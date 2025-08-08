import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    try {
      const issuerUrl = process.env.ISSUER_URL ?? "https://replit.com/oidc";
      console.log(`[auth] Discovering OIDC config from ${issuerUrl}`);
      const config = await client.discovery(
        new URL(issuerUrl),
        process.env.REPL_ID!
      );
      console.log(`[auth] OIDC config discovered successfully`);
      return config;
    } catch (error) {
      console.error(`[auth] Failed to discover OIDC config:`, error);
      throw error;
    }
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "lax" : "lax",
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  console.log(`[auth] Setting up authentication`);
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    try {
      console.log(`[auth] Verifying user with tokens`);
      const user = {};
      updateUserSession(user, tokens);
      await upsertUser(tokens.claims());
      console.log(`[auth] User verified successfully:`, tokens.claims()?.sub);
      verified(null, user);
    } catch (error) {
      console.error(`[auth] Error during verification:`, error);
      verified(error);
    }
  };

  // Get domains and add localhost for development
  const domains = process.env.REPLIT_DOMAINS!.split(",");
  if (process.env.NODE_ENV === "development") {
    domains.push("localhost:5000");
  }

  for (const domain of domains) {
    const protocol = domain.includes("localhost") ? "http" : "https";
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `${protocol}://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
    console.log(`[auth] Registered strategy for domain: ${domain}`);
  }

  passport.serializeUser((user: Express.User, cb) => {
    console.log(`[auth] Serializing user`);
    cb(null, user);
  });
  passport.deserializeUser((user: Express.User, cb) => {
    console.log(`[auth] Deserializing user`);
    cb(null, user);
  });

  app.get("/api/login", (req, res, next) => {
    const hostname = req.get('host') || req.hostname;
    console.log(`[auth] Login attempt from ${hostname}`);
    passport.authenticate(`replitauth:${hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    const hostname = req.get('host') || req.hostname;
    console.log(`[auth] Callback received from ${hostname}`, req.query);
    passport.authenticate(`replitauth:${hostname}`, (err, user, info) => {
      if (err) {
        console.error(`[auth] Callback error:`, err);
        return res.redirect("/api/login");
      }
      if (!user) {
        console.log(`[auth] No user returned:`, info);
        return res.redirect("/api/login");
      }
      req.logIn(user, (err) => {
        if (err) {
          console.error(`[auth] Login error:`, err);
          return res.redirect("/api/login");
        }
        console.log(`[auth] User logged in successfully`);
        return res.redirect("/");
      });
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
