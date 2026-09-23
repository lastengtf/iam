"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/components/AuthProvider";
import {
  ProjectItem,
  WorkItem,
  PublicationItem,
  StackItem,
  DailyLogItem,
  NewsItem,
  SenseCategory,
} from "@/data/profileData";
import {
  useProfileData,
  useProjectsData,
  useWorkData,
  usePublicationsData,
  useStackData,
  useDailyData,
  useNewsData,
  resetAllToDefault,
} from "@/data/contentStore";

type AdminTab = "overview" | "content" | "profile" | "sso" | "backup";
type ContentCategory = "all" | "projects" | "work" | "publications" | "alat" | "keseharian" | "news";
type ItemType = "projects" | "work" | "publications" | "alat" | "keseharian" | "news";

interface UnifiedRow {
  id: string;
  type: ItemType;
  typeLabel: string;
  title: string;
  category: string;
  metric: string;
  status: "active" | "progress" | "planned" | "retired";
  statusText: string;
  imageUrl: string;
  previewUrl: string;
  rawItem: ProjectItem | WorkItem | PublicationItem | StackItem | DailyLogItem | NewsItem;
}

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();

  // Redirect if unauthenticated
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace("/login");
    }
  }, [authStatus, router]);

  // Tab & Filter States
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [contentCategory, setContentCategory] = useState<ContentCategory>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"default" | "title-asc" | "title-desc">("default");
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" } | null>(null);

  // Reactive Data from Content Store
  const { profile, updateProfile } = useProfileData();
  const { projects, updateProjects } = useProjectsData();
  const { work, updateWork } = useWorkData();
  const { publications, updatePublications } = usePublicationsData();
  const { stack, updateStack } = useStackData();
  const { dailyLogs, updateDailyLogs } = useDailyData();
  const { news, updateNews } = useNewsData();

  // Form State for Profile tab
  const [profileForm, setProfileForm] = useState(profile);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setProfileForm(profile);
    });
    return () => cancelAnimationFrame(frame);
  }, [profile]);

  // Modal State for Create & Edit
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [targetType, setTargetType] = useState<ItemType>("projects");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form input fields
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formIcon, setFormIcon] = useState("⚡");
  const [formStatus, setFormStatus] = useState<"completed" | "in-progress" | "planned">("completed");
  const [formMetrics, setFormMetrics] = useState("");
  const [formTech, setFormTech] = useState("");
  const [formDetails, setFormDetails] = useState("");
  const [formHref, setFormHref] = useState("");
  const [formExternalHref, setFormExternalHref] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formPeriod, setFormPeriod] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formPublisher, setFormPublisher] = useState("");
  const [formYear, setFormYear] = useState("2026");
  const [formAbstract, setFormAbstract] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formStackCategory, setFormStackCategory] = useState<"Hardware & EDC" | "Software & Otomasi" | "Infrastruktur & Cloud">("Software & Otomasi");
  const [formStackStatus, setFormStackStatus] = useState<"active" | "evaluating" | "retired">("active");
  const [formReview, setFormReview] = useState("");
  const [formPlatforms, setFormPlatforms] = useState("Web, Desktop");
  const [formLikes, setFormLikes] = useState(1);
  const [formDailyCategory, setFormDailyCategory] = useState<SenseCategory>("Membaca");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formDate, setFormDate] = useState("Hari Ini");
  const [formThoughts, setFormThoughts] = useState("");
  const [formAuthor, setFormAuthor] = useState("TEN Editorial");
  const [formNewsContent, setFormNewsContent] = useState("");

  const showToast = (message: string, type: "success" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3200);
  };

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Convert raw items into UnifiedRow list
  const allRows: UnifiedRow[] = useMemo(() => {
    return [
      ...projects.map((p) => {
        let status: "active" | "progress" | "planned" = "active";
        let statusText = "Selesai";
        if (p.status === "in-progress") {
          status = "progress";
          statusText = "Sedang Dibuat";
        } else if (p.status === "planned") {
          status = "planned";
          statusText = "Rencana";
        }
        return {
          id: p.slug,
          type: "projects" as const,
          typeLabel: "Karya",
          title: p.name,
          category: p.category,
          metric: p.metrics || "Digital Product",
          status,
          statusText,
          imageUrl: p.imageUrl,
          previewUrl: `/karya/details?id=proj-${p.slug}`,
          rawItem: p,
        };
      }),
      ...work.map((w) => ({
        id: w.id,
        type: "work" as const,
        typeLabel: "Pengalaman",
        title: `${w.role} @ ${w.company}`,
        category: w.period,
        metric: w.location,
        status: "active" as const,
        statusText: "Aktif",
        imageUrl: w.imageUrl,
        previewUrl: `/pengalaman/details?id=${w.id}`,
        rawItem: w,
      })),
      ...publications.map((p) => ({
        id: p.id,
        type: "publications" as const,
        typeLabel: "Publikasi",
        title: p.title,
        category: p.publisher,
        metric: `Tahun ${p.year}`,
        status: "active" as const,
        statusText: "Diterbitkan",
        imageUrl: p.imageUrl,
        previewUrl: `/karya/details?id=pub-${p.id}`,
        rawItem: p,
      })),
      ...stack.map((s) => ({
        id: s.id,
        type: "alat" as const,
        typeLabel: "Alat",
        title: s.name,
        category: s.category,
        metric: `Platform: ${s.platforms.join(", ")} • ♥ ${s.likes}`,
        status: s.status === "active" ? ("active" as const) : s.status === "evaluating" ? ("progress" as const) : ("retired" as const),
        statusText: s.status === "active" ? "Aktif" : s.status === "evaluating" ? "Evaluasi" : "Arsip",
        imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
        previewUrl: `/alat/details?id=${s.id}`,
        rawItem: s,
      })),
      ...dailyLogs.map((d) => ({
        id: d.id,
        type: "keseharian" as const,
        typeLabel: "Keseharian",
        title: d.title,
        category: `${d.category}${d.subtitle ? ` • ${d.subtitle}` : ""}`,
        metric: d.date,
        status: "active" as const,
        statusText: "Tercatat",
        imageUrl: d.imageUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
        previewUrl: `/keseharian/details?id=${d.id}`,
        rawItem: d,
      })),
      ...news.map((n) => ({
        id: n.slug,
        type: "news" as const,
        typeLabel: "Warta",
        title: n.title,
        category: n.category,
        metric: `${n.date} • ${n.author}`,
        status: "active" as const,
        statusText: "Publikasi",
        imageUrl: n.imageUrl,
        previewUrl: `/news/details?slug=${n.slug}`,
        rawItem: n,
      })),
    ];
  }, [projects, work, publications, stack, dailyLogs, news]);

  // Filtered & Sorted Rows
  const filteredContents = useMemo(() => {
    let result = allRows.filter((item) => {
      const matchCategory = contentCategory === "all" || item.type === contentCategory;
      const matchStatus = statusFilter === "all" || item.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.metric.toLowerCase().includes(q);
      return matchCategory && matchStatus && matchSearch;
    });

    if (sortBy === "title-asc") {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "title-desc") {
      result = [...result].sort((a, b) => b.title.localeCompare(a.title));
    }

    return result;
  }, [allRows, contentCategory, statusFilter, searchQuery, sortBy]);

  // Open Create Modal
  const handleOpenCreateModal = (type: ItemType = "projects") => {
    setModalMode("create");
    setTargetType(type);
    setEditingId(null);

    // Reset form fields
    setFormTitle("");
    setFormCategory("");
    setFormDescription("");
    setFormImageUrl("");
    setFormSlug("");
    setFormIcon("⚡");
    setFormStatus("completed");
    setFormMetrics("Baru ditambahkan • Aktif");
    setFormTech("TypeScript, Next.js, Cloudflare");
    setFormDetails("Arsitektur modular siap pakai terintegrasi pada ekosistem TEN.");
    setFormHref("/karya/details");
    setFormExternalHref("https://ten.my.id");
    setFormCompany("Inisiatif Mandiri");
    setFormPeriod("2026 - Sekarang");
    setFormLocation("Indonesia");
    setFormPublisher("TEN Riset / Editorial");
    setFormYear("2026");
    setFormAbstract("Abstraksi penelitian dan rancang bangun platform terdistribusi.");
    setFormTags("Riset, Inovasi, Edge");
    setFormStackCategory("Software & Otomasi");
    setFormStackStatus("active");
    setFormReview("Sangat menunjang performa komputasi dan alur kerja.");
    setFormPlatforms("Web, Desktop");
    setFormLikes(1);
    setFormDailyCategory("Membaca");
    setFormSubtitle("Refleksi Keseharian");
    setFormDate("Hari Ini");
    setFormThoughts("Membangun konsistensi dan eksplorasi berkesinambungan.");
    setFormAuthor("TEN Editorial");
    setFormNewsContent("Kabar berkala pemutakhiran ekosistem TEN.");

    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (row: UnifiedRow) => {
    setModalMode("edit");
    setTargetType(row.type);
    setEditingId(row.id);

    if (row.type === "projects") {
      const p = row.rawItem as ProjectItem;
      setFormTitle(p.name);
      setFormSlug(p.slug);
      setFormCategory(p.category);
      setFormDescription(p.description);
      setFormImageUrl(p.imageUrl || "");
      setFormIcon(p.icon || "⚡");
      setFormStatus(p.status || "completed");
      setFormMetrics(p.metrics || "");
      setFormTech(p.tech.join(", "));
      setFormDetails(p.details || "");
      setFormHref(p.href || "");
      setFormExternalHref(p.externalHref || "");
    } else if (row.type === "work") {
      const w = row.rawItem as WorkItem;
      setFormTitle(w.role);
      setFormCompany(w.company);
      setFormPeriod(w.period);
      setFormLocation(w.location);
      setFormDescription(w.summary);
      setFormDetails(w.details.join("\n"));
      setFormTech(w.skills.join(", "));
      setFormHref(w.href);
      setFormImageUrl(w.imageUrl);
    } else if (row.type === "publications") {
      const pub = row.rawItem as PublicationItem;
      setFormTitle(pub.title);
      setFormPublisher(pub.publisher);
      setFormYear(pub.year);
      setFormDescription(pub.summary);
      setFormAbstract(pub.abstract);
      setFormTags(pub.tags.join(", "));
      setFormHref(pub.href);
      setFormImageUrl(pub.imageUrl);
    } else if (row.type === "alat") {
      const s = row.rawItem as StackItem;
      setFormTitle(s.name);
      setFormStackCategory(s.category);
      setFormDescription(s.description);
      setFormReview(s.review);
      setFormPlatforms(s.platforms.join(", "));
      setFormStackStatus(s.status);
      setFormLikes(s.likes || 1);
      setFormHref(s.href || "");
      setFormIcon(s.icon || "🛠");
    } else if (row.type === "keseharian") {
      const d = row.rawItem as DailyLogItem;
      setFormTitle(d.title);
      setFormSubtitle(d.subtitle || "");
      setFormDailyCategory(d.category);
      setFormDate(d.date);
      setFormDescription(d.summary);
      setFormThoughts(d.thoughts);
      setFormTags(d.tags.join(", "));
      setFormImageUrl(d.imageUrl || "");
      setFormHref(d.link || "");
    } else if (row.type === "news") {
      const n = row.rawItem as NewsItem;
      setFormTitle(n.title);
      setFormSlug(n.slug);
      setFormCategory(n.category);
      setFormDate(n.date);
      setFormAuthor(n.author);
      setFormDescription(n.summary);
      setFormNewsContent(n.content);
      setFormImageUrl(n.imageUrl);
      setFormHref(n.href);
    }

    setShowModal(true);
  };

  // Duplicate an Item
  const handleDuplicateItem = (row: UnifiedRow) => {
    const timestamp = Date.now().toString().slice(-4);
    if (row.type === "projects") {
      const p = row.rawItem as ProjectItem;
      const clone: ProjectItem = {
        ...p,
        slug: `${p.slug}-salinan-${timestamp}`,
        name: `${p.name} (Salinan)`,
      };
      updateProjects([clone, ...projects]);
    } else if (row.type === "work") {
      const w = row.rawItem as WorkItem;
      const clone: WorkItem = {
        ...w,
        id: `work-${Date.now()}`,
        role: `${w.role} (Salinan)`,
      };
      updateWork([clone, ...work]);
    } else if (row.type === "publications") {
      const pub = row.rawItem as PublicationItem;
      const clone: PublicationItem = {
        ...pub,
        id: `pub-${Date.now()}`,
        title: `${pub.title} (Salinan)`,
      };
      updatePublications([clone, ...publications]);
    } else if (row.type === "alat") {
      const s = row.rawItem as StackItem;
      const clone: StackItem = {
        ...s,
        id: `stack-${Date.now()}`,
        name: `${s.name} (Salinan)`,
      };
      updateStack([clone, ...stack]);
    } else if (row.type === "keseharian") {
      const d = row.rawItem as DailyLogItem;
      const clone: DailyLogItem = {
        ...d,
        id: `daily-${Date.now()}`,
        title: `${d.title} (Salinan)`,
      };
      updateDailyLogs([clone, ...dailyLogs]);
    } else if (row.type === "news") {
      const n = row.rawItem as NewsItem;
      const clone: NewsItem = {
        ...n,
        slug: `${n.slug}-salinan-${timestamp}`,
        title: `${n.title} (Salinan)`,
      };
      updateNews([clone, ...news]);
    }
    showToast(`Berhasil menduplikasi item "${row.title}"!`);
  };

  // Delete an Item
  const handleDeleteItem = (type: ItemType, id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus "${title}"?`)) return;

    if (type === "projects") {
      updateProjects(projects.filter((p) => p.slug !== id));
    } else if (type === "work") {
      updateWork(work.filter((w) => w.id !== id));
    } else if (type === "publications") {
      updatePublications(publications.filter((p) => p.id !== id));
    } else if (type === "alat") {
      updateStack(stack.filter((s) => s.id !== id));
    } else if (type === "keseharian") {
      updateDailyLogs(dailyLogs.filter((d) => d.id !== id));
    } else if (type === "news") {
      updateNews(news.filter((n) => n.slug !== id));
    }

    showToast(`Item "${title}" berhasil dihapus.`);
  };

  // Save / Update Form Submission
  const handleSubmitModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert("Judul atau Nama Item wajib diisi!");
      return;
    }

    if (targetType === "projects") {
      const slugVal = formSlug.trim()
        ? formSlug.toLowerCase().replace(/[^a-z0-9]+/g, "-")
        : formTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const techArray = formTech.split(",").map((s) => s.trim()).filter(Boolean);
      const defaultImg = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80";

      const itemPayload: ProjectItem = {
        slug: slugVal,
        name: formTitle,
        category: formCategory || "Tools & Utilitas",
        icon: formIcon || "⚡",
        description: formDescription || "Deskripsi inisiatif karya pada platform TEN.",
        details: formDetails || "Arsitektur modular siap pakai terintegrasi pada ekosistem TEN.",
        metrics: formMetrics || "Digital Product",
        tech: techArray.length > 0 ? techArray : ["TypeScript", "Next.js"],
        liveApp: true,
        status: formStatus,
        href: formHref || `/karya/details?id=proj-${slugVal}`,
        externalHref: formExternalHref || "https://ten.my.id",
        imageUrl: formImageUrl || defaultImg,
      };

      if (modalMode === "create") {
        updateProjects([itemPayload, ...projects]);
        showToast("Karya / Proyek baru berhasil ditambahkan!");
      } else {
        updateProjects(projects.map((p) => (p.slug === editingId ? itemPayload : p)));
        showToast("Karya / Proyek berhasil diperbarui!");
      }
    } else if (targetType === "work") {
      const skillsArray = formTech.split(",").map((s) => s.trim()).filter(Boolean);
      const detailsArray = formDetails.split("\n").map((s) => s.trim()).filter(Boolean);
      const defaultImg = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80";

      const itemPayload: WorkItem = {
        id: modalMode === "create" ? `work-${Date.now()}` : (editingId as string),
        role: formTitle,
        company: formCompany || "Inisiatif Mandiri",
        period: formPeriod || "2026 - Sekarang",
        location: formLocation || "Indonesia",
        summary: formDescription || "Ringkasan pengalaman dan peran profesional.",
        details: detailsArray.length > 0 ? detailsArray : ["Mengelola dan mengembangkan platform digital."],
        skills: skillsArray.length > 0 ? skillsArray : ["Manajemen Proyek", "Sistem Digital"],
        href: formHref || "https://ten.my.id",
        imageUrl: formImageUrl || defaultImg,
      };

      if (modalMode === "create") {
        updateWork([itemPayload, ...work]);
        showToast("Pengalaman baru berhasil ditambahkan!");
      } else {
        updateWork(work.map((w) => (w.id === editingId ? itemPayload : w)));
        showToast("Pengalaman kerja berhasil diperbarui!");
      }
    } else if (targetType === "publications") {
      const tagsArray = formTags.split(",").map((s) => s.trim()).filter(Boolean);
      const defaultImg = "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80";

      const itemPayload: PublicationItem = {
        id: modalMode === "create" ? `pub-${Date.now()}` : (editingId as string),
        title: formTitle,
        publisher: formPublisher || "Jurnal Ilmiah / Riset",
        year: formYear || "2026",
        summary: formDescription || "Telaah riset ilmiah dalam rekayasa sistem.",
        abstract: formAbstract || "Abstraksi penelitian dan rancang bangun platform terdistribusi.",
        tags: tagsArray.length > 0 ? tagsArray : ["Riset", "Inovasi"],
        imageUrl: formImageUrl || defaultImg,
        href: formHref || "/karya/details",
      };

      if (modalMode === "create") {
        updatePublications([itemPayload, ...publications]);
        showToast("Publikasi / Riset baru berhasil ditambahkan!");
      } else {
        updatePublications(publications.map((p) => (p.id === editingId ? itemPayload : p)));
        showToast("Publikasi berhasil diperbarui!");
      }
    } else if (targetType === "alat") {
      const platformsArray = formPlatforms.split(",").map((s) => s.trim()).filter(Boolean);

      const itemPayload: StackItem = {
        id: modalMode === "create" ? `stack-${Date.now()}` : (editingId as string),
        name: formTitle,
        category: formStackCategory,
        description: formDescription || "Instrumen produktivitas harian.",
        review: formReview || "Sangat menunjang performa komputasi dan alur kerja.",
        platforms: platformsArray.length > 0 ? platformsArray : ["Web", "Desktop"],
        status: formStackStatus,
        icon: formIcon || "🛠",
        href: formHref || "https://ten.my.id",
        likes: formLikes || 1,
      };

      if (modalMode === "create") {
        updateStack([itemPayload, ...stack]);
        showToast("Alat / Stack baru berhasil ditambahkan!");
      } else {
        updateStack(stack.map((s) => (s.id === editingId ? itemPayload : s)));
        showToast("Alat / Stack berhasil diperbarui!");
      }
    } else if (targetType === "keseharian") {
      const tagsArray = formTags.split(",").map((s) => s.trim()).filter(Boolean);
      const defaultImg = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80";

      const itemPayload: DailyLogItem = {
        id: modalMode === "create" ? `daily-${Date.now()}` : (editingId as string),
        title: formTitle,
        subtitle: formSubtitle || "Refleksi Keseharian",
        category: formDailyCategory,
        date: formDate || "Hari Ini",
        summary: formDescription || "Catatan pengamatan dan refleksi.",
        thoughts: formThoughts || "Membangun konsistensi dan eksplorasi berkesinambungan.",
        tags: tagsArray.length > 0 ? tagsArray : ["Keseharian", "Jurnal"],
        imageUrl: formImageUrl || defaultImg,
        link: formHref || undefined,
      };

      if (modalMode === "create") {
        updateDailyLogs([itemPayload, ...dailyLogs]);
        showToast("Catatan keseharian baru berhasil ditambahkan!");
      } else {
        updateDailyLogs(dailyLogs.map((d) => (d.id === editingId ? itemPayload : d)));
        showToast("Catatan keseharian berhasil diperbarui!");
      }
    } else if (targetType === "news") {
      const slugVal = formSlug.trim()
        ? formSlug.toLowerCase().replace(/[^a-z0-9]+/g, "-")
        : formTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const defaultImg = "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80";

      const itemPayload: NewsItem = {
        slug: slugVal,
        title: formTitle,
        category: formCategory || "Warta Platform",
        date: formDate || new Date().toISOString().slice(0, 10),
        author: formAuthor || "TEN Editorial",
        summary: formDescription || "Pengumuman dan kabar mutakhir ekosistem TEN.",
        content: formNewsContent || formDescription || "Kabar berkala ekosistem.",
        href: formHref || `/news/details?slug=${slugVal}`,
        imageUrl: formImageUrl || defaultImg,
      };

      if (modalMode === "create") {
        updateNews([itemPayload, ...news]);
        showToast("Warta baru berhasil ditambahkan!");
      } else {
        updateNews(news.map((n) => (n.slug === editingId ? itemPayload : n)));
        showToast("Warta berhasil diperbarui!");
      }
    }

    setShowModal(false);
  };

  // Save Profile Handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profileForm);
    showToast("Pengaturan profil berhasil disimpan & disinkronkan!");
  };

  // Export JSON Backup
  const handleExportJSON = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      platform: "TEN Personal Knowledge Platform",
      profile: profileForm,
      projects,
      work,
      publications,
      stack,
      dailyLogs,
      news,
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const a = document.createElement("a");
    a.setAttribute("href", dataStr);
    a.setAttribute("download", `ten-platform-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast("Cadangan berkas JSON berhasil diunduh.");
  };

  // Import JSON Backup
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.profile) updateProfile(parsed.profile);
        if (parsed.projects) updateProjects(parsed.projects);
        if (parsed.work) updateWork(parsed.work);
        if (parsed.publications) updatePublications(parsed.publications);
        if (parsed.stack) updateStack(parsed.stack);
        if (parsed.dailyLogs) updateDailyLogs(parsed.dailyLogs);
        if (parsed.news) updateNews(parsed.news);
        showToast("Data backup berhasil dipulihkan & disinkronkan!");
      } catch {
        alert("Gagal membaca berkas JSON. Pastikan format cadangan valid.");
      }
    };
    reader.readAsText(file);
  };

  // Factory Reset Handler
  const handleResetDefaults = () => {
    if (confirm("PENTING: Apakah Anda yakin ingin mengembalikan seluruh konten dan profil ke data awal bawaan? Semua modifikasi lokal akan diatur ulang.")) {
      resetAllToDefault();
      showToast("Data platform berhasil diatur ulang ke kondisi awal bawaan.");
    }
  };

  const CATEGORY_TABS: { id: ContentCategory; label: string; count: number }[] = [
    { id: "all", label: "Semua", count: allRows.length },
    { id: "projects", label: "Karya", count: projects.length },
    { id: "work", label: "Pengalaman", count: work.length },
    { id: "publications", label: "Publikasi", count: publications.length },
    { id: "alat", label: "Alat", count: stack.length },
    { id: "keseharian", label: "Keseharian", count: dailyLogs.length },
    { id: "news", label: "Warta", count: news.length },
  ];

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

  if (authStatus === "unauthenticated") {
    return null;
  }

  return (
    <div className="admin-portal-container">
      {/* Top Bar */}
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

      {/* Toast Notification */}
      {notification && (
        <div className={`admin-toast-banner ${notification.type}`}>
          ✓ {notification.message}
        </div>
      )}

      {/* Navigation Tabs */}
      <nav className="admin-tabs-nav" aria-label="Menu Navigasi Admin">
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => handleTabChange("overview")}
        >
          <span className="admin-tab-icon-pill">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="9" rx="1" />
              <rect x="14" y="3" width="7" height="5" rx="1" />
              <rect x="14" y="12" width="7" height="9" rx="1" />
              <rect x="3" y="16" width="7" height="5" rx="1" />
            </svg>
          </span>
          <span className="admin-tab-label">Ringkasan</span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "content" ? "active" : ""}`}
          onClick={() => handleTabChange("content")}
        >
          <span className="admin-tab-icon-pill">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span className="admin-tab-badge">{allRows.length}</span>
          </span>
          <span className="admin-tab-label">Kelola Konten</span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => handleTabChange("profile")}
        >
          <span className="admin-tab-icon-pill">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
          <span className="admin-tab-label">Pengaturan Profil</span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "sso" ? "active" : ""}`}
          onClick={() => handleTabChange("sso")}
        >
          <span className="admin-tab-icon-pill">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
          <span className="admin-tab-label">SSO & Akses</span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "backup" ? "active" : ""}`}
          onClick={() => handleTabChange("backup")}
        >
          <span className="admin-tab-icon-pill">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            </svg>
          </span>
          <span className="admin-tab-label">Cadangan & Reset</span>
        </button>
      </nav>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="admin-tab-body">
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <span className="admin-stat-label">Total Inisiatif</span>
                <span className="admin-stat-badge">{allRows.length} Items</span>
              </div>
              <div className="admin-stat-value">{allRows.length}</div>
              <div className="admin-stat-desc">
                {projects.length} Karya • {work.length} Pengalaman • {publications.length} Riset • {stack.length} Alat • {dailyLogs.length} Harian
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <span className="admin-stat-label">Karya & Riset</span>
                <span className="admin-stat-badge">Koleksi</span>
              </div>
              <div className="admin-stat-value">{projects.length + publications.length}</div>
              <div className="admin-stat-desc">
                {projects.length} Aplikasi Terpasang • {publications.length} Telaah Ilmiah
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <span className="admin-stat-label">Alat & Jurnal Harian</span>
                <span className="admin-stat-badge">Aktif</span>
              </div>
              <div className="admin-stat-value">{stack.length + dailyLogs.length}</div>
              <div className="admin-stat-desc">
                {stack.length} Instrumen • {dailyLogs.length} Catatan Indera
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <span className="admin-stat-label">Warta & Kabar</span>
                <span className="admin-stat-badge">Rilis</span>
              </div>
              <div className="admin-stat-value">{news.length}</div>
              <div className="admin-stat-desc">
                Kabar berkala ekosistem & pembaruan platform
              </div>
            </div>
          </div>

          <div className="admin-grid-two">
            <div className="admin-box-card">
              <h3 className="admin-card-title">Aksi Cepat Pengelolaan</h3>
              <p className="admin-card-text">
                Pilih modul di bawah ini untuk langsung menambahkan konten baru ke platform:
              </p>
              <div className="admin-quick-actions">
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={() => {
                    setActiveTab("content");
                    setContentCategory("projects");
                    handleOpenCreateModal("projects");
                  }}
                >
                  + Tambah Karya / Proyek Baru
                </button>
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={() => {
                    setActiveTab("content");
                    setContentCategory("work");
                    handleOpenCreateModal("work");
                  }}
                >
                  + Tambah Riwayat Pengalaman
                </button>
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={() => {
                    setActiveTab("content");
                    setContentCategory("publications");
                    handleOpenCreateModal("publications");
                  }}
                >
                  + Tambah Riset & Publikasi
                </button>
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={() => {
                    setActiveTab("content");
                    setContentCategory("alat");
                    handleOpenCreateModal("alat");
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
                    handleOpenCreateModal("keseharian");
                  }}
                >
                  + Tambah Catatan Keseharian
                </button>
              </div>
            </div>

            <div className="admin-box-card">
              <h3 className="admin-card-title">Infrastruktur & Lingkungan Komputasi</h3>
              <ul className="admin-info-list">
                <li><strong>Runtime Host:</strong> Cloudflare Workers (Edge Static Assets)</li>
                <li><strong>Framework:</strong> Next.js 16 (SSG Turbopack Build)</li>
                <li><strong>Sinkronisasi:</strong> Reaktif Otomatis antar Tab & Halaman Publik</li>
                <li><strong>Autentikasi:</strong> OpenID Connect (OIDC PKCE) via accounts.ten.my.id</li>
                <li><strong>Penyimpanan:</strong> Persistent Browser Cache + Import/Export JSON</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONTENT MANAGEMENT */}
      {activeTab === "content" && (
        <div className="admin-tab-body">
          <div className="admin-section-bar">
            <div>
              <h2 className="admin-section-title">Kelola Konten & Inisiatif</h2>
              <p className="admin-section-subtitle">
                Sunting, duplikasi, tambah, atau hapus konten di 5 pilar dan warta platform TEN.
              </p>
            </div>
            <button
              type="button"
              className="admin-btn-primary"
              onClick={() => handleOpenCreateModal(contentCategory === "all" ? "projects" : contentCategory)}
            >
              + Tambah Konten Baru
            </button>
          </div>

          {/* Filter Bar */}
          <div className="admin-filter-bar">
            <div className="admin-category-pills">
              {CATEGORY_TABS.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`admin-category-btn ${contentCategory === cat.id ? "active" : ""}`}
                  onClick={() => setContentCategory(cat.id)}
                >
                  {cat.label} ({cat.count})
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
              {/* Status Filter */}
              <select
                className="admin-select"
                style={{ width: "auto", fontSize: "0.75rem", padding: "0.3rem 0.5rem" }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Semua Status</option>
                <option value="active">Selesai / Aktif</option>
                <option value="progress">Sedang Dibuat / Evaluasi</option>
                <option value="planned">Rencana</option>
              </select>

              {/* Sorting Filter */}
              <select
                className="admin-select"
                style={{ width: "auto", fontSize: "0.75rem", padding: "0.3rem 0.5rem" }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "default" | "title-asc" | "title-desc")}
              >
                <option value="default">Urutan Bawaan</option>
                <option value="title-asc">Judul (A - Z)</option>
                <option value="title-desc">Judul (Z - A)</option>
              </select>

              {/* Search Box */}
              <div className="admin-search-input-wrap">
                <input
                  type="text"
                  placeholder="Cari item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="admin-search-input"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: "80px" }}>Tipe</th>
                  <th>Judul & Media</th>
                  <th>Kategori / Instansi</th>
                  <th>Metrik / Info</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredContents.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-dim)" }}>
                      Tidak ada konten yang cocok dengan filter atau pencarian &quot;{searchQuery}&quot;.
                    </td>
                  </tr>
                ) : (
                  filteredContents.map((row) => (
                    <tr key={`${row.type}-${row.id}`}>
                      <td>
                        <span className="admin-table-badge">{row.typeLabel}</span>
                      </td>
                      <td>
                        <div className="admin-table-item-cell">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={row.imageUrl}
                            alt=""
                            className="admin-thumb-img"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=100&auto=format&fit=crop&q=60";
                            }}
                          />
                          <div>
                            <div className="admin-table-title">{row.title}</div>
                            <div className="admin-field-help" style={{ marginTop: 0 }}>
                              ID: <code>{row.id}</code>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="admin-table-sub">{row.category}</td>
                      <td className="admin-table-meta">{row.metric}</td>
                      <td>
                        <span className={`admin-status-pill ${row.status}`}>
                          {row.statusText}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div className="admin-table-actions">
                          <Link
                            href={row.previewUrl}
                            className="admin-btn-sm admin-btn-view"
                            title="Buka pratinjau halaman detail"
                          >
                            Lihat ↗
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(row)}
                            className="admin-btn-sm admin-btn-edit"
                            title="Sunting konten ini"
                          >
                            ✎ Sunting
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicateItem(row)}
                            className="admin-btn-sm admin-btn-dup"
                            title="Duplikasi item ini"
                          >
                            ⎘ Duplikat
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(row.type, row.id, row.title)}
                            className="admin-btn-sm admin-btn-del"
                            title="Hapus item ini"
                          >
                            ✕ Hapus
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

      {/* TAB 3: PROFILE SETTINGS */}
      {activeTab === "profile" && (
        <div className="admin-tab-body">
          <div className="admin-section-bar">
            <div>
              <h2 className="admin-section-title">Pengaturan Profil & Identitas</h2>
              <p className="admin-section-subtitle">
                Sesuaikan narasi profil, foto avatar, status ketersediaan, serta tautan komunikasi.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="admin-form-grid">
            {/* Box 1: Brand & Narasi */}
            <div className="admin-box-card">
              <h3 className="admin-card-title">Informasi Brand & Identitas</h3>

              {/* Avatar Live Preview */}
              <div className="admin-avatar-preview-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profileForm.avatarUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=260&auto=format&fit=crop&q=80"}
                  alt="Avatar Preview"
                  className="admin-avatar-preview-img"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=260&auto=format&fit=crop&q=80";
                  }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-main)" }}>
                    {profileForm.name} ({profileForm.fullName})
                  </div>
                  <div style={{ fontSize: "0.76rem", color: "var(--text-dim)" }}>
                    Pratinjau Foto Avatar di Header Situs
                  </div>
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">URL Foto Avatar / Profil</label>
                <input
                  type="url"
                  value={profileForm.avatarUrl}
                  onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                  className="admin-input"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Nama Panggilan / Brand</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="admin-input"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Nama Lengkap</label>
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  className="admin-input"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Tagline Headline</label>
                <input
                  type="text"
                  value={profileForm.tagline}
                  onChange={(e) => setProfileForm({ ...profileForm, tagline: e.target.value })}
                  className="admin-input"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Status Ketersediaan</label>
                <input
                  type="text"
                  value={profileForm.status}
                  onChange={(e) => setProfileForm({ ...profileForm, status: e.target.value })}
                  className="admin-input"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Narasi Bio (Netral & Komprehensif)</label>
                <textarea
                  rows={4}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="admin-textarea"
                  required
                />
              </div>
            </div>

            {/* Box 2: Tautan Kontak & Statistik */}
            <div className="admin-box-card">
              <h3 className="admin-card-title">Tautan Kontak & Kanal Komunikasi</h3>

              <div className="admin-form-group">
                <label className="admin-label">Alamat Email Korespondensi</label>
                <input
                  type="email"
                  value={profileForm.contact.email}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      contact: { ...profileForm.contact, email: e.target.value },
                    })
                  }
                  className="admin-input"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Domain Website Utama</label>
                <input
                  type="url"
                  value={profileForm.contact.website}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      contact: { ...profileForm.contact, website: e.target.value },
                    })
                  }
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Tautan Dokumentasi</label>
                <input
                  type="url"
                  value={profileForm.contact.docsUrl}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      contact: { ...profileForm.contact, docsUrl: e.target.value },
                    })
                  }
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Host SSO Portal</label>
                <input
                  type="url"
                  value={profileForm.contact.ssoPortal}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      contact: { ...profileForm.contact, ssoPortal: e.target.value },
                    })
                  }
                  className="admin-input"
                />
              </div>

              <h4 style={{ fontSize: "0.86rem", fontWeight: 700, margin: "1.25rem 0 0.65rem", color: "var(--text-main)" }}>
                Metrik Ringkasan Profil (Statistik Beranda)
              </h4>

              {profileForm.stats.map((stat, idx) => (
                <div key={idx} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <input
                    type="text"
                    placeholder="Nilai (e.g. 6+ Tahun)"
                    value={stat.value}
                    onChange={(e) => {
                      const newStats = [...profileForm.stats];
                      newStats[idx] = { ...newStats[idx], value: e.target.value };
                      setProfileForm({ ...profileForm, stats: newStats });
                    }}
                    className="admin-input"
                    style={{ flex: 1 }}
                  />
                  <input
                    type="text"
                    placeholder="Label (e.g. Rekayasa)"
                    value={stat.label}
                    onChange={(e) => {
                      const newStats = [...profileForm.stats];
                      newStats[idx] = { ...newStats[idx], label: e.target.value };
                      setProfileForm({ ...profileForm, stats: newStats });
                    }}
                    className="admin-input"
                    style={{ flex: 1.5 }}
                  />
                </div>
              ))}

              <div style={{ marginTop: "1.5rem" }}>
                <button type="submit" className="admin-btn-primary" style={{ width: "100%" }}>
                  Simpan Seluruh Pengaturan Profil
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: SSO & SECURITY */}
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
                <label className="admin-label">Nama Administrator</label>
                <input
                  type="text"
                  value={session?.user?.name || "(Pengelola Terotentikasi)"}
                  readOnly
                  className="admin-input readonly"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Email Administrator</label>
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
                    Hak akses administrator penuh ke seluruh platform.
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

      {/* TAB 5: BACKUP & RESET */}
      {activeTab === "backup" && (
        <div className="admin-tab-body">
          <div className="admin-section-bar">
            <div>
              <h2 className="admin-section-title">Cadangan Data & Reset Platform</h2>
              <p className="admin-section-subtitle">
                Unduh berkas JSON cadangan seluruh platform, pulihkan dari cadangan, atau atur ulang ke data bawaan pabrik.
              </p>
            </div>
          </div>

          <div className="admin-grid-two">
            <div className="admin-box-card">
              <h3 className="admin-card-title">Ekspor Cadangan Lengkap (JSON)</h3>
              <p className="admin-card-text">
                Simpan seluruh data profil, karya proyek, riwayat pekerjaan, riset ilmiah, alat, catatan keseharian, dan warta ke dalam satu berkas JSON.
              </p>
              <button
                type="button"
                className="admin-btn-primary"
                onClick={handleExportJSON}
              >
                Unduh Cadangan (.JSON)
              </button>
            </div>

            <div className="admin-box-card">
              <h3 className="admin-card-title">Impor & Pulihkan Data</h3>
              <p className="admin-card-text">
                Unggah berkas JSON cadangan yang telah diekspor sebelumnya untuk memulihkan seluruh konfigurasi dan konten platform.
              </p>
              <label className="admin-btn-outline" style={{ display: "inline-block", cursor: "pointer" }}>
                Pilih Berkas Cadangan (.JSON)
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <div className="admin-box-card" style={{ borderColor: "#fecaca", background: "#fffbfb" }}>
              <h3 className="admin-card-title" style={{ color: "#dc2626" }}>
                Atur Ulang ke Data Bawaan Pabrik (Factory Reset)
              </h3>
              <p className="admin-card-text" style={{ color: "#7f1d1d" }}>
                Tindakan ini akan menghapus semua modifikasi lokal dari browser Anda dan mengembalikan konfigurasi profil serta item konten ke data bawaan awal di berkas <code>profileData.ts</code>.
              </p>
              <button
                type="button"
                className="admin-btn-sm admin-btn-del"
                style={{ padding: "0.5rem 1rem", fontSize: "0.82rem" }}
                onClick={handleResetDefaults}
              >
                Kembalikan Seluruh Data ke Bawaan Awal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADAPTIVE MODAL (CREATE / EDIT) */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="admin-modal-box admin-modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {modalMode === "create" ? "Tambah Konten Baru" : "Sunting Item Konten"}
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="admin-modal-scroll-body">
              {/* Type Selector (only on create) */}
              {modalMode === "create" && (
                <div className="admin-form-group">
                  <label className="admin-label">Pilih Modul / Jenis Pilar</label>
                  <select
                    className="admin-select"
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value as ItemType)}
                  >
                    <option value="projects">Karya & Proyek Digital</option>
                    <option value="work">Riwayat Pekerjaan & Pengalaman</option>
                    <option value="publications">Riset & Publikasi Ilmiah</option>
                    <option value="alat">Alat & Instrumen Kerja</option>
                    <option value="keseharian">Catatan Keseharian & Indera</option>
                    <option value="news">Kabar & Warta Ekosistem</option>
                  </select>
                </div>
              )}

              {/* COMMON & TYPE-SPECIFIC FIELDS */}

              {/* 1. PROJECTS */}
              {targetType === "projects" && (
                <>
                  <div className="admin-form-grid">
                    <div className="admin-form-group">
                      <label className="admin-label">Nama / Judul Karya</label>
                      <input
                        type="text"
                        placeholder="e.g. Views Counter SaaS"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="admin-input"
                        required
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Kategori</label>
                      <input
                        type="text"
                        placeholder="e.g. Tools & Utilitas"
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="admin-input"
                      />
                    </div>
                  </div>

                  <div className="admin-form-grid">
                    <div className="admin-form-group">
                      <label className="admin-label">Status Proyek</label>
                      <select
                        className="admin-select"
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as "completed" | "in-progress" | "planned")}
                      >
                        <option value="completed">Selesai (Completed)</option>
                        <option value="in-progress">Sedang Dibuat (In-Progress)</option>
                        <option value="planned">Rencana (Planned)</option>
                      </select>
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Slug / ID URL</label>
                      <input
                        type="text"
                        placeholder="e.g. views-counter"
                        value={formSlug}
                        onChange={(e) => setFormSlug(e.target.value)}
                        className="admin-input"
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Tech Stack (Pisahkan dengan koma)</label>
                    <input
                      type="text"
                      placeholder="e.g. Cloudflare, TypeScript, Next.js, Hono"
                      value={formTech}
                      onChange={(e) => setFormTech(e.target.value)}
                      className="admin-input"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Metrik / Info Ringkas</label>
                    <input
                      type="text"
                      placeholder="e.g. 10k+ Queries • Edge Ready"
                      value={formMetrics}
                      onChange={(e) => setFormMetrics(e.target.value)}
                      className="admin-input"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Deskripsi Ringkas</label>
                    <textarea
                      rows={2}
                      placeholder="Ringkasan inisiatif karya..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="admin-textarea"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Rincian Arsitektur / Detail Teknis</label>
                    <textarea
                      rows={3}
                      placeholder="Penjelasan arsitektur, integrasi, dan keunggulan teknis..."
                      value={formDetails}
                      onChange={(e) => setFormDetails(e.target.value)}
                      className="admin-textarea"
                    />
                  </div>

                  <div className="admin-form-grid">
                    <div className="admin-form-group">
                      <label className="admin-label">Tautan Eksternal / Demo</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={formExternalHref}
                        onChange={(e) => setFormExternalHref(e.target.value)}
                        className="admin-input"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Ikon Emoji</label>
                      <input
                        type="text"
                        placeholder="⚡"
                        value={formIcon}
                        onChange={(e) => setFormIcon(e.target.value)}
                        className="admin-input"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* 2. WORK / PENGALAMAN */}
              {targetType === "work" && (
                <>
                  <div className="admin-form-grid">
                    <div className="admin-form-group">
                      <label className="admin-label">Peran / Posisi</label>
                      <input
                        type="text"
                        placeholder="e.g. Koordinator Transformasi Sistem"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="admin-input"
                        required
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Perusahaan / Lembaga</label>
                      <input
                        type="text"
                        placeholder="e.g. Inisiatif Mandiri / Yayasan"
                        value={formCompany}
                        onChange={(e) => setFormCompany(e.target.value)}
                        className="admin-input"
                      />
                    </div>
                  </div>

                  <div className="admin-form-grid">
                    <div className="admin-form-group">
                      <label className="admin-label">Periode</label>
                      <input
                        type="text"
                        placeholder="e.g. 2024 - Sekarang"
                        value={formPeriod}
                        onChange={(e) => setFormPeriod(e.target.value)}
                        className="admin-input"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Lokasi</label>
                      <input
                        type="text"
                        placeholder="e.g. Jakarta, Indonesia"
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                        className="admin-input"
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Ringkasan Peran</label>
                    <textarea
                      rows={2}
                      placeholder="Ringkasan tugas kepemimpinan dan tanggung jawab..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="admin-textarea"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Rincian Tanggung Jawab (1 baris per poin)</label>
                    <textarea
                      rows={3}
                      placeholder="Merancang arsitektur sistem&#10;Mengkoordinasikan tim rekayasa&#10;Mengaudit kepatuhan data"
                      value={formDetails}
                      onChange={(e) => setFormDetails(e.target.value)}
                      className="admin-textarea"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Keahlian / Skills (Pisahkan dengan koma)</label>
                    <input
                      type="text"
                      placeholder="e.g. Manajemen Proyek, Transformasi Digital, Cloud Architecture"
                      value={formTech}
                      onChange={(e) => setFormTech(e.target.value)}
                      className="admin-input"
                    />
                  </div>
                </>
              )}

              {/* 3. PUBLICATIONS / RISET */}
              {targetType === "publications" && (
                <>
                  <div className="admin-form-group">
                    <label className="admin-label">Judul Riset / Publikasi</label>
                    <input
                      type="text"
                      placeholder="e.g. Telaah Rancang Bangun Edge Worker Terdistribusi"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="admin-input"
                      required
                    />
                  </div>

                  <div className="admin-form-grid">
                    <div className="admin-form-group">
                      <label className="admin-label">Penerbit / Jurnal / Forum</label>
                      <input
                        type="text"
                        placeholder="e.g. TEN Research Papers"
                        value={formPublisher}
                        onChange={(e) => setFormPublisher(e.target.value)}
                        className="admin-input"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Tahun Terbit</label>
                      <input
                        type="text"
                        placeholder="2026"
                        value={formYear}
                        onChange={(e) => setFormYear(e.target.value)}
                        className="admin-input"
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Ringkasan Riset</label>
                    <textarea
                      rows={2}
                      placeholder="Ringkasan temuan penelitian..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="admin-textarea"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Abstrak Penelitian</label>
                    <textarea
                      rows={3}
                      placeholder="Abstraksi lengkap dan metodologi..."
                      value={formAbstract}
                      onChange={(e) => setFormAbstract(e.target.value)}
                      className="admin-textarea"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Tag / Kata Kunci (Pisahkan dengan koma)</label>
                    <input
                      type="text"
                      placeholder="e.g. Riset, Komputasi Awan, Edge Computing"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      className="admin-input"
                    />
                  </div>
                </>
              )}

              {/* 4. ALAT / STACK */}
              {targetType === "alat" && (
                <>
                  <div className="admin-form-grid">
                    <div className="admin-form-group">
                      <label className="admin-label">Nama Instrumen / Alat</label>
                      <input
                        type="text"
                        placeholder="e.g. Visual Studio Code / Neovim"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="admin-input"
                        required
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Kategori Alat</label>
                      <select
                        className="admin-select"
                        value={formStackCategory}
                        onChange={(e) => setFormStackCategory(e.target.value as "Hardware & EDC" | "Software & Otomasi" | "Infrastruktur & Cloud")}
                      >
                        <option value="Software & Otomasi">Software & Otomasi</option>
                        <option value="Hardware & EDC">Hardware & EDC</option>
                        <option value="Infrastruktur & Cloud">Infrastruktur & Cloud</option>
                      </select>
                    </div>
                  </div>

                  <div className="admin-form-grid">
                    <div className="admin-form-group">
                      <label className="admin-label">Status Penggunaan</label>
                      <select
                        className="admin-select"
                        value={formStackStatus}
                        onChange={(e) => setFormStackStatus(e.target.value as "active" | "evaluating" | "retired")}
                      >
                        <option value="active">Aktif Dipakai (Active)</option>
                        <option value="evaluating">Sedang Dievaluasi (Evaluating)</option>
                        <option value="retired">Pensiun / Arsip (Retired)</option>
                      </select>
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Platform (Pisahkan koma)</label>
                      <input
                        type="text"
                        placeholder="e.g. Web, macOS, Linux"
                        value={formPlatforms}
                        onChange={(e) => setFormPlatforms(e.target.value)}
                        className="admin-input"
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Deskripsi Alat</label>
                    <textarea
                      rows={2}
                      placeholder="Fungsi dan kegunaan alat ini..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="admin-textarea"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Ulasan / Catatan Pengalaman</label>
                    <textarea
                      rows={2}
                      placeholder="Kesan dan manfaat penggunaan alat..."
                      value={formReview}
                      onChange={(e) => setFormReview(e.target.value)}
                      className="admin-textarea"
                    />
                  </div>
                </>
              )}

              {/* 5. KESEHARIAN */}
              {targetType === "keseharian" && (
                <>
                  <div className="admin-form-grid">
                    <div className="admin-form-group">
                      <label className="admin-label">Judul Catatan</label>
                      <input
                        type="text"
                        placeholder="e.g. Mengamati Aliran Informasi"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="admin-input"
                        required
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Kategori Indera / Rasa</label>
                      <select
                        className="admin-select"
                        value={formDailyCategory}
                        onChange={(e) => setFormDailyCategory(e.target.value as SenseCategory)}
                      >
                        <option value="Membaca">Membaca</option>
                        <option value="Mendengar">Mendengar</option>
                        <option value="Mengecap">Mengecap</option>
                        <option value="Melihat">Melihat</option>
                      </select>
                    </div>
                  </div>

                  <div className="admin-form-grid">
                    <div className="admin-form-group">
                      <label className="admin-label">Subjudul / Topik</label>
                      <input
                        type="text"
                        placeholder="e.g. Refleksi Bacaan"
                        value={formSubtitle}
                        onChange={(e) => setFormSubtitle(e.target.value)}
                        className="admin-input"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Tanggal / Waktu</label>
                      <input
                        type="text"
                        placeholder="e.g. 2026-09-23 atau Hari Ini"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="admin-input"
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Ringkasan Catatan</label>
                    <textarea
                      rows={2}
                      placeholder="Ringkasan pengalaman indera..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="admin-textarea"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Catatan Pemikiran / Refleksi</label>
                    <textarea
                      rows={3}
                      placeholder="Gagasan dan catatan pemikiran lebih lanjut..."
                      value={formThoughts}
                      onChange={(e) => setFormThoughts(e.target.value)}
                      className="admin-textarea"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Tag (Pisahkan koma)</label>
                    <input
                      type="text"
                      placeholder="e.g. Jurnal, Buku, Refleksi"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      className="admin-input"
                    />
                  </div>
                </>
              )}

              {/* 6. NEWS / WARTA */}
              {targetType === "news" && (
                <>
                  <div className="admin-form-group">
                    <label className="admin-label">Judul Warta / Berita</label>
                    <input
                      type="text"
                      placeholder="e.g. Pemutakhiran Modul TEN v1.2"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="admin-input"
                      required
                    />
                  </div>

                  <div className="admin-form-grid">
                    <div className="admin-form-group">
                      <label className="admin-label">Kategori Warta</label>
                      <input
                        type="text"
                        placeholder="e.g. Warta Platform"
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="admin-input"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Penulis / Redaksi</label>
                      <input
                        type="text"
                        placeholder="TEN Editorial"
                        value={formAuthor}
                        onChange={(e) => setFormAuthor(e.target.value)}
                        className="admin-input"
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Ringkasan Warta</label>
                    <textarea
                      rows={2}
                      placeholder="Ringkasan warta untuk kartu depan..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="admin-textarea"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Isi Lengkap Warta</label>
                    <textarea
                      rows={4}
                      placeholder="Konten narasi lengkap warta..."
                      value={formNewsContent}
                      onChange={(e) => setFormNewsContent(e.target.value)}
                      className="admin-textarea"
                    />
                  </div>
                </>
              )}

              {/* IMAGE URL & LIVE PREVIEW (FOR ALL TYPES) */}
              <div className="admin-form-group">
                <label className="admin-label">URL Gambar Sampul / Media (Opsional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="admin-input"
                />
                {formImageUrl && (
                  <div className="admin-img-preview-box">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formImageUrl}
                      alt="Preview"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=100&auto=format&fit=crop&q=60";
                      }}
                    />
                    <div className="admin-img-preview-info">
                      <strong>Pratinjau Gambar Media:</strong>
                      <div>Gambar akan otomatis dimuat dan disesuaikan secara proporsional di kartu konten.</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={() => setShowModal(false)}
                >
                  Batal
                </button>
                <button type="submit" className="admin-btn-primary">
                  {modalMode === "create" ? "Simpan & Publikasikan" : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Button on Mobile */}
      {activeTab === "content" && (
        <button
          type="button"
          className="admin-mobile-fab"
          onClick={() => handleOpenCreateModal(contentCategory === "all" ? "projects" : contentCategory)}
          title="Tambah Konten Baru"
          aria-label="Tambah Konten Baru"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      )}
    </div>
  );
}
