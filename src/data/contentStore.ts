"use client";

import { useSyncExternalStore, useCallback } from "react";
import {
  PROFILE_DATA,
  WORK_ITEMS,
  PROJECT_ITEMS,
  PUBLICATION_ITEMS,
  NEWS_ITEMS,
  STACK_ITEMS,
  DAILY_LOG_ITEMS,
  UPDATE_FEED_ITEMS,
  WorkItem,
  ProjectItem,
  PublicationItem,
  NewsItem,
  StackItem,
  DailyLogItem,
  UpdateFeedItem,
} from "./profileData";

export const STORAGE_KEYS = {
  PROJECTS: "ten_admin_projects",
  WORK: "ten_admin_work",
  PUBLICATIONS: "ten_admin_pub",
  STACK: "ten_admin_stack",
  DAILY: "ten_admin_daily",
  NEWS: "ten_admin_news",
  PROFILE: "ten_admin_profile",
} as const;

export const SYNC_EVENT_NAME = "ten-content-updated";

// Helper to trigger cross-component updates in the current window
export function notifyContentUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SYNC_EVENT_NAME));
  }
}

// In-memory cache to ensure referential equality in getSnapshot
interface CacheEntry<T> {
  raw: string | null;
  parsed: T;
}
const memoryCache: Record<string, CacheEntry<unknown>> = {};

// Subscribe to storage & local custom events
function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(SYNC_EVENT_NAME, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(SYNC_EVENT_NAME, callback);
    window.removeEventListener("storage", callback);
  };
}

// Read snapshot safely
function getSnapshot<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const existing = memoryCache[key] as CacheEntry<T> | undefined;
    if (existing && existing.raw === raw) {
      return existing.parsed;
    }
    const parsed = JSON.parse(raw) as T;
    memoryCache[key] = { raw, parsed };
    return parsed;
  } catch {
    return fallback;
  }
}

// Helper safely setting JSON to localStorage
export function setStoredData<T>(key: string, data: T) {
  if (typeof window === "undefined") return;
  try {
    const raw = JSON.stringify(data);
    localStorage.setItem(key, raw);
    memoryCache[key] = { raw, parsed: data };
    notifyContentUpdated();
  } catch (err) {
    console.error(`Failed to save to localStorage (${key}):`, err);
  }
}

// Reset all storage keys to initial profileData constants
export function resetAllToDefault() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.WORK);
    localStorage.removeItem(STORAGE_KEYS.PUBLICATIONS);
    localStorage.removeItem(STORAGE_KEYS.STACK);
    localStorage.removeItem(STORAGE_KEYS.DAILY);
    localStorage.removeItem(STORAGE_KEYS.NEWS);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    Object.keys(memoryCache).forEach((k) => delete memoryCache[k]);
    notifyContentUpdated();
  } catch (err) {
    console.error("Failed to reset storage:", err);
  }
}

// Custom Hook: Profile Data
export function useProfileData() {
  const profile = useSyncExternalStore(
    subscribe,
    () => getSnapshot(STORAGE_KEYS.PROFILE, PROFILE_DATA),
    () => PROFILE_DATA
  );

  const updateProfile = useCallback((newProfile: typeof PROFILE_DATA) => {
    setStoredData(STORAGE_KEYS.PROFILE, newProfile);
  }, []);

  return { profile, updateProfile };
}

// Custom Hook: Projects Data
export function useProjectsData() {
  const projects = useSyncExternalStore(
    subscribe,
    () => getSnapshot(STORAGE_KEYS.PROJECTS, PROJECT_ITEMS),
    () => PROJECT_ITEMS
  );

  const updateProjects = useCallback((newProjects: ProjectItem[]) => {
    setStoredData(STORAGE_KEYS.PROJECTS, newProjects);
  }, []);

  return { projects, updateProjects };
}

// Custom Hook: Work Data
export function useWorkData() {
  const work = useSyncExternalStore(
    subscribe,
    () => getSnapshot(STORAGE_KEYS.WORK, WORK_ITEMS),
    () => WORK_ITEMS
  );

  const updateWork = useCallback((newWork: WorkItem[]) => {
    setStoredData(STORAGE_KEYS.WORK, newWork);
  }, []);

  return { work, updateWork };
}

