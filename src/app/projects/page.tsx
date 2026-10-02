"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PROJECT_ITEMS } from "@/data/profileData";
import CardToolbar, { ViewMode } from "@/components/CardToolbar";
import Pagination from "@/components/Pagination";

const ITEMS_PER_PAGE = 3;

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const filteredProjects = PROJECT_ITEMS.filter((project) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      project.name.toLowerCase().includes(q) ||
      project.category.toLowerCase().includes(q) ||
      project.description.toLowerCase().includes(q) ||
      project.tech.some((t) => t.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div style={{ paddingBottom: "2.5rem" }}>
      <div className="section-header">
        <div>
          <h2 className="section-title">Karya & Proyek Inisiatif</h2>
          <div className="section-subtitle">
            Koleksi karya mandiri, sarana produktivitas, dan proyek eksplorasi
          </div>
        </div>
      </div>

      {/* Toolbar: Search & View Switcher (Grid, List, Ringkas) */}
      <CardToolbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        placeholder="Cari karya, kategori, atau topik..."
        totalFiltered={filteredProjects.length}
      />

      {/* Jika Hasil Pencarian Kosong */}
      {filteredProjects.length === 0 && (
        <div className="empty-search-state">
          <div className="empty-search-icon">🔍</div>
          <div className="empty-search-title">Tidak ada hasil ditemukan</div>
          <div className="empty-search-desc">
            Tidak ada proyek yang cocok dengan &quot;{searchQuery}&quot;
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
      {viewMode === "gallery" && paginatedProjects.length > 0 && (
        <div className="card-gallery-view">
          {paginatedProjects.map((project) => (
            <Link
              href={`/projects/details?slug=${project.slug}`}
              key={project.slug}
              className="card-gallery-item"
              title={`Buka detail ${project.name}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.imageUrl}
                alt={project.name}
                className="card-gallery-img"
                loading="lazy"
              />
              <div className="card-gallery-overlay">
                <span className="card-gallery-title">{project.name}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* TAMPILAN 1: GRID VIEW */}
      {viewMode === "grid" && paginatedProjects.length > 0 && (
        <div className="card-grid-responsive">
          {paginatedProjects.map((project) => (
            <Link
              href={`/projects/details?slug=${project.slug}`}
              key={project.slug}
              className="card-item-link"
              title={`Buka detail ${project.name}`}
            >
              <div className="card-thumb-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.imageUrl}
                  alt={project.name}
                  className="card-thumb-img"
                  loading="lazy"
                />
                <span className="card-badge-overlay">
                  {project.icon} {project.category}
                </span>
              </div>

              <div className="card-body-content">
                <div className="card-meta-line">
                  <span>{project.metrics}</span>
                </div>
                <h3 className="card-title-text">{project.name}</h3>
                <p className="card-desc-text">{project.description}</p>
                <div className="tag-pills">
                  {project.tech.map((t) => (
                    <span key={t} className="tag-pill">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* TAMPILAN 2: LIST VIEW */}
      {viewMode === "list" && paginatedProjects.length > 0 && (
        <div className="card-list-view">
          {paginatedProjects.map((project) => (
            <Link
              href={`/projects/details?slug=${project.slug}`}
              key={project.slug}
              className="card-item-list-link"
              title={`Buka detail ${project.name}`}
            >
              <div className="card-list-thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.imageUrl}
                  alt={project.name}
                  loading="lazy"
                />
                <span className="card-badge-overlay">
                  {project.icon} {project.category}
                </span>
              </div>

              <div className="card-list-body">
                <div className="card-meta-line">
                  <span>{project.metrics}</span>
                </div>
                <h3 className="card-title-text">{project.name}</h3>
                <p className="card-desc-text">{project.description}</p>
                <div className="tag-pills">
                  {project.tech.map((t) => (
                    <span key={t} className="tag-pill">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* TAMPILAN 3: RINGKAS / COMPACT VIEW (Judul di kiri) */}
      {viewMode === "compact" && paginatedProjects.length > 0 && (
        <div className="card-compact-view">
          {paginatedProjects.map((project) => (
            <Link
              href={`/projects/details?slug=${project.slug}`}
              key={project.slug}
              className="card-compact-row"
              title={`Buka detail ${project.name}`}
            >
              <div className="compact-left">
                <span className="compact-title">{project.name}</span>
                <span className="compact-badge">{project.icon} {project.category}</span>
              </div>
              <div className="compact-right">
                <span className="compact-meta">{project.metrics}</span>
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
