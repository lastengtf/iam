"use client";

import React from "react";
import Link from "next/link";
import { useProfileData } from "@/data/contentStore";

export default function BioHomePage() {
  const { profile } = useProfileData();

  return (
    <div className="bio-ringkas-container">
      {/* 1. Profil Ringkas & Intro Personal */}
      <section className="section-box" style={{ padding: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <span className="bio-pulse-dot"></span>
          <span style={{ fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--mono-gray-mid)" }}>
            Bio Personal
          </span>
          <span style={{ color: "var(--border-subtle)" }}>•</span>
          <span style={{ fontSize: "0.78rem", color: "#10b981", fontWeight: 600 }}>
            {profile.status || "Terbuka untuk Kolaborasi"}
          </span>
        </div>

        <h2 style={{ fontSize: "1.45rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--mono-black)", marginBottom: "0.65rem", lineHeight: 1.3 }}>
          {profile.tagline || "Eksplorasi Karya, Inisiatif Mandiri, & Dokumentasi Terbuka"}
        </h2>

        <p style={{ fontSize: "0.96rem", lineHeight: 1.65, color: "var(--text-main)", marginBottom: "1rem" }}>
          {profile.aboutIntro || profile.bio}
        </p>

        {/* Paragraf Ringkas Inti */}
        {profile.aboutParagraphs && profile.aboutParagraphs[0] && (
          <p style={{ fontSize: "0.88rem", lineHeight: 1.6, color: "var(--text-dim)", margin: 0 }}>
            {profile.aboutParagraphs[0]}
          </p>
        )}

        {/* Fokus Ringkas (Chips / Badges) */}
        {profile.currentFocus && profile.currentFocus.length > 0 && (
          <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid var(--border-subtle)", display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--mono-gray-mid)", marginRight: "0.25rem" }}>
              Fokus Utama:
            </span>
            {profile.currentFocus.map((f) => (
              <span
                key={f.id}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.25rem 0.65rem",
                  background: "var(--bg-hover)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "9999px",
                  fontSize: "0.78rem",
                  color: "var(--mono-black)",
                  fontWeight: 500,
                }}
              >
                <span>{f.icon || "⚡"}</span>
                <span>{f.title}</span>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* 2. Jelajahi 4 Pilar Utama (Ringkas & Langsung) */}
      <div className="bio-ringkas-nav-grid">
        <Link href="/pengalaman" className="bio-ringkas-card">
          <div className="bio-ringkas-card-icon">💼</div>
          <div className="bio-ringkas-card-text">
            <span className="bio-ringkas-card-title">Pengalaman</span>
            <span className="bio-ringkas-card-sub">Rekam jejak & peran kerja</span>
          </div>
          <span className="bio-ringkas-arrow">↗</span>
        </Link>

        <Link href="/karya" className="bio-ringkas-card">
          <div className="bio-ringkas-card-icon">🚀</div>
          <div className="bio-ringkas-card-text">
            <span className="bio-ringkas-card-title">Riset & Karya</span>
            <span className="bio-ringkas-card-sub">Aplikasi web & tulisan ilmiah</span>
          </div>
          <span className="bio-ringkas-arrow">↗</span>
        </Link>

        <Link href="/alat" className="bio-ringkas-card">
          <div className="bio-ringkas-card-icon">🛠️</div>
          <div className="bio-ringkas-card-text">
            <span className="bio-ringkas-card-title">Alat & Reviewku</span>
            <span className="bio-ringkas-card-sub">Hardware, software, & ulasan</span>
          </div>
          <span className="bio-ringkas-arrow">↗</span>
        </Link>

        <Link href="/keseharian" className="bio-ringkas-card">
          <div className="bio-ringkas-card-icon">☕</div>
          <div className="bio-ringkas-card-text">
            <span className="bio-ringkas-card-title">Keseharian</span>
            <span className="bio-ringkas-card-sub">Watched, Read, Listened, Tasted</span>
          </div>
          <span className="bio-ringkas-arrow">↗</span>
        </Link>
      </div>

      {/* 3. Kontak Cepat */}
      <section className="section-box" style={{ padding: "1.1rem 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "1.1rem" }}>✉️</span>
            <div>
              <span style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--mono-black)" }}>
                Korespondensi & Diskusi:
              </span>{" "}
              <a
                href={`mailto:${profile.contact?.email}`}
                style={{ fontSize: "0.84rem", color: "var(--mono-black)", fontWeight: 700, textDecoration: "underline" }}
              >
                {profile.contact?.email}
              </a>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            {profile.contact?.docsUrl && (
              <a
                href={profile.contact.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-btn-outline"
                style={{ textDecoration: "none", padding: "0.35rem 0.75rem", fontSize: "0.78rem" }}
              >
                Panduan Docs ↗
              </a>
            )}
            <a
              href={`mailto:${profile.contact?.email}`}
              className="admin-btn-primary"
              style={{ textDecoration: "none", padding: "0.35rem 0.85rem", fontSize: "0.78rem" }}
            >
              Kirim Pesan
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
