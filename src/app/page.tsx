"use client";

import React from "react";
import Link from "next/link";
import { useProfileData } from "@/data/contentStore";

export default function BioHomePage() {
  const { profile } = useProfileData();

  return (
    <div className="bio-page-container" style={{ paddingBottom: "3rem" }}>
      {/* 1. Pengantar Personal (About Intro & Lead) */}
      <section className="section-box" style={{ marginBottom: "1.75rem" }}>
        <div className="bio-hero-header">
          <div className="bio-intro-badge">
            <span className="bio-pulse-dot"></span>
            <span>Profil & Bio Personal</span>
          </div>
          <h2 className="bio-hero-title">
            Membangun Ruang Mandiri, Merawat Arsip Terbuka
          </h2>
          <p className="bio-hero-lead">
            {profile.aboutIntro || profile.bio}
          </p>
        </div>

        {/* Paragraf Narasi Lengkap */}
        <div className="bio-narrative-flow">
          {(profile.aboutParagraphs && profile.aboutParagraphs.length > 0
            ? profile.aboutParagraphs
            : [
                "Ruang personal ini didedikasikan untuk mengarsipkan perjalanan, eksplorasi karya, riset mandiri, serta catatan pemikiran berkelanjutan secara terbuka.",
                "Seluruh sistem dirancang dengan prinsip kesederhanaan, keterbacaan, dan efisiensi arsitektur edge terdistribusi.",
              ]
          ).map((para, idx) => (
            <p key={idx} className="bio-narrative-p">
              {para}
            </p>
          ))}
        </div>
      </section>

      {/* 2. Fokus & Inisiatif Saat Ini */}
      {profile.currentFocus && profile.currentFocus.length > 0 && (
        <section className="section-box" style={{ marginBottom: "1.75rem" }}>
          <div className="section-header">
            <div>
              <h2 className="section-title">Fokus & Inisiatif Saat Ini</h2>
              <div className="section-subtitle">
                Bidang eksplorasi dan prioritas kerja yang sedang ditekuni
              </div>
            </div>
          </div>

          <div className="bio-focus-grid">
            {profile.currentFocus.map((item) => (
              <div key={item.id} className="bio-focus-card">
                <div className="bio-focus-card-top">
                  <span className="bio-focus-icon">{item.icon || "⚡"}</span>
                  {item.badge && (
                    <span className="bio-focus-badge">{item.badge}</span>
                  )}
                </div>
                <h3 className="bio-focus-title">{item.title}</h3>
                <p className="bio-focus-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Prinsip & Nilai Kerja */}
      {profile.principles && profile.principles.length > 0 && (
        <section className="section-box" style={{ marginBottom: "1.75rem" }}>
          <div className="section-header">
            <div>
              <h2 className="section-title">Prinsip & Nilai Kerja</h2>
              <div className="section-subtitle">
                Panduan fundamental dalam merancang sistem dan menyelesaikan inisiatif
              </div>
            </div>
          </div>

          <div className="bio-principles-grid">
            {profile.principles.map((pr) => (
              <div key={pr.id} className="bio-principle-card">
                <span className="bio-principle-icon">{pr.icon || "✦"}</span>
                <div>
                  <h4 className="bio-principle-title">{pr.title}</h4>
                  <p className="bio-principle-desc">{pr.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Ruang Eksplorasi (Jelajahi Pilar Lainnya) */}
      <section className="section-box" style={{ marginBottom: "1.75rem" }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">Jelajahi Ruang Dokumentasi</h2>
            <div className="section-subtitle">
              Pilar arsip karya, instrumen alat, dan catatan harian
            </div>
          </div>
        </div>

        <div className="bio-nav-cards-grid">
          <Link href="/pengalaman" className="bio-hub-card">
            <span className="bio-hub-icon">💼</span>
            <div className="bio-hub-text">
              <span className="bio-hub-title">Pengalaman Kerja</span>
              <span className="bio-hub-desc">Riwayat peran, kontribusi program, dan koordinasi tim</span>
            </div>
            <span className="bio-hub-arrow">→</span>
          </Link>

          <Link href="/karya" className="bio-hub-card">
            <span className="bio-hub-icon">🚀</span>
            <div className="bio-hub-text">
              <span className="bio-hub-title">Riset & Karya</span>
              <span className="bio-hub-desc">Koleksi aplikasi web, repositori, dan publikasi ilmiah</span>
            </div>
            <span className="bio-hub-arrow">→</span>
          </Link>

          <Link href="/alat" className="bio-hub-card">
            <span className="bio-hub-icon">🛠️</span>
            <div className="bio-hub-text">
              <span className="bio-hub-title">Alat & Reviewku</span>
              <span className="bio-hub-desc">Hardware, software editor, cloud, dan ulasan personal</span>
            </div>
            <span className="bio-hub-arrow">→</span>
          </Link>

          <Link href="/keseharian" className="bio-hub-card">
            <span className="bio-hub-icon">☕</span>
            <div className="bio-hub-text">
              <span className="bio-hub-title">Keseharian & Refleksi</span>
              <span className="bio-hub-desc">Watched, Read, Listened, Tasted, Rating, dan Reviewku</span>
            </div>
            <span className="bio-hub-arrow">→</span>
          </Link>
        </div>
      </section>

      {/* 5. Kolaborasi & Kontak Langsung */}
      <section className="section-box">
        <div className="bio-collab-card">
          <div className="bio-collab-left">
            <span className="bio-collab-status-badge">
              🟢 {profile.status || "Terbuka untuk Kolaborasi"}
            </span>
            <h3 className="bio-collab-title">Mari Terhubung & Berdiskusi</h3>
            <p className="bio-collab-desc">
              Tertarik membahas inisiatif mandiri, arsitektur sistem modular, atau sekadar bertukar wawasan? Korespondensi selalu disambut hangat.
            </p>
          </div>
          <div className="bio-collab-actions">
            <a
              href={`mailto:${profile.contact.email}`}
              className="action-btn-detail"
              style={{ textDecoration: "none" }}
            >
              ✉️ Kirim Email ({profile.contact.email})
            </a>
            {profile.contact.docsUrl && (
              <a
                href={profile.contact.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn-share"
                style={{ textDecoration: "none" }}
              >
                📖 Baca Dokumentasi Panduan ↗
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
