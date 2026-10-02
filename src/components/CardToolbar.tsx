"use client";

import React from "react";

export type ViewMode = "gallery" | "grid" | "list" | "compact";

interface CardToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  placeholder?: string;
  totalFiltered: number;
}

export default function CardToolbar({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  placeholder = "Cari karya, topik, atau kata kunci...",
  totalFiltered,
}: CardToolbarProps) {
  return (
    <div className="card-toolbar-wrap">
      {/* Search Input Box */}
      <div className="search-box-container">
        <svg
          className="search-box-icon"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          className="search-box-input"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className="search-box-clear"
            onClick={() => onSearchChange("")}
            title="Hapus pencarian"
          >
            ✕
          </button>
        )}
      </div>

      {/* View Switcher: Galeri, Grid, List, Ringkas */}
      <div className="view-switcher-wrapper">
        <span className="view-switcher-label">View:</span>
        <div className="view-switcher-group">
        <button
          type="button"
          className={`view-switcher-btn ${viewMode === "gallery" ? "active" : ""}`}
          onClick={() => onViewModeChange("gallery")}
          title="Tampilan Galeri (Hanya Cover)"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span className="view-btn-text">Galeri</span>
        </button>

        <button
          type="button"
          className={`view-switcher-btn ${viewMode === "grid" ? "active" : ""}`}
          onClick={() => onViewModeChange("grid")}
          title="Tampilan Grid (1-3 Kolom)"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          <span className="view-btn-text">Grid</span>
        </button>

        <button
          type="button"
          className={`view-switcher-btn ${viewMode === "list" ? "active" : ""}`}
          onClick={() => onViewModeChange("list")}
          title="Tampilan List"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          <span className="view-btn-text">List</span>
        </button>

        <button
          type="button"
          className={`view-switcher-btn ${viewMode === "compact" ? "active" : ""}`}
          onClick={() => onViewModeChange("compact")}
          title="Tampilan Ringkas"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <span className="view-btn-text">Ringkas</span>
        </button>
      </div>
    </div>
  </div>
);
}
