"use client";

import React, { Suspense } from "react";
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

  const sidebarItems: MasterDetailSidebarItem[] = dailyLogs.map((item) => ({
    id: item.id,
    title: item.title,
    subtitle: `${item.itemType || SENSE_LABELS_EN[item.category]} • ★ ${item.rating?.toFixed(1) || "5.0"}`,
    badge: SENSE_LABELS_EN[item.category],
    icon: SENSE_ICONS[item.category],
    imageUrl: item.imageUrl,
    href: `/keseharian/details?id=${item.id}`,
  }));

  // Catatan lainnya untuk navigasi ringkas di bawah
  const nextLogs = dailyLogs.filter((item) => item.id !== selectedLog.id).slice(0, 3);

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
      <article className="keseharian-mobile-friendly-detail">
        {/* Header Badges & Rating */}
        <div className="km-header-row">
          <div className="km-badges-left">
            <span className={`sensory-badge-overlay ${selectedLog.category.toLowerCase()}`} style={{ position: "static" }}>
              {SENSE_ICONS[selectedLog.category]} {SENSE_LABELS_EN[selectedLog.category]}
            </span>
            {selectedLog.itemType && (
              <span className="km-type-pill">{selectedLog.itemType}</span>
            )}
          </div>

          <div className="km-rating-pill">
            <span style={{ color: "#f59e0b" }}>★</span>
            <span style={{ fontWeight: 700 }}>{selectedLog.rating?.toFixed(1) || "5.0"}</span>
            <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>/5.0</span>
          </div>
        </div>

        {/* Poster & Judul (Tata letak responsif & ringkas) */}
        <div className="km-main-info-block">
          {selectedLog.imageUrl && (
            <div className="km-poster-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedLog.imageUrl}
                alt={selectedLog.title}
                className="km-poster-img"
              />
            </div>
          )}

          <div className="km-title-meta-col">
            <h1 className="km-title">{selectedLog.title}</h1>

            {selectedLog.creator && (
              <div className="km-creator">
                <span style={{ color: "var(--text-muted)" }}>
                  {selectedLog.category === "Melihat"
                    ? "Karya / Sutradara:"
                    : selectedLog.category === "Membaca"
                    ? "Penulis:"
                    : selectedLog.category === "Mendengar"
                    ? "Musisi / Host:"
                    : "Asal / Roastery:"}{" "}
                </span>
                <strong style={{ color: "var(--mono-black)" }}>{selectedLog.creator}</strong>
                {selectedLog.year ? ` • ${selectedLog.year}` : ""}
              </div>
            )}

            {selectedLog.subtitle && (
              <div className="km-subtitle">{selectedLog.subtitle}</div>
            )}

            <div className="km-date">
              Dicatat pada: {selectedLog.date}
            </div>
          </div>
        </div>

        {/* REVIEWKU — FOKUS UTAMA YANG NYAMAN DIBACA */}
        <div className="km-review-box">
          <div className="km-review-header">
            <span className="km-review-title">Reviewku</span>
            <span className="km-review-author">oleh Teguh Eko N. (TEN)</span>
          </div>
          <p className="km-review-text">
            &ldquo;{selectedLog.thoughts || selectedLog.summary}&rdquo;
          </p>
        </div>

        {/* SINOPSIS SINGKAT */}
        <div className="km-synopsis-section">
          <h2 className="km-section-heading">Sinopsis Singkat</h2>
          <p className="km-synopsis-text">{selectedLog.summary}</p>
        </div>

        {/* TAGS */}
        {selectedLog.tags && selectedLog.tags.length > 0 && (
          <div className="km-tags-section">
            <div className="tag-pills">
              {selectedLog.tags.map((t) => (
                <span key={t} className="tag-pill" style={{ fontSize: "0.76rem" }}>
                  #{t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* NAVIGASI RINGKAS KE CATATAN LAINNYA */}
        {nextLogs.length > 0 && (
          <div className="km-next-section">
            <div className="km-section-heading">Catatan Keseharian Lainnya</div>
            <div className="km-next-list">
              {nextLogs.map((item) => (
                <Link
                  key={item.id}
                  href={`/keseharian/details?id=${item.id}`}
                  className="km-next-card"
                >
                  <span className="km-next-icon">{SENSE_ICONS[item.category]}</span>
                  <div className="km-next-text">
                    <span className="km-next-title">{item.title}</span>
                    <span className="km-next-sub">
                      {item.itemType || SENSE_LABELS_EN[item.category]} • ★ {item.rating?.toFixed(1) || "5.0"}
                    </span>
                  </div>
                  <span className="km-next-arrow">→</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </MasterDetailLayout>
  );
}

export default function KeseharianDetailPage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Memuat catatan keseharian...</div>}>
      <KeseharianDetailInner />
    </Suspense>
  );
}
