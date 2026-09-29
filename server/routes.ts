import type { Express } from "express";
import type { Server } from "http";
import authRoutes from "./authRoutes";
import stripeRoutes from "./stripeRoutes";
import classBattleRoutes from "./classBattleRoutes";
import adminRoutes from "./adminRoutes";
import analyticsRoutes from "./analyticsRoutes";
import newsletterRoutes from "./newsletterRoutes";
import weeklyNewsletterRoutes from "./weeklyNewsletterRoutes";
import { createRoom, joinRoom, getRoom } from "./generic-room";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  httpServer.setMaxListeners(50);
  app.use("/api/auth", authRoutes);
  app.use("/api/stripe", stripeRoutes);
  app.use("/api/class-battle", classBattleRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/newsletter", newsletterRoutes);
  app.use("/api/newsletter/weekly", weeklyNewsletterRoutes);

  return httpServer;
}
