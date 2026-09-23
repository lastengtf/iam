"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useNewsData } from "@/data/contentStore";
import CardToolbar, { ViewMode } from "@/components/CardToolbar";
import Pagination from "@/components/Pagination";

const ITEMS_PER_PAGE = 3;

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const { news: newsList } = useNewsData();

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const filteredNews = newsList.filter((news) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      news.title.toLowerCase().includes(q) ||
      news.category.toLowerCase().includes(q) ||
      news.summary.toLowerCase().includes(q) ||
      news.content.toLowerCase().includes(q) ||
      news.author.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE);
  const paginatedNews = filteredNews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div style={{ paddingBottom: "2.5rem" }}>
      <div className="section-header">
        <div>
          <h2 className="section-title">Kabar & Warta Kegiatan</h2>
          <div className="section-subtitle">
            Kabar berkala, warta kegiatan, dan catatan perkembangan
          </div>
        </div>
      </div>

      {/* Toolbar: Search & View Switcher (Grid, List, Ringkas) */}
      <CardToolbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        placeholder="Cari kabar atau warta kegiatan..."
        totalFiltered={filteredNews.length}
      />

      {/* Jika Hasil Pencarian Kosong */}
      {filteredNews.length === 0 && (
        <div className="empty-search-state">
          <div className="empty-search-icon">🔍</div>
          <div className="empty-search-title">Tidak ada hasil ditemukan</div>
          <div className="empty-search-desc">
            Tidak ada kabar yang cocok dengan &quot;{searchQuery}&quot;
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
      {viewMode === "grid" && paginatedNews.length > 0 && (
        <div className="card-grid-responsive">
          {paginatedNews.map((news) => (
            <Link
              href={`/news/details?slug=${news.slug}`}
              key={news.slug}
              className="card-item-link"
              title={`Buka detail ${news.title}`}
            >
              <div className="card-thumb-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={news.imageUrl}
                  alt={news.title}
                  className="card-thumb-img"
                  loading="lazy"
                />
                <span className="card-badge-overlay">{news.category}</span>
              </div>

              <div className="card-body-content">
                <div className="card-meta-line">
                  <span>{news.date}</span>
                  <span>{news.author}</span>
                </div>
                <h3 className="card-title-text">{news.title}</h3>
                <p className="card-desc-text">{news.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* TAMPILAN 2: LIST VIEW */}
      {viewMode === "list" && paginatedNews.length > 0 && (
        <div className="card-list-view">
          {paginatedNews.map((news) => (
            <Link
              href={`/news/details?slug=${news.slug}`}
              key={news.slug}
              className="card-item-list-link"
              title={`Buka detail ${news.title}`}
            >
              <div className="card-list-thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={news.imageUrl}
                  alt={news.title}
                  loading="lazy"
                />
                <span className="card-badge-overlay">{news.category}</span>
              </div>

              <div className="card-list-body">
                <div className="card-meta-line">
                  <span>{news.date}</span>
                  <span>{news.author}</span>
                </div>
                <h3 className="card-title-text">{news.title}</h3>
                <p className="card-desc-text">{news.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* TAMPILAN 3: RINGKAS / COMPACT VIEW (Judul di kiri) */}
      {viewMode === "compact" && paginatedNews.length > 0 && (
        <div className="card-compact-view">
          {paginatedNews.map((news) => (
            <Link
              href={`/news/details?slug=${news.slug}`}
              key={news.slug}
              className="card-compact-row"
              title={`Buka detail ${news.title}`}
            >
              <div className="compact-left">
                <span className="compact-title">{news.title}</span>
                <span className="compact-badge">{news.category}</span>
              </div>
              <div className="compact-right">
                <span className="compact-meta">{news.date}</span>
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
