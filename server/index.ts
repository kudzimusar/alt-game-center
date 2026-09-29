import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { db } from "./db";
import { sql } from "drizzle-orm";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const { default: stripeRouter } = await import("./stripeRoutes");
  (stripeRouter as any).handle(req, res);
});

app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf; } }));
app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true });
  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;
  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      log(logLine);
    }
  });
  next();
});

async function ensureSchema() {
  try {
    await db.execute(sql`CREATE TABLE IF NOT EXISTS users (id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(), email TEXT NOT NULL UNIQUE, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL, name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'teacher', school TEXT, stripe_customer_id TEXT, stripe_subscription_id TEXT, subscription_status TEXT DEFAULT 'inactive', subscription_plan TEXT, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())`);
    const userCols: Array<[string, string]> = [["email", "TEXT"], ["username", "TEXT"], ["password", "TEXT"], ["name", "TEXT NOT NULL DEFAULT 'User'"], ["role", "TEXT NOT NULL DEFAULT 'teacher'"], ["school", "TEXT"], ["is_active", "BOOLEAN NOT NULL DEFAULT TRUE"], ["notes", "TEXT"], ["stripe_customer_id", "TEXT"], ["stripe_subscription_id", "TEXT"], ["subscription_status", "TEXT DEFAULT 'inactive'"], ["subscription_plan", "TEXT"], ["created_at", "TIMESTAMP DEFAULT NOW()"], ["updated_at", "TIMESTAMP DEFAULT NOW()"]];
    for (const [col, def] of userCols) await db.execute(sql.raw(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ${col} ${def}`));
    await db.execute(sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_email_unique') THEN ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email); END IF; END $$`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS live_sessions (id VARCHAR PRIMARY KEY, code VARCHAR(5) NOT NULL UNIQUE, teacher_id VARCHAR NOT NULL, grade VARCHAR(1) NOT NULL, topic TEXT NOT NULL, mode VARCHAR(20) NOT NULL DEFAULT 'individual', status VARCHAR(30) NOT NULL DEFAULT 'waiting', participant_count INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT NOW(), ended_at TIMESTAMP)`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS live_participants (id VARCHAR PRIMARY KEY, session_id VARCHAR NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE, name TEXT NOT NULL, group_name VARCHAR(1), device_id TEXT, joined_at TIMESTAMP DEFAULT NOW(), is_active BOOLEAN DEFAULT TRUE)`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS live_responses (id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(), session_id VARCHAR NOT NULL, participant_id VARCHAR NOT NULL, question_id VARCHAR NOT NULL, answer TEXT NOT NULL, is_correct BOOLEAN NOT NULL DEFAULT FALSE, points_awarded INTEGER DEFAULT 0, response_rank INTEGER DEFAULT 0, submitted_at BIGINT NOT NULL)`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS live_scores (id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(), session_id VARCHAR NOT NULL, participant_id VARCHAR NOT NULL, participant_name TEXT NOT NULL, group_name VARCHAR(1), total_points INTEGER DEFAULT 0, streak INTEGER DEFAULT 0, fastest_count INTEGER DEFAULT 0, UNIQUE(session_id, participant_id))`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS notes TEXT`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS game_sessions (id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(), teacher_id VARCHAR REFERENCES users(id) ON DELETE SET NULL, teacher_name TEXT, game_type TEXT NOT NULL, week_number INTEGER, room_code TEXT, student_count INTEGER DEFAULT 0, mode TEXT DEFAULT 'multiplayer', started_at TIMESTAMP DEFAULT NOW(), ended_at TIMESTAMP)`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS analytics_events (id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(), user_id VARCHAR REFERENCES users(id) ON DELETE SET NULL, session_id TEXT, event_type TEXT NOT NULL, page_path TEXT, game_type TEXT, duration_seconds INTEGER, metadata TEXT, created_at TIMESTAMP DEFAULT NOW())`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_analytics_game_type ON analytics_events(game_type)`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS newsletter_subscribers (id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(), email TEXT NOT NULL UNIQUE, name TEXT, status TEXT NOT NULL DEFAULT 'active', source TEXT NOT NULL DEFAULT 'signup', user_id VARCHAR REFERENCES users(id) ON DELETE SET NULL, tags TEXT, unsub_token TEXT NOT NULL, subscribed_at TIMESTAMP DEFAULT NOW(), unsubscribed_at TIMESTAMP)`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS newsletter_campaigns (id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(), subject TEXT NOT NULL, preview_text TEXT, html_content TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'draft', sent_by VARCHAR REFERENCES users(id) ON DELETE SET NULL, recipient_count INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT NOW(), sent_at TIMESTAMP)`);
    log("Database schema ready");
  } catch (err: any) { log(`Schema error: ${err.message}`); }
}

(async () => {
  await ensureSchema();
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error(`[error] ${status} ${message}`);
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    { port, host: "0.0.0.0", reusePort: true },
    () => { log(`serving on port ${port}`); },
  );
})();
