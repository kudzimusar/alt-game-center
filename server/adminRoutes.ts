import { Router } from "express";
import { db } from "./db";
import { users, gameSessions } from "@shared/schema";
import { eq, ilike, or, desc, count, and, ne } from "drizzle-orm";
import { requireAuth, requireAdmin, hashPassword } from "./auth";
import { z } from "zod";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/stats", async (_req, res) => {
  try {
    const [totalUsers] = await db.select({ count: count() }).from(users);
    const [activeSubscriptions] = await db.select({ count: count() }).from(users).where(eq(users.subscriptionStatus, "active"));
    const [inactiveUsers] = await db.select({ count: count() }).from(users).where(eq(users.isActive, false));
    const [totalSessions] = await db.select({ count: count() }).from(gameSessions);

    const schoolsResult = await db.selectDistinct({ school: users.school }).from(users).where(and(ne(users.school, ""), eq(users.isActive, true)));
    const schoolCount = schoolsResult.filter(r => r.school).length;

    const planBreakdown: Record<string, number> = {};
    const planRows = await db.select({ plan: users.subscriptionPlan, cnt: count() })
      .from(users)
      .where(eq(users.subscriptionStatus, "active"))
      .groupBy(users.subscriptionPlan);
    for (const row of planRows) {
      if (row.plan) planBreakdown[row.plan] = Number(row.cnt);
    }

    const roleBreakdown: Record<string, number> = {};
    const roleRows = await db.select({ role: users.role, cnt: count() })
      .from(users)
      .groupBy(users.role);
    for (const row of roleRows) {
      roleBreakdown[row.role] = Number(row.cnt);
    }

    const recentUsers = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      school: users.school,
      subscriptionStatus: users.subscriptionStatus,
      subscriptionPlan: users.subscriptionPlan,
      isActive: users.isActive,
      createdAt: users.createdAt,
    }).from(users).orderBy(desc(users.createdAt)).limit(10);

    const recentSessions = await db.select().from(gameSessions).orderBy(desc(gameSessions.startedAt)).limit(10);

    const gameBreakdown: Record<string, number> = {};
    const gameRows = await db.select({ gameType: gameSessions.gameType, cnt: count() })
      .from(gameSessions)
      .groupBy(gameSessions.gameType);
    for (const row of gameRows) {
      gameBreakdown[row.gameType] = Number(row.cnt);
    }

    res.json({
      totalUsers: Number(totalUsers.count),
      activeSubscriptions: Number(activeSubscriptions.count),
      inactiveUsers: Number(inactiveUsers.count),
      totalSessions: Number(totalSessions.count),
      schoolCount,
      planBreakdown,
      roleBreakdown,
      recentUsers,
      recentSessions,
      gameBreakdown,
    });
  } catch (err: any) {
    console.error("Admin stats error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/users", async (req, res) => {
  try {
    const { search, role, subscription, page = "1", limit = "25" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    let query = db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      username: users.username,
      role: users.role,
      school: users.school,
      isActive: users.isActive,
      notes: users.notes,
      subscriptionStatus: users.subscriptionStatus,
      subscriptionPlan: users.subscriptionPlan,
      stripeCustomerId: users.stripeCustomerId,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users).$dynamic();

    const conditions = [];

    if (search) {
      conditions.push(or(
        ilike(users.name, `%${search}%`),
        ilike(users.email, `%${search}%`),
        ilike(users.username, `%${search}%`),
      ));
    }
    if (role && role !== "all") {
      conditions.push(eq(users.role, role));
    }
    if (subscription === "active") {
      conditions.push(eq(users.subscriptionStatus, "active"));
    } else if (subscription === "inactive") {
      conditions.push(eq(users.subscriptionStatus, "inactive"));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const rows = await query.orderBy(desc(users.createdAt)).limit(limitNum).offset(offset);

    let countQuery = db.select({ count: count() }).from(users).$dynamic();
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    const [{ count: total }] = await countQuery;

    res.json({
      users: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: Number(total),
        pages: Math.ceil(Number(total) / limitNum),
      },
    });
  } catch (err: any) {
    console.error("Admin users error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/users/:id", async (req, res) => {
  try {
    const [user] = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      username: users.username,
      role: users.role,
      school: users.school,
      isActive: users.isActive,
      notes: users.notes,
      subscriptionStatus: users.subscriptionStatus,
      subscriptionPlan: users.subscriptionPlan,
      stripeCustomerId: users.stripeCustomerId,
      stripeSubscriptionId: users.stripeSubscriptionId,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users).where(eq(users.id, req.params.id));
    if (!user) return res.status(404).json({ error: "User not found" });

    const sessions = await db.select().from(gameSessions)
      .where(eq(gameSessions.teacherId, req.params.id))
      .orderBy(desc(gameSessions.startedAt))
      .limit(20);

    res.json({ user, sessions });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(["teacher", "school_admin", "admin"]).optional(),
  school: z.string().optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
  subscriptionStatus: z.enum(["active", "inactive"]).optional(),
  subscriptionPlan: z.enum(["starter", "pro", "school", "district", "free"]).optional(),
  password: z.string().min(6).optional(),
});

router.patch("/users/:id", async (req, res) => {
  try {
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input", details: parsed.error.errors });
    }

    const updates: Record<string, any> = { updatedAt: new Date() };
    const { password, ...rest } = parsed.data;
    Object.assign(updates, rest);
    if (password) {
      updates.password = await hashPassword(password);
    }

    const [updated] = await db.update(users).set(updates).where(eq(users.id, req.params.id)).returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      school: users.school,
      isActive: users.isActive,
      subscriptionStatus: users.subscriptionStatus,
      subscriptionPlan: users.subscriptionPlan,
    });

    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json({ user: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/users/:id/grant-access", async (req, res) => {
  try {
    const { plan = "pro" } = req.body;
    const [updated] = await db.update(users).set({
      subscriptionStatus: "active",
      subscriptionPlan: plan,
      updatedAt: new Date(),
    }).where(eq(users.id, req.params.id)).returning({ id: users.id, subscriptionStatus: users.subscriptionStatus, subscriptionPlan: users.subscriptionPlan });
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, user: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/users/:id/revoke-access", async (req, res) => {
  try {
    const [updated] = await db.update(users).set({
      subscriptionStatus: "inactive",
      updatedAt: new Date(),
    }).where(eq(users.id, req.params.id)).returning({ id: users.id, subscriptionStatus: users.subscriptionStatus });
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, user: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/users/:id/deactivate", async (req, res) => {
  try {
    const [updated] = await db.update(users).set({ isActive: false, updatedAt: new Date() })
      .where(eq(users.id, req.params.id)).returning({ id: users.id, isActive: users.isActive });
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, user: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/users/:id/activate", async (req, res) => {
  try {
    const [updated] = await db.update(users).set({ isActive: true, updatedAt: new Date() })
      .where(eq(users.id, req.params.id)).returning({ id: users.id, isActive: users.isActive });
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, user: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/users/create", async (req, res) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      username: z.string().min(3),
      password: z.string().min(6),
      name: z.string().min(1),
      role: z.enum(["teacher", "school_admin", "admin"]),
      school: z.string().optional(),
      subscriptionStatus: z.enum(["active", "inactive"]).optional(),
      subscriptionPlan: z.enum(["starter", "pro", "school", "district", "free"]).optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.errors });

    const { password, ...rest } = parsed.data;
    const hashed = await hashPassword(password);
    const [user] = await db.insert(users).values({
      ...rest,
      password: hashed,
      school: rest.school || null,
      subscriptionStatus: rest.subscriptionStatus || "inactive",
      subscriptionPlan: rest.subscriptionPlan || null,
    }).returning({ id: users.id, name: users.name, email: users.email, role: users.role });
    res.json({ user });
  } catch (err: any) {
    if (err.code === "23505") return res.status(409).json({ error: "Email or username already exists" });
    res.status(500).json({ error: err.message });
  }
});

router.get("/sessions", async (req, res) => {
  try {
    const { gameType, page = "1", limit = "25" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    let query = db.select().from(gameSessions).$dynamic();
    if (gameType && gameType !== "all") {
      query = query.where(eq(gameSessions.gameType, gameType));
    }

    const rows = await query.orderBy(desc(gameSessions.startedAt)).limit(limitNum).offset(offset);
    const [{ count: total }] = await db.select({ count: count() }).from(gameSessions);

    res.json({ sessions: rows, pagination: { page: pageNum, limit: limitNum, total: Number(total) } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
