"use client";

import React, { ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/components/AuthProvider";
import { AdminProvider, useAdmin } from "./AdminContext";

function AdminLayoutInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status: authStatus } = useSession();
  const { requestConfirm } = useAdmin();

  // Redirect if unauthenticated
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace("/login");
    }
  }, [authStatus, router]);

  if (authStatus === "loading") {
    return (
      <div className="admin-loading-screen">
        <div className="admin-loading-card">
          <div className="admin-logo-badge" style={{ display: "inline-block", marginBottom: "0.5rem" }}>
            TEN
          </div>
          <h3>Memeriksa Otorisasi Sesi...</h3>
          <p>Memvalidasi identitas pengelola platform</p>
        </div>
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    return null;
  }

  const isOverview = pathname === "/admin" || pathname === "/admin/overview";
  const isContent = pathname.startsWith("/admin/content");
  const isProfile = pathname.startsWith("/admin/profile");
  const isSso = pathname.startsWith("/admin/sso");
  const isBackup = pathname.startsWith("/admin/backup");

  const handleLogout = () => {
    requestConfirm({
      title: "Konfirmasi Keluar Sesi",
      message: "Apakah Anda yakin ingin mengakhiri sesi administrator dan keluar?",
      confirmLabel: "Keluar Sesi",
      cancelLabel: "Batal",
      isDanger: false,
      onConfirm: () => {
        signOut();
      },
    });
  };

  return (
    <div className="admin-portal-container">
      {/* Top Bar */}
      <header className="admin-topbar">
        <div className="admin-brand-group">
          <Link href="/admin" className="admin-logo" style={{ textDecoration: "none" }}>
            <span className="admin-logo-badge">TEN</span>
            <span className="admin-logo-text">Admin Portal</span>
          </Link>
          <span className="admin-status-indicator" title="Edge Platform Online">
            <span className="admin-status-dot"></span>
            Cloudflare Edge Live
          </span>
        </div>

        <div className="admin-topbar-actions">
          <Link href="/" className="admin-return-btn" title="Buka Halaman Depan Publik">
            ← Web Publik
          </Link>

          <div className="admin-user-pill-top">
            <span className="admin-user-avatar">
              {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "A"}
            </span>
            <div className="admin-user-text">
              <span className="admin-user-name">
                {session?.user?.name || session?.user?.email || "Admin"}
              </span>
              <span className="admin-user-badge">
                {session?.user?.role || "ADMIN"}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="admin-logout-btn"
            onClick={handleLogout}
            title="Keluar dari sesi administrator"
          >
            Keluar
          </button>
        </div>
      </header>

      {/* Navigation Tabs (Desktop Top Bar & Mobile Fixed Bottom Bar) */}
      <nav className="admin-tabs-nav" aria-label="Menu Navigasi Admin">
        <Link
          href="/admin"
          className={`admin-tab-btn ${isOverview ? "active" : ""}`}
        >
          <span className="admin-tab-icon-pill">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="9" rx="1" />
              <rect x="14" y="3" width="7" height="5" rx="1" />
              <rect x="14" y="12" width="7" height="9" rx="1" />
              <rect x="3" y="16" width="7" height="5" rx="1" />
            </svg>
          </span>
          <span className="admin-tab-label-full">Ringkasan</span>
          <span className="admin-tab-label-short">Overview</span>
        </Link>

        <Link
          href="/admin/content"
          className={`admin-tab-btn ${isContent ? "active" : ""}`}
        >
          <span className="admin-tab-icon-pill">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </span>
          <span className="admin-tab-label-full">Kelola Konten</span>
          <span className="admin-tab-label-short">Konten</span>
        </Link>

        <Link
          href="/admin/profile"
          className={`admin-tab-btn ${isProfile ? "active" : ""}`}
        >
          <span className="admin-tab-icon-pill">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
          <span className="admin-tab-label-full">Profil & Identitas</span>
          <span className="admin-tab-label-short">Profil</span>
        </Link>

        <Link
          href="/admin/sso"
          className={`admin-tab-btn ${isSso ? "active" : ""}`}
        >
          <span className="admin-tab-icon-pill">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
          <span className="admin-tab-label-full">Autentikasi SSO</span>
          <span className="admin-tab-label-short">SSO</span>
        </Link>

        <Link
          href="/admin/backup"
          className={`admin-tab-btn ${isBackup ? "active" : ""}`}
        >
          <span className="admin-tab-icon-pill">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </span>
          <span className="admin-tab-label-full">Cadangan & Reset</span>
          <span className="admin-tab-label-short">Backup</span>
        </Link>
      </nav>

      {/* Main Routed Page Content */}
      <main className="admin-main-viewport">
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminProvider>
  );
}
