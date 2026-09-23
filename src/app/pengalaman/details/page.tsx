"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useWorkData } from "@/data/contentStore";
import MasterDetailLayout, { MasterDetailSidebarItem } from "@/components/MasterDetailLayout";

function PengalamanDetailInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { work: workList } = useWorkData();
  const selectedWork = workList.find((w) => w.id === id) || workList[0];

  const sidebarItems: MasterDetailSidebarItem[] = workList.map((w) => ({
    id: w.id,
    title: w.role,
    subtitle: `${w.company} • ${w.period}`,
    badge: w.period.includes("Sekarang") ? "Aktif" : undefined,
    imageUrl: w.imageUrl,
    href: `/pengalaman/details?id=${w.id}`,
  }));

  return (
    <MasterDetailLayout
      backHref="/pengalaman"
      categoryLabel="Pengalaman"
      categoryTitle="Daftar Pengalaman"
      sidebarItems={sidebarItems}
      selectedId={selectedWork.id}
      detailTitle={`${selectedWork.role} (${selectedWork.company})`}
      shareTitle={`${selectedWork.role} di ${selectedWork.company} — TEN`}
      shareUrl={`/pengalaman/details?id=${selectedWork.id}`}
    >
      <article className="content-card-detail" style={{ border: "none", boxShadow: "none", padding: 0 }}>
        {/* Banner Gambar */}
        <div style={{ width: "100%", height: "240px", borderRadius: "var(--radius-md)", overflow: "hidden", marginBottom: "1.5rem", border: "1px solid var(--border-subtle)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedWork.imageUrl}
            alt={selectedWork.role}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <span className="card-badge-overlay" style={{ position: "static", display: "inline-block", marginBottom: "0.5rem" }}>
              {selectedWork.period}
            </span>
            <h1 style={{ fontSize: "1.65rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "0.2rem" }}>
              {selectedWork.role}
            </h1>
            <div style={{ fontSize: "0.9rem", color: "var(--mono-gray-mid)", fontFamily: "var(--font-mono)" }}>
              {selectedWork.company} • {selectedWork.location}
            </div>
          </div>

          <a
            href={selectedWork.href}
            target="_blank"
            rel="noopener noreferrer"
            className="action-btn-goto"
          >
            Tautan Inisiatif ↗
          </a>
        </div>

        <div style={{ marginTop: "1.5rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "1.25rem" }}>
          <h3 style={{ color: "var(--text-main)", marginBottom: "0.5rem", fontSize: "1rem", fontWeight: 700 }}>
            Ringkasan Peran
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.65, marginBottom: "1.5rem" }}>
            {selectedWork.summary}
          </p>

          <h3 style={{ color: "var(--text-main)", marginBottom: "0.5rem", fontSize: "1rem", fontWeight: 700 }}>
            Tanggung Jawab & Pencapaian Utama
          </h3>
          <ul className="modal-bullet-list" style={{ marginBottom: "1.5rem" }}>
            {selectedWork.details.map((d, i) => (
              <li key={i} className="modal-bullet-item" style={{ marginBottom: "0.5rem", lineHeight: 1.55 }}>
                {d}
              </li>
            ))}
          </ul>

          <h3 style={{ color: "var(--text-main)", marginBottom: "0.5rem", fontSize: "1rem", fontWeight: 700 }}>
            Keahlian & Teknologi Terapan
          </h3>
          <div className="tag-pills">
            {selectedWork.skills.map((s) => (
              <span key={s} className="tag-pill">
                #{s}
              </span>
            ))}
          </div>
        </div>
      </article>
    </MasterDetailLayout>
  );
}

export default function PengalamanDetailPage() {
  return (
    <Suspense fallback={<div style={{ padding: "3rem", textAlign: "center" }}>Memuat riwayat pengalaman...</div>}>
      <PengalamanDetailInner />
    </Suspense>
  );
}
