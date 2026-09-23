"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PROFILE_DATA } from "@/data/profileData";

const NAV_ITEMS = [
  { label: "Beranda", shortLabel: "Beranda", href: "/" },
  { label: "Pengalaman", shortLabel: "Pengalaman", href: "/pengalaman" },
  { label: "Riset & Karya", shortLabel: "Karya", href: "/karya" },
  { label: "Alat", shortLabel: "Alat", href: "/alat" },
  { label: "Keseharian", shortLabel: "Harian", href: "/keseharian" },
];

export default function Header() {
  const pathname = usePathname();
  const cleanPath = pathname.replace(/\/$/, "");
  const isDetailPage =
    cleanPath.includes("/details") ||
    cleanPath === "/projects/views-counter" ||
    cleanPath === "/projects/scratchpad" ||
    cleanPath === "/projects/cloudflare-status" ||
    cleanPath === "/projects/docs-api" ||
    cleanPath === "/admin" ||
    cleanPath.startsWith("/admin/") ||
    cleanPath === "/login" ||
    cleanPath.startsWith("/login/");

  if (isDetailPage) {
    return null;
  }

  return (
    <header className="profile-header-wrap">
      {/* Photo Profile */}
      <div className="profile-avatar-box">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PROFILE_DATA.avatarUrl}
          alt={PROFILE_DATA.name}
          className="profile-avatar-img"
        />
        <div className="profile-status-dot" title={PROFILE_DATA.status}></div>
      </div>

      {/* Nama & Tagline Netral */}
      <h1 className="profile-name">{PROFILE_DATA.name}</h1>
      <div className="profile-tagline">{PROFILE_DATA.tagline}</div>

      {/* Deskripsi Bio Netral */}
      <p className="profile-bio">{PROFILE_DATA.bio}</p>

      {/* Kontak & Media Icons di Bawah Bio - Halus & Tidak Mencolok */}
      <div className="profile-media-icons-row">
        <a
          href={`mailto:${PROFILE_DATA.contact.email}`}
          className="profile-contact-icon"
          title={`Email: ${PROFILE_DATA.contact.email}`}
          aria-label="Email"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </a>

        <a
          href={PROFILE_DATA.contact.website}
          target="_blank"
          rel="noopener noreferrer"
          className="profile-contact-icon"
          title="Website (ten.my.id)"
          aria-label="Website"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </a>

        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="profile-contact-icon"
          title="GitHub"
          aria-label="GitHub"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
          </svg>
        </a>

        <a
          href={PROFILE_DATA.contact.docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="profile-contact-icon"
          title="Dokumentasi Panduan"
          aria-label="Dokumentasi Panduan"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </a>

        <a
          href={PROFILE_DATA.contact.ssoPortal}
          target="_blank"
          rel="noopener noreferrer"
          className="profile-contact-icon"
          title="Portal Akses"
          aria-label="Portal Akses"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </a>
      </div>

      {/* Statistik Minimalis di Atas Navigasi */}
      <div className="stats-bar">
        {PROFILE_DATA.stats.map((stat, idx) => (
          <React.Fragment key={stat.label}>
            {idx > 0 && <span className="stat-sep">•</span>}
            <div className="stat-pill">
              <span className="stat-num">{stat.value}</span>
              <span className="stat-lbl">{stat.label}</span>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Navigasi Utama (5 Pilar) */}
      <nav className="bio-nav-bar" aria-label="Navigasi Utama">
        <ul className="bio-nav-list">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? cleanPath === "" || cleanPath === "/"
                : cleanPath === item.href ||
                  cleanPath.startsWith(item.href + "/") ||
                  (item.href === "/pengalaman" && (cleanPath === "/work" || cleanPath.startsWith("/work/"))) ||
                  (item.href === "/karya" && (cleanPath === "/projects" || cleanPath.startsWith("/projects/") || cleanPath === "/publications" || cleanPath.startsWith("/publications/")));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`bio-nav-btn ${isActive ? "active" : ""}`}
                  title={item.label}
                >
                  <span className="bio-nav-label-full">{item.label}</span>
                  <span className="bio-nav-label-short">{item.shortLabel || item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
