"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PUBLICATION_ITEMS } from "@/data/profileData";
import CardToolbar, { ViewMode } from "@/components/CardToolbar";
import Pagination from "@/components/Pagination";

const ITEMS_PER_PAGE = 3;

export default function PublicationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const filteredPublications = PUBLICATION_ITEMS.filter((pub) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      pub.title.toLowerCase().includes(q) ||
      pub.publisher.toLowerCase().includes(q) ||
      pub.summary.toLowerCase().includes(q) ||
      pub.year.includes(q) ||
      pub.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredPublications.length / ITEMS_PER_PAGE);
  const paginatedPublications = filteredPublications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div style={{ paddingBottom: "2.5rem" }}>
      <div className="section-header">
        <div>
          <h2 className="section-title">Tulisan & Publikasi</h2>
          <div className="section-subtitle">
            Catatan pemikiran, dokumentasi gagasan, dan telaah riset
          </div>
        </div>
      </div>

      {/* Toolbar: Search & View Switcher (Grid, List, Ringkas) */}
      <CardToolbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        placeholder="Cari judul, topik, atau kata kunci..."
        totalFiltered={filteredPublications.length}
      />

      {/* Jika Hasil Pencarian Kosong */}
      {filteredPublications.length === 0 && (
        <div className="empty-search-state">
          <div className="empty-search-icon">🔍</div>
          <div className="empty-search-title">Tidak ada hasil ditemukan</div>
          <div className="empty-search-desc">
            Tidak ada publikasi yang cocok dengan &quot;{searchQuery}&quot;
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

      {/* TAMPILAN 0: GALERI / GALLERY VIEW (Hanya Cover) */}
      {viewMode === "gallery" && paginatedPublications.length > 0 && (
        <div className="card-gallery-view">
          {paginatedPublications.map((pub) => (
            <Link
              href={`/publications/details?id=${pub.id}`}
              key={pub.id}
              className="card-gallery-item"
              title={`Buka detail ${pub.title}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pub.imageUrl}
                alt={pub.title}
                className="card-gallery-img"
                loading="lazy"
              />
              <div className="card-gallery-overlay">
                <span className="card-gallery-title">{pub.title}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* TAMPILAN 1: GRID VIEW */}
      {viewMode === "grid" && paginatedPublications.length > 0 && (
        <div className="card-grid-responsive">
          {paginatedPublications.map((pub) => (
            <Link
              href={`/publications/details?id=${pub.id}`}
              key={pub.id}
              className="card-item-link"
              title={`Buka detail ${pub.title}`}
            >
              <div className="card-thumb-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pub.imageUrl}
                  alt={pub.title}
                  className="card-thumb-img"
                  loading="lazy"
                />
                <span className="card-badge-overlay">Tahun {pub.year}</span>
              </div>

              <div className="card-body-content">
                <div className="card-meta-line">
                  <span>{pub.publisher}</span>
                </div>
                <h3 className="card-title-text">{pub.title}</h3>
                <p className="card-desc-text">{pub.summary}</p>
                <div className="tag-pills">
                  {pub.tags.slice(0, 3).map((tag) => (
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
      {viewMode === "list" && paginatedPublications.length > 0 && (
        <div className="card-list-view">
          {paginatedPublications.map((pub) => (
            <Link
              href={`/publications/details?id=${pub.id}`}
              key={pub.id}
              className="card-item-list-link"
              title={`Buka detail ${pub.title}`}
            >
              <div className="card-list-thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pub.imageUrl}
                  alt={pub.title}
                  loading="lazy"
                />
                <span className="card-badge-overlay">Tahun {pub.year}</span>
              </div>

              <div className="card-list-body">
                <div className="card-meta-line">
                  <span>{pub.publisher}</span>
                </div>
                <h3 className="card-title-text">{pub.title}</h3>
                <p className="card-desc-text">{pub.summary}</p>
                <div className="tag-pills">
                  {pub.tags.map((tag) => (
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

      {/* TAMPILAN 3: RINGKAS / COMPACT VIEW (Judul di kiri) */}
      {viewMode === "compact" && paginatedPublications.length > 0 && (
        <div className="card-compact-view">
          {paginatedPublications.map((pub) => (
            <Link
              href={`/publications/details?id=${pub.id}`}
              key={pub.id}
              className="card-compact-row"
              title={`Buka detail ${pub.title}`}
            >
              <div className="compact-left">
                <span className="compact-title">{pub.title}</span>
                <span className="compact-badge">{pub.year}</span>
              </div>
              <div className="compact-right">
                <span className="compact-meta">{pub.publisher}</span>
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
