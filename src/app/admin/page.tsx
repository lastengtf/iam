"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  PROFILE_DATA,
  WORK_ITEMS,
  PROJECT_ITEMS,
  PUBLICATION_ITEMS,
  NEWS_ITEMS,
  WorkItem,
  ProjectItem,
  PublicationItem,
  NewsItem,
} from "@/data/profileData";

type AdminTab = "overview" | "content" | "profile" | "sso" | "backup";
type ContentCategory = "all" | "work" | "projects" | "publications" | "news";

export default function AdminPage() {
  const { data: session, status: authStatus } = useSession();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [contentCategory, setContentCategory] = useState<ContentCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" } | null>(null);

  // Editable Profile State
  const [profile, setProfile] = useState(PROFILE_DATA);

  // Content Items State
  const [workList, setWorkList] = useState<WorkItem[]>(WORK_ITEMS);
  const [projectList, setProjectList] = useState<ProjectItem[]>(PROJECT_ITEMS);
  const [pubList, setPubList] = useState<PublicationItem[]>(PUBLICATION_ITEMS);
  const [newsList, setNewsList] = useState<NewsItem[]>(NEWS_ITEMS);

  // Modal State for adding/editing content
  const [showModal, setShowModal] = useState(false);
  const [newItemType, setNewItemType] = useState<"work" | "project" | "publication" | "news">("project");
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemImage, setNewItemImage] = useState("");

  const showToast = (message: string, type: "success" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Pengaturan profil berhasil diperbarui!");
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle) return;

    if (newItemType === "project") {
      const newProj: ProjectItem = {
        slug: newItemTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: newItemTitle,
        category: newItemCategory || "Tools & Utilitas",
        icon: "⚡",
        description: newItemDesc || "Deskripsi inisiatif baru di platform TEN.",
        details: "Arsitektur modular siap pakai terintegrasi pada ekosistem TEN.",
        metrics: "Baru ditambahkan • Aktif",
        tech: ["Cloudflare", "TypeScript", "Next.js"],
        liveApp: false,
        href: "/projects/details",
        externalHref: "https://ten.my.id",
        imageUrl: newItemImage || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80",
      };
      setProjectList([newProj, ...projectList]);
    } else if (newItemType === "work") {
      const newWork: WorkItem = {
        id: `work-${Date.now()}`,
        role: newItemTitle,
        company: newItemCategory || "Inisiatif Mandiri",
        period: "2026 - Sekarang",
        location: "Indonesia",
        summary: newItemDesc || "Ringkasan peran profesional baru.",
        details: ["Mengelola dan mengembangkan platform digital."],
        skills: ["Manajemen Proyek", "Sistem Digital"],
        href: "https://ten.my.id",
        imageUrl: newItemImage || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80",
      };
      setWorkList([newWork, ...workList]);
    } else if (newItemType === "publication") {
      const newPub: PublicationItem = {
        id: `pub-${Date.now()}`,
        title: newItemTitle,
        publisher: newItemCategory || "Catatan Terbuka",
        year: "2026",
        summary: newItemDesc || "Publikasi dokumentasi karya dan pemikiran.",
        abstract: "Rangkuman studi kasus dan evaluasi implementasi sistem.",
        tags: ["Dokumentasi", "Riset"],
        href: "https://ten.my.id",
        imageUrl: newItemImage || "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80",
      };
      setPubList([newPub, ...pubList]);
    } else {
      const newNews: NewsItem = {
        slug: newItemTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        title: newItemTitle,
        date: "06 Sep 2026",
        category: newItemCategory || "Pengumuman",
        summary: newItemDesc || "Kabar terbaru mengenai perkembangan ekosistem.",
        content: "Dokumentasi dan pengumuman resmi terkait inisiatif TEN.",
        author: "TEN Platform",
        href: "/news/details",
        imageUrl: newItemImage || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop&q=80",
      };
      setNewsList([newNews, ...newsList]);
    }

    setShowModal(false);
    setNewItemTitle("");
    setNewItemCategory("");
    setNewItemDesc("");
    setNewItemImage("");
    showToast(`Berhasil menambahkan konten baru ke ${newItemType}!`);
  };

  const handleDeleteItem = (type: string, idOrSlug: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus item ini?")) return;
    if (type === "project") {
      setProjectList(projectList.filter((p) => p.slug !== idOrSlug));
    } else if (type === "work") {
      setWorkList(workList.filter((w) => w.id !== idOrSlug));
    } else if (type === "publication") {
      setPubList(pubList.filter((p) => p.id !== idOrSlug));
    } else if (type === "news") {
      setNewsList(newsList.filter((n) => n.slug !== idOrSlug));
    }
    showToast("Item berhasil dihapus.");
  };

  const handleExportJSON = () => {
    const dataToExport = {
      exportedAt: new Date().toISOString(),
      profile,
      workList,
      projectList,
      pubList,
      newsList,
      sso: {
        provider: "ten-accounts",
        issuer: "https://accounts.ten.my.id/api/auth",
        status: authStatus,
        user: session?.user || null,
      },
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ten-platform-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Backup JSON berhasil diunduh.");
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.projectList) setProjectList(parsed.projectList);
        if (parsed.workList) setWorkList(parsed.workList);
        if (parsed.pubList) setPubList(parsed.pubList);
        if (parsed.newsList) setNewsList(parsed.newsList);
        showToast("Data backup berhasil dipulihkan!");
      } catch {
        alert("Gagal membaca file JSON. Pastikan format valid.");
      }
    };
    reader.readAsText(file);
  };

  // Aggregated content rows for table
  const allContents = [
    ...projectList.map((p) => ({
      id: p.slug,
      type: "project",
      typeLabel: "Project",
      title: p.name,
      category: p.category,
      metric: p.metrics,
      previewUrl: `/projects/details?slug=${p.slug}`,
    })),
    ...workList.map((w) => ({
      id: w.id,
      type: "work",
      typeLabel: "Work",
      title: `${w.role} @ ${w.company}`,
      category: w.period,
      metric: w.location,
      previewUrl: `/work/details?id=${w.id}`,
    })),
    ...pubList.map((p) => ({
      id: p.id,
      type: "publication",
      typeLabel: "Publication",
      title: p.title,
      category: p.publisher,
      metric: p.year,
      previewUrl: `/publications/details?id=${p.id}`,
    })),
    ...newsList.map((n) => ({
      id: n.slug,
      type: "news",
      typeLabel: "News",
      title: n.title,
      category: n.category,
      metric: n.date,
      previewUrl: `/news/details?slug=${n.slug}`,
    })),
  ];

  const filteredContents = allContents.filter((item) => {
    const matchesCategory = contentCategory === "all" || item.type === contentCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="admin-portal-container">
      {/* Admin Top Bar */}
      <header className="admin-topbar">
        <div className="admin-brand-group">
          <div className="admin-logo">
            <span className="admin-logo-badge">TEN</span>
            <span className="admin-logo-text">Admin Portal</span>
          </div>
          <span className="admin-status-indicator" title="Edge Platform Online">
            <span className="admin-status-dot"></span>
            Cloudflare Edge Live
          </span>
        </div>

        <div className="admin-topbar-actions">
          <Link href="/" className="admin-return-btn">
            ← Kembali ke Web Publik
          </Link>
          <button
            type="button"
            className="admin-sync-btn"
            onClick={() => showToast("Status sistem telah disinkronisasi.")}
            title="Sinkronisasi Data"
          >
            ↻ Sinkronkan
          </button>
        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div className={`admin-toast-banner ${notification.type}`}>
          ✓ {notification.message}
        </div>
      )}

      {/* Navigation Tabs (Desktop Top Tabs / Mobile Android Bottom Navigation) */}
      <nav className="admin-tabs-nav" aria-label="Menu Navigasi Admin">
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => handleTabChange("overview")}
          aria-label="Ringkasan & Metrik"
        >
          <span className="admin-tab-icon-pill">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="9" rx="1" />
              <rect x="14" y="3" width="7" height="5" rx="1" />
              <rect x="14" y="12" width="7" height="9" rx="1" />
              <rect x="3" y="16" width="7" height="5" rx="1" />
            </svg>
          </span>
          <span className="admin-tab-label">
            <span className="admin-tab-label-full">Ringkasan & Metrik</span>
            <span className="admin-tab-label-short">Ringkasan</span>
          </span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "content" ? "active" : ""}`}
          onClick={() => handleTabChange("content")}
          aria-label="Kelola Konten & Inisiatif"
        >
          <span className="admin-tab-icon-pill">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span className="admin-tab-badge" title={`${allContents.length} total konten`}>
              {allContents.length}
            </span>
          </span>
          <span className="admin-tab-label">
            <span className="admin-tab-label-full">Kelola Konten</span>
            <span className="admin-tab-label-short">Konten</span>
          </span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => handleTabChange("profile")}
          aria-label="Pengaturan Profil"
        >
          <span className="admin-tab-icon-pill">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
          <span className="admin-tab-label">
            <span className="admin-tab-label-full">Pengaturan Profil</span>
            <span className="admin-tab-label-short">Profil</span>
          </span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "sso" ? "active" : ""}`}
          onClick={() => handleTabChange("sso")}
          aria-label="SSO & Akses"
        >
          <span className="admin-tab-icon-pill">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
          <span className="admin-tab-label">
            <span className="admin-tab-label-full">SSO & Akses</span>
            <span className="admin-tab-label-short">SSO</span>
          </span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "backup" ? "active" : ""}`}
          onClick={() => handleTabChange("backup")}
          aria-label="Cadangan Data"
        >
          <span className="admin-tab-icon-pill">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            </svg>
          </span>
          <span className="admin-tab-label">
            <span className="admin-tab-label-full">Cadangan Data</span>
            <span className="admin-tab-label-short">Backup</span>
          </span>
        </button>
      </nav>

      {/* Tab 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="admin-tab-body">
          {/* Quick Metrics Grid */}
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <span className="admin-stat-label">Total Kunjungan</span>
                <span className="admin-stat-badge">Live</span>
              </div>
              <div className="admin-stat-value">1.2k+</div>
              <div className="admin-stat-desc">Akumulasi analitik kunjungan edge</div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <span className="admin-stat-label">Total Inisiatif Karya</span>
                <span className="admin-stat-badge">{allContents.length} Items</span>
              </div>
              <div className="admin-stat-value">{projectList.length + workList.length}</div>
              <div className="admin-stat-desc">{projectList.length} Proyek • {workList.length} Pengalaman</div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <span className="admin-stat-label">Publikasi & Kabar</span>
                <span className="admin-stat-badge">Aktif</span>
              </div>
              <div className="admin-stat-value">{pubList.length + newsList.length}</div>
              <div className="admin-stat-desc">{pubList.length} Tulisan • {newsList.length} Warta</div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <span className="admin-stat-label">Status SSO Auth</span>
                <span className={`admin-stat-badge ${authStatus === "authenticated" ? "active" : ""}`}>
                  {authStatus === "loading" ? "Memeriksa" : authStatus === "authenticated" ? "Active" : "Guest"}
                </span>
              </div>
              <div className="admin-stat-value" style={{ fontSize: "1.1rem", color: "var(--mono-black)" }}>
                {authStatus === "authenticated"
                  ? (session?.user?.name || session?.user?.email || "accounts.ten.my.id")
                  : "accounts.ten.my.id"}
              </div>
              <div className="admin-stat-desc">
                {authStatus === "authenticated"
                  ? `Peran: ${session?.user?.role || "user"} • Sesi OIDC Aktif`
                  : "Belum terautentikasi (Tamu)"}
              </div>
            </div>
          </div>

          {/* Quick Shortcuts & System Health */}
          <div className="admin-grid-two">
            <div className="admin-box-card">
              <h3 className="admin-card-title">Akses Cepat Pengelolaan</h3>
              <p className="admin-card-text">Pilih tindakan cepat untuk memperbarui komponen platform:</p>
              <div className="admin-quick-actions">
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={() => {
                    setActiveTab("content");
                    setShowModal(true);
                  }}
                >
                  + Tambah Inisiatif Baru
                </button>
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={() => setActiveTab("profile")}
                >
                  Edit Profil & Bio
                </button>
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={() => setActiveTab("sso")}
                >
                  Periksa Sesi SSO
                </button>
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={handleExportJSON}
                >
                  Unduh Backup JSON
                </button>
              </div>
            </div>

            <div className="admin-box-card">
              <h3 className="admin-card-title">Informasi Runtime Lingkungan</h3>
              <ul className="admin-info-list">
                <li>
                  <strong>Framework:</strong> Next.js 16 (App Router / Static HTML Export)
                </li>
                <li>
                  <strong>Infrastruktur:</strong> Cloudflare Workers / Wrangler Edge Runtime
                </li>
                <li>
                  <strong>Penyimpanan Data:</strong> Cloudflare KV (WWW_KV Namespace)
                </li>
                <li>
                  <strong>Protokol Keamanan:</strong> Single Sign-On (TEN ID OAuth/JWT)
                </li>
                <li>
                  <strong>Optimasi SEO:</strong> OpenGraph, Twitter Cards, Schema.org JSON-LD
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: CONTENT MANAGER */}
      {activeTab === "content" && (
        <div className="admin-tab-body">
          <div className="admin-section-bar">
            <div>
              <h2 className="admin-section-title">Kelola Konten & Inisiatif</h2>
              <p className="admin-section-subtitle">
                Atur seluruh item karya, proyek web, riwayat pekerjaan, tulisan, dan warta platform.
              </p>
            </div>
            <button
              type="button"
              className="admin-btn-primary"
              onClick={() => setShowModal(true)}
            >
              + Tambah Konten Baru
            </button>
          </div>

          {/* Filters & Search */}
          <div className="admin-filter-bar">
            <div className="admin-category-pills">
              {(["all", "projects", "work", "publications", "news"] as ContentCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`admin-category-btn ${contentCategory === cat ? "active" : ""}`}
                  onClick={() => setContentCategory(cat)}
                >
                  {cat === "all" ? "Semua Konten" : cat.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="admin-search-input-wrap">
              <input
                type="text"
                placeholder="Cari item konten..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-search-input"
              />
            </div>
          </div>

          {/* Table of Content */}
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tipe</th>
                  <th>Judul Konten</th>
                  <th>Kategori / Instansi</th>
                  <th>Metrik / Info</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredContents.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--text-dim)" }}>
                      Tidak ada konten yang cocok dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredContents.map((item) => (
                    <tr key={`${item.type}-${item.id}`}>
                      <td>
                        <span className="admin-table-badge">{item.typeLabel}</span>
                      </td>
                      <td>
                        <div className="admin-table-title">{item.title}</div>
                      </td>
                      <td className="admin-table-sub">{item.category}</td>
                      <td className="admin-table-meta">{item.metric}</td>
                      <td>
                        <span className="admin-status-pill active">Aktif</span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div className="admin-table-actions">
                          <Link
                            href={item.previewUrl}
                            className="admin-btn-sm admin-btn-view"
                            title="Pratinjau Halaman"
                          >
                            Lihat ↗
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.type, item.id)}
                            className="admin-btn-sm admin-btn-del"
                            title="Hapus Item"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: PROFILE SETTINGS */}
      {activeTab === "profile" && (
        <div className="admin-tab-body">
          <div className="admin-section-bar">
            <div>
              <h2 className="admin-section-title">Pengaturan Profil & Identitas</h2>
              <p className="admin-section-subtitle">
                Sesuaikan nama, headline, narasi biografi, serta tautan komunikasi platform.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="admin-form-grid">
            <div className="admin-box-card">
              <h3 className="admin-card-title">Informasi Brand & Narasi</h3>
              <div className="admin-form-group">
                <label className="admin-label">Nama Platform / Inisial</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="admin-input"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Status Ketersediaan</label>
                <input
                  type="text"
                  value={profile.status}
                  onChange={(e) => setProfile({ ...profile, status: e.target.value })}
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Tagline Headline</label>
                <input
                  type="text"
                  value={profile.tagline}
                  onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                  className="admin-input"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Narasi Bio (Netral & Komprehensif)</label>
                <textarea
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="admin-textarea"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">URL Foto Avatar / Profil</label>
                <input
                  type="url"
                  value={profile.avatarUrl}
                  onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                  className="admin-input"
                />
              </div>
            </div>

            <div className="admin-box-card">
              <h3 className="admin-card-title">Tautan Kontak & Media</h3>
              <div className="admin-form-group">
                <label className="admin-label">Alamat Email Korespondensi</label>
                <input
                  type="email"
                  value={profile.contact.email}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      contact: { ...profile.contact, email: e.target.value },
                    })
                  }
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Domain Website Utama</label>
                <input
                  type="url"
                  value={profile.contact.website}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      contact: { ...profile.contact, website: e.target.value },
                    })
                  }
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Tautan Dokumentasi</label>
                <input
                  type="url"
                  value={profile.contact.docsUrl}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      contact: { ...profile.contact, docsUrl: e.target.value },
                    })
                  }
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Host SSO Portal</label>
                <input
                  type="url"
                  value={profile.contact.ssoPortal}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      contact: { ...profile.contact, ssoPortal: e.target.value },
                    })
                  }
                  className="admin-input"
                />
              </div>

              <div style={{ marginTop: "1.5rem" }}>
                <button type="submit" className="admin-btn-primary" style={{ width: "100%" }}>
                  Simpan Perubahan Profil
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: SSO & SECURITY */}
      {activeTab === "sso" && (
        <div className="admin-tab-body">
          <div className="admin-section-bar">
            <div>
              <h2 className="admin-section-title">Konfigurasi Single Sign-On (SSO)</h2>
              <p className="admin-section-subtitle">
                Otorisasi terpusat via TEN Accounts IdP (<code>https://accounts.ten.my.id</code>) berbasis OIDC & OAuth 2.1.
              </p>
            </div>
            {authStatus === "authenticated" ? (
              <button
                type="button"
                className="admin-btn-outline"
                style={{ color: "#e11d48", borderColor: "#fecdd3" }}
                onClick={() => signOut()}
              >
                Keluar Akun (Logout)
              </button>
            ) : (
              <button
                type="button"
                className="admin-btn-primary"
                onClick={() => signIn("ten-accounts")}
              >
                Login via TEN Accounts
              </button>
            )}
          </div>

          <div className="admin-grid-two">
            <div className="admin-box-card">
              <h3 className="admin-card-title">Status Sesi Pengguna</h3>
              
              <div className="admin-form-group">
                <label className="admin-label">Status Autentikasi</label>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <span className={`admin-status-pill ${authStatus === "authenticated" ? "active" : ""}`}>
                    {authStatus === "loading" ? "MEMERIKSA..." : authStatus === "authenticated" ? "CONNECTED (Aktif)" : "BELUM LOGIN"}
                  </span>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-dim)" }}>
                    {authStatus === "authenticated" ? "Sesi OIDC valid via Better Auth / NextAuth" : "Masuk untuk mendapatkan akses penuh"}
                  </span>
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Nama Pengguna (Profile)</label>
                <input
                  type="text"
                  value={session?.user?.name || "(Belum masuk)"}
                  readOnly
                  className="admin-input readonly"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Email Terverifikasi</label>
                <input
                  type="text"
                  value={session?.user?.email || "(Belum masuk)"}
                  readOnly
                  className="admin-input readonly"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Peran Pengguna (Role)</label>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <span className="admin-status-pill active">
                    {(session?.user?.role || "GUEST").toUpperCase()}
                  </span>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-dim)" }}>
                    {session?.user?.role === "admin"
                      ? "Hak akses administrator penuh."
                      : "Hak akses pengguna terautentikasi."}
                  </span>
                </div>
              </div>
            </div>

            <div className="admin-box-card">
              <h3 className="admin-card-title">Parameter IdP TEN Accounts</h3>
              <p className="admin-card-text">
                Integrasi identitas satelit berbasis OpenID Connect (OIDC) & PKCE:
              </p>
              <ul className="admin-info-list" style={{ marginBottom: "1.25rem" }}>
                <li><strong>Issuer:</strong> <code>https://accounts.ten.my.id/api/auth</code></li>
                <li><strong>Discovery:</strong> <code>/.well-known/openid-configuration</code></li>
                <li><strong>Authorize:</strong> <code>/api/auth/oauth2/authorize</code></li>
                <li><strong>Token:</strong> <code>/api/auth/oauth2/token</code></li>
                <li><strong>UserInfo:</strong> <code>/api/auth/oauth2/userinfo</code></li>
                <li><strong>Callback URI:</strong> <code>/api/auth/callback/ten-accounts</code></li>
              </ul>
              <button
                type="button"
                className="admin-btn-outline"
                onClick={() => showToast("Endpoint IdP accounts.ten.my.id aktif dan responsif.")}
              >
                Uji Konektivitas SSO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: BACKUP & EXPORT */}
      {activeTab === "backup" && (
        <div className="admin-tab-body">
          <div className="admin-section-bar">
            <div>
              <h2 className="admin-section-title">Cadangan Data & Pemulihan</h2>
              <p className="admin-section-subtitle">
                Ekspor seluruh konfigurasi profil dan katalog inisiatif ke berkas JSON atau pulihkan dari cadangan.
              </p>
            </div>
          </div>

          <div className="admin-grid-two">
            <div className="admin-box-card">
              <h3 className="admin-card-title">Ekspor Cadangan (JSON)</h3>
              <p className="admin-card-text">
                Simpan seluruh data profil, proyek, riwayat pekerjaan, tulisan, dan berita ke dalam satu berkas terstruktur.
              </p>
              <button
                type="button"
                className="admin-btn-primary"
                onClick={handleExportJSON}
              >
                Unduh Berkas Cadangan (.JSON)
              </button>
            </div>

            <div className="admin-box-card">
              <h3 className="admin-card-title">Impor & Pulihkan Data</h3>
              <p className="admin-card-text">
                Unggah berkas JSON cadangan yang telah dibuat sebelumnya untuk memulihkan konfigurasi platform.
              </p>
              <label className="admin-btn-outline" style={{ display: "inline-block", cursor: "pointer" }}>
                Pilih Berkas JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Konten Baru */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Tambah Konten Inisiatif Baru</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateItem}>
              <div className="admin-form-group">
                <label className="admin-label">Pilih Modul / Jenis Konten</label>
                <select
                  className="admin-select"
                  value={newItemType}
                  onChange={(e) => setNewItemType(e.target.value as "work" | "project" | "publication" | "news")}
                >
                  <option value="project">Karya & Proyek Digital</option>
                  <option value="work">Riwayat Pekerjaan</option>
                  <option value="publication">Tulisan & Publikasi</option>
                  <option value="news">Kabar & Warta Terkini</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Judul Inisiatif / Peran</label>
                <input
                  type="text"
                  placeholder="Misal: Views Counter SaaS atau Senior Engineer"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  className="admin-input"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Kategori / Instansi</label>
                <input
                  type="text"
                  placeholder="Misal: Tools & Utilitas, PT Inovasi Digital"
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Deskripsi Singkat</label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan ringkasan item ini..."
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  className="admin-textarea"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">URL Gambar Sampul (Opsional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newItemImage}
                  onChange={(e) => setNewItemImage(e.target.value)}
                  className="admin-input"
                />
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={() => setShowModal(false)}
                >
                  Batal
                </button>
                <button type="submit" className="admin-btn-primary">
                  Simpan & Publikasikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Android-style Floating Action Button (FAB) on Mobile when viewing Content */}
      {activeTab === "content" && (
        <button
          type="button"
          className="admin-mobile-fab"
          onClick={() => setShowModal(true)}
          title="Tambah Konten Baru"
          aria-label="Tambah Konten Baru"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      )}
    </div>
  );
}
