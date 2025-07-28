// Import necessary packages for Neon serverless PostgreSQL connection
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon to use WebSocket constructor for serverless environments
neonConfig.webSocketConstructor = ws;

// Validate that DATABASE_URL environment variable exists
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is required. Please set it to your PostgreSQL connection string.",
  );
}

// Create connection pool using the database URL
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Initialize Drizzle ORM with the connection pool and schema
export const db = drizzle({ client: pool, schema });