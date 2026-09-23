"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useUpdatesFeed } from "@/data/contentStore";
import CardToolbar, { ViewMode } from "@/components/CardToolbar";
import Pagination from "@/components/Pagination";

const ITEMS_PER_PAGE = 3;

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const updatesFeed = useUpdatesFeed();

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const filteredUpdates = updatesFeed.filter((item) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      item.title.toLowerCase().includes(query) ||
      item.summary.toLowerCase().includes(query) ||
      item.badge.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredUpdates.length / ITEMS_PER_PAGE);
  const paginatedUpdates = filteredUpdates.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div style={{ paddingBottom: "2.5rem" }}>
      {/* Updates Section */}
      <section className="section-box">
        <div className="section-header">
          <div>
            <h2 className="section-title">Catatan & Updates Terkini</h2>
            <div className="section-subtitle">
              Aktivitas berkala, eksplorasi karya, dan warta kegiatan
            </div>
          </div>
        </div>

        {/* Toolbar: Search & View Switcher (Grid, List, Ringkas) */}
        <CardToolbar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          placeholder="Cari updates, karya, tulisan..."
          totalFiltered={filteredUpdates.length}
        />

        {/* Jika Hasil Pencarian Kosong */}
        {filteredUpdates.length === 0 && (
          <div className="empty-search-state">
            <div className="empty-search-icon">🔍</div>
            <div className="empty-search-title">Tidak ada hasil ditemukan</div>
            <div className="empty-search-desc">
              Tidak ada catatan atau updates yang cocok dengan &quot;{searchQuery}&quot;
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

        {/* TAMPILAN 1: GRID VIEW (1-3 KOLOM) */}
        {viewMode === "grid" && paginatedUpdates.length > 0 && (
          <div className="card-grid-responsive">
            {paginatedUpdates.map((item) => (
              <Link
                href={item.link}
                key={item.id}
                className="card-item-link"
                title={`Buka detail ${item.title}`}
              >
                <div className="card-thumb-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="card-thumb-img"
                    loading="lazy"
                  />
                  <span className="card-badge-overlay">{item.badge}</span>
                </div>

                <div className="card-body-content">
                  <div className="card-meta-line">
                    <span>{item.date}</span>
                  </div>
                  <h3 className="card-title-text">{item.title}</h3>
                  <p className="card-desc-text">{item.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* TAMPILAN 2: LIST VIEW (HORIZONTAL) */}
        {viewMode === "list" && paginatedUpdates.length > 0 && (
          <div className="card-list-view">
            {paginatedUpdates.map((item) => (
              <Link
                href={item.link}
                key={item.id}
                className="card-item-list-link"
                title={`Buka detail ${item.title}`}
              >
                <div className="card-list-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    loading="lazy"
                  />
                  <span className="card-badge-overlay">{item.badge}</span>
                </div>

                <div className="card-list-body">
                  <div className="card-meta-line">
                    <span>{item.date}</span>
                  </div>
                  <h3 className="card-title-text">{item.title}</h3>
                  <p className="card-desc-text">{item.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* TAMPILAN 3: RINGKAS / COMPACT VIEW (Judul di kiri, lalu badge) */}
        {viewMode === "compact" && paginatedUpdates.length > 0 && (
          <div className="card-compact-view">
            {paginatedUpdates.map((item) => (
              <Link
                href={item.link}
                key={item.id}
                className="card-compact-row"
                title={`Buka detail ${item.title}`}
              >
                <div className="compact-left">
                  <span className="compact-title">{item.title}</span>
                  <span className="compact-badge">{item.badge}</span>
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
      </section>
    </div>
  );
}
