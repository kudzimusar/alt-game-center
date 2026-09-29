import { Router } from "express";
import { requireAuth, requireAdmin } from "./auth";
import { sendWeeklyNewsletter } from "./weeklyNewsletterService";

const router = Router();

router.post("/run", requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await sendWeeklyNewsletter();
    res.json({ ok: true, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
