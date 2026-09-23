"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ShareButton from "@/components/ShareButton";

export interface MasterDetailSidebarItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: string;
  imageUrl?: string;
  href: string;
}

interface MasterDetailLayoutProps {
  backHref: string;
  backLabel?: string;
  categoryLabel?: string;
  categoryTitle?: string;
  sidebarItems: MasterDetailSidebarItem[];
  selectedId: string;
  detailTitle?: string;
  shareTitle: string;
  shareUrl: string;
  children: React.ReactNode;
}

const MIN_WIDTH = 240;
const MAX_WIDTH = 500;
const DEFAULT_WIDTH = 320;

const ALL_CATEGORIES = [
  { label: "Pengalaman", href: "/pengalaman/details", catalogHref: "/pengalaman", icon: "💼", desc: "Rekam jejak karier & peran" },
  { label: "Riset & Karya", href: "/karya/details", catalogHref: "/karya", icon: "🛠️", desc: "Aplikasi, karya & riset ilmiah" },
  { label: "Alat", href: "/alat/details", catalogHref: "/alat", icon: "⚙️", desc: "Stack perangkat & ulasan" },
  { label: "Keseharian", href: "/keseharian/details", catalogHref: "/keseharian", icon: "☕", desc: "Jurnal rasa, buku & visual" },
];

