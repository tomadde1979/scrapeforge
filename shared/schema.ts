import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  platforms: jsonb("platforms").$type<string[]>().notNull().default([]),
  keywords: text("keywords"),
  domains: text("domains"),
  status: text("status").notNull().default("active"), // active, paused, completed
  userId: varchar("user_id").notNull(),
  // New follower/commenter scraping options
  includeFollowers: boolean("include_followers").default(false),
  includeCommenters: boolean("include_commenters").default(false),
  maxFollowersPerProfile: integer("max_followers_per_profile").default(100),
  maxCommentsPerProfile: integer("max_comments_per_profile").default(50),
  maxPostsToScan: integer("max_posts_to_scan").default(10),
  useRealScraping: boolean("use_real_scraping").default(true),
  useHeadlessMode: boolean("use_headless_mode").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const scrapingResults = pgTable("scraping_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  profileName: text("profile_name").notNull(),
  profileUrl: text("profile_url").notNull(),
  platform: text("platform").notNull(),
  email: text("email"),
  emailSource: text("email_source"), // bio, bio_link, ai_parsed
  bioText: text("bio_text"),
  linkInBio: text("link_in_bio"),
  isAiParsed: boolean("is_ai_parsed").default(false),
  foundAt: timestamp("found_at").defaultNow().notNull(),
  // New fields for tracking source type
  sourceType: text("source_type").default("direct"), // direct, follower, commenter
  sourceProfile: text("source_profile"), // Profile that this was found through (for followers/commenters)
  sourcePostUrl: text("source_post_url"), // For commenters, the post they commented on
});

export const scrapingLogs = pgTable("scraping_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  platform: text("platform").notNull(),
  status: text("status").notNull(), // started, completed, error
  message: text("message"),
  profilesScanned: integer("profiles_scanned").default(0),
  emailsFound: integer("emails_found").default(0),
  errors: jsonb("errors").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const scrapingJobs = pgTable("scraping_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  platform: text("platform").notNull(),
  status: text("status").notNull().default("pending"), // pending, running, completed, failed
  progress: integer("progress").default(0),
  totalProfiles: integer("total_profiles").default(0),
  scannedProfiles: integer("scanned_profiles").default(0),
  foundEmails: integer("found_emails").default(0),
  currentProfile: text("current_profile"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const projectsRelations = relations(projects, ({ many }) => ({
  results: many(scrapingResults),
  logs: many(scrapingLogs),
  jobs: many(scrapingJobs),
}));

export const scrapingResultsRelations = relations(scrapingResults, ({ one }) => ({
  project: one(projects, {
    fields: [scrapingResults.projectId],
    references: [projects.id],
  }),
}));

export const scrapingLogsRelations = relations(scrapingLogs, ({ one }) => ({
  project: one(projects, {
    fields: [scrapingLogs.projectId],
    references: [projects.id],
  }),
}));

export const scrapingJobsRelations = relations(scrapingJobs, ({ one }) => ({
  project: one(projects, {
    fields: [scrapingJobs.projectId],
    references: [projects.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScrapingResultSchema = createInsertSchema(scrapingResults).omit({
  id: true,
  foundAt: true,
});

export const insertScrapingLogSchema = createInsertSchema(scrapingLogs).omit({
  id: true,
  createdAt: true,
});

export const insertScrapingJobSchema = createInsertSchema(scrapingJobs).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
export type ScrapingResult = typeof scrapingResults.$inferSelect;
export type InsertScrapingResult = typeof scrapingResults.$inferInsert;
export type ScrapingLog = typeof scrapingLogs.$inferSelect;
export type InsertScrapingLog = typeof scrapingLogs.$inferInsert;
export type ScrapingJob = typeof scrapingJobs.$inferSelect;
export type InsertScrapingJob = typeof scrapingJobs.$inferInsert;

// Auth schemas
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, hyphens, and underscores"),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type ScrapingResult = typeof scrapingResults.$inferSelect;
export type InsertScrapingResult = z.infer<typeof insertScrapingResultSchema>;

export type ScrapingLog = typeof scrapingLogs.$inferSelect;
export type InsertScrapingLog = z.infer<typeof insertScrapingLogSchema>;

export type ScrapingJob = typeof scrapingJobs.$inferSelect;
export type InsertScrapingJob = z.infer<typeof insertScrapingJobSchema>;
