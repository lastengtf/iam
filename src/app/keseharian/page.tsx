"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SenseCategory } from "@/data/profileData";
import { useDailyData } from "@/data/contentStore";
import CardToolbar, { usePersistedViewMode } from "@/components/CardToolbar";
import Pagination from "@/components/Pagination";

const ITEMS_PER_PAGE = 16;

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

export default function KeseharianPage() {
  const [selectedSense, setSelectedSense] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = usePersistedViewMode("gallery");
  const [currentPage, setCurrentPage] = useState(1);
  const { dailyLogs } = useDailyData();

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const handleSenseChange = (sense: string) => {
    setSelectedSense(sense);
    setCurrentPage(1);
  };

  const filteredLogs = dailyLogs.filter((item) => {
    const matchesSense =
      selectedSense === "all" || item.category === selectedSense;
    const q = searchQuery.toLowerCase().trim();
    if (!matchesSense) return false;
    if (!q) return true;

    const senseEn = SENSE_LABELS_EN[item.category]?.toLowerCase() || "";

    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      (item.creator && item.creator.toLowerCase().includes(q)) ||
      (item.itemType && item.itemType.toLowerCase().includes(q)) ||
      (item.year && item.year.toLowerCase().includes(q)) ||
      senseEn.includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.thoughts.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div style={{ paddingBottom: "2.5rem" }}>
      <div className="section-header">
        <div>
          <h2 className="section-title">Keseharian: Watched, Read, Listened, & Tasted</h2>
          <div className="section-subtitle">
            Apa yang ditonton, dibaca, didengar, dan dikecap beserta rating &amp; reviewku
          </div>
        </div>
      </div>

      {/* Filter Kategori: Watched, Read, Listened, Tasted */}
      <div className="karya-tab-nav">
        <button
          type="button"
          className={`karya-tab-btn ${selectedSense === "all" ? "active" : ""}`}
          onClick={() => handleSenseChange("all")}
        >
          <span className="tab-label-full">Semua ({dailyLogs.length})</span>
          <span className="tab-label-short">Semua</span>
        </button>
        <button
          type="button"
          className={`karya-tab-btn ${selectedSense === "Melihat" ? "active" : ""}`}
          onClick={() => handleSenseChange("Melihat")}
        >
          👁️ Watched
        </button>
        <button
          type="button"
          className={`karya-tab-btn ${selectedSense === "Membaca" ? "active" : ""}`}
          onClick={() => handleSenseChange("Membaca")}
        >
          📖 Read
        </button>
        <button
          type="button"
          className={`karya-tab-btn ${selectedSense === "Mendengar" ? "active" : ""}`}
          onClick={() => handleSenseChange("Mendengar")}
        >
          🎧 Listened
        </button>
        <button
          type="button"
          className={`karya-tab-btn ${selectedSense === "Mengecap" ? "active" : ""}`}
          onClick={() => handleSenseChange("Mengecap")}
        >
          ☕ Tasted
        </button>
      </div>

      {/* Toolbar: Search & View Switcher */}
      <CardToolbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        placeholder={
          selectedSense === "Melihat"
            ? "Cari apa yang ditonton..."
            : selectedSense === "Membaca"
            ? "Cari apa yang dibaca..."
            : selectedSense === "Mendengar"
            ? "Cari apa yang didengar..."
            : selectedSense === "Mengecap"
            ? "Cari apa yang dikecap / seduhan..."
            : "Cari watched, read, listened, tasted..."
        }
        totalFiltered={filteredLogs.length}
      />

      {/* Jika Kosong */}
      {filteredLogs.length === 0 && (
        <div className="empty-search-state">
          <div className="empty-search-icon">🔍</div>
          <div className="empty-search-title">Tidak ada hasil ditemukan</div>
          <div className="empty-search-desc">
            Tidak ada catatan yang cocok dengan kata kunci &quot;{searchQuery}&quot;
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

      {/* TAMPILAN 0: GALERI / GALLERY VIEW (Pure Cover + Direct Rating + Hover Overlay) */}
      {viewMode === "gallery" && paginatedLogs.length > 0 && (
        <div className="sensory-gallery-grid">
          {paginatedLogs.map((item) => (
            <Link
              href={`/keseharian/details?id=${item.id}`}
              key={item.id}
              className="sensory-gallery-card"
              title={`Buka detail & reviewku: ${item.title}`}
            >
              <div className="sensory-gallery-poster-wrap">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="sensory-gallery-poster-img"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="sensory-gallery-placeholder">
                    <span>{SENSE_ICONS[item.category] || "📝"}</span>
                  </div>
                )}

                {/* Rating minimalis terlihat langsung di pojok cover */}
                <div className="sensory-gallery-rating-badge">
                  <span className="sensory-star">★</span>
                  <span className="rating-val">
                    {item.rating?.toFixed(1) || "5.0"}
                  </span>
                </div>

                {/* Overlay hover */}
                <div className="card-gallery-overlay sensory-hover-overlay">
                  <div className="sensory-hover-content">
                    {item.itemType && (
                      <span className="sensory-hover-type">{item.itemType}</span>
                    )}
                    <span className="card-gallery-title">{item.title}</span>
                    {item.creator && (
                      <span className="sensory-hover-creator">
                        {item.creator} {item.year ? `(${item.year})` : ""}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* TAMPILAN 1: GRID VIEW */}
      {viewMode === "grid" && paginatedLogs.length > 0 && (
        <div className="card-grid-responsive">
          {paginatedLogs.map((item) => (
            <Link
              href={`/keseharian/details?id=${item.id}`}
              key={item.id}
              className="sensory-card-item"
              style={{ textDecoration: "none", color: "inherit" }}
              title={`Baca reviewku: ${item.title}`}
            >
              {item.imageUrl && (
                <div className="card-thumb-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="card-thumb-img"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="sensory-badges-row">
                    <span
                      className={`sensory-badge-overlay ${item.category.toLowerCase()}`}
                    >
                      {SENSE_ICONS[item.category]} {SENSE_LABELS_EN[item.category]}
                    </span>
                    {item.itemType && (
                      <span className="sensory-type-badge-top">
                        {item.itemType}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="card-body-content">
                <div
                  className="card-meta-line"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>{item.date}</span>
                  <div className="sensory-rating-pill">
                    <span className="sensory-star">★</span>
                    <span className="sensory-rating-val">
                      {item.rating?.toFixed(1) || "5.0"}
                    </span>
                    <span className="sensory-rating-scale">/5</span>
                  </div>
                </div>

                <h3 className="card-title-text">{item.title}</h3>
                {item.creator && (
                  <div className="sensory-creator-text">
                    {item.creator} {item.year ? `(${item.year})` : ""}
                  </div>
                )}
                {item.subtitle && (
                  <div className="sensory-subtitle-text">{item.subtitle}</div>
                )}

                {/* Reviewku (Ulasan Personal Sederhana) */}
                <div className="sensory-thought-box">
                  <span className="sensory-thought-label">Reviewku:</span>
                  <p className="sensory-thought-text">&ldquo;{item.thoughts || item.summary}&rdquo;</p>
                </div>

                <div className="tag-pills">
                  {item.tags.map((tag) => (
                    <span key={tag} className="tag-pill">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* TAMPILAN 2: LIST VIEW */}
      {viewMode === "list" && paginatedLogs.length > 0 && (
        <div className="card-list-view">
          {paginatedLogs.map((item) => (
            <Link
              href={`/keseharian/details?id=${item.id}`}
              key={item.id}
              className="card-item-list-link"
              title={`Baca detail catatan: ${item.title}`}
            >
              {item.imageUrl && (
                <div className="card-list-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                  />
                  <span
                    className={`sensory-badge-overlay ${item.category.toLowerCase()}`}
                  >
                    {SENSE_ICONS[item.category]} {SENSE_LABELS_EN[item.category]}
                  </span>
                </div>
              )}

              <div className="card-list-body">
                <div
                  className="card-meta-line"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>
                    {item.date} • {item.itemType || SENSE_LABELS_EN[item.category]}
                  </span>
                  <div className="sensory-rating-pill">
                    <span className="sensory-star">★</span>
                    <span className="sensory-rating-val">
                      {item.rating?.toFixed(1) || "5.0"}
                    </span>
                    <span className="sensory-rating-scale">/5</span>
                  </div>
                </div>
                <h3 className="card-title-text">{item.title}</h3>
                {item.creator && (
                  <div className="sensory-creator-text">
                    {item.creator} {item.year ? `(${item.year})` : ""}
                  </div>
                )}
                {item.subtitle && (
                  <div className="sensory-subtitle-text">{item.subtitle}</div>
                )}
                <div className="sensory-thought-box" style={{ marginTop: "0.5rem" }}>
                  <span className="sensory-thought-label">Reviewku:</span>
                  <p className="sensory-thought-text">&ldquo;{item.thoughts || item.summary}&rdquo;</p>
                </div>
                <div className="tag-pills">
                  {item.tags.map((tag) => (
                    <span key={tag} className="tag-pill">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* TAMPILAN 3: RINGKAS / COMPACT VIEW */}
      {viewMode === "compact" && paginatedLogs.length > 0 && (
        <div className="card-compact-view">
          {paginatedLogs.map((item) => (
            <Link
              href={`/keseharian/details?id=${item.id}`}
              key={item.id}
              className="card-compact-row"
              title={`Baca detail catatan: ${item.title}`}
            >
              <div className="compact-left">
                <span className="compact-title">
                  {SENSE_ICONS[item.category]} {item.title}
                </span>
                <span className="compact-badge">
                  {item.itemType || SENSE_LABELS_EN[item.category]}
                </span>
                {item.creator && (
                  <span
                    className="compact-creator"
                    style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}
                  >
                    • {item.creator}
                  </span>
                )}
              </div>
              <div className="compact-right">
                <div
                  className="sensory-rating-pill"
                  style={{ padding: "0.15rem 0.45rem", fontSize: "0.76rem" }}
                >
                  <span className="sensory-star">★</span>
                  <span>{item.rating?.toFixed(1) || "5.0"}</span>
                </div>
                <span className="compact-meta">{item.date}</span>
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
