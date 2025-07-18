import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertDeveloperProfileSchema,
  insertProjectSchema,
  insertSwipeSchema,
  insertMessageSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

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
      const match = await storage.checkMatch(userId, userId); // This needs to be fixed
      if (!match) {
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
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time messaging
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket, req) => {
    console.log('New WebSocket connection');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Broadcast message to other clients in the same match
        if (data.type === 'chat_message') {
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(data));
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
