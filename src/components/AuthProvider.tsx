"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface SessionUser {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
}

export interface SessionData {
  user?: SessionUser | null;
  expires?: string;
}

export interface AuthContextType {
  data: SessionData | null;
  status: "loading" | "authenticated" | "unauthenticated";
}

const AuthContext = createContext<AuthContextType>({
  data: null,
  status: "loading",
});

export function useSession() {
  return useContext(AuthContext);
}

export function signIn(providerId = "ten-accounts") {
  if (typeof window !== "undefined") {
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = `/api/auth/signin/${providerId}`;
  }
}

export function signOut() {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("ten_session_override");
    } catch {}
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/api/auth/signout";
  }
}

export function loginLocalAdmin(
  name = "Administrator TEN",
  email = "admin@ten.my.id",
  role = "admin"
) {
  const sessionPayload: SessionData = {
    user: { id: "admin-local", name, email, role },
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
  try {
    localStorage.setItem("ten_session_override", JSON.stringify(sessionPayload));
    window.location.href = "/admin";
  } catch {}
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      try {
        const local = localStorage.getItem("ten_session_override");
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed?.user && isMounted) {
            setSession(parsed);
            setStatus("authenticated");
            return;
          }
        }
      } catch {}

      fetch("/api/auth/session")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch session");
          return res.json();
        })
        .then((data) => {
          if (!isMounted) return;
          if (data?.user) {
            setSession(data);
            setStatus("authenticated");
          } else {
            setSession(null);
            setStatus("unauthenticated");
          }
        })
        .catch(() => {
          if (isMounted) {
            setSession(null);
            setStatus("unauthenticated");
          }
        });
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ data: session, status }}>
      {children}
    </AuthContext.Provider>
  );
}
