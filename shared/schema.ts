import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Developer profiles
export const developerProfiles = pgTable("developer_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  bio: text("bio"),
  skills: text("skills").array(),
  experience: varchar("experience"),
  availability: varchar("availability"), // "available", "busy", "not_seeking"
  remote: boolean("remote").default(true),
  location: varchar("location"),
  collaborationType: varchar("collaboration_type"), // "quick", "long_term", "both"
  projectInterests: text("project_interests").array(),
  githubUrl: varchar("github_url"),
  portfolioUrl: varchar("portfolio_url"),
  timezone: varchar("timezone"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tool/Application profiles
export const toolProfiles = pgTable("tool_profiles", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  category: varchar("category").notNull(), // "ide", "version_control", "database", "framework", etc.
  description: text("description"),
  logoUrl: varchar("logo_url"),
  websiteUrl: varchar("website_url"),
  integrations: text("integrations").array(),
  platforms: text("platforms").array(), // "web", "desktop", "mobile"
  pricing: varchar("pricing"), // "free", "paid", "freemium"
  tags: text("tags").array(),
  popularity: integer("popularity").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Current projects
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  developerId: integer("developer_id").notNull().references(() => developerProfiles.id),
  title: varchar("title").notNull(),
  description: text("description"),
  techStack: text("tech_stack").array(),
  status: varchar("status").default("active"), // "active", "completed", "paused"
  seekingRoles: text("seeking_roles").array(), // "frontend", "backend", "designer", etc.
  repositoryUrl: varchar("repository_url"),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Swipe actions
export const swipes = pgTable("swipes", {
  id: serial("id").primaryKey(),
  swiperId: varchar("swiper_id").notNull().references(() => users.id),
  targetId: varchar("target_id").notNull(), // Can be user ID or tool ID
  targetType: varchar("target_type").notNull(), // "developer" or "tool"
  action: varchar("action").notNull(), // "like", "pass", "super_like"
  createdAt: timestamp("created_at").defaultNow(),
});

// Matches (when both developers like each other)
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  user1Id: varchar("user1_id").notNull().references(() => users.id),
  user2Id: varchar("user2_id").notNull().references(() => users.id),
  matchedAt: timestamp("matched_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

// Chat messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull().references(() => matches.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
  isRead: boolean("is_read").default(false),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  developerProfile: one(developerProfiles, {
    fields: [users.id],
    references: [developerProfiles.userId],
  }),
  sentSwipes: many(swipes, { relationName: "swiper" }),
  matches1: many(matches, { relationName: "user1" }),
  matches2: many(matches, { relationName: "user2" }),
  sentMessages: many(messages, { relationName: "sender" }),
}));

export const developerProfilesRelations = relations(developerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [developerProfiles.userId],
    references: [users.id],
  }),
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  developer: one(developerProfiles, {
    fields: [projects.developerId],
    references: [developerProfiles.id],
  }),
}));

export const swipesRelations = relations(swipes, ({ one }) => ({
  swiper: one(users, {
    fields: [swipes.swiperId],
    references: [users.id],
    relationName: "swiper",
  }),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  user1: one(users, {
    fields: [matches.user1Id],
    references: [users.id],
    relationName: "user1",
  }),
  user2: one(users, {
    fields: [matches.user2Id],
    references: [users.id],
    relationName: "user2",
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  match: one(matches, {
    fields: [messages.matchId],
    references: [matches.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
}));

// Insert schemas
export const insertDeveloperProfileSchema = createInsertSchema(developerProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertToolProfileSchema = createInsertSchema(toolProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSwipeSchema = createInsertSchema(swipes).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  sentAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type DeveloperProfile = typeof developerProfiles.$inferSelect;
export type InsertDeveloperProfile = z.infer<typeof insertDeveloperProfileSchema>;
export type ToolProfile = typeof toolProfiles.$inferSelect;
export type InsertToolProfile = z.infer<typeof insertToolProfileSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Swipe = typeof swipes.$inferSelect;
export type InsertSwipe = z.infer<typeof insertSwipeSchema>;
export type Match = typeof matches.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
