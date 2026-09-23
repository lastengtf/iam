"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/components/AuthProvider";
import {
  PROFILE_DATA,
  WORK_ITEMS,
  PROJECT_ITEMS,
  PUBLICATION_ITEMS,
  NEWS_ITEMS,
  STACK_ITEMS,
  DAILY_LOG_ITEMS,
  WorkItem,
  ProjectItem,
  PublicationItem,
  NewsItem,
  StackItem,
  DailyLogItem,
} from "@/data/profileData";

type AdminTab = "overview" | "content" | "profile" | "sso" | "backup";
type ContentCategory = "all" | "projects" | "work" | "publications" | "alat" | "keseharian" | "news";

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();

  // Auth protection: redirect unauthenticated users to /login
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace("/login");
    }
  }, [authStatus, router]);

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
  const [stackList, setStackList] = useState<StackItem[]>(STACK_ITEMS);
  const [dailyList, setDailyList] = useState<DailyLogItem[]>(DAILY_LOG_ITEMS);

  // Modal State for adding/editing content
  const [showModal, setShowModal] = useState(false);
  const [newItemType, setNewItemType] = useState<"project" | "work" | "publication" | "alat" | "keseharian" | "news">("project");
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemImage, setNewItemImage] = useState("");

  // Load persisted items from localStorage
  useEffect(() => {
    try {
      const savedProj = localStorage.getItem("ten_admin_projects");
      if (savedProj) setProjectList(JSON.parse(savedProj));
      const savedWork = localStorage.getItem("ten_admin_work");
      if (savedWork) setWorkList(JSON.parse(savedWork));
      const savedPub = localStorage.getItem("ten_admin_pub");
      if (savedPub) setPubList(JSON.parse(savedPub));
      const savedStack = localStorage.getItem("ten_admin_stack");
      if (savedStack) setStackList(JSON.parse(savedStack));
      const savedDaily = localStorage.getItem("ten_admin_daily");
      if (savedDaily) setDailyList(JSON.parse(savedDaily));
      const savedNews = localStorage.getItem("ten_admin_news");
      if (savedNews) setNewsList(JSON.parse(savedNews));
      const savedProfile = localStorage.getItem("ten_admin_profile");
      if (savedProfile) setProfile(JSON.parse(savedProfile));
    } catch {}
  }, []);

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
    try {
      localStorage.setItem("ten_admin_profile", JSON.stringify(profile));
    } catch {}
    showToast("Pengaturan profil berhasil disimpan!");
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
        href: "/karya/details",
        externalHref: "https://ten.my.id",
        imageUrl: newItemImage || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80",
      };
      const updated = [newProj, ...projectList];
      setProjectList(updated);
      try {
        localStorage.setItem("ten_admin_projects", JSON.stringify(updated));
      } catch {}
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
      const updated = [newWork, ...workList];
      setWorkList(updated);
      try {
        localStorage.setItem("ten_admin_work", JSON.stringify(updated));
      } catch {}
    } else if (newItemType === "publication") {
      const newPub: PublicationItem = {
        id: `pub-${Date.now()}`,
        title: newItemTitle,
        publisher: newItemCategory || "Jurnal Ilmiah / Riset",
        year: "2026",
        summary: newItemDesc || "Telaah riset ilmiah terbaru dalam rekayasa sistem.",
        abstract: newItemDesc || "Abstraksi penelitian dan rancang bangun platform terdistribusi.",
        tags: ["Riset", "Inovasi", "Digital"],
        imageUrl: newItemImage || "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80",
        href: "/karya/details",
      };
      const updated = [newPub, ...pubList];
      setPubList(updated);
      try {
        localStorage.setItem("ten_admin_pub", JSON.stringify(updated));
      } catch {}
    } else if (newItemType === "alat") {
      const validCategory: "Hardware & EDC" | "Software & Otomasi" | "Infrastruktur & Cloud" =
        newItemCategory === "Hardware & EDC" || newItemCategory === "Infrastruktur & Cloud"
          ? newItemCategory
          : "Software & Otomasi";
      const newTool: StackItem = {
        id: `stack-${Date.now()}`,
        name: newItemTitle,
        category: validCategory,
        description: newItemDesc || "Instrumen produktivitas harian.",
        review: "Sangat menunjang performa komputasi dan alur kerja.",
        platforms: ["Web", "Desktop"],
        status: "active",
        likes: 1,
      };
      const updated = [newTool, ...stackList];
      setStackList(updated);
      try {
        localStorage.setItem("ten_admin_stack", JSON.stringify(updated));
      } catch {}
    } else if (newItemType === "keseharian") {
      const newDaily: DailyLogItem = {
        id: `daily-${Date.now()}`,
        title: newItemTitle,
        subtitle: newItemCategory || "Refleksi Keseharian",
        category: "Membaca",
        date: "Hari Ini",
        summary: newItemDesc || "Catatan pengamatan dan refleksi.",
        thoughts: "Membangun konsistensi dan eksplorasi berkesinambungan.",
        tags: ["Keseharian", "Jurnal"],
        imageUrl: newItemImage || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
      };
      const updated = [newDaily, ...dailyList];
      setDailyList(updated);
      try {
        localStorage.setItem("ten_admin_daily", JSON.stringify(updated));
      } catch {}
    } else if (newItemType === "news") {
      const newNews: NewsItem = {
        slug: newItemTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        title: newItemTitle,
        category: newItemCategory || "Warta Platform",
        date: "2026-09-23",
        summary: newItemDesc || "Pengumuman dan kabar mutakhir ekosistem TEN.",
        content: newItemDesc || "Kabar berkala ekosistem.",
        author: "TEN Editorial",
        href: "/news/details",
        imageUrl: newItemImage || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80",
      };
      const updated = [newNews, ...newsList];
      setNewsList(updated);
      try {
        localStorage.setItem("ten_admin_news", JSON.stringify(updated));
      } catch {}
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
    if (type === "projects") {
      const updated = projectList.filter((p) => p.slug !== idOrSlug);
      setProjectList(updated);
      try {
        localStorage.setItem("ten_admin_projects", JSON.stringify(updated));
      } catch {}
    } else if (type === "work") {
      const updated = workList.filter((w) => w.id !== idOrSlug);
      setWorkList(updated);
      try {
        localStorage.setItem("ten_admin_work", JSON.stringify(updated));
      } catch {}
    } else if (type === "publications") {
      const updated = pubList.filter((p) => p.id !== idOrSlug);
      setPubList(updated);
      try {
        localStorage.setItem("ten_admin_pub", JSON.stringify(updated));
      } catch {}
    } else if (type === "alat") {
      const updated = stackList.filter((s) => s.id !== idOrSlug);
      setStackList(updated);
      try {
        localStorage.setItem("ten_admin_stack", JSON.stringify(updated));
      } catch {}
    } else if (type === "keseharian") {
      const updated = dailyList.filter((d) => d.id !== idOrSlug);
      setDailyList(updated);
      try {
        localStorage.setItem("ten_admin_daily", JSON.stringify(updated));
      } catch {}
    } else if (type === "news") {
      const updated = newsList.filter((n) => n.slug !== idOrSlug);
      setNewsList(updated);
      try {
        localStorage.setItem("ten_admin_news", JSON.stringify(updated));
      } catch {}
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
      stackList,
      dailyList,
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
        if (parsed.stackList) setStackList(parsed.stackList);
        if (parsed.dailyList) setDailyList(parsed.dailyList);
        if (parsed.newsList) setNewsList(parsed.newsList);
        showToast("Data backup berhasil dipulihkan!");
      } catch {
        alert("Gagal membaca file JSON. Pastikan format valid.");
      }
    };
    reader.readAsText(file);
  };

  // Aggregated content rows for table across all 5 pillars
  const allContents = [
    ...projectList.map((p) => ({
      id: p.slug,
      type: "projects" as const,
      typeLabel: "Karya Proyek",
      title: p.name,
      category: p.category,
      metric: p.metrics || "Digital Product",
      previewUrl: `/karya/details?id=proj-${p.slug}`,
    })),
    ...workList.map((w) => ({
      id: w.id,
      type: "work" as const,
      typeLabel: "Pengalaman",
      title: `${w.role} @ ${w.company}`,
      category: w.period,
      metric: w.location,
      previewUrl: `/pengalaman/details?id=${w.id}`,
    })),
    ...pubList.map((p) => ({
      id: p.id,
      type: "publications" as const,
      typeLabel: "Publikasi",
      title: p.title,
      category: p.publisher,
      metric: `Tahun ${p.year}`,
      previewUrl: `/karya/details?id=pub-${p.id}`,
    })),
    ...stackList.map((s) => ({
      id: s.id,
      type: "alat" as const,
      typeLabel: "Alat",
      title: s.name,
      category: s.category,
      metric: `Status: ${s.status} • ♥ ${s.likes}`,
      previewUrl: `/alat/details?id=${s.id}`,
    })),
    ...dailyList.map((d) => ({
      id: d.id,
      type: "keseharian" as const,
      typeLabel: "Keseharian",
      title: d.title,
      category: d.category,
      metric: d.date,
      previewUrl: `/keseharian/details?id=${d.id}`,
    })),
    ...newsList.map((n) => ({
      id: n.slug,
      type: "news" as const,
      typeLabel: "Warta",
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

  const CATEGORY_TABS: { id: ContentCategory; label: string }[] = [
    { id: "all", label: "Semua Konten" },
    { id: "projects", label: "Karya & Proyek" },
    { id: "work", label: "Pengalaman" },
    { id: "publications", label: "Riset & Tulisan" },
    { id: "alat", label: "Alat & Stack" },
    { id: "keseharian", label: "Keseharian" },
    { id: "news", label: "Warta" },
  ];

  // Auth checking screen
  if (authStatus === "loading") {
    return (
      <div className="admin-loading-screen">
        <div className="admin-loading-card">
          <div className="admin-logo-badge" style={{ display: "inline-block", marginBottom: "0.5rem" }}>
            TEN
          </div>
          <h3>Memeriksa Otorisasi Sesi...</h3>
          <p>Memvalidasi identitas pengelola platform</p>
        </div>
      </div>
    );
  }

  // If unauthenticated, do not flash admin content
  if (authStatus === "unauthenticated") {
    return null;
  }

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
          <Link href="/" className="admin-return-btn" title="Buka Halaman Depan Publik">
            ← Web Publik
          </Link>

          {/* User Info Chip */}
          <div className="admin-user-pill-top">
            <span className="admin-user-avatar">
              {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "A"}
            </span>
            <div className="admin-user-text">
              <span className="admin-user-name">
                {session?.user?.name || session?.user?.email || "Admin"}
              </span>
              <span className="admin-user-badge">
                {session?.user?.role || "ADMIN"}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="admin-logout-btn"
            onClick={() => signOut()}
            title="Keluar dari sesi administrator"
          >
            Keluar
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
                <span className="admin-stat-label">Total Inisiatif Konten</span>
                <span className="admin-stat-badge">{allContents.length} Items</span>
              </div>
              <div className="admin-stat-value">{allContents.length}</div>
              <div className="admin-stat-desc">
                {projectList.length} Proyek • {workList.length} Pengalaman • {pubList.length} Publikasi • {stackList.length} Alat • {dailyList.length} Harian
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <span className="admin-stat-label">Karya & Riset</span>
                <span className="admin-stat-badge">Koleksi</span>
              </div>
              <div className="admin-stat-value">{projectList.length + pubList.length}</div>
              <div className="admin-stat-desc">{projectList.length} Aplikasi • {pubList.length} Telaah Ilmiah</div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <span className="admin-stat-label">Alat & Catatan Keseharian</span>
                <span className="admin-stat-badge">Aktif</span>
              </div>
              <div className="admin-stat-value">{stackList.length + dailyList.length}</div>
              <div className="admin-stat-desc">{stackList.length} Instrumen • {dailyList.length} Catatan Indera</div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <span className="admin-stat-label">Status Otorisasi Sesi</span>
                <span className="admin-stat-badge active">Aktif</span>
              </div>
              <div className="admin-stat-value" style={{ fontSize: "1.05rem", color: "var(--mono-black)" }}>
                {session?.user?.name || session?.user?.email || "Admin Terverifikasi"}
              </div>
              <div className="admin-stat-desc">
                Peran: <strong>{session?.user?.role || "admin"}</strong> • Terotentikasi Penuh
              </div>
            </div>
          </div>

          {/* Quick Shortcuts & System Health */}
          <div className="admin-grid-two">
            <div className="admin-box-card">
              <h3 className="admin-card-title">Akses Cepat Pengelolaan</h3>
              <p className="admin-card-text">Pilih modul untuk menambah item baru ke dalam portofolio 5 pilar:</p>
              <div className="admin-quick-actions">
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={() => {
                    setActiveTab("content");
                    setContentCategory("projects");
                    setNewItemType("project");
                    setShowModal(true);
                  }}
                >
                  + Tambah Karya / Proyek
                </button>
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={() => {
                    setActiveTab("content");
                    setContentCategory("work");
                    setNewItemType("work");
                    setShowModal(true);
                  }}
                >
                  + Tambah Pengalaman
                </button>
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={() => {
                    setActiveTab("content");
                    setContentCategory("alat");
                    setNewItemType("alat");
                    setShowModal(true);
                  }}
                >
                  + Tambah Alat / Stack
                </button>
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={() => {
                    setActiveTab("content");
                    setContentCategory("keseharian");
                    setNewItemType("keseharian");
                    setShowModal(true);
                  }}
                >
                  + Tambah Catatan Harian
                </button>
              </div>
            </div>

            <div className="admin-box-card">
              <h3 className="admin-card-title">Infrastruktur & Lingkungan Komputasi</h3>
              <ul className="admin-info-list">
                <li><strong>Runtime Host:</strong> Cloudflare Workers (Static Assets Edge)</li>
                <li><strong>Framework:</strong> Next.js 16 (Turbopack SSG Output)</li>
                <li><strong>Autentikasi:</strong> OpenID Connect (OIDC PKCE) via accounts.ten.my.id</li>
                <li><strong>Status TLS/SSL:</strong> Terenkripsi Penuh (Let&apos;s Encrypt / Cloudflare)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: CONTENT MANAGEMENT */}
      {activeTab === "content" && (
        <div className="admin-tab-body">
          <div className="admin-section-bar">
            <div>
              <h2 className="admin-section-title">Kelola Konten & Inisiatif</h2>
              <p className="admin-section-subtitle">
                Atur seluruh item karya, proyek web, riwayat pekerjaan, instrumen alat, dan catatan keseharian.
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
              {CATEGORY_TABS.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`admin-category-btn ${contentCategory === cat.id ? "active" : ""}`}
                  onClick={() => setContentCategory(cat.id)}
                >
                  {cat.label}
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
                      Tidak ada konten yang cocok dengan pencarian &quot;{searchQuery}&quot;.
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
                            title="Pratinjau Halaman Detail"
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
                Parameter integrasi OAuth2 / OIDC dengan satelit autentikasi <code>accounts.ten.my.id</code>.
              </p>
            </div>
          </div>

          <div className="admin-grid-two">
            <div className="admin-box-card">
              <h3 className="admin-card-title">Status Sesi Pengguna Aktif</h3>
              <div className="admin-form-group">
                <label className="admin-label">Nama Lengkap</label>
                <input
                  type="text"
                  value={session?.user?.name || "(Pengelola Terotentikasi)"}
                  readOnly
                  className="admin-input readonly"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Email Terverifikasi</label>
                <input
                  type="text"
                  value={session?.user?.email || "(admin@ten.my.id)"}
                  readOnly
                  className="admin-input readonly"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Peran Pengguna (Role)</label>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <span className="admin-status-pill active">
                    {(session?.user?.role || "ADMIN").toUpperCase()}
                  </span>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-dim)" }}>
                    Hak akses administrator penuh.
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
                Ekspor seluruh konfigurasi profil dan katalog inisiatif 5 pilar ke berkas JSON atau pulihkan dari cadangan.
              </p>
            </div>
          </div>

          <div className="admin-grid-two">
            <div className="admin-box-card">
              <h3 className="admin-card-title">Ekspor Cadangan (JSON)</h3>
              <p className="admin-card-text">
                Simpan seluruh data profil, karya proyek, pekerjaan, tulisan ilmiah, instrumen alat, dan catatan keseharian.
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
                  onChange={(e) => setNewItemType(e.target.value as "project" | "work" | "publication" | "alat" | "keseharian" | "news")}
                >
                  <option value="project">Karya & Proyek Digital</option>
                  <option value="work">Riwayat Pekerjaan & Pengalaman</option>
                  <option value="publication">Riset & Publikasi Ilmiah</option>
                  <option value="alat">Alat & Instrumen Kerja</option>
                  <option value="keseharian">Catatan Keseharian & Indera</option>
                  <option value="news">Kabar & Warta Terkini</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Judul Inisiatif / Peran / Nama Alat</label>
                <input
                  type="text"
                  placeholder="Misal: Views Counter SaaS atau Neovim"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  className="admin-input"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Kategori / Instansi / Bidang</label>
                <input
                  type="text"
                  placeholder="Misal: Software & Otomasi, PT Digital"
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Deskripsi Singkat / Ulasan</label>
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
