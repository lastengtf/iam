"use client";

import React, { Suspense, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useStackData } from "@/data/contentStore";
import MasterDetailLayout, { MasterDetailSidebarItem } from "@/components/MasterDetailLayout";

function AlatDetailInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { stack: stackList } = useStackData();
  const selectedItem = stackList.find((item) => item.id === id) || stackList[0];
  const reviewRef = useRef<HTMLDivElement>(null);

  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const initialLikes: Record<string, number> = {};
      stackList.forEach((item) => {
        initialLikes[item.id] = item.likes;
      });

      try {
        const storedLikes = localStorage.getItem("ten_stack_likes");
        const storedLiked = localStorage.getItem("ten_stack_user_liked");
        if (storedLikes) {
          setLikesMap({ ...initialLikes, ...JSON.parse(storedLikes) });
        } else {
          setLikesMap(initialLikes);
        }
        if (storedLiked) {
          setLikedItems(JSON.parse(storedLiked));
        }
      } catch {
        setLikesMap(initialLikes);
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [stackList]);

  const handleLike = (itemId: string) => {
    const isLiked = likedItems[itemId];
    const newLikesCount = (likesMap[itemId] || 0) + (isLiked ? -1 : 1);
    const newLikesMap = { ...likesMap, [itemId]: newLikesCount };
    const newLikedItems = { ...likedItems, [itemId]: !isLiked };

    setLikesMap(newLikesMap);
    setLikedItems(newLikedItems);

    try {
      localStorage.setItem("ten_stack_likes", JSON.stringify(newLikesMap));
      localStorage.setItem("ten_stack_user_liked", JSON.stringify(newLikedItems));
    } catch {}
  };

  const scrollToReview = () => {
    reviewRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sidebarItems: MasterDetailSidebarItem[] = stackList.map((item) => ({
    id: item.id,
    title: item.name,
    subtitle: item.category,
    icon: item.icon || "⚙️",
    badge: `♥ ${likesMap[item.id] ?? item.likes}`,
    href: `/alat/details?id=${item.id}`,
  }));

  const otherTools = stackList.filter((item) => item.id !== selectedItem.id).slice(0, 4);

  const isLiked = likedItems[selectedItem.id] || false;
  const currentLikes = likesMap[selectedItem.id] ?? selectedItem.likes;

  return (
    <MasterDetailLayout
      backHref="/alat"
      categoryLabel="Alat"
      categoryTitle="Daftar Alat"
      sidebarItems={sidebarItems}
      selectedId={selectedItem.id}
      detailTitle={selectedItem.name}
      shareTitle={`${selectedItem.name} — Alat Kerja TEN`}
      shareUrl={`/alat/details?id=${selectedItem.id}`}
    >
      <div className="netflix-detail-wrapper">
        {/* 1. CINEMATIC BILLBOARD FOR ALAT */}
        <div className="netflix-billboard">
          <div
            className="netflix-billboard-backdrop"
            style={{
              background: "radial-gradient(circle at 80% 20%, rgba(229, 9, 20, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)",
            }}
          />
          <div className="netflix-billboard-scrim" />

          <div className="netflix-billboard-content">
            {/* Visual Icon Avatar */}
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)",
                border: "1px solid rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "3.5rem",
                boxShadow: "0 12px 32px rgba(0,0,0,0.6)",
                flexShrink: 0,
              }}
            >
              {selectedItem.icon || "⚙️"}
            </div>

            {/* Info Column */}
            <div className="netflix-info-column">
              <div className="netflix-brand-tag">
                <span className="netflix-brand-logo-n">TEN</span>
                <span>INSTRUMEN KERJA • PRO STACK</span>
              </div>

              <h1 className="netflix-title-text">{selectedItem.name}</h1>

              <div className="netflix-meta-strip">
                <span className="netflix-match-score">99% Efisiensi</span>
                <span style={{ color: "#10b981", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10b981" }}></span>
                  Aktif Digunakan Sehari-hari
                </span>
                <span className="netflix-badge-pill">{selectedItem.category}</span>
                <span className="netflix-quality-badge">PRO EDITION</span>
                <span style={{ color: "#a3a3a3", fontSize: "0.82rem" }}>
                  ♥ {currentLikes} Apresiasi
                </span>
              </div>

              {/* Action Buttons */}
              <div className="netflix-actions-row">
                <button
                  type="button"
                  onClick={scrollToReview}
                  className="netflix-play-btn"
                >
                  <span>▶</span>
                  <span>Baca Reviewku</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLike(selectedItem.id)}
                  className="netflix-secondary-btn"
                >
                  <span>{isLiked ? "♥" : "♡"}</span>
                  <span>{isLiked ? "Disukai" : "Sukai Alat"}</span>
                </button>

                {selectedItem.href && (
                  <a
                    href={selectedItem.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="netflix-secondary-btn"
                  >
                    <span>Situs Resmi</span>
                    <span>↗</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. SPOTLIGHT: REVIEWKU */}
        <div ref={reviewRef} className="netflix-review-spotlight">
          <div className="netflix-review-header">
            <div className="netflix-review-badge">
              <span>✦</span>
              <span>Reviewku — Pengalaman &amp; Ulasan Nyata</span>
            </div>
            <div style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
              Status: <strong style={{ color: "#ffffff" }}>Teruji dalam Workflow</strong>
            </div>
          </div>

          <p className="netflix-review-quote">
            &ldquo;{selectedItem.review}&rdquo;
          </p>

          <div className="netflix-review-author">
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#e50914", display: "inline-block" }}></span>
            <span>Ulasan orisinal berdasarkan pengalaman kerja langsung oleh <strong>Teguh Eko N. (TEN)</strong></span>
          </div>
        </div>

        {/* 3. CONTENT & PLATFORM METADATA GRID */}
        <div className="netflix-content-grid">
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--mono-black)", marginBottom: "0.75rem" }}>
              Peran dalam Alur Kerja
            </h3>
            <p className="netflix-synopsis-p">
              {selectedItem.description} Instrumen ini merupakan bagian terintegrasi dari ekosistem kerja mandiri yang mendukung efisiensi komputasi, kenyamanan mengetik laporan riset, serta pemeliharaan infrastruktur edge yang andal.
            </p>

            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--mono-gray-mid)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "0.5rem" }}>
              Dukungan Platform:
            </span>
            <div className="tag-pills">
              {selectedItem.platforms.map((p) => (
                <span key={p} className="tag-pill" style={{ padding: "0.3rem 0.75rem" }}>
                  💻 {p}
                </span>
              ))}
            </div>
          </div>

          <div className="netflix-metadata-box">
            <div>
              <div className="netflix-meta-item-label">Kategori Alat:</div>
              <div className="netflix-meta-item-val">{selectedItem.category}</div>
            </div>

            <div>
              <div className="netflix-meta-item-label">Status Integrasi:</div>
              <div className="netflix-meta-item-val" style={{ color: "#10b981" }}>
                Aktif (Daily Driver)
              </div>
            </div>

            <div>
              <div className="netflix-meta-item-label">Apresiasi Pengunjung:</div>
              <div className="netflix-meta-item-val">{currentLikes} Orang Menyukai</div>
            </div>

            {selectedItem.href && (
              <div>
                <div className="netflix-meta-item-label">Tautan Eksternal:</div>
                <div className="netflix-meta-item-val">
                  <a
                    href={selectedItem.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#e50914", textDecoration: "none", fontWeight: 600 }}
                  >
                    Buka Website Resmi ↗
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. ALAT TERKAIT LAINNYA (MORE LIKE THIS) */}
        {otherTools.length > 0 && (
          <div className="netflix-more-like-this-section">
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--mono-black)", margin: 0 }}>
              Alat &amp; Instrumen Lainnya
            </h3>

            <div className="netflix-more-grid">
              {otherTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/alat/details?id=${tool.id}`}
                  className="netflix-more-card"
                  style={{
                    background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
                    justifyContent: "space-between",
                    padding: "1rem",
                  }}
                  title={`Buka ${tool.name}`}
                >
                  <div style={{ fontSize: "2.2rem" }}>{tool.icon || "⚙️"}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <span style={{ fontSize: "0.72rem", color: "#10b981", fontWeight: 700 }}>
                      ♥ {likesMap[tool.id] ?? tool.likes}
                    </span>
                    <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#ffffff", lineHeight: 1.25 }}>
                      {tool.name}
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "#9ca3af" }}>
                      {tool.category}
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

export default function AlatDetailPage() {
  return (
    <Suspense fallback={<div style={{ padding: "3rem", textAlign: "center" }}>Memuat detail instrumen...</div>}>
      <AlatDetailInner />
    </Suspense>
  );
}
