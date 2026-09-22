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
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/api/auth/signout";
  }
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch session");
        return res.json();
      })
      .then((data) => {
        if (data?.user) {
          setSession(data);
          setStatus("authenticated");
        } else {
          setSession(null);
          setStatus("unauthenticated");
        }
      })
      .catch(() => {
        setSession(null);
        setStatus("unauthenticated");
      });
  }, []);

  return (
    <AuthContext.Provider value={{ data: session, status }}>
      {children}
    </AuthContext.Provider>
  );
}
