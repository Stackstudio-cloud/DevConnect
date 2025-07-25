import {
  users,
  developerProfiles,
  toolProfiles,
  projects,
  swipes,
  matches,
  messages,
  type User,
  type UpsertUser,
  type DeveloperProfile,
  type InsertDeveloperProfile,
  type ToolProfile,
  type InsertToolProfile,
  type Project,
  type InsertProject,
  type Swipe,
  type InsertSwipe,
  type Match,
  type Message,
  type InsertMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, ne, notInArray, desc, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Developer profile operations
  getDeveloperProfile(userId: string): Promise<DeveloperProfile | undefined>;
  createDeveloperProfile(profile: InsertDeveloperProfile): Promise<DeveloperProfile>;
  updateDeveloperProfile(userId: string, profile: Partial<InsertDeveloperProfile>): Promise<DeveloperProfile>;
  getDeveloperProfilesForDiscovery(userId: string, limit?: number): Promise<(DeveloperProfile & { user: User })[]>;
  
  // Tool profile operations
  getToolProfiles(limit?: number): Promise<ToolProfile[]>;
  getToolProfile(id: number): Promise<ToolProfile | undefined>;
  
  // Project operations
  getProjectsByDeveloper(developerId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  
  // Swipe operations
  createSwipe(swipe: InsertSwipe): Promise<Swipe>;
  getSwipe(swiperId: string, targetId: string, targetType: string): Promise<Swipe | undefined>;
  
  // Match operations
  createMatch(user1Id: string, user2Id: string): Promise<Match>;
  getMatches(userId: string): Promise<(Match & { user1: User; user2: User })[]>;
  checkMatch(user1Id: string, user2Id: string): Promise<Match | undefined>;
  
  // Message operations
  getMessagesByMatch(matchId: number): Promise<(Message & { sender: User })[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(matchId: number, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Developer profile operations
  async getDeveloperProfile(userId: string): Promise<DeveloperProfile | undefined> {
    const [profile] = await db
      .select()
      .from(developerProfiles)
      .where(eq(developerProfiles.userId, userId));
    return profile;
  }

  async createDeveloperProfile(profile: InsertDeveloperProfile): Promise<DeveloperProfile> {
    const [newProfile] = await db
      .insert(developerProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async updateDeveloperProfile(userId: string, profile: Partial<InsertDeveloperProfile>): Promise<DeveloperProfile> {
    const [updatedProfile] = await db
      .update(developerProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(developerProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }

  async getDeveloperProfilesForDiscovery(userId: string, limit = 10): Promise<(DeveloperProfile & { user: User })[]> {
    // Get profiles that haven't been swiped on by the current user
    const swipedTargets = db
      .select({ targetId: swipes.targetId })
      .from(swipes)
      .where(and(
        eq(swipes.swiperId, userId),
        eq(swipes.targetType, "developer")
      ));

    const profiles = await db
      .select({
        id: developerProfiles.id,
        userId: developerProfiles.userId,
        title: developerProfiles.title,
        bio: developerProfiles.bio,
        skills: developerProfiles.skills,
        experience: developerProfiles.experience,
        availability: developerProfiles.availability,
        remote: developerProfiles.remote,
        location: developerProfiles.location,
        collaborationType: developerProfiles.collaborationType,
        projectInterests: developerProfiles.projectInterests,
        githubUrl: developerProfiles.githubUrl,
        portfolioUrl: developerProfiles.portfolioUrl,
        timezone: developerProfiles.timezone,
        isActive: developerProfiles.isActive,
        createdAt: developerProfiles.createdAt,
        updatedAt: developerProfiles.updatedAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(developerProfiles)
      .innerJoin(users, eq(developerProfiles.userId, users.id))
      .where(and(
        eq(developerProfiles.isActive, true),
        ne(developerProfiles.userId, userId),
        notInArray(developerProfiles.userId, swipedTargets)
      ))
      .limit(limit)
      .orderBy(desc(developerProfiles.createdAt));

    return profiles;
  }

  // Tool profile operations
  async getToolProfiles(limit = 50): Promise<ToolProfile[]> {
    const tools = await db
      .select()
      .from(toolProfiles)
      .where(eq(toolProfiles.isActive, true))
      .limit(limit)
      .orderBy(desc(toolProfiles.popularity));
    
    // If no tools exist, create some sample data
    if (tools.length === 0) {
      await this.createSampleTools();
      return await db
        .select()
        .from(toolProfiles)
        .where(eq(toolProfiles.isActive, true))
        .limit(limit)
        .orderBy(desc(toolProfiles.popularity));
    }
    
    return tools;
  }

  private async createSampleTools(): Promise<void> {
    const sampleTools = [
      {
        name: "VS Code",
        category: "ide",
        description: "Visual Studio Code is a lightweight but powerful source code editor with rich extension ecosystem and debugging capabilities.",
        logoUrl: "https://code.visualstudio.com/assets/images/code-stable.png",
        websiteUrl: "https://code.visualstudio.com",
        integrations: ["Git", "Docker", "TypeScript", "Python", "React"],
        platforms: ["Windows", "macOS", "Linux"],
        pricing: "free",
        tags: ["IntelliSense", "Debugging", "Extensions", "Terminal"],
        popularity: 95
      },
      {
        name: "Docker",
        category: "containerization",
        description: "Platform for developing, shipping, and running applications using containerization technology.",
        logoUrl: "https://www.docker.com/sites/default/files/d8/2019-07/vertical-logo-monochromatic.png",
        websiteUrl: "https://www.docker.com",
        integrations: ["Kubernetes", "AWS", "Azure", "Jenkins"],
        platforms: ["Windows", "macOS", "Linux"],
        pricing: "freemium",
        tags: ["Containers", "Microservices", "DevOps", "Cloud"],
        popularity: 88
      },
      {
        name: "Figma",
        category: "design",
        description: "Collaborative interface design tool with real-time editing and prototyping capabilities.",
        logoUrl: "https://cdn.worldvectorlogo.com/logos/figma-1.svg",
        websiteUrl: "https://www.figma.com",
        integrations: ["Slack", "Notion", "Zeplin", "Adobe"],
        platforms: ["Web", "Desktop", "Mobile"],
        pricing: "freemium",
        tags: ["UI Design", "Prototyping", "Collaboration", "Vector"],
        popularity: 82
      },
      {
        name: "GitHub",
        category: "version_control",
        description: "Web-based Git repository hosting service with collaboration features and CI/CD capabilities.",
        logoUrl: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
        websiteUrl: "https://github.com",
        integrations: ["VS Code", "Slack", "Jira", "Docker"],
        platforms: ["Web", "Desktop", "Mobile"],
        pricing: "freemium",
        tags: ["Git", "Collaboration", "CI/CD", "Open Source"],
        popularity: 93
      },
      {
        name: "Notion",
        category: "productivity",
        description: "All-in-one workspace for notes, tasks, wikis, and databases with powerful collaboration features.",
        logoUrl: "https://www.notion.so/cdn-cgi/image/format=auto,width=256,quality=100/front-static/shared/icons/notion-app-icon-3d.png",
        websiteUrl: "https://www.notion.so",
        integrations: ["Slack", "Google Drive", "Figma", "GitHub"],
        platforms: ["Web", "Desktop", "Mobile"],
        pricing: "freemium",
        tags: ["Documentation", "Project Management", "Collaboration"],
        popularity: 79
      },
      {
        name: "PostgreSQL",
        category: "database",
        description: "Advanced open-source relational database with strong standards compliance and extensibility.",
        logoUrl: "https://www.postgresql.org/media/img/about/press/elephant.png",
        websiteUrl: "https://www.postgresql.org",
        integrations: ["Docker", "AWS RDS", "Heroku", "Node.js"],
        platforms: ["Linux", "Windows", "macOS"],
        pricing: "free",
        tags: ["SQL", "ACID", "JSON", "Extensions"],
        popularity: 85
      }
    ];

    await db.insert(toolProfiles).values(sampleTools);
  }

  async getToolProfile(id: number): Promise<ToolProfile | undefined> {
    const [tool] = await db
      .select()
      .from(toolProfiles)
      .where(eq(toolProfiles.id, id));
    return tool;
  }

  // Project operations
  async getProjectsByDeveloper(developerId: number): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(and(
        eq(projects.developerId, developerId),
        eq(projects.isPublic, true)
      ))
      .orderBy(desc(projects.createdAt));
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db
      .insert(projects)
      .values(project)
      .returning();
    return newProject;
  }

  // Swipe operations
  async createSwipe(swipe: InsertSwipe): Promise<Swipe> {
    const [newSwipe] = await db
      .insert(swipes)
      .values(swipe)
      .returning();
    return newSwipe;
  }

  async getSwipe(swiperId: string, targetId: string, targetType: string): Promise<Swipe | undefined> {
    const [swipe] = await db
      .select()
      .from(swipes)
      .where(and(
        eq(swipes.swiperId, swiperId),
        eq(swipes.targetId, targetId),
        eq(swipes.targetType, targetType)
      ));
    return swipe;
  }

  // Match operations
  async createMatch(user1Id: string, user2Id: string): Promise<Match> {
    const [newMatch] = await db
      .insert(matches)
      .values({ user1Id, user2Id })
      .returning();
    return newMatch;
  }

  async getMatches(userId: string): Promise<(Match & { user1: User; user2: User })[]> {
    const matchesData = await db
      .select({
        id: matches.id,
        user1Id: matches.user1Id,
        user2Id: matches.user2Id,
        matchedAt: matches.matchedAt,
        isActive: matches.isActive,
        user1: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
        user2: users,
      })
      .from(matches)
      .innerJoin(users, eq(matches.user1Id, users.id))
      .where(and(
        or(eq(matches.user1Id, userId), eq(matches.user2Id, userId)),
        eq(matches.isActive, true)
      ))
      .orderBy(desc(matches.matchedAt));

    // Need to fetch user2 data separately for proper typing
    const enrichedMatches = await Promise.all(
      matchesData.map(async (match) => {
        const [user2] = await db
          .select()
          .from(users)
          .where(eq(users.id, match.user2Id));
        
        return {
          ...match,
          user2,
        };
      })
    );

    return enrichedMatches;
  }

  async checkMatch(user1Id: string, user2Id: string): Promise<Match | undefined> {
    const [match] = await db
      .select()
      .from(matches)
      .where(or(
        and(eq(matches.user1Id, user1Id), eq(matches.user2Id, user2Id)),
        and(eq(matches.user1Id, user2Id), eq(matches.user2Id, user1Id))
      ));
    return match;
  }

  // Message operations
  async getMessagesByMatch(matchId: number): Promise<(Message & { sender: User })[]> {
    const messagesData = await db
      .select({
        id: messages.id,
        matchId: messages.matchId,
        senderId: messages.senderId,
        content: messages.content,
        sentAt: messages.sentAt,
        isRead: messages.isRead,
        sender: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.matchId, matchId))
      .orderBy(messages.sentAt);

    return messagesData;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  async markMessagesAsRead(matchId: number, userId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(and(
        eq(messages.matchId, matchId),
        ne(messages.senderId, userId)
      ));
  }
}

export const storage = new DatabaseStorage();
