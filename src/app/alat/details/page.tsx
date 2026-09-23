"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useStackData } from "@/data/contentStore";
import MasterDetailLayout, { MasterDetailSidebarItem } from "@/components/MasterDetailLayout";

function AlatDetailInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { stack: stackList } = useStackData();
  const selectedItem = stackList.find((item) => item.id === id) || stackList[0];

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

  const sidebarItems: MasterDetailSidebarItem[] = stackList.map((item) => ({
    id: item.id,
    title: item.name,
    subtitle: item.category,
    icon: item.icon || "⚙️",
    badge: `♥ ${likesMap[item.id] ?? item.likes}`,
    href: `/alat/details?id=${item.id}`,
  }));

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
      <article className="content-card-detail" style={{ border: "none", boxShadow: "none", padding: 0 }}>
        {/* Header Kartu Alat */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
          <div style={{ width: "4rem", height: "4rem", borderRadius: "var(--radius-md)", background: "var(--bg-soft)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>
            {selectedItem.icon || "⚙️"}
          </div>
          <div style={{ flex: 1 }}>
            <span className="card-badge-overlay" style={{ position: "static", display: "inline-block", marginBottom: "0.25rem" }}>
              {selectedItem.category}
            </span>
            <h1 style={{ fontSize: "1.65rem", fontWeight: 800, color: "var(--text-main)", margin: "0.15rem 0" }}>
              {selectedItem.name}
            </h1>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Status: <span style={{ color: "#10b981", fontWeight: 600 }}>Aktif Digunakan Sehari-hari</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleLike(selectedItem.id)}
            className={`stack-like-btn ${isLiked ? "liked" : ""}`}
            style={{ padding: "0.5rem 0.95rem", fontSize: "0.85rem" }}
            title={isLiked ? "Batal menyukai" : "Sukai alat ini"}
          >
            <span className="stack-heart">{isLiked ? "♥" : "♡"}</span>
            <span className="stack-like-num">{currentLikes} Apresiasi</span>
          </button>
        </div>

        {/* Ulasan Utama */}
        <div style={{ marginTop: "1rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "1.25rem" }}>
          <h3 style={{ color: "var(--text-main)", marginBottom: "0.5rem", fontSize: "1rem", fontWeight: 700 }}>
            Ulasan Pengalaman Personal
          </h3>
          <div className="stack-review-box" style={{ padding: "1rem 1.25rem", margin: "0.75rem 0 1.5rem" }}>
            <span className="stack-review-tag" style={{ fontSize: "0.72rem" }}>Catatan Kejujuran Pemakaian:</span>
            <p className="stack-review-text" style={{ fontSize: "0.95rem", lineHeight: 1.6 }}>
              &ldquo;{selectedItem.review}&rdquo;
            </p>
          </div>

          <h3 style={{ color: "var(--text-main)", marginBottom: "0.5rem", fontSize: "1rem", fontWeight: 700 }}>
            Deskripsi Fungsi & Peran dalam Alur Kerja
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.65, marginBottom: "1.5rem" }}>
            {selectedItem.description} Instrumen ini merupakan bagian terintegrasi dari ekosistem kerja mandiri yang mendukung efisiensi komputasi, kenyamanan mengetik laporan riset, serta pemeliharaan infrastruktur edge yang andal.
          </p>

          <h3 style={{ color: "var(--text-main)", marginBottom: "0.5rem", fontSize: "1rem", fontWeight: 700 }}>
            Ekosistem & Kompatibilitas Platform
          </h3>
          <div className="tag-pills" style={{ marginBottom: "1.5rem" }}>
            {selectedItem.platforms.map((p) => (
              <span key={p} className="tag-pill" style={{ padding: "0.25rem 0.75rem", fontSize: "0.78rem" }}>
                Platform: {p}
              </span>
            ))}
          </div>

          {selectedItem.href && (
            <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-subtle)" }}>
              <a
                href={selectedItem.href}
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn-goto"
              >
                Kunjungi Situs Resmi {selectedItem.name} ↗
              </a>
            </div>
          )}
        </div>
      </article>
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
