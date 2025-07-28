import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ScraperEngine } from "./services/scraper-engine";
import { insertProjectSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const scraperEngine = ScraperEngine.getInstance();

  // Projects endpoints
  app.get("/api/projects", async (req, res) => {
    try {
      // For demo purposes, use a default user ID
      // In production, this would come from authentication
      const userId = "default-user";
      const projects = await storage.getProjects(userId);
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

  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse({
        ...req.body,
        userId: "default-user", // In production, get from auth
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
      
      if (scraperEngine.isScrapingActive(projectId)) {
        return res.status(400).json({ error: "Scraping already in progress" });
      }

      // Start scraping in background
      scraperEngine.startScraping(projectId).catch(console.error);
      
      res.json({ message: "Scraping started", projectId });
    } catch (error) {
      res.status(500).json({ error: "Failed to start scraping" });
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
