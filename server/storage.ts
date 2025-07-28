import { 
  users, projects, scrapingResults, scrapingLogs, scrapingJobs,
  type User, type InsertUser, type Project, type InsertProject,
  type ScrapingResult, type InsertScrapingResult,
  type ScrapingLog, type InsertScrapingLog,
  type ScrapingJob, type InsertScrapingJob
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Projects
  getProjects(userId: string): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project>;
  deleteProject(id: string): Promise<void>;

  // Scraping Results
  getScrapingResults(projectId: string): Promise<ScrapingResult[]>;
  createScrapingResult(result: InsertScrapingResult): Promise<ScrapingResult>;
  getResultsWithFilters(projectId: string, platform?: string, search?: string): Promise<ScrapingResult[]>;

  // Scraping Logs
  getScrapingLogs(projectId: string): Promise<ScrapingLog[]>;
  createScrapingLog(log: InsertScrapingLog): Promise<ScrapingLog>;

  // Scraping Jobs
  getScrapingJobs(projectId: string): Promise<ScrapingJob[]>;
  getActiveScrapingJob(projectId: string): Promise<ScrapingJob | undefined>;
  createScrapingJob(job: InsertScrapingJob): Promise<ScrapingJob>;
  updateScrapingJob(id: string, updates: Partial<ScrapingJob>): Promise<ScrapingJob>;

  // Statistics
  getProjectStats(projectId: string): Promise<{
    profilesScanned: number;
    emailsFound: number;
    successRate: number;
    aiParsed: number;
  }>;
  
  getDashboardStats(): Promise<{
    activeProjects: number;
    emailsFound: number;
    profilesScanned: number;
    successRate: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getProjects(userId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.updatedAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db
      .insert(projects)
      .values(project)
      .returning();
    return newProject;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const [updatedProject] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  async getScrapingResults(projectId: string): Promise<ScrapingResult[]> {
    return await db
      .select()
      .from(scrapingResults)
      .where(eq(scrapingResults.projectId, projectId))
      .orderBy(desc(scrapingResults.foundAt));
  }

  async createScrapingResult(result: InsertScrapingResult): Promise<ScrapingResult> {
    const [newResult] = await db
      .insert(scrapingResults)
      .values(result)
      .returning();
    return newResult;
  }

  async getResultsWithFilters(projectId: string, platform?: string, search?: string): Promise<ScrapingResult[]> {
    let query = db
      .select()
      .from(scrapingResults)
      .where(eq(scrapingResults.projectId, projectId));

    let conditions = [eq(scrapingResults.projectId, projectId)];

    if (platform) {
      conditions.push(eq(scrapingResults.platform, platform));
    }

    if (search) {
      conditions.push(sql`${scrapingResults.profileName} ILIKE ${`%${search}%`}`);
    }

    if (conditions.length > 0) {
      query = db
        .select()
        .from(scrapingResults)
        .where(and(...conditions));
    }

    return await query.orderBy(desc(scrapingResults.foundAt));
  }

  async getScrapingLogs(projectId: string): Promise<ScrapingLog[]> {
    return await db
      .select()
      .from(scrapingLogs)
      .where(eq(scrapingLogs.projectId, projectId))
      .orderBy(desc(scrapingLogs.createdAt));
  }

  async createScrapingLog(log: InsertScrapingLog): Promise<ScrapingLog> {
    const [newLog] = await db
      .insert(scrapingLogs)
      .values(log)
      .returning();
    return newLog;
  }

  async getScrapingJobs(projectId: string): Promise<ScrapingJob[]> {
    return await db
      .select()
      .from(scrapingJobs)
      .where(eq(scrapingJobs.projectId, projectId))
      .orderBy(desc(scrapingJobs.createdAt));
  }

  async getActiveScrapingJob(projectId: string): Promise<ScrapingJob | undefined> {
    const [job] = await db
      .select()
      .from(scrapingJobs)
      .where(and(
        eq(scrapingJobs.projectId, projectId),
        eq(scrapingJobs.status, 'running')
      ));
    return job || undefined;
  }

  async createScrapingJob(job: InsertScrapingJob): Promise<ScrapingJob> {
    const [newJob] = await db
      .insert(scrapingJobs)
      .values(job)
      .returning();
    return newJob;
  }

  async updateScrapingJob(id: string, updates: Partial<ScrapingJob>): Promise<ScrapingJob> {
    const [updatedJob] = await db
      .update(scrapingJobs)
      .set(updates)
      .where(eq(scrapingJobs.id, id))
      .returning();
    return updatedJob;
  }

  async getProjectStats(projectId: string): Promise<{
    profilesScanned: number;
    emailsFound: number;
    successRate: number;
    aiParsed: number;
  }> {
    const [stats] = await db
      .select({
        profilesScanned: count(scrapingResults.id),
        emailsFound: sql<number>`count(case when ${scrapingResults.email} is not null then 1 end)`,
        aiParsed: sql<number>`count(case when ${scrapingResults.isAiParsed} = true then 1 end)`,
      })
      .from(scrapingResults)
      .where(eq(scrapingResults.projectId, projectId));

    const successRate = stats.profilesScanned > 0 
      ? (stats.emailsFound / stats.profilesScanned) * 100 
      : 0;

    return {
      profilesScanned: stats.profilesScanned,
      emailsFound: stats.emailsFound,
      successRate: parseFloat(successRate.toFixed(1)),
      aiParsed: stats.aiParsed,
    };
  }

  async getDashboardStats(): Promise<{
    activeProjects: number;
    emailsFound: number;
    profilesScanned: number;
    successRate: number;
  }> {
    const [projectStats] = await db
      .select({
        activeProjects: sql<number>`count(case when ${projects.status} = 'active' then 1 end)`,
      })
      .from(projects);

    const [resultStats] = await db
      .select({
        profilesScanned: count(scrapingResults.id),
        emailsFound: sql<number>`count(case when ${scrapingResults.email} is not null then 1 end)`,
      })
      .from(scrapingResults);

    const successRate = resultStats.profilesScanned > 0 
      ? (resultStats.emailsFound / resultStats.profilesScanned) * 100 
      : 0;

    return {
      activeProjects: projectStats.activeProjects,
      emailsFound: resultStats.emailsFound,
      profilesScanned: resultStats.profilesScanned,
      successRate: parseFloat(successRate.toFixed(1)),
    };
  }
}

export const storage = new DatabaseStorage();
