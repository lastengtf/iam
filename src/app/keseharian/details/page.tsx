"use client";

import React, { Suspense } from "react";
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
      <article className="content-card-detail" style={{ border: "none", boxShadow: "none", padding: 0 }}>
        {selectedLog.imageUrl && (
          <div className="detail-keseharian-hero">
            <div className="detail-portrait-poster-container">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedLog.imageUrl}
                alt={selectedLog.title}
                className="detail-portrait-poster"
              />
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
          <div style={{ flex: 1, minWidth: "240px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
              <span className={`sensory-badge-overlay ${selectedLog.category.toLowerCase()}`} style={{ position: "static", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                {SENSE_ICONS[selectedLog.category]} {SENSE_LABELS_EN[selectedLog.category]}
              </span>
              {selectedLog.itemType && (
                <span className="sensory-type-badge-top" style={{ position: "static", display: "inline-flex" }}>
                  {selectedLog.itemType}
                </span>
              )}
            </div>

            <h1 className="detail-main-title">
              {selectedLog.title}
            </h1>

            {selectedLog.creator && (
              <div className="detail-meta-subtitle">
                <span style={{ color: "var(--text-muted)" }}>
                  {selectedLog.category === "Melihat"
                    ? "Karya / Sutradara:"
                    : selectedLog.category === "Membaca"
                    ? "Penulis:"
                    : selectedLog.category === "Mendengar"
                    ? "Musisi / Host:"
                    : "Asal / Roastery:"}{" "}
                </span>
                <span style={{ color: "var(--text-main)", fontWeight: 600 }}>{selectedLog.creator}</span>
                {selectedLog.year ? ` • Tahun ${selectedLog.year}` : ""}
              </div>
            )}

            {selectedLog.subtitle && (
              <div style={{ fontSize: "0.88rem", color: "var(--mono-gray-mid)", fontStyle: "italic", marginBottom: "0.45rem" }}>
                {selectedLog.subtitle}
              </div>
            )}

            <div style={{ fontSize: "0.78rem", color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
              Tanggal Catatan: {selectedLog.date}
            </div>
          </div>

          {/* Rating Pill Besar di Halaman Detail */}
          <div className="sensory-detail-rating-box">
            <div className="sensory-detail-rating-score">
              <span className="sensory-star-lg">★</span>
              <span className="rating-num-lg">{selectedLog.rating?.toFixed(1) || "5.0"}</span>
              <span className="rating-scale-lg">/5.0</span>
            </div>
            <div className="sensory-detail-rating-label">Rating Personal TEN</div>
          </div>
        </div>

        <div style={{ marginTop: "1.5rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "1.25rem" }}>
          <h3 style={{ color: "var(--text-main)", marginBottom: "0.5rem", fontSize: "1rem", fontWeight: 700 }}>
            {selectedLog.category === "Melihat"
              ? "Sinopsis & Premis Tontonan"
              : selectedLog.category === "Membaca"
              ? "Sinopsis & Pokok Bahasan"
              : selectedLog.category === "Mendengar"
              ? "Latar Belakang Karya"
              : "Profil Biji & Metode Seduh"}
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: 1.65, marginBottom: "1.5rem" }}>
            {selectedLog.summary}
          </p>

          <h3 style={{ color: "var(--text-main)", marginBottom: "0.5rem", fontSize: "1rem", fontWeight: 700 }}>
            {selectedLog.category === "Melihat"
              ? "Refleksi & Catatan Menonton"
              : selectedLog.category === "Membaca"
              ? "Refleksi Pemikiran & Relevansi"
              : selectedLog.category === "Mendengar"
              ? "Refleksi Audio & Resonansi Fokus"
              : "Catatan Rasa & Pengalaman Seduh"}
          </h3>
          <div className="sensory-thought-box" style={{ padding: "1.1rem 1.35rem", margin: "0.75rem 0 1.5rem" }}>
            <span className="sensory-thought-label" style={{ fontSize: "0.72rem" }}>Intisari Personal:</span>
            <p className="sensory-thought-text" style={{ fontSize: "0.95rem", lineHeight: 1.65 }}>
              &ldquo;{selectedLog.thoughts}&rdquo;
            </p>
          </div>

          <h3 style={{ color: "var(--text-main)", marginBottom: "0.5rem", fontSize: "1rem", fontWeight: 700 }}>
            Topik & Kata Kunci Terkait
          </h3>
          <div className="tag-pills">
            {selectedLog.tags.map((t) => (
              <span key={t} className="tag-pill">
                #{t}
              </span>
            ))}
          </div>
        </div>
      </article>
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
