"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DAILY_LOG_ITEMS, DailyLogItem, SenseCategory } from "@/data/profileData";
import CardToolbar, { ViewMode } from "@/components/CardToolbar";
import Pagination from "@/components/Pagination";

const ITEMS_PER_PAGE = 4;

const SENSE_ICONS: Record<SenseCategory, string> = {
  Membaca: "📖",
  Mendengar: "🎧",
  Mengecap: "☕",
  Melihat: "👁️",
};

export default function KeseharianPage() {
  const [selectedSense, setSelectedSense] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const handleSenseChange = (sense: string) => {
    setSelectedSense(sense);
    setCurrentPage(1);
  };

  const filteredLogs = DAILY_LOG_ITEMS.filter((item) => {
    const matchesSense =
      selectedSense === "all" || item.category === selectedSense;
    const q = searchQuery.toLowerCase().trim();
    if (!matchesSense) return false;
    if (!q) return true;

    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
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
          <h2 className="section-title">Catatan Keseharian & Indera</h2>
          <div className="section-subtitle">
            Ruang refleksi personal: apa yang dibaca, didengarkan, dicicipi, dan dilihat dalam keseharian
          </div>
        </div>
      </div>

      {/* Filter Indera: Semua, Membaca, Mendengar, Mengecap, Melihat */}
      <div className="karya-tab-nav">
        <button
          type="button"
          className={`karya-tab-btn ${selectedSense === "all" ? "active" : ""}`}
          onClick={() => handleSenseChange("all")}
        >
          Semua Catatan ({DAILY_LOG_ITEMS.length})
        </button>
        <button
          type="button"
          className={`karya-tab-btn ${selectedSense === "Membaca" ? "active" : ""}`}
          onClick={() => handleSenseChange("Membaca")}
        >
          📖 Membaca
        </button>
        <button
          type="button"
          className={`karya-tab-btn ${selectedSense === "Mendengar" ? "active" : ""}`}
          onClick={() => handleSenseChange("Mendengar")}
        >
          🎧 Mendengar
        </button>
        <button
          type="button"
          className={`karya-tab-btn ${selectedSense === "Mengecap" ? "active" : ""}`}
          onClick={() => handleSenseChange("Mengecap")}
        >
          ☕ Mengecap
        </button>
        <button
          type="button"
          className={`karya-tab-btn ${selectedSense === "Melihat" ? "active" : ""}`}
          onClick={() => handleSenseChange("Melihat")}
        >
          👁️ Melihat
        </button>
      </div>

      {/* Toolbar: Search & View Switcher */}
      <CardToolbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        placeholder={
          selectedSense === "Membaca"
            ? "Cari buku, telaah, catatan pemikiran..."
            : selectedSense === "Mendengar"
            ? "Cari musik, podcast, audio..."
            : selectedSense === "Mengecap"
            ? "Cari kopi, kuliner, rasa..."
            : selectedSense === "Melihat"
            ? "Cari dokumenter, visual, foto..."
            : "Cari catatan keseharian..."
        }
        totalFiltered={filteredLogs.length}
      />

      {/* Jika Kosong */}
      {filteredLogs.length === 0 && (
        <div className="empty-search-state">
          <div className="empty-search-icon">🔍</div>
          <div className="empty-search-title">Tidak ada hasil ditemukan</div>
          <div className="empty-search-desc">
            Tidak ada catatan keseharian yang cocok dengan &quot;{searchQuery}&quot;
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
      {viewMode === "grid" && paginatedLogs.length > 0 && (
        <div className="card-grid-responsive">
          {paginatedLogs.map((item) => (
            <Link
              href={`/keseharian/details?id=${item.id}`}
              key={item.id}
              className="sensory-card-item"
              style={{ textDecoration: "none", color: "inherit" }}
              title={`Baca detail catatan: ${item.title}`}
            >
              {item.imageUrl && (
                <div className="card-thumb-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="card-thumb-img"
                    loading="lazy"
                  />
                  <span className={`sensory-badge-overlay ${item.category.toLowerCase()}`}>
                    {SENSE_ICONS[item.category]} {item.category}
                  </span>
                </div>
              )}

              <div className="card-body-content">
                <div className="card-meta-line">
                  <span>{item.date}</span>
                </div>
                <h3 className="card-title-text">{item.title}</h3>
                {item.subtitle && (
                  <div className="sensory-subtitle-text">{item.subtitle}</div>
                )}
                <p className="card-desc-text">{item.summary}</p>

                {/* Catatan Rasa / Intisari Pemikiran */}
                <div className="sensory-thought-box">
                  <span className="sensory-thought-label">Refleksi & Catatan Rasa:</span>
                  <p className="sensory-thought-text">&ldquo;{item.thoughts}&rdquo;</p>
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
                  />
                  <span className={`sensory-badge-overlay ${item.category.toLowerCase()}`}>
                    {SENSE_ICONS[item.category]} {item.category}
                  </span>
                </div>
              )}

              <div className="card-list-body">
                <div className="card-meta-line">
                  <span>{item.date} • {item.category}</span>
                </div>
                <h3 className="card-title-text">{item.title}</h3>
                {item.subtitle && (
                  <div className="sensory-subtitle-text">{item.subtitle}</div>
                )}
                <p className="card-desc-text">{item.summary}</p>
                <div className="sensory-thought-text-list">
                  <strong>Refleksi:</strong> &ldquo;{item.thoughts}&rdquo;
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
                <span className="compact-badge">{item.category}</span>
              </div>
              <div className="compact-right">
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
