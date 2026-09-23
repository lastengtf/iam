"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { STACK_ITEMS, StackItem } from "@/data/profileData";
import CardToolbar, { ViewMode } from "@/components/CardToolbar";
import Pagination from "@/components/Pagination";

const ITEMS_PER_PAGE = 6;

export default function AlatPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Initialize likes from data
    const initialLikes: Record<string, number> = {};
    STACK_ITEMS.forEach((item) => {
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
  }, []);

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const isLiked = likedItems[id];
    const newLikesCount = (likesMap[id] || 0) + (isLiked ? -1 : 1);
    const newLikesMap = { ...likesMap, [id]: newLikesCount };
    const newLikedItems = { ...likedItems, [id]: !isLiked };

    setLikesMap(newLikesMap);
    setLikedItems(newLikedItems);

    try {
      localStorage.setItem("ten_stack_likes", JSON.stringify(newLikesMap));
      localStorage.setItem("ten_stack_user_liked", JSON.stringify(newLikedItems));
    } catch {}
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const filteredItems = STACK_ITEMS.filter((item) => {
    const matchesCat =
      selectedCategory === "all" || item.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!matchesCat) return false;
    if (!q) return true;

    return (
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.review.toLowerCase().includes(q) ||
      item.platforms.some((p) => p.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div style={{ paddingBottom: "2.5rem" }}>
      <div className="section-header">
        <div>
          <h2 className="section-title">Alat & Instrumen Kerja</h2>
          <div className="section-subtitle">
            Katalog perangkat keras, editor kode, dan infrastruktur komputasi harian beserta catatan ulasan personal
          </div>
        </div>
      </div>

      {/* Filter Kategori: Semua, Hardware, Software, Cloud */}
      <div className="karya-tab-nav">
        <button
          type="button"
          className={`karya-tab-btn ${selectedCategory === "all" ? "active" : ""}`}
          onClick={() => handleCategoryChange("all")}
        >
          <span className="tab-label-full">Semua Instrumen</span>
          <span className="tab-label-short">Semua</span>
          <span>({STACK_ITEMS.length})</span>
        </button>
        <button
          type="button"
          className={`karya-tab-btn ${selectedCategory === "Hardware & EDC" ? "active" : ""}`}
          onClick={() => handleCategoryChange("Hardware & EDC")}
        >
          <span>💻</span>
          <span className="tab-label-full">Hardware & EDC</span>
          <span className="tab-label-short">Hardware</span>
        </button>
        <button
          type="button"
          className={`karya-tab-btn ${selectedCategory === "Software & Otomasi" ? "active" : ""}`}
          onClick={() => handleCategoryChange("Software & Otomasi")}
        >
          <span>🛠️</span>
          <span className="tab-label-full">Software & Otomasi</span>
          <span className="tab-label-short">Software</span>
        </button>
        <button
          type="button"
          className={`karya-tab-btn ${selectedCategory === "Infrastruktur & Cloud" ? "active" : ""}`}
          onClick={() => handleCategoryChange("Infrastruktur & Cloud")}
        >
          <span>☁️</span>
          <span className="tab-label-full">Infrastruktur & Cloud</span>
          <span className="tab-label-short">Cloud</span>
        </button>
      </div>

      {/* Toolbar: Search & View Switcher */}
      <CardToolbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        placeholder="Cari alat, software, platform..."
        totalFiltered={filteredItems.length}
      />

      {/* Jika Kosong */}
      {filteredItems.length === 0 && (
        <div className="empty-search-state">
          <div className="empty-search-icon">🔍</div>
          <div className="empty-search-title">Tidak ada hasil ditemukan</div>
          <div className="empty-search-desc">
            Tidak ada alat atau instrumen yang cocok dengan &quot;{searchQuery}&quot;
          </div>
          <button
            type="button"
            className="action-btn-detail"
            onClick={() => handleSearchChange("")}
          >
            Reset Pencarian
          </button>
        </div>
      )}

      {/* TAMPILAN 1: GRID VIEW */}
      {viewMode === "grid" && paginatedItems.length > 0 && (
        <div className="card-grid-responsive">
          {paginatedItems.map((item) => {
            const isLiked = likedItems[item.id] || false;
            const likeCount = likesMap[item.id] ?? item.likes;

            return (
              <div key={item.id} className="stack-card-item">
                <div className="stack-header-row">
                  <div className="stack-icon-wrap">{item.icon || "⚙️"}</div>
                  <div className="stack-header-info">
                    <span className="stack-cat-label">{item.category}</span>
                    <h3 className="stack-title-text">
                      <Link href={`/alat/details?id=${item.id}`} style={{ textDecoration: "none", color: "inherit" }} title={`Buka detail & ulasan ${item.name}`}>
                        {item.name}
                      </Link>
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleLike(item.id, e)}
                    className={`stack-like-btn ${isLiked ? "liked" : ""}`}
                    title={isLiked ? "Batal menyukai" : "Sukai alat ini"}
                    aria-label={`Sukai ${item.name}`}
                  >
                    <span className="stack-heart">{isLiked ? "♥" : "♡"}</span>
                    <span className="stack-like-num">{likeCount}</span>
                  </button>
                </div>

                <p className="stack-desc-text">{item.description}</p>

                {/* Ulasan Personal (Micro-Review) */}
                <div className="stack-review-box">
                  <span className="stack-review-tag">Ulasan Personal:</span>
                  <p className="stack-review-text">&ldquo;{item.review}&rdquo;</p>
                </div>

                <div className="stack-footer-row">
                  <div className="tag-pills">
                    {item.platforms.map((p) => (
                      <span key={p} className="tag-pill-sm">
                        {p}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <Link
                      href={`/alat/details?id=${item.id}`}
                      className="stack-ext-link"
                      style={{ color: "var(--mono-black)", fontWeight: 700 }}
                    >
                      Buka Ulasan ↗
                    </Link>
                    {item.href && (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="stack-ext-link"
                        style={{ color: "var(--text-muted)" }}
                        title={`Buka situs resmi ${item.name}`}
                      >
                        Web ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAMPILAN 2: LIST VIEW */}
      {viewMode === "list" && paginatedItems.length > 0 && (
        <div className="card-list-view">
          {paginatedItems.map((item) => {
            const isLiked = likedItems[item.id] || false;
            const likeCount = likesMap[item.id] ?? item.likes;

            return (
              <div key={item.id} className="stack-list-card">
                <div className="stack-list-left">
                  <span className="stack-icon-wrap-list">{item.icon || "⚙️"}</span>
                  <div>
                    <div className="stack-cat-label">{item.category}</div>
                    <h3 className="stack-title-text">{item.name}</h3>
                    <p className="stack-desc-text">{item.description}</p>
                    <div className="stack-review-text-list">
                      <strong>Ulasan:</strong> &ldquo;{item.review}&rdquo;
                    </div>
                  </div>
                </div>
                <div className="stack-list-right">
                  <button
                    type="button"
                    onClick={(e) => handleLike(item.id, e)}
                    className={`stack-like-btn ${isLiked ? "liked" : ""}`}
                    title={isLiked ? "Batal menyukai" : "Sukai alat ini"}
                  >
                    <span className="stack-heart">{isLiked ? "♥" : "♡"}</span>
                    <span className="stack-like-num">{likeCount}</span>
                  </button>
                  {item.href && (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="stack-ext-link"
                    >
                      Kunjungi ↗
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAMPILAN 3: RINGKAS / COMPACT VIEW */}
      {viewMode === "compact" && paginatedItems.length > 0 && (
        <div className="card-compact-view">
          {paginatedItems.map((item) => (
            <Link
              href={`/alat/details?id=${item.id}`}
              key={item.id}
              className="card-compact-row"
              title={`Buka detail & ulasan ${item.name}`}
            >
              <div className="compact-left">
                <span className="compact-title">
                  {item.icon} {item.name}
                </span>
                <span className="compact-badge">{item.category}</span>
              </div>
              <div className="compact-right">
                <span className="compact-meta">♥ {likesMap[item.id] ?? item.likes}</span>
                <span className="compact-arrow">↗</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
