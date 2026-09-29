import { Router } from "express";

const router = Router();

const SERPER_KEY = process.env.SERPER_API_KEY || "57bf2beb67e1b19d35b75e0b80b6d393bb5f0aa1";
const GOOGLE_CSE_KEY = process.env.GOOGLE_CSE_API_KEY || "";
const GOOGLE_CSE_CX = process.env.GOOGLE_CSE_CX || "";

async function fetchSerper(query: string): Promise<string | null> {
  try {
    const res = await fetch("https://google.serper.dev/images", {
      method: "POST",
      headers: {
        "X-API-KEY": SERPER_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query, num: 3, gl: "jp" }),
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.images && data.images.length > 0) {
      return data.images[0].imageUrl ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchGoogleCSE(query: string): Promise<string | null> {
  if (!GOOGLE_CSE_KEY || !GOOGLE_CSE_CX) return null;
  try {
    const params = new URLSearchParams({
      key: GOOGLE_CSE_KEY,
      cx: GOOGLE_CSE_CX,
      q: query,
      searchType: "image",
      num: "3",
      safe: "active",
    });
    const url = `https://www.googleapis.com/customsearch/v1?${params.toString()}`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.items && data.items.length > 0) {
      return data.items[0].link ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

router.get("/", async (req, res) => {
  const query = (req.query.q as string || "").trim();
  if (!query) {
    return res.status(400).json({ error: "Missing query parameter: q" });
  }

  // Try Serper first
  let imageUrl = await fetchSerper(query);

  // Fall back to Google Custom Search
  if (!imageUrl) {
    imageUrl = await fetchGoogleCSE(query);
  }

  if (!imageUrl) {
    return res.json({ imageUrl: null, source: "none" });
  }

  return res.json({
    imageUrl,
    source: imageUrl ? (imageUrl.includes("serper") || !GOOGLE_CSE_KEY ? "serper" : "google") : "none",
  });
});

export default router;
