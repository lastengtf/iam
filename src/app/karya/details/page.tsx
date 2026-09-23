"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PROJECT_ITEMS, PUBLICATION_ITEMS } from "@/data/profileData";
import MasterDetailLayout, { MasterDetailSidebarItem } from "@/components/MasterDetailLayout";

function KaryaDetailInner() {
  const searchParams = useSearchParams();
  const rawId = searchParams.get("id") || searchParams.get("slug") || "";

  // Normalize ID (handle "proj-views-counter" or just "views-counter")
  const cleanId = rawId.replace(/^proj-/, "").replace(/^pub-/, "");

  const projectMatch = PROJECT_ITEMS.find((p) => p.slug === cleanId || p.slug === rawId);
  const pubMatch = PUBLICATION_ITEMS.find((pub) => pub.id === cleanId || pub.id === rawId);

  // If neither, fallback to first project
  const currentType = projectMatch ? "project" : pubMatch ? "research" : "project";
  const currentProject = projectMatch || (!pubMatch ? PROJECT_ITEMS[0] : null);
  const currentPub = pubMatch;

  // Build unified sidebar list
  const sidebarItems: MasterDetailSidebarItem[] = [
    ...PROJECT_ITEMS.map((p) => ({
      id: `proj-${p.slug}`,
      title: p.name,
      subtitle: p.category,
      badge: p.status === "in-progress" ? "Proses" : p.status === "planned" ? "Rencana" : "Proyek",
      imageUrl: p.imageUrl,
      href: `/karya/details?id=proj-${p.slug}`,
    })),
    ...PUBLICATION_ITEMS.map((pub) => ({
      id: `pub-${pub.id}`,
      title: pub.title,
      subtitle: `${pub.publisher} (${pub.year})`,
      badge: "Riset",
      imageUrl: pub.imageUrl,
      href: `/karya/details?id=pub-${pub.id}`,
    })),
  ];

  const currentSelectedId = currentProject ? `proj-${currentProject.slug}` : `pub-${currentPub?.id}`;
  const currentTitle = currentProject ? currentProject.name : currentPub?.title || "Detail Karya";

  return (
    <MasterDetailLayout
      backHref="/karya"
      categoryLabel="Riset & Karya"
      categoryTitle="Daftar Riset & Karya"
      sidebarItems={sidebarItems}
      selectedId={currentSelectedId}
      detailTitle={currentTitle}
      shareTitle={`${currentTitle} — TEN`}
      shareUrl={`/karya/details?id=${currentSelectedId}`}
    >
      {currentProject && (
        <article className="content-card-detail" style={{ border: "none", boxShadow: "none", padding: 0 }}>
          <div style={{ width: "100%", height: "240px", borderRadius: "var(--radius-md)", overflow: "hidden", marginBottom: "1.5rem", border: "1px solid var(--border-subtle)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentProject.imageUrl}
              alt={currentProject.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <span className="card-badge-overlay" style={{ position: "static", display: "inline-block", marginBottom: "0.5rem" }}>
                {currentProject.status === "in-progress" ? "🟡 Sedang Dikerjakan" : currentProject.status === "planned" ? "🔵 Tahap Perencanaan" : "🟢 Selesai / Aktif"}
              </span>
              <h1 style={{ fontSize: "1.65rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "0.2rem" }}>
                {currentProject.icon} {currentProject.name}
              </h1>
              <div style={{ fontSize: "0.9rem", color: "var(--mono-gray-mid)", fontFamily: "var(--font-mono)" }}>
                {currentProject.category} • {currentProject.metrics}
              </div>
            </div>

            {currentProject.externalHref && currentProject.externalHref !== "#" && (
              <a
                href={currentProject.externalHref}
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn-goto"
              >
                Buka Layanan Langsung ↗
              </a>
            )}
          </div>

          <div style={{ marginTop: "1.5rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "1.25rem" }}>
            <h3 style={{ color: "var(--text-main)", marginBottom: "0.5rem", fontSize: "1rem", fontWeight: 700 }}>
              Tentang Inisiatif / Proyek
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.65, marginBottom: "1.25rem" }}>
              {currentProject.description}
            </p>

            <h3 style={{ color: "var(--text-main)", marginBottom: "0.5rem", fontSize: "1rem", fontWeight: 700 }}>
              Deskripsi Teknis & Nilai Solusi
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.65, marginBottom: "1.5rem" }}>
              {currentProject.details}
            </p>

            <h3 style={{ color: "var(--text-main)", marginBottom: "0.5rem", fontSize: "1rem", fontWeight: 700 }}>
              Karakteristik & Teknologi
            </h3>
            <div className="tag-pills">
              {currentProject.tech.map((t) => (
                <span key={t} className="tag-pill">
                  #{t}
                </span>
              ))}
            </div>
          </div>
        </article>
      )}

      {currentPub && (
        <article className="content-card-detail" style={{ border: "none", boxShadow: "none", padding: 0 }}>
          <div style={{ width: "100%", height: "240px", borderRadius: "var(--radius-md)", overflow: "hidden", marginBottom: "1.5rem", border: "1px solid var(--border-subtle)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentPub.imageUrl}
              alt={currentPub.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <span className="card-badge-overlay" style={{ position: "static", display: "inline-block", marginBottom: "0.5rem" }}>
                📜 Publikasi Ilmiah • {currentPub.year}
              </span>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "0.4rem", lineHeight: 1.35 }}>
                {currentPub.title}
              </h1>
              <div style={{ fontSize: "0.9rem", color: "var(--mono-gray-mid)", fontFamily: "var(--font-mono)" }}>
                Penerbit / Wadah: {currentPub.publisher}
              </div>
            </div>

            {currentPub.href && (
              <a
                href={currentPub.href}
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn-goto"
              >
                Akses Dokumen Ilmiah ↗
              </a>
            )}
          </div>

          <div style={{ marginTop: "1.5rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "1.25rem" }}>
            <h3 style={{ color: "var(--text-main)", marginBottom: "0.5rem", fontSize: "1rem", fontWeight: 700 }}>
              Ringkasan Kajian
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.65, marginBottom: "1.25rem" }}>
              {currentPub.summary}
            </p>

            <h3 style={{ color: "var(--text-main)", marginBottom: "0.5rem", fontSize: "1rem", fontWeight: 700 }}>
              Abstrak Metodologi & Telaah Periset
            </h3>
            <div style={{ background: "var(--bg-soft)", borderLeft: "3px solid var(--mono-black)", padding: "1rem 1.25rem", borderRadius: "0 var(--radius-sm) var(--radius-sm) 0", marginBottom: "1.5rem" }}>
              <p style={{ color: "var(--text-main)", fontSize: "0.88rem", lineHeight: 1.7, fontStyle: "italic", margin: 0 }}>
                &ldquo;{currentPub.abstract}&rdquo;
              </p>
            </div>

            <h3 style={{ color: "var(--text-main)", marginBottom: "0.5rem", fontSize: "1rem", fontWeight: 700 }}>
              Kata Kunci & Bidang Telaah
            </h3>
            <div className="tag-pills">
              {currentPub.tags.map((t) => (
                <span key={t} className="tag-pill">
                  #{t}
                </span>
              ))}
            </div>
          </div>
        </article>
      )}
    </MasterDetailLayout>
  );
}

export default function KaryaDetailPage() {
  return (
    <Suspense fallback={<div style={{ padding: "3rem", textAlign: "center" }}>Memuat detail karya...</div>}>
      <KaryaDetailInner />
    </Suspense>
  );
}