// Custom Hook: Publications Data
export function usePublicationsData() {
  const publications = useSyncExternalStore(
    subscribe,
    () => getSnapshot(STORAGE_KEYS.PUBLICATIONS, PUBLICATION_ITEMS),
    () => PUBLICATION_ITEMS
  );

  const updatePublications = useCallback((newPubs: PublicationItem[]) => {
    setStoredData(STORAGE_KEYS.PUBLICATIONS, newPubs);
  }, []);

  return { publications, updatePublications };
}

// Custom Hook: Stack / Alat Data
export function useStackData() {
  const stack = useSyncExternalStore(
    subscribe,
    () => getSnapshot(STORAGE_KEYS.STACK, STACK_ITEMS),
    () => STACK_ITEMS
  );

  const updateStack = useCallback((newStack: StackItem[]) => {
    setStoredData(STORAGE_KEYS.STACK, newStack);
  }, []);

  return { stack, updateStack };
}

// Custom Hook: Daily Logs Data
export function useDailyData() {
  const dailyLogs = useSyncExternalStore(
    subscribe,
    () => getSnapshot(STORAGE_KEYS.DAILY, DAILY_LOG_ITEMS),
    () => DAILY_LOG_ITEMS
  );

  const updateDailyLogs = useCallback((newDaily: DailyLogItem[]) => {
    setStoredData(STORAGE_KEYS.DAILY, newDaily);
  }, []);

  return { dailyLogs, updateDailyLogs };
}

// Custom Hook: News Data
export function useNewsData() {
  const news = useSyncExternalStore(
    subscribe,
    () => getSnapshot(STORAGE_KEYS.NEWS, NEWS_ITEMS),
    () => NEWS_ITEMS
  );

  const updateNews = useCallback((newNews: NewsItem[]) => {
    setStoredData(STORAGE_KEYS.NEWS, newNews);
  }, []);

  return { news, updateNews };
}

// Custom Hook for Unified Updates Feed (used on Homepage)
export function useUpdatesFeed() {
  const { projects } = useProjectsData();
  const { publications } = usePublicationsData();
  const { stack } = useStackData();
  const { dailyLogs } = useDailyData();
  const { work } = useWorkData();

  // Combine top items dynamically
  const updates: UpdateFeedItem[] = [
    ...(projects[0]
      ? [
          {
            id: `proj-${projects[0].slug}`,
            badge: "Karya" as const,
            title: projects[0].name,
            date: "Terbaru",
            summary: projects[0].description,
            link: projects[0].href || `/karya/details?id=proj-${projects[0].slug}`,
            imageUrl: projects[0].imageUrl,
          },
        ]
      : []),
    ...(publications[0]
      ? [
          {
            id: `pub-${publications[0].id}`,
            badge: "Riset" as const,
            title: publications[0].title,
            date: `Tahun ${publications[0].year}`,
            summary: publications[0].summary,
            link: publications[0].href || `/karya/details?id=pub-${publications[0].id}`,
            imageUrl: publications[0].imageUrl,
          },
        ]
      : []),
    ...(stack[0]
      ? [
          {
            id: `stack-${stack[0].id}`,
            badge: "Alat" as const,
            title: stack[0].name,
            date: "Aktif",
            summary: stack[0].description,
            link: `/alat/details?id=${stack[0].id}`,
            imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
          },
        ]
      : []),
    ...(dailyLogs[0]
      ? [
          {
            id: `daily-${dailyLogs[0].id}`,
            badge: "Keseharian" as const,
            title: dailyLogs[0].title,
            date: dailyLogs[0].date,
            summary: dailyLogs[0].summary,
            link: `/keseharian/details?id=${dailyLogs[0].id}`,
            imageUrl: dailyLogs[0].imageUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
          },
        ]
      : []),
    ...(work[0]
      ? [
          {
            id: `work-${work[0].id}`,
            badge: "Pengalaman" as const,
            title: `${work[0].role} @ ${work[0].company}`,
            date: work[0].period,
            summary: work[0].summary,
            link: `/pengalaman/details?id=${work[0].id}`,
            imageUrl: work[0].imageUrl,
          },
        ]
      : []),
  ];

  return updates.length > 0 ? updates : UPDATE_FEED_ITEMS;
}