export default function MasterDetailLayout({
  backHref,
  backLabel,
  categoryLabel,
  categoryTitle,
  sidebarItems,
  selectedId,
  detailTitle,
  shareTitle,
  shareUrl,
  children,
}: MasterDetailLayoutProps) {
  const [sidebarWidth, setSidebarWidth] = useState<number>(DEFAULT_WIDTH);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [isDrawerClosing, setIsDrawerClosing] = useState<boolean>(false);
  const [isCatMenuOpen, setIsCatMenuOpen] = useState<boolean>(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const catMenuRef = useRef<HTMLDivElement>(null);

  const closeMobileDrawer = () => {
    if (isDrawerClosing) return;
    setIsDrawerClosing(true);
    setTimeout(() => {
      setIsMobileDrawerOpen(false);
      setIsDrawerClosing(false);
    }, 230);
  };

  // Close category dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (catMenuRef.current && !catMenuRef.current.contains(e.target as Node)) {
        setIsCatMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Setup full-screen layout class on document body
  useEffect(() => {
    document.body.classList.add("in-master-detail");
    return () => {
      document.body.classList.remove("in-master-detail");
    };
  }, []);

  // Load saved sidebar width from localStorage
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const savedWidth = localStorage.getItem("ten_md_sidebar_width");
        const savedCollapsed = localStorage.getItem("ten_md_sidebar_collapsed");
        if (savedWidth) {
          const parsed = parseInt(savedWidth, 10);
          if (parsed >= MIN_WIDTH && parsed <= MAX_WIDTH) {
            setSidebarWidth(parsed);
          }
        }
        if (savedCollapsed === "true") {
          setIsCollapsed(true);
        }
      } catch {}
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  // Handle Drag Resizing
  const startResizing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !sidebarRef.current) return;
      const rect = sidebarRef.current.getBoundingClientRect();
      const newWidth = e.clientX - rect.left;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
        if (isCollapsed) setIsCollapsed(false);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isResizing || !sidebarRef.current) return;
      const rect = sidebarRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      const newWidth = touch.clientX - rect.left;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
        if (isCollapsed) setIsCollapsed(false);
      }
    };

    const stopResizing = () => {
      if (isResizing) {
        setIsResizing(false);
        try {
          localStorage.setItem("ten_md_sidebar_width", sidebarWidth.toString());
        } catch {}
      }
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", stopResizing);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", stopResizing);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopResizing);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", stopResizing);
    };
  }, [isResizing, sidebarWidth, isCollapsed]);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    try {
      localStorage.setItem("ten_md_sidebar_collapsed", nextState.toString());
    } catch {}
  };

  const setWidthPreset = (width: number) => {
    setIsCollapsed(false);
    setSidebarWidth(width);
    try {
      localStorage.setItem("ten_md_sidebar_width", width.toString());
      localStorage.setItem("ten_md_sidebar_collapsed", "false");
    } catch {}
  };

  // Resolve Titles and Breadcrumb Data
  const resolvedCategory = categoryLabel || (categoryTitle ? categoryTitle.replace(/^Daftar\s+/i, "") : backLabel || "Kategori");
  const resolvedSidebarTitle = categoryTitle || (categoryLabel ? `Daftar ${categoryLabel}` : "Daftar Item");
  const resolvedDetailTitle = detailTitle || sidebarItems.find((item) => item.id === selectedId)?.title || "Detail";
  const categoryDetailHref = backHref.endsWith("/details")
    ? backHref
    : `${backHref.replace(/\/$/, "")}/details`;

  // Filter items in sidebar
  const filteredSidebarItems = sidebarItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      (item.badge && item.badge.toLowerCase().includes(q))
    );
  });

  return (
    <div className="md-wrapper">
      {/* Top Navbar */}
      <div className="md-topbar">
        <div className="md-topbar-left">
          {/* Fitur Tampilkan/Sembunyikan Daftar: Icon saja & di sebelah kiri icon home */}
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.innerWidth <= 768) {
                if (isMobileDrawerOpen) {
                  closeMobileDrawer();
                } else {
                  setIsMobileDrawerOpen(true);
                }
              } else {
                toggleCollapse();
              }
            }}
            className={`md-sidebar-toggle-btn ${isCollapsed ? "is-collapsed" : "is-open"}`}
            title={isCollapsed ? "Tampilkan daftar samping" : "Sembunyikan daftar samping"}
            aria-label="Tampilkan atau sembunyikan daftar samping"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="md-toggle-icon"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M9 3v18" />
            </svg>
          </button>

          {/* Breadcrumb Navigation: Home TEN / Category (with hover dropdown) / Detail */}
          <nav className="md-breadcrumb" aria-label="Navigasi Jejak">
            <Link href="/" className="md-breadcrumb-link md-breadcrumb-home" title="Ke Beranda Utama (TEN)">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="md-home-icon"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span className="md-breadcrumb-brand">TEN</span>
            </Link>

            <span className="md-breadcrumb-sep">/</span>

            {/* Bagian Kategori dengan Hover Dropdown untuk berpindah cepat */}
            <div
              ref={catMenuRef}
              className="md-breadcrumb-cat-wrap"
              onMouseEnter={() => setIsCatMenuOpen(true)}
              onMouseLeave={() => setIsCatMenuOpen(false)}
            >
              <Link
                href={categoryDetailHref}
                className="md-breadcrumb-link md-breadcrumb-cat-trigger"
                title={`Ke Detail ${resolvedCategory} (Arahkan kursor atau klik untuk pilih kategori lain)`}
                onClick={() => setIsCatMenuOpen(false)}
              >
                <span>{resolvedCategory}</span>
                <span className="md-breadcrumb-chevron">▾</span>
              </Link>

              {isCatMenuOpen && (
                <div className="md-category-dropdown" role="menu">
                  <div className="md-cat-dropdown-header">Pindah Kategori:</div>
                  {ALL_CATEGORIES.map((cat) => {
                    const isCurrentCat =
                      cat.href === categoryDetailHref ||
                      cat.catalogHref === backHref;
                    return (
                      <Link
                        key={cat.href}
                        href={cat.href}
                        className={`md-cat-menu-item ${isCurrentCat ? "active" : ""}`}
                        onClick={() => setIsCatMenuOpen(false)}
                      >
                        <span className="md-cat-icon">{cat.icon}</span>
                        <div className="md-cat-text">
                          <span className="md-cat-title">{cat.label}</span>
                          <span className="md-cat-desc">{cat.desc}</span>
                        </div>
                        {isCurrentCat && <span className="md-cat-check">✓</span>}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <span className="md-breadcrumb-sep">/</span>

            <span className="md-breadcrumb-current" title={resolvedDetailTitle}>
              {resolvedDetailTitle}
            </span>
          </nav>

          {/* Desktop Sidebar Width Controls */}
          {!isCollapsed && (
            <div className="md-width-controls">
              <button
                type="button"
                onClick={() => setWidthPreset(300)}
                className={`md-control-pill ${sidebarWidth === 300 ? "active" : ""}`}
                title="Ukuran Standar (300px)"
              >
                Standar
              </button>
              <button
                type="button"
                onClick={() => setWidthPreset(420)}
                className={`md-control-pill ${sidebarWidth === 420 ? "active" : ""}`}
                title="Ukuran Luas (420px)"
              >
                Luas
              </button>
            </div>
          )}
        </div>

        <div className="md-topbar-right">
          <ShareButton
            title={shareTitle}
            text={`Simak selengkapnya: ${shareTitle}`}
            url={shareUrl}
          />
        </div>
      </div>

      {/* Main Two-Panel Layout */}
      <div className="md-container">
        {/* Left Side List (Desktop) */}
        <aside
          ref={sidebarRef}
          className={`md-sidebar ${isCollapsed ? "collapsed" : ""}`}
          style={{ width: isCollapsed ? 0 : `${sidebarWidth}px` }}
          aria-label={resolvedSidebarTitle}
        >
          <div className="md-sidebar-inner" style={{ width: `${sidebarWidth}px` }}>
            <div className="md-sidebar-header">
              <div className="md-sidebar-title-row">
                <span className="md-sidebar-title">{resolvedSidebarTitle}</span>
                <span className="md-sidebar-count">({sidebarItems.length})</span>
              </div>
              <div className="md-sidebar-search-wrap">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari dalam daftar..."
                  className="md-sidebar-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="md-search-clear-btn"
                    title="Hapus pencarian"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            <div className="md-sidebar-list">
              {filteredSidebarItems.length === 0 ? (
                <div className="md-sidebar-empty">
                  Tidak ada item yang cocok dengan &quot;{searchQuery}&quot;
                </div>
              ) : (
                filteredSidebarItems.map((item) => {
                  const isCurrent = item.id === selectedId;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`md-sidebar-item ${isCurrent ? "active" : ""}`}
                      title={item.title}
                    >
                      {item.imageUrl ? (
                        <div className="md-item-thumb-box">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="md-item-thumb-img"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="md-item-icon-box">{item.icon || "📄"}</div>
                      )}

                      <div className="md-item-info">
                        <div className="md-item-top-meta">
                          {item.badge && <span className="md-item-badge">{item.badge}</span>}
                          {item.subtitle && <span className="md-item-sub">{item.subtitle}</span>}
                        </div>
                        <h4 className="md-item-title">{item.title}</h4>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </aside>

        {/* Resizer Handle */}
        {!isCollapsed && (
          <div
            className={`md-resizer ${isResizing ? "resizing" : ""}`}
            onMouseDown={startResizing}
            onTouchStart={startResizing}
            title="Tarik untuk memperlebar / memperkecil daftar samping"
          >
            <div className="md-resizer-line"></div>
          </div>
        )}

        {/* Right Content Area */}
        <main className="md-content-area">
          <div className="md-content-inner">{children}</div>
        </main>
      </div>

      {/* Mobile Drawer Overlay */}
      {(isMobileDrawerOpen || isDrawerClosing) && (
        <div
          className={`md-drawer-backdrop ${isDrawerClosing ? "closing" : ""}`}
          onClick={closeMobileDrawer}
        >
          <div
            className={`md-drawer-sheet ${isDrawerClosing ? "closing" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="md-drawer-header">
              <span className="md-sidebar-title">{resolvedSidebarTitle}</span>
              <button
                type="button"
                className="md-drawer-close-btn"
                onClick={closeMobileDrawer}
                aria-label="Tutup daftar"
              >
                ✕
              </button>
            </div>
            <div className="md-sidebar-search-wrap" style={{ margin: "0.5rem 0 1rem" }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari dalam daftar..."
                className="md-sidebar-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="md-search-clear-btn"
                  title="Hapus pencarian"
                >
                  ×
                </button>
              )}
            </div>
            <div className="md-sidebar-list">
              {filteredSidebarItems.length === 0 ? (
                <div className="md-sidebar-empty">
                  Tidak ada item yang cocok dengan &quot;{searchQuery}&quot;
                </div>
              ) : (
                filteredSidebarItems.map((item) => {
                  const isCurrent = item.id === selectedId;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={closeMobileDrawer}
                      className={`md-sidebar-item ${isCurrent ? "active" : ""}`}
                      title={item.title}
                    >
                      {item.imageUrl ? (
                        <div className="md-item-thumb-box">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="md-item-thumb-img"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="md-item-icon-box">{item.icon || "📄"}</div>
                      )}

                      <div className="md-item-info">
                        <div className="md-item-top-meta">
                          {item.badge && <span className="md-item-badge">{item.badge}</span>}
                          {item.subtitle && <span className="md-item-sub">{item.subtitle}</span>}
                        </div>
                        <h4 className="md-item-title">{item.title}</h4>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
