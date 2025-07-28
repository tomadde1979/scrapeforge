import session from "express-session";
import MemoryStore from "memorystore";

// Use memory store for development, in production you'd use Redis or database
const MemoryStoreInstance = MemoryStore(session);

export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
  store: new MemoryStoreInstance({
    checkPeriod: 86400000, // prune expired entries every 24h
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: "lax",
  },
  name: "scrapeforge.sid",
});