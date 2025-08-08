import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { storage } from "./storage";

export function setupGoogleAuth() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn("[auth] GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET not set; Google OAuth disabled");
    return;
  }

  const callbackURL = process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback";

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL,
      },
      async (accessToken: string, refreshToken: string, profile: Profile, done) => {
        try {
          const userId = `google:${profile.id}`;
          await storage.upsertUser({
            id: userId,
            email: profile.emails?.[0]?.value,
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            profileImageUrl: profile.photos?.[0]?.value,
            authProvider: "google",
          });

          const expiresAt = Math.floor(Date.now() / 1000) + 3600; // 1h
          const user: any = {
            claims: {
              sub: userId,
              email: profile.emails?.[0]?.value,
              given_name: profile.name?.givenName,
              family_name: profile.name?.familyName,
            },
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_at: expiresAt,
          };
          return done(null, user);
        } catch (err) {
          return done(err as Error);
        }
      }
    )
  );

  console.log("[auth] Google OAuth strategy registered");
}


