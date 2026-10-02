"use client";

import React, { Suspense, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SenseCategory } from "@/data/profileData";
import { useDailyData } from "@/data/contentStore";
import MasterDetailLayout, { MasterDetailSidebarItem } from "@/components/MasterDetailLayout";

const SENSE_ICONS: Record<SenseCategory, string> = {
  Melihat: "👁️",
  Membaca: "📖",
  Mendengar: "🎧",
  Mengecap: "☕",
};

const SENSE_LABELS_EN: Record<SenseCategory, string> = {
  Melihat: "Watched",
  Membaca: "Read",
  Mendengar: "Listened",
  Mengecap: "Tasted",
};

function KeseharianDetailInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { dailyLogs } = useDailyData();
  const selectedLog = dailyLogs.find((item) => item.id === id) || dailyLogs[0];
  const reviewRef = useRef<HTMLDivElement>(null);

  const sidebarItems: MasterDetailSidebarItem[] = dailyLogs.map((item) => ({
    id: item.id,
    title: item.title,
    subtitle: `${item.itemType || SENSE_LABELS_EN[item.category]} • ★ ${item.rating?.toFixed(1) || "5.0"}`,
    badge: SENSE_LABELS_EN[item.category],
    icon: SENSE_ICONS[item.category],
    imageUrl: item.imageUrl,
    href: `/keseharian/details?id=${item.id}`,
  }));

  // More like this items (excluding current)
  const otherItems = dailyLogs.filter((item) => item.id !== selectedLog.id).slice(0, 4);

  const scrollToReview = () => {
    reviewRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const matchScore = Math.min(99, Math.round(((selectedLog.rating || 4.8) / 5) * 100));

  return (
    <MasterDetailLayout
      backHref="/keseharian"
      categoryLabel="Keseharian"
      categoryTitle="Catatan Keseharian"
      sidebarItems={sidebarItems}
      selectedId={selectedLog.id}
      detailTitle={selectedLog.title}
      shareTitle={`${selectedLog.title} — Keseharian TEN`}
      shareUrl={`/keseharian/details?id=${selectedLog.id}`}
    >
      <div className="netflix-detail-wrapper">
        {/* 1. NETFLIX BILLBOARD / HERO CINEMATIC BANNER */}
        <div className="netflix-billboard">
          {/* Background Poster Blur with Scrim */}
          {selectedLog.imageUrl && (
            <div
              className="netflix-billboard-backdrop"
              style={{ backgroundImage: `url(${selectedLog.imageUrl})` }}
            />
          )}
          <div className="netflix-billboard-scrim" />

          <div className="netflix-billboard-content">
            {/* Front Poster Card */}
            {selectedLog.imageUrl && (
              <div className="netflix-poster-box">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedLog.imageUrl}
                  alt={selectedLog.title}
                  className="netflix-poster-img"
                />
              </div>
            )}

            {/* Title & Metadata Column */}
            <div className="netflix-info-column">
              <div className="netflix-brand-tag">
                <span className="netflix-brand-logo-n">TEN</span>
                <span>ORIGINAL CURATION</span>
              </div>

              <h1 className="netflix-title-text">{selectedLog.title}</h1>

              {selectedLog.subtitle && (
                <div style={{ fontSize: "0.92rem", color: "#e2e8f0", fontStyle: "italic", opacity: 0.9 }}>
                  {selectedLog.subtitle}
                </div>
              )}

              {/* Strip Rating & Badges */}
              <div className="netflix-meta-strip">
                <span className="netflix-match-score">{matchScore}% Match</span>
                <span className="netflix-rating-score">
                  ★ {selectedLog.rating?.toFixed(1) || "5.0"}/5.0
                </span>
                {selectedLog.year && (
                  <span className="netflix-year-tag">{selectedLog.year}</span>
                )}
                <span className="netflix-badge-pill">
                  {SENSE_ICONS[selectedLog.category]} {SENSE_LABELS_EN[selectedLog.category]}
                </span>
                <span className="netflix-quality-badge">
                  {selectedLog.itemType || "CURATED"}
                </span>
                <span className="netflix-quality-badge">4K ULTRA HD</span>
              </div>

              {/* Netflix Action Buttons */}
              <div className="netflix-actions-row">
                <button
                  type="button"
                  onClick={scrollToReview}
                  className="netflix-play-btn"
                >
                  <span>▶</span>
                  <span>Baca Reviewku</span>
                </button>

                <div className="netflix-secondary-btn" style={{ cursor: "default" }}>
                  <span>✓</span>
                  <span>Terkurasi di Harian</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. SPOTLIGHT: REVIEWKU (VERDICT UTAMA TEN) */}
        <div ref={reviewRef} className="netflix-review-spotlight">
          <div className="netflix-review-header">
            <div className="netflix-review-badge">
              <span>✦</span>
              <span>Reviewku — Ulasan & Refleksi TEN</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#fbbf24", fontWeight: 700, fontSize: "0.95rem" }}>
              <span>★</span>
              <span>{selectedLog.rating?.toFixed(1) || "5.0"}</span>
              <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>/ 5.0</span>
            </div>
          </div>

          <p className="netflix-review-quote">
            &ldquo;{selectedLog.thoughts || selectedLog.summary}&rdquo;
          </p>

          <div className="netflix-review-author">
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#e50914", display: "inline-block" }}></span>
            <span>Ulasan orisinal oleh <strong>Teguh Eko N. (TEN)</strong> • Tanggal: {selectedLog.date}</span>
          </div>
        </div>

        {/* 3. NETFLIX DETAILS & SYNOPSIS GRID */}
        <div className="netflix-content-grid">
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--mono-black)", marginBottom: "0.75rem" }}>
              Sinopsis &amp; Pokok Karya
            </h3>
            <p className="netflix-synopsis-p">
              {selectedLog.summary}
            </p>

            {selectedLog.tags && selectedLog.tags.length > 0 && (
              <div>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--mono-gray-mid)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "0.5rem" }}>
                  Genre &amp; Tag Terkait:
                </span>
                <div className="tag-pills">
                  {selectedLog.tags.map((t) => (
                    <span key={t} className="tag-pill">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="netflix-metadata-box">
            {selectedLog.creator && (
              <div>
                <div className="netflix-meta-item-label">
                  {selectedLog.category === "Melihat"
                    ? "Sutradara / Kreator:"
                    : selectedLog.category === "Membaca"
                    ? "Penulis / Pengarang:"
                    : selectedLog.category === "Mendengar"
                    ? "Musisi / Host Podcast:"
                    : "Roastery / Asal Biji:"}
                </div>
                <div className="netflix-meta-item-val">{selectedLog.creator}</div>
              </div>
            )}

            <div>
              <div className="netflix-meta-item-label">Kategori Indera:</div>
              <div className="netflix-meta-item-val">
                {SENSE_ICONS[selectedLog.category]} {SENSE_LABELS_EN[selectedLog.category]} ({selectedLog.category})
              </div>
            </div>

            <div>
              <div className="netflix-meta-item-label">Format / Tipe Media:</div>
              <div className="netflix-meta-item-val">{selectedLog.itemType || "Karya"}</div>
            </div>

            {selectedLog.year && (
              <div>
                <div className="netflix-meta-item-label">Tahun Rilis:</div>
                <div className="netflix-meta-item-val">{selectedLog.year}</div>
              </div>
            )}

            <div>
              <div className="netflix-meta-item-label">Skor Pengalaman:</div>
              <div className="netflix-meta-item-val" style={{ color: "#e50914" }}>
                {selectedLog.rating?.toFixed(1) || "5.0"} dari 5.0 Bintang
              </div>
            </div>
          </div>
        </div>

        {/* 4. LAINNYA DI KESEHARIAN (MORE LIKE THIS - NETFLIX THUMBNAIL ROW) */}
        {otherItems.length > 0 && (
          <div className="netflix-more-like-this-section">
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--mono-black)", margin: 0 }}>
              Koleksi Keseharian Lainnya
            </h3>

            <div className="netflix-more-grid">
              {otherItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/keseharian/details?id=${item.id}`}
                  className="netflix-more-card"
                  title={`Buka ${item.title}`}
                >
                  {item.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="netflix-more-poster"
                      loading="lazy"
                    />
                  )}
                  <div className="netflix-more-gradient" />
                  <div className="netflix-more-info">
                    <span className="netflix-more-score">
                      ★ {item.rating?.toFixed(1) || "5.0"}
                    </span>
                    <span className="netflix-more-title">{item.title}</span>
                    <span style={{ fontSize: "0.68rem", color: "#a3a3a3" }}>
                      {item.itemType || SENSE_LABELS_EN[item.category]}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </MasterDetailLayout>
  );
}

export default function KeseharianDetailPage() {
  return (
    <Suspense fallback={<div style={{ padding: "3rem", textAlign: "center" }}>Memuat catatan keseharian...</div>}>
      <KeseharianDetailInner />
    </Suspense>
  );
}
