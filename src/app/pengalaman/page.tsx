"use client";

import React, { useState } from "react";
import Link from "next/link";
import { WORK_ITEMS } from "@/data/profileData";
import CardToolbar, { ViewMode } from "@/components/CardToolbar";
import Pagination from "@/components/Pagination";

const ITEMS_PER_PAGE = 3;

export default function PengalamanPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const filteredWork = WORK_ITEMS.filter((work) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      work.role.toLowerCase().includes(q) ||
      work.company.toLowerCase().includes(q) ||
      work.summary.toLowerCase().includes(q) ||
      work.skills.some((s) => s.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredWork.length / ITEMS_PER_PAGE);
  const paginatedWork = filteredWork.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div style={{ paddingBottom: "2.5rem" }}>
      <div className="section-header">
        <div>
          <h2 className="section-title">Riwayat Pengalaman & Peran</h2>
          <div className="section-subtitle">
            Rekam jejak kepemimpinan inisiatif, tata kelola alur kerja, dan transformasi program
          </div>
        </div>
      </div>

      {/* Toolbar: Search & View Switcher */}
      <CardToolbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        placeholder="Cari peran, lembaga, atau keahlian..."
        totalFiltered={filteredWork.length}
      />

      {/* Jika Kosong */}
      {filteredWork.length === 0 && (
        <div className="empty-search-state">
          <div className="empty-search-icon">🔍</div>
          <div className="empty-search-title">Tidak ada hasil ditemukan</div>
          <div className="empty-search-desc">
            Tidak ada riwayat pengalaman yang cocok dengan &quot;{searchQuery}&quot;
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
      {viewMode === "grid" && paginatedWork.length > 0 && (
        <div className="card-grid-responsive">
          {paginatedWork.map((work) => (
            <Link
              href={`/pengalaman/details?id=${work.id}`}
              key={work.id}
              className="card-item-link"
              title={`Lihat detail peran ${work.role}`}
            >
              <div className="card-thumb-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={work.imageUrl}
                  alt={work.role}
                  className="card-thumb-img"
                  loading="lazy"
                />
                <span className="card-badge-overlay">{work.period}</span>
              </div>

              <div className="card-body-content">
                <div className="card-meta-line">
                  <span>{work.company} • {work.location}</span>
                </div>
                <h3 className="card-title-text">{work.role}</h3>
                <p className="card-desc-text">{work.summary}</p>
                <div className="tag-pills">
                  {work.skills.slice(0, 3).map((skill) => (
                    <span key={skill} className="tag-pill">
                      #{skill}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* TAMPILAN 2: LIST VIEW */}
      {viewMode === "list" && paginatedWork.length > 0 && (
        <div className="card-list-view">
          {paginatedWork.map((work) => (
            <Link
              href={`/pengalaman/details?id=${work.id}`}
              key={work.id}
              className="card-item-list-link"
              title={`Lihat detail peran ${work.role}`}
            >
              <div className="card-list-thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={work.imageUrl}
                  alt={work.role}
                  loading="lazy"
                />
                <span className="card-badge-overlay">{work.period}</span>
              </div>

              <div className="card-list-body">
                <div className="card-meta-line">
                  <span>{work.company} • {work.location}</span>
                </div>
                <h3 className="card-title-text">{work.role}</h3>
                <p className="card-desc-text">{work.summary}</p>
                <div className="tag-pills">
                  {work.skills.map((skill) => (
                    <span key={skill} className="tag-pill">
                      #{skill}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* TAMPILAN 3: RINGKAS / COMPACT VIEW */}
      {viewMode === "compact" && paginatedWork.length > 0 && (
        <div className="card-compact-view">
          {paginatedWork.map((work) => (
            <Link
              href={`/pengalaman/details?id=${work.id}`}
              key={work.id}
              className="card-compact-row"
              title={`Lihat detail peran ${work.role}`}
            >
              <div className="compact-left">
                <span className="compact-title">{work.role}</span>
                <span className="compact-badge">{work.period}</span>
              </div>
              <div className="compact-right">
                <span className="compact-meta">{work.company}</span>
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
