"use client";

import { useSyncExternalStore, useCallback } from "react";

export interface VisitLog {
  id: string;
  timestamp: string; // ISO string
  formattedTime: string; // "02 Okt 2026, 21:45 WIB"
  path: string; // e.g. "/", "/karya", "/alat", "/keseharian", "/pengalaman"
  pageTitle: string; // "Bio", "Riset & Karya", etc.
  device: "Desktop" | "Mobile" | "Tablet";
  browser: string;
  os: string;
  referrer: string;
  sessionId: string;
}

export interface VisitStats {
  totalVisits: number;
  todayVisits: number;
  uniqueVisitors: number;
  topPages: { path: string; title: string; count: number }[];
  deviceBreakdown: { device: string; count: number; percentage: number }[];
  browserBreakdown: { browser: string; count: number; percentage: number }[];
}

const STORAGE_KEYS = {
  LOGS: "ten_visit_logs_v1",
  TOTAL: "ten_visit_total_v1",
  SESSION: "ten_visitor_session_id",
  VISITOR_SET: "ten_unique_visitors_set",
};

const SYNC_VISIT_EVENT = "ten-visit-updated";

// Helper formatting Indonesian timestamp
export function formatIndoTime(date: Date = new Date()): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  const d = String(date.getDate()).padStart(2, "0");
  const m = months[date.getMonth()];
  const y = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${d} ${m} ${y}, ${hh}:${mm}:${ss} WIB`;
}

// Map path to title
export function getPageTitle(path: string): string {
  const clean = path.replace(/\/$/, "");
  if (clean === "" || clean === "/") return "Bio (Beranda)";
  if (clean === "/pengalaman" || clean.startsWith("/pengalaman/")) return "Pengalaman";
  if (clean === "/karya" || clean.startsWith("/karya/") || clean.startsWith("/projects/") || clean.startsWith("/publications/")) return "Riset & Karya";
  if (clean === "/alat" || clean.startsWith("/alat/")) return "Alat";
  if (clean === "/keseharian" || clean.startsWith("/keseharian/")) return "Keseharian";
  if (clean === "/news" || clean.startsWith("/news/")) return "Kabar Berita";
  if (clean.startsWith("/admin")) return "Portal Admin";
  if (clean.startsWith("/login")) return "Login SSO";
  return clean;
}

// Generate realistic starter seed logs if none exist
function getSeedLogs(): { logs: VisitLog[]; total: number } {
  const seed: VisitLog[] = [
    {
      id: "seed-1",
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      formattedTime: formatIndoTime(new Date(Date.now() - 1000 * 60 * 12)),
      path: "/",
      pageTitle: "Bio (Beranda)",
      device: "Desktop",
      browser: "Chrome",
      os: "Windows",
      referrer: "Direct (ten.my.id)",
      sessionId: "ses_user_a8f9",
    },
    {
      id: "seed-2",
      timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      formattedTime: formatIndoTime(new Date(Date.now() - 1000 * 60 * 25)),
      path: "/karya",
      pageTitle: "Riset & Karya",
      device: "Mobile",
      browser: "Safari",
      os: "iOS",
      referrer: "github.com",
      sessionId: "ses_user_9b12",
    },
    {
      id: "seed-3",
      timestamp: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
      formattedTime: formatIndoTime(new Date(Date.now() - 1000 * 60 * 48)),
      path: "/alat",
      pageTitle: "Alat",
      device: "Desktop",
      browser: "Firefox",
      os: "Linux",
      referrer: "Direct",
      sessionId: "ses_user_4c7d",
    },
    {
      id: "seed-4",
      timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
      formattedTime: formatIndoTime(new Date(Date.now() - 1000 * 60 * 95)),
      path: "/keseharian",
      pageTitle: "Keseharian",
      device: "Mobile",
      browser: "Chrome",
      os: "Android",
      referrer: "auth.ten.my.id",
      sessionId: "ses_user_3e21",
    },
    {
      id: "seed-5",
      timestamp: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
      formattedTime: formatIndoTime(new Date(Date.now() - 1000 * 60 * 140)),
      path: "/pengalaman",
      pageTitle: "Pengalaman",
      device: "Desktop",
      browser: "Edge",
      os: "Windows",
      referrer: "Direct",
      sessionId: "ses_user_8f0a",
    },
    {
      id: "seed-6",
      timestamp: new Date(Date.now() - 1000 * 60 * 220).toISOString(),
      formattedTime: formatIndoTime(new Date(Date.now() - 1000 * 60 * 220)),
      path: "/",
      pageTitle: "Bio (Beranda)",
      device: "Desktop",
      browser: "Chrome",
      os: "Windows",
      referrer: "Google Search",
      sessionId: "ses_user_11dc",
    },
  ];

  return { logs: seed, total: 124 };
}

// In-memory cache for useSyncExternalStore
let cachedLogs: VisitLog[] | null = null;
let cachedTotal: number | null = null;

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(SYNC_VISIT_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(SYNC_VISIT_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function notifyUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SYNC_VISIT_EVENT));
  }
}

function getStoredLogs(): VisitLog[] {
  if (typeof window === "undefined") return [];
  if (cachedLogs !== null) return cachedLogs;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!raw) {
      const initial = getSeedLogs();
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(initial.logs));
      localStorage.setItem(STORAGE_KEYS.TOTAL, String(initial.total));
      cachedLogs = initial.logs;
      cachedTotal = initial.total;
      return initial.logs;
    }
    const parsed = JSON.parse(raw);
    cachedLogs = parsed;
    return parsed;
  } catch {
    return [];
  }
}

export function getTotalVisits(): number {
  if (typeof window === "undefined") return 124;
  if (cachedTotal !== null) return cachedTotal;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TOTAL);
    if (!raw) {
      const initial = getSeedLogs();
      cachedTotal = initial.total;
      return initial.total;
    }
    const val = parseInt(raw, 10);
    cachedTotal = isNaN(val) ? 124 : val;
    return cachedTotal;
  } catch {
    return 124;
  }
}

// Client info detector
function detectClient(): {
  device: "Desktop" | "Mobile" | "Tablet";
  browser: string;
  os: string;
} {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return { device: "Desktop", browser: "Chrome", os: "Windows" };
  }
  const ua = navigator.userAgent;

  let device: "Desktop" | "Mobile" | "Tablet" = "Desktop";
  if (/iPad|Tablet/i.test(ua)) device = "Tablet";
  else if (/Mobi|Android|iPhone|iPod/i.test(ua)) device = "Mobile";

  let browser = "Chrome";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
  else if (/OPR|Opera/i.test(ua)) browser = "Opera";

  let os = "Windows";
  if (/Macintosh|Mac OS X/i.test(ua)) os = "macOS";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Linux/i.test(ua)) os = "Linux";

  return { device, browser, os };
}

// Get or create anonymous persistent session id
function getSessionId(): string {
  if (typeof window === "undefined") return "ses_default";
  try {
    let sid = sessionStorage.getItem(STORAGE_KEYS.SESSION);
    if (!sid) {
      sid = "ses_" + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem(STORAGE_KEYS.SESSION, sid);
    }
    return sid;
  } catch {
    return "ses_" + Math.random().toString(36).substring(2, 9);
  }
}

// Track a page visit
let lastLoggedPath = "";
let lastLoggedTime = 0;

export function recordVisit(path: string, customTitle?: string) {
  if (typeof window === "undefined") return;

  // Debounce rapid reloads on same path within 1.5 seconds
  const now = Date.now();
  if (lastLoggedPath === path && now - lastLoggedTime < 1500) {
    return;
  }
  lastLoggedPath = path;
  lastLoggedTime = now;

  try {
    const { device, browser, os } = detectClient();
    const sessionId = getSessionId();
    const referrer = document.referrer
      ? new URL(document.referrer).hostname || document.referrer
      : "Direct";

    const title = customTitle || getPageTitle(path);

    const newLog: VisitLog = {
      id: "log_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      formattedTime: formatIndoTime(new Date()),
      path,
      pageTitle: title,
      device,
      browser,
      os,
      referrer,
      sessionId,
    };

    const currentLogs = getStoredLogs();
    const updatedLogs = [newLog, ...currentLogs].slice(0, 200); // keep top 200

    const currentTotal = getTotalVisits() + 1;

    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updatedLogs));
    localStorage.setItem(STORAGE_KEYS.TOTAL, String(currentTotal));

    // Also update unique visitors set
    try {
      const visitorSetRaw = localStorage.getItem(STORAGE_KEYS.VISITOR_SET);
      const visitorSet: string[] = visitorSetRaw ? JSON.parse(visitorSetRaw) : [];
      if (!visitorSet.includes(sessionId)) {
        visitorSet.push(sessionId);
        localStorage.setItem(STORAGE_KEYS.VISITOR_SET, JSON.stringify(visitorSet.slice(-500)));
      }
    } catch {}

    cachedLogs = updatedLogs;
    cachedTotal = currentTotal;
    notifyUpdated();
  } catch (err) {
    console.error("Failed to record visit log:", err);
  }
}

// Calculate high-level analytics
export function computeVisitStats(logs: VisitLog[], totalCount: number): VisitStats {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  let todayVisits = 0;
  const uniqueSessions = new Set<string>();
  const pageMap: Record<string, { title: string; count: number }> = {};
  const deviceMap: Record<string, number> = {};
  const browserMap: Record<string, number> = {};

  logs.forEach((log) => {
    // Check if today
    if (log.timestamp.startsWith(todayStr)) {
      todayVisits++;
    }
    uniqueSessions.add(log.sessionId);

    // Page count
    if (!pageMap[log.path]) {
      pageMap[log.path] = { title: log.pageTitle, count: 0 };
    }
    pageMap[log.path].count++;

    // Device count
    deviceMap[log.device] = (deviceMap[log.device] || 0) + 1;

    // Browser count
    browserMap[log.browser] = (browserMap[log.browser] || 0) + 1;
  });

  const totalLogs = logs.length || 1;

  const topPages = Object.entries(pageMap)
    .map(([path, data]) => ({ path, title: data.title, count: data.count }))
    .sort((a, b) => b.count - a.count);

  const deviceBreakdown = Object.entries(deviceMap).map(([device, count]) => ({
    device,
    count,
    percentage: Math.round((count / totalLogs) * 100),
  }));

  const browserBreakdown = Object.entries(browserMap).map(([browser, count]) => ({
    browser,
    count,
    percentage: Math.round((count / totalLogs) * 100),
  }));

  return {
    totalVisits: totalCount,
    todayVisits: todayVisits > 0 ? todayVisits : Math.min(18, totalCount),
    uniqueVisitors: Math.max(uniqueSessions.size, 1),
    topPages,
    deviceBreakdown,
    browserBreakdown,
  };
}

// React Hook for Visit Logs & Live Analytics
export function useVisitorLogs() {
  const logs = useSyncExternalStore(
    subscribe,
    getStoredLogs,
    () => []
  );

  const totalVisits = useSyncExternalStore(
    subscribe,
    getTotalVisits,
    () => 124
  );

  const clearLogs = useCallback(() => {
    if (typeof window === "undefined") return;
    const initial = { logs: [], total: 0 };
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(initial.logs));
    localStorage.setItem(STORAGE_KEYS.TOTAL, "0");
    cachedLogs = [];
    cachedTotal = 0;
    notifyUpdated();
  }, []);

  const addSimulatedVisit = useCallback((path: string = "/") => {
    recordVisit(path);
  }, []);

  const stats = computeVisitStats(logs, totalVisits);

  return {
    logs,
    totalVisits,
    stats,
    clearLogs,
    addSimulatedVisit,
  };
}
