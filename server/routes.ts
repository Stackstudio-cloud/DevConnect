import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import signature from "cookie-signature";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { setupGitHubAuth } from "./githubAuth";
import { setupTwitterAuth } from "./twitterAuth";
import { setupGoogleAuth } from "./googleAuth";
import passport from "passport";
import {
  insertDeveloperProfileSchema,
  insertProjectSchema,
  insertSwipeSchema,
  insertMessageSchema,
} from "@shared/schema";
import { enqueueUrl } from "./qstash";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  setupGitHubAuth();
  setupTwitterAuth();
  setupGoogleAuth();

  // GitHub Auth routes
  app.get('/api/auth/github', (req, res, next) => {
    // Redirect to placeholder page for GitHub auth setup
    res.redirect('/?auth_demo=github');
  });

  app.get('/api/auth/github/callback', (req, res) => {
    res.redirect('/?auth_demo=github_callback');
  });

  // Twitter Auth routes  
  // Google OAuth routes (active when env set)
  app.get('/api/auth/google', (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID) return res.redirect('/?auth_demo=google');
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
  });
  app.get('/api/auth/google/callback', (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID) return res.redirect('/?auth_demo=google_callback');
    passport.authenticate('google', (err, user) => {
      if (err || !user) return res.redirect('/?login=failed');
      req.logIn(user, (err2) => {
        if (err2) return res.redirect('/?login=failed');
        res.redirect('/');
      });
    })(req, res, next);
  });
  app.get('/api/auth/twitter', (req, res, next) => {
    // Redirect to placeholder page for Twitter auth setup
    res.redirect('/?auth_demo=twitter');
  });

  app.get('/api/auth/twitter/callback', (req, res) => {
    res.redirect('/?auth_demo=twitter_callback');
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Developer profile routes
  app.get('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getDeveloperProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = insertDeveloperProfileSchema.parse({
        ...req.body,
        userId,
      });
      
      const existingProfile = await storage.getDeveloperProfile(userId);
      let profile;
      
      if (existingProfile) {
        profile = await storage.updateDeveloperProfile(userId, profileData);
      } else {
        profile = await storage.createDeveloperProfile(profileData);
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error creating/updating profile:", error);
      res.status(500).json({ message: "Failed to create/update profile" });
    }
  });

  // Discovery routes
  app.get('/api/discover/developers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;
      const profiles = await storage.getDeveloperProfilesForDiscovery(userId, limit);
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching discovery profiles:", error);
      res.status(500).json({ message: "Failed to fetch discovery profiles" });
    }
  });

  app.get('/api/discover/tools', isAuthenticated, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const tools = await storage.getToolProfiles(limit);
      res.json(tools);
    } catch (error) {
      console.error("Error fetching tools:", error);
      res.status(500).json({ message: "Failed to fetch tools" });
    }
  });

  // Tool details route
  app.get('/api/tools/:toolId', isAuthenticated, async (req: any, res) => {
    try {
      const toolId = parseInt(req.params.toolId);
      const tool = await storage.getToolProfile(toolId);
      if (!tool) return res.status(404).json({ message: 'Tool not found' });
      res.json(tool);
    } catch (error) {
      console.error('Error fetching tool:', error);
      res.status(500).json({ message: 'Failed to fetch tool' });
    }
  });

  // Swipe routes
  app.post('/api/swipe', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const swipeData = insertSwipeSchema.parse({
        ...req.body,
        swiperId: userId,
      });

      // Check if already swiped
      const existingSwipe = await storage.getSwipe(
        swipeData.swiperId,
        swipeData.targetId,
        swipeData.targetType
      );

      if (existingSwipe) {
        return res.status(400).json({ message: "Already swiped on this profile" });
      }

      const swipe = await storage.createSwipe(swipeData);

      // Check for match if it's a like on a developer
      let match = null;
      if (swipeData.action === "like" && swipeData.targetType === "developer") {
        // Check if the target user has also liked this user
        const reciprocalSwipe = await storage.getSwipe(
          swipeData.targetId,
          swipeData.swiperId,
          "developer"
        );

        if (reciprocalSwipe && reciprocalSwipe.action === "like") {
          // Create a match
          match = await storage.createMatch(swipeData.swiperId, swipeData.targetId);
        }
      }

      res.json({ swipe, match });
    } catch (error) {
      console.error("Error creating swipe:", error);
      res.status(500).json({ message: "Failed to create swipe" });
    }
  });

  // Match routes
  app.get('/api/matches', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const matches = await storage.getMatches(userId);
      res.json(matches);
    } catch (error) {
      console.error("Error fetching matches:", error);
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  // Message routes
  app.get('/api/matches/:matchId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const matchId = parseInt(req.params.matchId);
      // Verify user is part of this match
      const match = await storage.getMatchById(matchId);
      if (!match) {
        return res.status(403).json({ message: "Not authorized to view these messages" });
      }
      if (match.user1Id !== userId && match.user2Id !== userId) {
        return res.status(403).json({ message: "Not authorized to view these messages" });
      }

      const messages = await storage.getMessagesByMatch(matchId);
      
      // Mark messages as read
      await storage.markMessagesAsRead(matchId, userId);
      
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/matches/:matchId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const matchId = parseInt(req.params.matchId);
      
      // Verify membership
      const match = await storage.getMatchById(matchId);
      if (!match || (match.user1Id !== userId && match.user2Id !== userId)) {
        return res.status(403).json({ message: "Not authorized to send messages to this match" });
      }

      const messageData = insertMessageSchema.parse({
        ...req.body,
        matchId,
        senderId: userId,
      });

      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // WebSocket token endpoint (signed with SESSION_SECRET)
  app.get('/api/ws/token', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const matchId = parseInt(req.query.matchId as string);
      if (!Number.isFinite(matchId)) return res.status(400).json({ message: 'Invalid matchId' });
      const match = await storage.getMatchById(matchId);
      if (!match || (match.user1Id !== userId && match.user2Id !== userId)) {
        return res.status(403).json({ message: 'Not authorized for this match' });
      }
      const raw = `${userId}:${matchId}`;
      const token = signature.sign(raw, process.env.SESSION_SECRET!);
      res.json({ token, userId, matchId });
    } catch (error) {
      console.error('Error creating ws token:', error);
      res.status(500).json({ message: 'Failed to create token' });
    }
  });

  // Project routes
  app.get('/api/profile/:developerId/projects', isAuthenticated, async (req: any, res) => {
    try {
      const developerId = parseInt(req.params.developerId);
      const projects = await storage.getProjectsByDeveloper(developerId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getDeveloperProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Developer profile not found" });
      }

      const projectData = insertProjectSchema.parse({
        ...req.body,
        developerId: profile.id,
      });

      const project = await storage.createProject(projectData);
      // enqueue post-create processing (e.g., notify followers)
      await enqueueUrl(`${req.protocol}://${req.get('host')}/api/hooks/project-created`, {
        projectId: project.id,
        developerId: project.developerId,
      });
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  // webhook to accept qstash jobs (should be signed verification in prod)
  app.post('/api/hooks/project-created', async (req, res) => {
    // placeholder: do async processing, send emails, recompute rankings, etc
    res.json({ ok: true });
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time messaging
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Simple room-based broadcast with auth by match membership
  wss.on('connection', async (ws: WebSocket, req) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    let room = 0;
    let userId = '';

    const token = url.searchParams.get('token');
    if (token) {
      try {
        const unsigned = signature.unsign(token, process.env.SESSION_SECRET!);
        if (!unsigned) throw new Error('invalid token');
        const [uid, matchStr] = unsigned.split(':');
        userId = uid;
        const maybeRoom = parseInt(matchStr);
        room = Number.isFinite(maybeRoom) ? maybeRoom : 0;
      } catch (err) {
        console.warn('WS token verification failed');
      }
    } else {
      // Fallback: legacy query params (less secure)
      const matchId = parseInt(url.searchParams.get('matchId') || '0');
      userId = url.searchParams.get('userId') || '';
      room = Number.isFinite(matchId) ? matchId : 0;
    }

    (ws as any).room = room;
    (ws as any).userId = userId;
    console.log('New WebSocket connection', { matchId: room, userId });

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        // Only allow chat messages scoped to the same room
        if (data.type === 'chat_message' && (ws as any).room && data.matchId === (ws as any).room) {
          wss.clients.forEach((client) => {
            if (
              client !== ws &&
              (client as any).room === (ws as any).room &&
              client.readyState === WebSocket.OPEN
            ) {
              client.send(JSON.stringify({ ...data, serverTimestamp: Date.now() }));
            }
          });
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}
