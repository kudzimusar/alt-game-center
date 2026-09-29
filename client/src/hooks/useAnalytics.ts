import { useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { getToken } from "@/lib/auth";

const SESSION_KEY = "alt_analytics_session";

function getSessionId(): string {
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

async function sendEvent(eventType: string, data: Record<string, any> = {}) {
  const token = getToken();
  const sessionId = getSessionId();
  try {
    await fetch("/api/analytics/event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ eventType, sessionId, ...data }),
      keepalive: true,
    });
  } catch {
    // Analytics never breaks the app
  }
}

export function usePageAnalytics(pagePath?: string) {
  const [location] = useLocation();
  const startTimeRef = useRef<number>(Date.now());
  const effectivePath = pagePath || location;

  useEffect(() => {
    startTimeRef.current = Date.now();
    sendEvent("page_view", { pagePath: effectivePath });

    return () => {
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (duration >= 1) {
        sendEvent("page_exit", { pagePath: effectivePath, durationSeconds: duration });
      }
    };
  }, [effectivePath]);
}

export function useGameAnalytics(gameType: string) {
  const startTimeRef = useRef<number>(Date.now());

  const trackStart = useCallback((extra: Record<string, any> = {}) => {
    startTimeRef.current = Date.now();
    sendEvent("game_start", { gameType, ...extra });
  }, [gameType]);

  const trackEnd = useCallback((extra: Record<string, any> = {}) => {
    const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
    sendEvent("game_end", { gameType, durationSeconds: duration, ...extra });
  }, [gameType]);

  const trackJoin = useCallback((extra: Record<string, any> = {}) => {
    sendEvent("game_join", { gameType, ...extra });
  }, [gameType]);

  return { trackStart, trackEnd, trackJoin };
}

export { sendEvent };
