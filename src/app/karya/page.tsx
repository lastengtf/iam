"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PROJECT_ITEMS, PUBLICATION_ITEMS, ProjectItem, PublicationItem } from "@/data/profileData";
import CardToolbar, { ViewMode } from "@/components/CardToolbar";
import Pagination from "@/components/Pagination";

type TabType = "all" | "projects" | "research";

interface UnifiedKaryaItem {
  id: string;
  type: "project" | "research";
  title: string;
  category: string;
  summary: string;
  meta: string;
  tags: string[];
  imageUrl: string;
  href: string;
  statusText?: string;
  statusClass?: string;
}

const ITEMS_PER_PAGE = 4;

export default function KaryaPage() {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // Convert Projects to unified format
  const projectItemsUnified: UnifiedKaryaItem[] = PROJECT_ITEMS.map((p) => {
    let statusText = "Selesai";
    let statusClass = "status-completed";
    if (p.status === "in-progress") {
      statusText = "Sedang Dibuat";
      statusClass = "status-progress";
    } else if (p.status === "planned") {
      statusText = "Rencana";
      statusClass = "status-planned";
    }

    return {
      id: `proj-${p.slug}`,
      type: "project",
      title: p.name,
      category: p.category,
      summary: p.description,
      meta: p.metrics || "Proyek Digital",
      tags: p.tech,
      imageUrl: p.imageUrl,
      href: `/karya/details?id=proj-${p.slug}`,
      statusText,
      statusClass,
    };
  });

  // Convert Publications to unified format
  const publicationItemsUnified: UnifiedKaryaItem[] = PUBLICATION_ITEMS.map((pub) => ({
    id: `pub-${pub.id}`,
    type: "research",
    title: pub.title,
    category: pub.publisher,
    summary: pub.summary,
    meta: `Karya Ilmiah • Tahun ${pub.year}`,
    tags: pub.tags,
    imageUrl: pub.imageUrl,
    href: `/karya/details?id=pub-${pub.id}`,
    statusText: "Publikasi Ilmiah",
    statusClass: "status-research",
  }));

  // Filter based on activeTab
  const allUnified: UnifiedKaryaItem[] =
    activeTab === "all"
      ? [...projectItemsUnified, ...publicationItemsUnified]
      : activeTab === "projects"
      ? projectItemsUnified
      : publicationItemsUnified;

  // Filter based on search query
  const filteredItems = allUnified.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q))
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
          <h2 className="section-title">Riset & Karya Kreasi</h2>
          <div className="section-subtitle">
            Koleksi aplikasi rekayasa, sarana produktivitas, serta telaah karya ilmiah periset
          </div>
        </div>
      </div>

      {/* Tab Switcher: Semua, Proyek, Riset Ilmiah */}
      <div className="karya-tab-nav">
        <button
          type="button"
          className={`karya-tab-btn ${activeTab === "all" ? "active" : ""}`}
          onClick={() => handleTabChange("all")}
        >
          <span className="tab-label-full">Semua Koleksi</span>
          <span className="tab-label-short">Semua</span>
          <span>({projectItemsUnified.length + publicationItemsUnified.length})</span>
        </button>
        <button
          type="button"
          className={`karya-tab-btn ${activeTab === "projects" ? "active" : ""}`}
          onClick={() => handleTabChange("projects")}
        >
          <span>🛠️</span>
          <span className="tab-label-full">Proyek & Aplikasi</span>
          <span className="tab-label-short">Proyek</span>
          <span>({projectItemsUnified.length})</span>
        </button>
        <button
          type="button"
          className={`karya-tab-btn ${activeTab === "research" ? "active" : ""}`}
          onClick={() => handleTabChange("research")}
        >
          <span>📜</span>
          <span className="tab-label-full">Riset & Karya Ilmiah</span>
          <span className="tab-label-short">Riset</span>
          <span>({publicationItemsUnified.length})</span>
        </button>
      </div>

      {/* Toolbar: Search & View Switcher */}
      <CardToolbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        placeholder={
          activeTab === "projects"
            ? "Cari proyek, aplikasi, teknologi..."
            : activeTab === "research"
            ? "Cari judul paper, riset, topik ilmiah..."
            : "Cari proyek atau karya ilmiah..."
        }
        totalFiltered={filteredItems.length}
      />

      {/* Jika Kosong */}
      {filteredItems.length === 0 && (
        <div className="empty-search-state">
          <div className="empty-search-icon">🔍</div>
          <div className="empty-search-title">Tidak ada hasil ditemukan</div>
          <div className="empty-search-desc">
            Tidak ada karya atau riset yang cocok dengan &quot;{searchQuery}&quot;
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
          {paginatedItems.map((item) => (
            <Link
              href={item.href}
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
                <span className={`card-badge-overlay ${item.statusClass || ""}`}>
                  {item.statusText || item.meta}
                </span>
              </div>

              <div className="card-body-content">
                <div className="card-meta-line">
                  <span>{item.category}</span>
                </div>
                <h3 className="card-title-text">{item.title}</h3>
                <p className="card-desc-text">{item.summary}</p>
                <div className="tag-pills">
                  {item.tags.slice(0, 3).map((tag) => (
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
      {viewMode === "list" && paginatedItems.length > 0 && (
        <div className="card-list-view">
          {paginatedItems.map((item) => (
            <Link
              href={item.href}
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
                <span className={`card-badge-overlay ${item.statusClass || ""}`}>
                  {item.statusText || item.meta}
                </span>
              </div>

              <div className="card-list-body">
                <div className="card-meta-line">
                  <span>{item.category} • {item.meta}</span>
                </div>
                <h3 className="card-title-text">{item.title}</h3>
                <p className="card-desc-text">{item.summary}</p>
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
      {viewMode === "compact" && paginatedItems.length > 0 && (
        <div className="card-compact-view">
          {paginatedItems.map((item) => (
            <Link
              href={item.href}
              key={item.id}
              className="card-compact-row"
              title={`Buka detail ${item.title}`}
            >
              <div className="compact-left">
                <span className="compact-title">{item.title}</span>
                <span className={`compact-badge ${item.statusClass || ""}`}>
                  {item.type === "research" ? "📜 Riset" : "🛠️ Proyek"}
                </span>
              </div>
              <div className="compact-right">
                <span className="compact-meta">{item.category}</span>
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
