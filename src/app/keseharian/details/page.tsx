"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DAILY_LOG_ITEMS, SenseCategory } from "@/data/profileData";
import MasterDetailLayout, { MasterDetailSidebarItem } from "@/components/MasterDetailLayout";

const SENSE_ICONS: Record<SenseCategory, string> = {
  Membaca: "📖",
  Mendengar: "🎧",
  Mengecap: "☕",
  Melihat: "👁️",
};

function KeseharianDetailInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const selectedLog = DAILY_LOG_ITEMS.find((item) => item.id === id) || DAILY_LOG_ITEMS[0];

  const sidebarItems: MasterDetailSidebarItem[] = DAILY_LOG_ITEMS.map((item) => ({
    id: item.id,
    title: item.title,
    subtitle: item.date,
    badge: item.category,
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
          <div style={{ width: "100%", height: "260px", borderRadius: "var(--radius-md)", overflow: "hidden", marginBottom: "1.5rem", border: "1px solid var(--border-subtle)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedLog.imageUrl}
              alt={selectedLog.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <span className={`sensory-badge-overlay ${selectedLog.category.toLowerCase()}`} style={{ position: "static", display: "inline-block", marginBottom: "0.5rem" }}>
              {SENSE_ICONS[selectedLog.category]} {selectedLog.category}
            </span>
            <h1 style={{ fontSize: "1.65rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "0.2rem", lineHeight: 1.3 }}>
              {selectedLog.title}
            </h1>
            {selectedLog.subtitle && (
              <div style={{ fontSize: "0.95rem", color: "var(--mono-gray-mid)", fontWeight: 600, marginBottom: "0.3rem" }}>
                {selectedLog.subtitle}
              </div>
            )}
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              Tanggal Catatan: {selectedLog.date}
            </div>
          </div>
        </div>

        <div style={{ marginTop: "1.5rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "1.25rem" }}>
          <h3 style={{ color: "var(--text-main)", marginBottom: "0.5rem", fontSize: "1rem", fontWeight: 700 }}>
            Ringkasan Konteks
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: 1.65, marginBottom: "1.5rem" }}>
            {selectedLog.summary}
          </p>

          <h3 style={{ color: "var(--text-main)", marginBottom: "0.5rem", fontSize: "1rem", fontWeight: 700 }}>
            Refleksi & Catatan Rasa Personal
          </h3>
          <div className="sensory-thought-box" style={{ padding: "1rem 1.25rem", margin: "0.75rem 0 1.5rem" }}>
            <span className="sensory-thought-label" style={{ fontSize: "0.72rem" }}>Poin Intisari:</span>
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
