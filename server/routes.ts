import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ScraperEngine } from "./services/scraper-engine";
import { insertProjectSchema, loginSchema, registerSchema } from "@shared/schema";
import { z } from "zod";
import { sessionMiddleware } from "./middleware/session";
import { authenticateSession, hashPassword, verifyPassword } from "./middleware/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  const scraperEngine = ScraperEngine.getInstance();

  // Session middleware
  app.use(sessionMiddleware);

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password } = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
      });

      res.status(201).json({
        message: "Account created successfully",
        user: { id: user.id, email: user.email },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Create session
      (req.session as any).userId = user.id;
      
      res.json({
        message: "Login successful",
        user: { id: user.id, email: user.email },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/me", authenticateSession, async (req, res) => {
    res.json(req.user);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("scrapeforge.sid");
      res.json({ message: "Logged out successfully" });
    });
  });

  // Protected Projects endpoints
  app.get("/api/projects", authenticateSession, async (req, res) => {
    try {
      const projects = await storage.getProjects(req.user!.id);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", authenticateSession, async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid project data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const updates = req.body;
      const project = await storage.updateProject(req.params.id, updates);
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      await storage.deleteProject(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // Scraping endpoints
  app.post("/api/projects/:id/scrape", async (req, res) => {
    try {
      const projectId = req.params.id;
      console.log(`🚀 SCRAPING ENDPOINT CALLED - Project ID: ${projectId}`);
      console.log(`🕐 Timestamp: ${new Date().toISOString()}`);
      
      // Verify project exists before starting scraper
      const project = await storage.getProject(projectId);
      if (!project) {
        console.log(`❌ Project not found in storage: ${projectId}`);
        return res.status(404).json({ error: 'Project not found' });
      }
      
      console.log(`📋 Project found: ${project.name}`);
      console.log(`🔧 Settings: useRealScraping=${project.useRealScraping}, useHeadlessMode=${project.useHeadlessMode}`);
      console.log(`🎯 Keywords: ${project.keywords}`);
      console.log(`📱 Platforms: ${JSON.stringify(project.platforms)}`);
      
      if (scraperEngine.isScrapingActive(projectId)) {
        console.log(`⚠️ Scraping already in progress for project: ${projectId}`);
        return res.status(400).json({ error: "Scraping already in progress" });
      }

      // Start scraping in background
      console.log(`🎬 Starting scraper for project: ${project.name}`);
      scraperEngine.startScraping(projectId).catch((error) => {
        console.error(`❌ CRITICAL SCRAPER ERROR for project ${projectId}:`, error);
        console.error(`❌ Error stack:`, error.stack);
      });
      
      console.log(`✅ Scraping started successfully for project: ${project.name}`);
      res.json({ message: "Scraping started", projectId });
    } catch (error) {
      console.error(`❌ ROUTE ERROR in /api/projects/:id/scrape:`, error);
      console.error(`❌ Error stack:`, error instanceof Error ? error.stack : 'Unknown error');
      res.status(500).json({ error: "Failed to start scraping", details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post("/api/projects/:id/scrape/stop", async (req, res) => {
    try {
      await scraperEngine.stopScraping(req.params.id);
      res.json({ message: "Scraping stopped" });
    } catch (error) {
      res.status(500).json({ error: "Failed to stop scraping" });
    }
  });

  app.get("/api/projects/:id/scrape/status", async (req, res) => {
    try {
      const projectId = req.params.id;
      const activeJob = await storage.getActiveScrapingJob(projectId);
      
      res.json({
        isActive: scraperEngine.isScrapingActive(projectId),
        job: activeJob,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get scraping status" });
    }
  });

  // Results endpoints
  app.get("/api/projects/:id/results", async (req, res) => {
    try {
      const { platform, search } = req.query;
      const results = await storage.getResultsWithFilters(
        req.params.id,
        platform as string,
        search as string
      );
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch results" });
    }
  });

  // Logs endpoints
  app.get("/api/projects/:id/logs", async (req, res) => {
    try {
      const logs = await storage.getScrapingLogs(req.params.id);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });

  // Statistics endpoints
  app.get("/api/projects/:id/stats", async (req, res) => {
    try {
      const stats = await storage.getProjectStats(req.params.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project stats" });
    }
  });

  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Export endpoint (placeholder - would integrate with SheetJS)
  app.get("/api/projects/:id/export", async (req, res) => {
    try {
      const results = await storage.getScrapingResults(req.params.id);
      
      // This would use SheetJS to generate Excel file
      // For now, return JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="scraping-results.json"');
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to export results" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
