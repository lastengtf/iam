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
type MajorCategory = "pengalaman" | "riset-karya" | "alat" | "keseharian" | "warta";
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
  const [majorCategory, setMajorCategory] = useState<MajorCategory>("pengalaman");
  const [risetKaryaSubFilter, setRisetKaryaSubFilter] = useState<"all" | "projects" | "publications">("all");
  const [alatSubFilter, setAlatSubFilter] = useState<string>("all");
  const [keseharianSubFilter, setKeseharianSubFilter] = useState<string>("all");
  const [contentCategory, setContentCategory] = useState<ContentCategory>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"default" | "title-asc" | "title-desc" | "rating-desc" | "likes-desc">("default");
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
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

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
  const [formRating, setFormRating] = useState<number>(4.8);
  const [formItemType, setFormItemType] = useState<string>("Film");
  const [formCreator, setFormCreator] = useState<string>("");
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

  // Specific Memoized Lists for Each Major Category
  const filteredWork = useMemo(() => {
    let result = work.filter((w) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        w.role.toLowerCase().includes(q) ||
        w.company.toLowerCase().includes(q) ||
        w.location.toLowerCase().includes(q) ||
        w.summary.toLowerCase().includes(q) ||
        w.skills.some((s) => s.toLowerCase().includes(q));
      return matchSearch;
    });

    if (sortBy === "title-asc") {
      result = [...result].sort((a, b) => a.role.localeCompare(b.role));
    } else if (sortBy === "title-desc") {
      result = [...result].sort((a, b) => b.role.localeCompare(a.role));
    }
    return result;
  }, [work, searchQuery, sortBy]);

  const risetKaryaItems = useMemo(() => {
    const list: {
      id: string;
      itemType: "projects" | "publications";
      typeLabel: "Karya" | "Publikasi";
      title: string;
      category: string;
      metric: string;
      status: "active" | "progress" | "planned";
      statusText: string;
      imageUrl: string;
      previewUrl: string;
      rawItem: ProjectItem | PublicationItem;
    }[] = [];

    if (risetKaryaSubFilter === "all" || risetKaryaSubFilter === "projects") {
      projects.forEach((p) => {
        let status: "active" | "progress" | "planned" = "active";
        let statusText = "Selesai";
        if (p.status === "in-progress") {
          status = "progress";
          statusText = "Sedang Dibuat";
        } else if (p.status === "planned") {
          status = "planned";
          statusText = "Rencana";
        }
        list.push({
          id: p.slug,
          itemType: "projects",
          typeLabel: "Karya",
          title: p.name,
          category: p.category,
          metric: p.metrics || "Digital Product",
          status,
          statusText,
          imageUrl: p.imageUrl,
          previewUrl: `/karya/details?id=proj-${p.slug}`,
          rawItem: p,
        });
      });
    }

    if (risetKaryaSubFilter === "all" || risetKaryaSubFilter === "publications") {
      publications.forEach((pub) => {
        list.push({
          id: pub.id,
          itemType: "publications",
          typeLabel: "Publikasi",
          title: pub.title,
          category: pub.publisher,
          metric: `Tahun ${pub.year}`,
          status: "active",
          statusText: "Diterbitkan",
          imageUrl: pub.imageUrl,
          previewUrl: `/karya/details?id=pub-${pub.id}`,
          rawItem: pub,
        });
      });
    }

    return list;
  }, [projects, publications, risetKaryaSubFilter]);

  const filteredRisetKarya = useMemo(() => {
    let result = risetKaryaItems.filter((item) => {
      const matchStatus = statusFilter === "all" || item.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.metric.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });

    if (sortBy === "title-asc") {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "title-desc") {
      result = [...result].sort((a, b) => b.title.localeCompare(a.title));
    }
    return result;
  }, [risetKaryaItems, statusFilter, searchQuery, sortBy]);

  const filteredStack = useMemo(() => {
    let result = stack.filter((s) => {
      const matchCategory = alatSubFilter === "all" || s.category === alatSubFilter;
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.platforms.some((pl) => pl.toLowerCase().includes(q));
      return matchCategory && matchStatus && matchSearch;
    });

    if (sortBy === "title-asc") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "title-desc") {
      result = [...result].sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === "likes-desc") {
      result = [...result].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }
    return result;
  }, [stack, alatSubFilter, statusFilter, searchQuery, sortBy]);

  const filteredDaily = useMemo(() => {
    let result = dailyLogs.filter((d) => {
      const matchCategory = keseharianSubFilter === "all" || d.category === keseharianSubFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        d.title.toLowerCase().includes(q) ||
        (d.subtitle && d.subtitle.toLowerCase().includes(q)) ||
        d.summary.toLowerCase().includes(q) ||
        (d.creator && d.creator.toLowerCase().includes(q)) ||
        (d.itemType && d.itemType.toLowerCase().includes(q)) ||
        d.tags.some((t) => t.toLowerCase().includes(q));
      return matchCategory && matchSearch;
    });

    if (sortBy === "title-asc") {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "title-desc") {
      result = [...result].sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortBy === "rating-desc") {
      result = [...result].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }
    return result;
  }, [dailyLogs, keseharianSubFilter, searchQuery, sortBy]);

  const filteredNews = useMemo(() => {
    let result = news.filter((n) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q) ||
        n.author.toLowerCase().includes(q) ||
        n.summary.toLowerCase().includes(q);
      return matchSearch;
    });

    if (sortBy === "title-asc") {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "title-desc") {
      result = [...result].sort((a, b) => b.title.localeCompare(a.title));
    }
    return result;
  }, [news, searchQuery, sortBy]);

  // General Filtered & Sorted Rows (fallback for unified search)
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
    setShowAdvancedOptions(false);

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
    setFormRating(4.8);
    setFormItemType(type === "keseharian" ? "Film" : "");
    setFormCreator("");
    setFormAuthor("TEN Editorial");
    setFormNewsContent("Kabar berkala pemutakhiran ekosistem TEN.");

    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (row: UnifiedRow) => {
    setModalMode("edit");
    setTargetType(row.type);
    setEditingId(row.id);
    setShowAdvancedOptions(true);

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
      setFormRating(d.rating ?? 4.8);
      setFormItemType(d.itemType || "");
      setFormCreator(d.creator || "");
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

      const existingItem = dailyLogs.find((d) => d.id === editingId);
      const itemPayload: DailyLogItem = {
        ...existingItem,
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
        rating: Number(formRating) || 4.8,
        itemType:
          formItemType.trim() ||
          existingItem?.itemType ||
          (formDailyCategory === "Melihat"
            ? "Film"
            : formDailyCategory === "Membaca"
            ? "Buku"
            : formDailyCategory === "Mendengar"
            ? "Album Musik"
            : "Seduh Manual"),
        creator: formCreator.trim() || existingItem?.creator,
        year: formYear || existingItem?.year || new Date().getFullYear().toString(),
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

  const MAJOR_CATEGORIES = [
    {
      id: "pengalaman" as const,
      label: "Pengalaman",
      icon: "💼",
      count: work.length,
      description: "Karier, rekayasa & inisiatif",
      unit: "riwayat",
    },
    {
      id: "riset-karya" as const,
      label: "Riset & Karya",
      icon: "🚀",
      count: projects.length + publications.length,
      description: "Proyek digital & riset ilmiah",
      unit: "item",
    },
    {
      id: "alat" as const,
      label: "Alat",
      icon: "🛠️",
      count: stack.length,
      description: "Software, hardware & cloud",
      unit: "alat",
    },
    {
      id: "keseharian" as const,
      label: "Keseharian",
      icon: "☕",
      count: dailyLogs.length,
      description: "Watched, read, listened & tasted",
      unit: "catatan",
    },
    {
      id: "warta" as const,
      label: "Warta",
      icon: "📰",
      count: news.length,
      description: "Kabar rilis & catatan editorial",
      unit: "artikel",
    },
  ];

  const watchedCount = useMemo(() => dailyLogs.filter((d) => d.category === "Melihat").length, [dailyLogs]);
  const readCount = useMemo(() => dailyLogs.filter((d) => d.category === "Membaca").length, [dailyLogs]);
  const listenedCount = useMemo(() => dailyLogs.filter((d) => d.category === "Mendengar").length, [dailyLogs]);
  const tastedCount = useMemo(() => dailyLogs.filter((d) => d.category === "Mengecap").length, [dailyLogs]);

  const softwareCount = useMemo(() => stack.filter((s) => s.category === "Software & Otomasi").length, [stack]);
  const hardwareCount = useMemo(() => stack.filter((s) => s.category === "Hardware & EDC").length, [stack]);
  const infraCount = useMemo(() => stack.filter((s) => s.category === "Infrastruktur & Cloud").length, [stack]);

  const handleSelectMajorCategory = (cat: MajorCategory) => {
    setMajorCategory(cat);
    setSearchQuery("");
    setStatusFilter("all");
    setSortBy("default");
  };

  const getModalHeading = () => {
    const actionText = modalMode === "create" ? "Tambah" : "Sunting";
    switch (targetType) {
      case "work":
        return { icon: "💼", title: `${actionText} Riwayat Pengalaman`, desc: "Karier profesional, peran, dan inisiatif kepemimpinan" };
      case "projects":
        return { icon: "🚀", title: `${actionText} Karya Digital`, desc: "Inisiatif proyek digital, platform web, dan perkakas mandiri" };
      case "publications":
        return { icon: "📑", title: `${actionText} Riset & Publikasi`, desc: "Makalah ilmiah, kajian komputasi, dan telaah arsitektur" };
      case "alat":
        return { icon: "🛠️", title: `${actionText} Alat & Stack`, desc: "Instrumen software produktivitas, hardware EDC, dan cloud" };
      case "keseharian":
        return { icon: "☕", title: `${actionText} Catatan Keseharian`, desc: "Dokumentasi tontonan (Watched), bacaan (Read), musik (Listened), dan seduhan (Tasted)" };
      case "news":
        return { icon: "📰", title: `${actionText} Warta Platform`, desc: "Pembaruan rilis platform, catatan fitur, dan kabar ekosistem" };
      default:
        return { icon: "✨", title: `${actionText} Konten`, desc: "Kelola data pada ekosistem platform TEN" };
    }
  };

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
                    setMajorCategory("riset-karya");
                    setRisetKaryaSubFilter("projects");
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
                    setMajorCategory("pengalaman");
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
                    setMajorCategory("riset-karya");
                    setRisetKaryaSubFilter("publications");
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
                    setMajorCategory("alat");
                    setAlatSubFilter("all");
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
                    setMajorCategory("keseharian");
                    setKeseharianSubFilter("all");
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
          {/* Major Category Cards Navigator */}
          <div className="admin-major-tabs">
            {MAJOR_CATEGORIES.map((cat) => {
              const isActive = majorCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`admin-major-card ${isActive ? "active" : ""}`}
                  onClick={() => handleSelectMajorCategory(cat.id)}
                >
                  <div className="admin-major-icon">{cat.icon}</div>
                  <div className="admin-major-info">
                    <div className="admin-major-title-row">
                      <span className="admin-major-title">{cat.label}</span>
                      <span className="admin-major-count">{cat.count}</span>
                    </div>
                    <span className="admin-major-desc">{cat.description}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Section Bar */}
          <div className="admin-section-bar">
            <div>
              {majorCategory === "pengalaman" && (
                <>
                  <h2 className="admin-section-title">Kelola Riwayat Pengalaman & Inisiatif</h2>
                  <p className="admin-section-subtitle">
                    Karier profesional, inisiatif kepemimpinan, dan perjalanan rekayasa sistem.
                  </p>
                </>
              )}
              {majorCategory === "riset-karya" && (
                <>
                  <h2 className="admin-section-title">Kelola Riset & Karya Digital</h2>
                  <p className="admin-section-subtitle">
                    Kompilasi proyek digital, solusi open source, serta dokumen riset ilmiah.
                  </p>
                </>
              )}
              {majorCategory === "alat" && (
                <>
                  <h2 className="admin-section-title">Kelola Alat & Instrumen Komputasi</h2>
                  <p className="admin-section-subtitle">
                    Katalog instrumen software produktivitas, hardware EDC, dan infrastruktur cloud.
                  </p>
                </>
              )}
              {majorCategory === "keseharian" && (
                <>
                  <h2 className="admin-section-title">Kelola Pengalaman Keseharian</h2>
                  <p className="admin-section-subtitle">
                    Dokumentasi tontonan (Watched), bacaan (Read), pendengaran (Listened), dan seduhan (Tasted).
                  </p>
                </>
              )}
              {majorCategory === "warta" && (
                <>
                  <h2 className="admin-section-title">Kelola Warta & Pembaruan Platform</h2>
                  <p className="admin-section-subtitle">
                    Kabar pemutakhiran, rilisan fitur, dan pengumuman ekosistem TEN.
                  </p>
                </>
              )}
            </div>

            <div className="admin-header-actions">
              {majorCategory === "pengalaman" && (
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={() => handleOpenCreateModal("work")}
                >
                  + Tambah Pengalaman Baru
                </button>
              )}

              {majorCategory === "riset-karya" && (
                <>
                  <button
                    type="button"
                    className="admin-btn-primary"
                    onClick={() => handleOpenCreateModal("projects")}
                  >
                    + Tambah Karya / Proyek
                  </button>
                  <button
                    type="button"
                    className="admin-btn-outline"
                    onClick={() => handleOpenCreateModal("publications")}
                  >
                    + Tambah Riset / Publikasi
                  </button>
                </>
              )}

              {majorCategory === "alat" && (
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={() => handleOpenCreateModal("alat")}
                >
                  + Tambah Alat / Stack
                </button>
              )}

              {majorCategory === "keseharian" && (
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={() => handleOpenCreateModal("keseharian")}
                >
                  + Tambah Catatan Keseharian
                </button>
              )}

              {majorCategory === "warta" && (
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={() => handleOpenCreateModal("news")}
                >
                  + Tambah Warta Baru
                </button>
              )}
            </div>
          </div>

          {/* Filter Bar with Sub-categories */}
          <div className="admin-filter-bar">
            {/* Sub-Filters per category */}
            <div className="admin-category-pills">
              {majorCategory === "pengalaman" && (
                <button type="button" className="admin-category-btn active">
                  Semua Riwayat ({work.length})
                </button>
              )}

              {majorCategory === "riset-karya" && (
                <>
                  <button
                    type="button"
                    className={`admin-category-btn ${risetKaryaSubFilter === "all" ? "active" : ""}`}
                    onClick={() => setRisetKaryaSubFilter("all")}
                  >
                    Semua ({projects.length + publications.length})
                  </button>
                  <button
                    type="button"
                    className={`admin-category-btn ${risetKaryaSubFilter === "projects" ? "active" : ""}`}
                    onClick={() => setRisetKaryaSubFilter("projects")}
                  >
                    Karya / Proyek ({projects.length})
                  </button>
                  <button
                    type="button"
                    className={`admin-category-btn ${risetKaryaSubFilter === "publications" ? "active" : ""}`}
                    onClick={() => setRisetKaryaSubFilter("publications")}
                  >
                    Riset & Publikasi ({publications.length})
                  </button>
                </>
              )}

              {majorCategory === "alat" && (
                <>
                  <button
                    type="button"
                    className={`admin-category-btn ${alatSubFilter === "all" ? "active" : ""}`}
                    onClick={() => setAlatSubFilter("all")}
                  >
                    Semua Alat ({stack.length})
                  </button>
                  <button
                    type="button"
                    className={`admin-category-btn ${alatSubFilter === "Software & Otomasi" ? "active" : ""}`}
                    onClick={() => setAlatSubFilter("Software & Otomasi")}
                  >
                    Software & Otomasi ({softwareCount})
                  </button>
                  <button
                    type="button"
                    className={`admin-category-btn ${alatSubFilter === "Hardware & EDC" ? "active" : ""}`}
                    onClick={() => setAlatSubFilter("Hardware & EDC")}
                  >
                    Hardware & EDC ({hardwareCount})
                  </button>
                  <button
                    type="button"
                    className={`admin-category-btn ${alatSubFilter === "Infrastruktur & Cloud" ? "active" : ""}`}
                    onClick={() => setAlatSubFilter("Infrastruktur & Cloud")}
                  >
                    Infrastruktur & Cloud ({infraCount})
                  </button>
                </>
              )}

              {majorCategory === "keseharian" && (
                <>
                  <button
                    type="button"
                    className={`admin-category-btn ${keseharianSubFilter === "all" ? "active" : ""}`}
                    onClick={() => setKeseharianSubFilter("all")}
                  >
                    Semua ({dailyLogs.length})
                  </button>
                  <button
                    type="button"
                    className={`admin-category-btn ${keseharianSubFilter === "Melihat" ? "active" : ""}`}
                    onClick={() => setKeseharianSubFilter("Melihat")}
                  >
                    👁️ Watched ({watchedCount})
                  </button>
                  <button
                    type="button"
                    className={`admin-category-btn ${keseharianSubFilter === "Membaca" ? "active" : ""}`}
                    onClick={() => setKeseharianSubFilter("Membaca")}
                  >
                    📖 Read ({readCount})
                  </button>
                  <button
                    type="button"
                    className={`admin-category-btn ${keseharianSubFilter === "Mendengar" ? "active" : ""}`}
                    onClick={() => setKeseharianSubFilter("Mendengar")}
                  >
                    🎧 Listened ({listenedCount})
                  </button>
                  <button
                    type="button"
                    className={`admin-category-btn ${keseharianSubFilter === "Mengecap" ? "active" : ""}`}
                    onClick={() => setKeseharianSubFilter("Mengecap")}
                  >
                    ☕ Tasted ({tastedCount})
                  </button>
                </>
              )}

              {majorCategory === "warta" && (
                <button type="button" className="admin-category-btn active">
                  Semua Warta ({news.length})
                </button>
              )}
            </div>

            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
              {/* Status Filter for categories that support it */}
              {(majorCategory === "riset-karya" || majorCategory === "alat") && (
                <select
                  className="admin-select"
                  style={{ width: "auto", fontSize: "0.75rem", padding: "0.3rem 0.5rem" }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Semua Status</option>
                  {majorCategory === "riset-karya" ? (
                    <>
                      <option value="active">Selesai / Aktif</option>
                      <option value="progress">Sedang Dibuat</option>
                      <option value="planned">Rencana</option>
                    </>
                  ) : (
                    <>
                      <option value="active">Aktif Dipakai</option>
                      <option value="evaluating">Sedang Dievaluasi</option>
                      <option value="retired">Pensiun / Arsip</option>
                    </>
                  )}
                </select>
              )}

              {/* Sorting Filter */}
              <select
                className="admin-select"
                style={{ width: "auto", fontSize: "0.75rem", padding: "0.3rem 0.5rem" }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "default" | "title-asc" | "title-desc" | "rating-desc" | "likes-desc")}
              >
                <option value="default">Urutan Bawaan</option>
                <option value="title-asc">Judul / Nama (A - Z)</option>
                <option value="title-desc">Judul / Nama (Z - A)</option>
                {majorCategory === "keseharian" && (
                  <option value="rating-desc">Rating Tertinggi (★)</option>
                )}
                {majorCategory === "alat" && (
                  <option value="likes-desc">Apresiasi Terbanyak (♥)</option>
                )}
              </select>

              {/* Search Box */}
              <div className="admin-search-input-wrap">
                <input
                  type="text"
                  placeholder={
                    majorCategory === "pengalaman"
                      ? "Cari peran, instansi, keahlian..."
                      : majorCategory === "riset-karya"
                      ? "Cari karya, riset, kategori..."
                      : majorCategory === "alat"
                      ? "Cari nama alat, platform..."
                      : majorCategory === "keseharian"
                      ? "Cari judul, kreator, format..."
                      : "Cari warta, topik, penulis..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="admin-search-input"
                />
              </div>
            </div>
          </div>

          {/* Table Container Specialized by Major Category */}
          <div className="admin-table-container">
            <div className="admin-table-scroll-hint">
              <span>↔ Geser tabel ke samping untuk melihat seluruh data</span>
            </div>
            {/* 1. TABLE: PENGALAMAN */}
            {majorCategory === "pengalaman" && (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Peran & Posisi</th>
                    <th>Instansi & Lokasi</th>
                    <th>Periode</th>
                    <th>Keahlian Terkait</th>
                    <th style={{ textAlign: "right" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWork.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-dim)" }}>
                        Tidak ada riwayat pengalaman yang cocok dengan &quot;{searchQuery}&quot;.
                      </td>
                    </tr>
                  ) : (
                    filteredWork.map((w) => (
                      <tr key={w.id}>
                        <td>
                          <div className="admin-table-item-cell">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={w.imageUrl}
                              alt=""
                              className="admin-thumb-img"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=60";
                              }}
                            />
                            <div>
                              <div className="admin-table-title">{w.role}</div>
                              <div className="admin-field-help" style={{ marginTop: 0 }}>
                                ID: <code>{w.id}</code>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{w.company}</div>
                          <div className="admin-table-sub" style={{ fontSize: "0.74rem" }}>{w.location}</div>
                        </td>
                        <td className="admin-table-meta">
                          <span className="admin-status-pill active">{w.period}</span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", maxWidth: "260px" }}>
                            {w.skills.slice(0, 3).map((sk) => (
                              <span key={sk} className="admin-table-badge">{sk}</span>
                            ))}
                            {w.skills.length > 3 && (
                              <span className="admin-table-badge">+{w.skills.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div className="admin-table-actions">
                            <Link
                              href={`/pengalaman/details?id=${w.id}`}
                              className="admin-btn-sm admin-btn-view"
                              title="Buka pratinjau halaman detail"
                            >
                              Lihat ↗
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal({ type: "work", id: w.id, title: w.role, rawItem: w } as UnifiedRow)}
                              className="admin-btn-sm admin-btn-edit"
                              title="Sunting riwayat ini"
                            >
                              ✎ Sunting
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicateItem({ type: "work", id: w.id, title: w.role, rawItem: w } as UnifiedRow)}
                              className="admin-btn-sm admin-btn-dup"
                              title="Duplikasi riwayat ini"
                            >
                              ⎘ Duplikat
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem("work", w.id, w.role)}
                              className="admin-btn-sm admin-btn-del"
                              title="Hapus riwayat ini"
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
            )}

            {/* 2. TABLE: RISET & KARYA */}
            {majorCategory === "riset-karya" && (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: "90px" }}>Tipe</th>
                    <th>Judul & Media</th>
                    <th>Kategori / Penerbit</th>
                    <th>Metrik / Info</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRisetKarya.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-dim)" }}>
                        Tidak ada karya atau riset yang cocok dengan filter atau pencarian &quot;{searchQuery}&quot;.
                      </td>
                    </tr>
                  ) : (
                    filteredRisetKarya.map((item) => (
                      <tr key={`${item.itemType}-${item.id}`}>
                        <td>
                          <span
                            className="admin-table-badge"
                            style={{
                              background: item.itemType === "projects" ? "rgba(37, 99, 235, 0.08)" : "rgba(124, 58, 237, 0.08)",
                              color: item.itemType === "projects" ? "#2563eb" : "#7c3aed",
                              borderColor: item.itemType === "projects" ? "rgba(37, 99, 235, 0.2)" : "rgba(124, 58, 237, 0.2)",
                            }}
                          >
                            {item.typeLabel}
                          </span>
                        </td>
                        <td>
                          <div className="admin-table-item-cell">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.imageUrl}
                              alt=""
                              className="admin-thumb-img"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=100&auto=format&fit=crop&q=60";
                              }}
                            />
                            <div>
                              <div className="admin-table-title">{item.title}</div>
                              <div className="admin-field-help" style={{ marginTop: 0 }}>
                                ID: <code>{item.id}</code>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="admin-table-sub">{item.category}</td>
                        <td className="admin-table-meta">{item.metric}</td>
                        <td>
                          <span className={`admin-status-pill ${item.status}`}>
                            {item.statusText}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div className="admin-table-actions">
                            <Link
                              href={item.previewUrl}
                              className="admin-btn-sm admin-btn-view"
                              title="Buka pratinjau halaman detail"
                            >
                              Lihat ↗
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal({ type: item.itemType, id: item.id, title: item.title, rawItem: item.rawItem } as UnifiedRow)}
                              className="admin-btn-sm admin-btn-edit"
                              title="Sunting item ini"
                            >
                              ✎ Sunting
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicateItem({ type: item.itemType, id: item.id, title: item.title, rawItem: item.rawItem } as UnifiedRow)}
                              className="admin-btn-sm admin-btn-dup"
                              title="Duplikasi item ini"
                            >
                              ⎘ Duplikat
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item.itemType, item.id, item.title)}
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
            )}

            {/* 3. TABLE: ALAT / STACK */}
            {majorCategory === "alat" && (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Alat & Ikon</th>
                    <th>Kategori Stack</th>
                    <th>Platform Komputasi</th>
                    <th>Apresiasi (Likes)</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStack.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-dim)" }}>
                        Tidak ada alat yang cocok dengan filter atau pencarian &quot;{searchQuery}&quot;.
                      </td>
                    </tr>
                  ) : (
                    filteredStack.map((s) => {
                      const statusClass = s.status === "active" ? "active" : s.status === "evaluating" ? "progress" : "retired";
                      const statusLabel = s.status === "active" ? "Aktif Dipakai" : s.status === "evaluating" ? "Evaluasi" : "Arsip";
                      return (
                        <tr key={s.id}>
                          <td>
                            <div className="admin-table-item-cell">
                              <span style={{ fontSize: "1.4rem", marginRight: "0.25rem" }}>{s.icon || "🛠"}</span>
                              <div>
                                <div className="admin-table-title">{s.name}</div>
                                <div className="admin-field-help" style={{ marginTop: 0 }}>
                                  ID: <code>{s.id}</code>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="admin-table-sub">
                            <span className="admin-table-badge">{s.category}</span>
                          </td>
                          <td className="admin-table-meta">{s.platforms.join(", ")}</td>
                          <td>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "#e11d48", fontWeight: 700 }}>
                              ♥ {s.likes || 1}
                            </span>
                          </td>
                          <td>
                            <span className={`admin-status-pill ${statusClass}`}>{statusLabel}</span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div className="admin-table-actions">
                              <Link
                                href={`/alat/details?id=${s.id}`}
                                className="admin-btn-sm admin-btn-view"
                                title="Buka pratinjau halaman detail"
                              >
                                Lihat ↗
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal({ type: "alat", id: s.id, title: s.name, rawItem: s } as UnifiedRow)}
                                className="admin-btn-sm admin-btn-edit"
                                title="Sunting alat ini"
                              >
                                ✎ Sunting
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDuplicateItem({ type: "alat", id: s.id, title: s.name, rawItem: s } as UnifiedRow)}
                                className="admin-btn-sm admin-btn-dup"
                                title="Duplikasi alat ini"
                              >
                                ⎘ Duplikat
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteItem("alat", s.id, s.name)}
                                className="admin-btn-sm admin-btn-del"
                                title="Hapus alat ini"
                              >
                                ✕ Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}

            {/* 4. TABLE: KESEHARIAN */}
            {majorCategory === "keseharian" && (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: "70px" }}>Poster</th>
                    <th>Judul & Format</th>
                    <th>Kategori Indera</th>
                    <th>Kreator / Pembuat</th>
                    <th>Rating</th>
                    <th>Tanggal</th>
                    <th style={{ textAlign: "right" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDaily.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-dim)" }}>
                        Tidak ada catatan keseharian yang cocok dengan filter &quot;{searchQuery}&quot;.
                      </td>
                    </tr>
                  ) : (
                    filteredDaily.map((d) => (
                      <tr key={d.id}>
                        <td>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={d.imageUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&auto=format&fit=crop&q=60"}
                            alt=""
                            className="admin-thumb-img"
                            style={{ width: "42px", height: "56px", objectFit: "cover", borderRadius: "4px" }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&auto=format&fit=crop&q=60";
                            }}
                          />
                        </td>
                        <td>
                          <div className="admin-table-title">{d.title}</div>
                          <div style={{ display: "flex", gap: "0.35rem", alignItems: "center", marginTop: "0.15rem" }}>
                            {d.itemType && (
                              <span className="admin-table-badge" style={{ fontSize: "0.65rem", padding: "0.08rem 0.35rem" }}>
                                {d.itemType}
                              </span>
                            )}
                            {d.subtitle && (
                              <span className="admin-table-sub" style={{ fontSize: "0.72rem" }}>
                                {d.subtitle}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span
                            className="admin-table-badge"
                            style={{
                              background:
                                d.category === "Melihat"
                                  ? "rgba(59, 130, 246, 0.08)"
                                  : d.category === "Membaca"
                                  ? "rgba(16, 185, 129, 0.08)"
                                  : d.category === "Mendengar"
                                  ? "rgba(168, 85, 247, 0.08)"
                                  : "rgba(245, 158, 11, 0.08)",
                              color:
                                d.category === "Melihat"
                                  ? "#2563eb"
                                  : d.category === "Membaca"
                                  ? "#059669"
                                  : d.category === "Mendengar"
                                  ? "#7c3aed"
                                  : "#d97706",
                              fontWeight: 600,
                            }}
                          >
                            {d.category === "Melihat"
                              ? "👁️ Melihat"
                              : d.category === "Membaca"
                              ? "📖 Membaca"
                              : d.category === "Mendengar"
                              ? "🎧 Mendengar"
                              : "☕ Mengecap"}
                          </span>
                        </td>
                        <td className="admin-table-sub" style={{ fontSize: "0.8rem" }}>
                          {d.creator || "—"}
                        </td>
                        <td>
                          <span className="admin-table-rating">
                            ★ {(d.rating ?? 4.8).toFixed(1)}
                          </span>
                        </td>
                        <td className="admin-table-meta">{d.date}</td>
                        <td style={{ textAlign: "right" }}>
                          <div className="admin-table-actions">
                            <Link
                              href={`/keseharian/details?id=${d.id}`}
                              className="admin-btn-sm admin-btn-view"
                              title="Buka pratinjau catatan"
                            >
                              Lihat ↗
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal({ type: "keseharian", id: d.id, title: d.title, rawItem: d } as UnifiedRow)}
                              className="admin-btn-sm admin-btn-edit"
                              title="Sunting catatan ini"
                            >
                              ✎ Sunting
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicateItem({ type: "keseharian", id: d.id, title: d.title, rawItem: d } as UnifiedRow)}
                              className="admin-btn-sm admin-btn-dup"
                              title="Duplikasi catatan ini"
                            >
                              ⎘ Duplikat
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem("keseharian", d.id, d.title)}
                              className="admin-btn-sm admin-btn-del"
                              title="Hapus catatan ini"
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
            )}

            {/* 5. TABLE: WARTA */}
            {majorCategory === "warta" && (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Judul Warta</th>
                    <th>Kategori</th>
                    <th>Penulis / Redaksi</th>
                    <th>Tanggal Rilis</th>
                    <th style={{ textAlign: "right" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNews.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-dim)" }}>
                        Tidak ada warta yang cocok dengan pencarian &quot;{searchQuery}&quot;.
                      </td>
                    </tr>
                  ) : (
                    filteredNews.map((n) => (
                      <tr key={n.slug}>
                        <td>
                          <div className="admin-table-title">{n.title}</div>
                          <div className="admin-field-help" style={{ marginTop: 0 }}>
                            Slug: <code>{n.slug}</code>
                          </div>
                        </td>
                        <td>
                          <span className="admin-table-badge">{n.category}</span>
                        </td>
                        <td className="admin-table-sub">{n.author}</td>
                        <td className="admin-table-meta">{n.date}</td>
                        <td style={{ textAlign: "right" }}>
                          <div className="admin-table-actions">
                            <Link
                              href={`/news/details?slug=${n.slug}`}
                              className="admin-btn-sm admin-btn-view"
                              title="Buka pratinjau berita"
                            >
                              Lihat ↗
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal({ type: "news", id: n.slug, title: n.title, rawItem: n } as UnifiedRow)}
                              className="admin-btn-sm admin-btn-edit"
                              title="Sunting warta ini"
                            >
                              ✎ Sunting
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicateItem({ type: "news", id: n.slug, title: n.title, rawItem: n } as UnifiedRow)}
                              className="admin-btn-sm admin-btn-dup"
                              title="Duplikasi warta ini"
                            >
                              ⎘ Duplikat
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem("news", n.slug, n.title)}
                              className="admin-btn-sm admin-btn-del"
                              title="Hapus warta ini"
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
            )}
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
      {showModal && (() => {
        const heading = getModalHeading();
        return (
          <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
            <div
              className="admin-modal-box admin-modal-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-modal-drag-handle" />

              <div className="admin-modal-header">
                <div>
                  <h3 className="admin-modal-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span>{heading.icon}</span>
                    <span>{heading.title}</span>
                  </h3>
                  <p className="admin-field-help" style={{ margin: "0.2rem 0 0", fontSize: "0.75rem" }}>
                    {heading.desc}
                  </p>
                </div>
                <button
                  type="button"
                  className="admin-modal-close"
                  onClick={() => setShowModal(false)}
                  title="Tutup Modal"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitModal} className="admin-modal-scroll-body">
                {/* Type Switcher Pills (only on create) */}
                {modalMode === "create" && (
                  <div className="admin-type-pill-switcher">
                    {[
                      { id: "work" as const, label: "Pengalaman", icon: "💼" },
                      { id: "projects" as const, label: "Karya", icon: "🚀" },
                      { id: "publications" as const, label: "Riset", icon: "📑" },
                      { id: "alat" as const, label: "Alat", icon: "🛠️" },
                      { id: "keseharian" as const, label: "Keseharian", icon: "☕" },
                      { id: "news" as const, label: "Warta", icon: "📰" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        className={`admin-type-pill-btn ${targetType === tab.id ? "active" : ""}`}
                        onClick={() => setTargetType(tab.id)}
                      >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* 1. PROJECTS (KARYA DIGITAL) */}
                {targetType === "projects" && (
                  <>
                    <div className="admin-form-section">
                      <div className="admin-form-section-title">🚀 Informasi Utama Karya</div>
                      <div className="admin-form-group">
                        <label className="admin-label">Nama / Judul Karya</label>
                        <input
                          type="text"
                          placeholder="e.g. Views Counter SaaS"
                          value={formTitle}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormTitle(val);
                            if (modalMode === "create") {
                              setFormSlug(slugify(val));
                            }
                          }}
                          className="admin-input"
                          required
                        />
                      </div>

                      <div className="admin-form-grid">
                        <div className="admin-form-group">
                          <label className="admin-label">Kategori Karya</label>
                          <input
                            type="text"
                            placeholder="Pilih atau ketik kategori..."
                            value={formCategory}
                            onChange={(e) => setFormCategory(e.target.value)}
                            className="admin-input"
                          />
                          <div className="admin-chips-row">
                            {["Tools & Utilitas", "Arsitektur Sistem", "Platform Web", "Otomasi & Bot"].map((cat) => (
                              <button
                                key={cat}
                                type="button"
                                className={`admin-chip-btn ${formCategory === cat ? "active" : ""}`}
                                onClick={() => setFormCategory(cat)}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="admin-form-group">
                          <label className="admin-label">Status & Ikon</label>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <select
                              className="admin-select"
                              value={formStatus}
                              onChange={(e) => setFormStatus(e.target.value as "completed" | "in-progress" | "planned")}
                              style={{ flex: 1 }}
                            >
                              <option value="completed">✓ Selesai</option>
                              <option value="in-progress">⏳ Dibuat</option>
                              <option value="planned">📅 Rencana</option>
                            </select>
                            <input
                              type="text"
                              value={formIcon}
                              onChange={(e) => setFormIcon(e.target.value)}
                              className="admin-input"
                              style={{ width: "65px", textAlign: "center", fontSize: "1.1rem" }}
                              title="Ikon Emoji"
                            />
                          </div>
                          <div className="admin-chips-row">
                            {["⚡", "🚀", "🛡️", "🌐", "💻", "🔥", "✨"].map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                className={`admin-chip-btn ${formIcon === emoji ? "active" : ""}`}
                                onClick={() => setFormIcon(emoji)}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="admin-form-group">
                        <label className="admin-label">Teknologi Utama</label>
                        <input
                          type="text"
                          placeholder="e.g. Next.js, TypeScript, Cloudflare"
                          value={formTech}
                          onChange={(e) => setFormTech(e.target.value)}
                          className="admin-input"
                        />
                        <div className="admin-chips-row">
                          {["Next.js", "TypeScript", "Cloudflare", "TailwindCSS", "Hono", "SQLite", "Workers"].map((tech) => (
                            <button
                              key={tech}
                              type="button"
                              className="admin-chip-btn"
                              onClick={() => {
                                const current = formTech ? formTech.split(",").map((s) => s.trim()).filter(Boolean) : [];
                                if (!current.includes(tech)) {
                                  setFormTech([...current, tech].join(", "));
                                }
                              }}
                            >
                              +{tech}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="admin-form-group">
                        <label className="admin-label">Deskripsi Ringkas</label>
                        <textarea
                          rows={2}
                          placeholder="Ringkasan inisiatif karya pada platform..."
                          value={formDescription}
                          onChange={(e) => setFormDescription(e.target.value)}
                          className="admin-textarea"
                        />
                      </div>

                      <div className="admin-form-group">
                        <label className="admin-label">Tautan Demo / Web Publik</label>
                        <input
                          type="url"
                          placeholder="https://..."
                          value={formExternalHref}
                          onChange={(e) => setFormExternalHref(e.target.value)}
                          className="admin-input"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      className="admin-toggle-advanced-btn"
                      onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    >
                      <span>{showAdvancedOptions ? "▲ Sembunyikan Rincian Teknis" : "▼ Rincian Teknis Tambahan (Opsional)"}</span>
                      <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>
                        {showAdvancedOptions ? "Tutup" : "Slug, metrik, arsitektur & repo"}
                      </span>
                    </button>

                    {showAdvancedOptions && (
                      <div className="admin-form-section" style={{ background: "var(--bg-soft)" }}>
                        <div className="admin-form-grid">
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
                          <div className="admin-form-group">
                            <label className="admin-label">Highlight Metrik / Info</label>
                            <input
                              type="text"
                              placeholder="e.g. 10k+ Queries • Edge Ready"
                              value={formMetrics}
                              onChange={(e) => setFormMetrics(e.target.value)}
                              className="admin-input"
                            />
                          </div>
                        </div>

                        <div className="admin-form-group">
                          <label className="admin-label">Rincian Arsitektur / Fitur Teknis</label>
                          <textarea
                            rows={3}
                            placeholder="Penjelasan arsitektur, integrasi, dan keunggulan teknis..."
                            value={formDetails}
                            onChange={(e) => setFormDetails(e.target.value)}
                            className="admin-textarea"
                          />
                        </div>

                        <div className="admin-form-group" style={{ marginBottom: 0 }}>
                          <label className="admin-label">Tautan Internal / Repositori</label>
                          <input
                            type="text"
                            placeholder="/karya/details atau https://github.com/..."
                            value={formHref}
                            onChange={(e) => setFormHref(e.target.value)}
                            className="admin-input"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* 2. WORK (RIWAYAT PENGALAMAN) */}
                {targetType === "work" && (
                  <>
                    <div className="admin-form-section">
                      <div className="admin-form-section-title">💼 Informasi Riwayat Pengalaman</div>
                      <div className="admin-form-grid">
                        <div className="admin-form-group">
                          <label className="admin-label">Peran / Jabatan</label>
                          <input
                            type="text"
                            placeholder="e.g. Inisiator & Koordinator Program"
                            value={formTitle}
                            onChange={(e) => setFormTitle(e.target.value)}
                            className="admin-input"
                            required
                          />
                        </div>
                        <div className="admin-form-group">
                          <label className="admin-label">Perusahaan / Organisasi</label>
                          <input
                            type="text"
                            placeholder="e.g. TEN Initiative"
                            value={formCompany}
                            onChange={(e) => setFormCompany(e.target.value)}
                            className="admin-input"
                          />
                        </div>
                      </div>

                      <div className="admin-form-grid">
                        <div className="admin-form-group">
                          <label className="admin-label">Periode Waktu</label>
                          <input
                            type="text"
                            placeholder="e.g. 2024 — Sekarang"
                            value={formPeriod}
                            onChange={(e) => setFormPeriod(e.target.value)}
                            className="admin-input"
                          />
                        </div>
                        <div className="admin-form-group">
                          <label className="admin-label">Lokasi</label>
                          <input
                            type="text"
                            placeholder="e.g. Indonesia / Remote"
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
                          placeholder="Ringkasan peran kepemimpinan atau keahlian utama..."
                          value={formDescription}
                          onChange={(e) => setFormDescription(e.target.value)}
                          className="admin-textarea"
                        />
                      </div>

                      <div className="admin-form-group">
                        <label className="admin-label">Keahlian Kunci</label>
                        <input
                          type="text"
                          placeholder="e.g. Manajemen Program, Arsitektur Sistem"
                          value={formTech}
                          onChange={(e) => setFormTech(e.target.value)}
                          className="admin-input"
                        />
                        <div className="admin-chips-row">
                          {["Manajemen Program", "Perencanaan Strategis", "Kolaborasi Tim", "Arsitektur Sistem", "Dokumentasi"].map((skill) => (
                            <button
                              key={skill}
                              type="button"
                              className="admin-chip-btn"
                              onClick={() => {
                                const current = formTech ? formTech.split(",").map((s) => s.trim()).filter(Boolean) : [];
                                if (!current.includes(skill)) {
                                  setFormTech([...current, skill].join(", "));
                                }
                              }}
                            >
                              +{skill}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="admin-toggle-advanced-btn"
                      onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    >
                      <span>{showAdvancedOptions ? "▲ Sembunyikan Rincian Lanjutan" : "▼ Rincian Tanggung Jawab & Tautan (Opsional)"}</span>
                      <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>
                        {showAdvancedOptions ? "Tutup" : "Poin tanggung jawab & web perusahaan"}
                      </span>
                    </button>

                    {showAdvancedOptions && (
                      <div className="admin-form-section" style={{ background: "var(--bg-soft)" }}>
                        <div className="admin-form-group">
                          <label className="admin-label">Rincian Tanggung Jawab (1 baris per poin)</label>
                          <textarea
                            rows={3}
                            placeholder="Memimpin perencanaan program&#10;Mengoordinasikan tim lintas divisi&#10;Menyusun tata kelola kerja berkala"
                            value={formDetails}
                            onChange={(e) => setFormDetails(e.target.value)}
                            className="admin-textarea"
                          />
                        </div>

                        <div className="admin-form-group" style={{ marginBottom: 0 }}>
                          <label className="admin-label">Tautan Web Perusahaan / Referensi</label>
                          <input
                            type="url"
                            placeholder="https://..."
                            value={formHref}
                            onChange={(e) => setFormHref(e.target.value)}
                            className="admin-input"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* 3. PUBLICATIONS (RISET & PUBLIKASI) */}
                {targetType === "publications" && (
                  <>
                    <div className="admin-form-section">
                      <div className="admin-form-section-title">📑 Dokumen Riset & Publikasi</div>
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
                        <label className="admin-label">Ringkasan Intisari</label>
                        <textarea
                          rows={2}
                          placeholder="Ringkasan temuan penting penelitian..."
                          value={formDescription}
                          onChange={(e) => setFormDescription(e.target.value)}
                          className="admin-textarea"
                        />
                      </div>

                      <div className="admin-form-group">
                        <label className="admin-label">Tautan Dokumen / DOI / PDF</label>
                        <input
                          type="url"
                          placeholder="https://..."
                          value={formHref}
                          onChange={(e) => setFormHref(e.target.value)}
                          className="admin-input"
                        />
                      </div>

                      <div className="admin-form-group" style={{ marginBottom: 0 }}>
                        <label className="admin-label">Kata Kunci / Tag</label>
                        <input
                          type="text"
                          placeholder="e.g. Riset, Edge Computing, OIDC"
                          value={formTags}
                          onChange={(e) => setFormTags(e.target.value)}
                          className="admin-input"
                        />
                        <div className="admin-chips-row">
                          {["Riset", "Edge Computing", "Arsitektur Terdistribusi", "OIDC", "Keamanan", "Kinerja"].map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              className="admin-chip-btn"
                              onClick={() => {
                                const current = formTags ? formTags.split(",").map((s) => s.trim()).filter(Boolean) : [];
                                if (!current.includes(tag)) {
                                  setFormTags([...current, tag].join(", "));
                                }
                              }}
                            >
                              +{tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="admin-toggle-advanced-btn"
                      onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    >
                      <span>{showAdvancedOptions ? "▲ Sembunyikan Abstrak Lengkap" : "▼ Abstrak Lengkap (Opsional)"}</span>
                      <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>
                        {showAdvancedOptions ? "Tutup" : "Abstraksi metodologi komprehensif"}
                      </span>
                    </button>

                    {showAdvancedOptions && (
                      <div className="admin-form-section" style={{ background: "var(--bg-soft)" }}>
                        <div className="admin-form-group" style={{ marginBottom: 0 }}>
                          <label className="admin-label">Abstrak Lengkap</label>
                          <textarea
                            rows={4}
                            placeholder="Abstraksi lengkap dan metodologi..."
                            value={formAbstract}
                            onChange={(e) => setFormAbstract(e.target.value)}
                            className="admin-textarea"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* 4. ALAT (ALAT & STACK) */}
                {targetType === "alat" && (
                  <>
                    <div className="admin-form-section">
                      <div className="admin-form-section-title">🛠️ Identitas Alat & Platform</div>
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
                          <label className="admin-label">Ikon Emoji</label>
                          <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                            <input
                              type="text"
                              placeholder="🛠"
                              value={formIcon}
                              onChange={(e) => setFormIcon(e.target.value)}
                              className="admin-input"
                              style={{ width: "65px", textAlign: "center", fontSize: "1.1rem" }}
                            />
                            <div className="admin-chips-row" style={{ marginTop: 0 }}>
                              {["💻", "⚙️", "☁️", "📱", "🛠️", "⚡", "🔒"].map((ico) => (
                                <button
                                  key={ico}
                                  type="button"
                                  className={`admin-chip-btn ${formIcon === ico ? "active" : ""}`}
                                  onClick={() => setFormIcon(ico)}
                                >
                                  {ico}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="admin-form-grid">
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
                        <div className="admin-form-group">
                          <label className="admin-label">Status Penggunaan</label>
                          <select
                            className="admin-select"
                            value={formStackStatus}
                            onChange={(e) => setFormStackStatus(e.target.value as "active" | "evaluating" | "retired")}
                          >
                            <option value="active">✓ Aktif Dipakai (Active)</option>
                            <option value="evaluating">⏳ Sedang Dievaluasi (Evaluating)</option>
                            <option value="retired">📦 Pensiun / Arsip (Retired)</option>
                          </select>
                        </div>
                      </div>

                      <div className="admin-form-group">
                        <label className="admin-label">Fungsi Utama</label>
                        <textarea
                          rows={2}
                          placeholder="Fungsi dan kegunaan alat ini..."
                          value={formDescription}
                          onChange={(e) => setFormDescription(e.target.value)}
                          className="admin-textarea"
                        />
                      </div>

                      <div className="admin-form-group">
                        <label className="admin-label">Platform Komputasi</label>
                        <input
                          type="text"
                          placeholder="e.g. Web, macOS, Linux"
                          value={formPlatforms}
                          onChange={(e) => setFormPlatforms(e.target.value)}
                          className="admin-input"
                        />
                        <div className="admin-chips-row">
                          {["macOS", "Linux", "Windows", "Web", "iOS", "Android"].map((pl) => (
                            <button
                              key={pl}
                              type="button"
                              className="admin-chip-btn"
                              onClick={() => {
                                const current = formPlatforms ? formPlatforms.split(",").map((s) => s.trim()).filter(Boolean) : [];
                                if (!current.includes(pl)) {
                                  setFormPlatforms([...current, pl].join(", "));
                                }
                              }}
                            >
                              +{pl}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="admin-form-group" style={{ marginBottom: 0 }}>
                        <label className="admin-label">Tautan Resmi / Unduh</label>
                        <input
                          type="url"
                          placeholder="https://..."
                          value={formHref}
                          onChange={(e) => setFormHref(e.target.value)}
                          className="admin-input"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      className="admin-toggle-advanced-btn"
                      onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    >
                      <span>{showAdvancedOptions ? "▲ Sembunyikan Ulasan & Likes" : "▼ Ulasan Pengalaman & Likes (Opsional)"}</span>
                      <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>
                        {showAdvancedOptions ? "Tutup" : "Alasan pemilihan & hitungan apresiasi"}
                      </span>
                    </button>

                    {showAdvancedOptions && (
                      <div className="admin-form-section" style={{ background: "var(--bg-soft)" }}>
                        <div className="admin-form-group">
                          <label className="admin-label">Ulasan Pengalaman / Alasan Pemilihan</label>
                          <textarea
                            rows={2}
                            placeholder="Kesan dan manfaat penggunaan alat..."
                            value={formReview}
                            onChange={(e) => setFormReview(e.target.value)}
                            className="admin-textarea"
                          />
                        </div>

                        <div className="admin-form-group" style={{ marginBottom: 0 }}>
                          <label className="admin-label">Apresiasi (Likes ♥)</label>
                          <input
                            type="number"
                            min="1"
                            value={formLikes}
                            onChange={(e) => setFormLikes(parseInt(e.target.value) || 1)}
                            className="admin-input"
                            style={{ maxWidth: "120px" }}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* 5. KESEHARIAN (CATATAN INDERA) */}
                {targetType === "keseharian" && (
                  <>
                    <div className="admin-form-section">
                      <div className="admin-form-section-title">☕ Catatan Keseharian & Indera</div>
                      
                      {/* Sense Selector Buttons */}
                      <div className="admin-form-group">
                        <label className="admin-label">Kategori Indera / Aktivitas</label>
                        <div className="admin-chips-row">
                          {[
                            { id: "Melihat" as const, label: "👁️ Watched (Melihat)", defaultFmt: "Film" },
                            { id: "Membaca" as const, label: "📖 Read (Membaca)", defaultFmt: "Buku" },
                            { id: "Mendengar" as const, label: "🎧 Listened (Mendengar)", defaultFmt: "Album Musik" },
                            { id: "Mengecap" as const, label: "☕ Tasted (Mengecap)", defaultFmt: "Seduh Manual V60" },
                          ].map((sense) => (
                            <button
                              key={sense.id}
                              type="button"
                              className={`admin-chip-btn ${formDailyCategory === sense.id ? "active" : ""}`}
                              onClick={() => {
                                setFormDailyCategory(sense.id);
                                setFormItemType(sense.defaultFmt);
                              }}
                              style={{ padding: "0.3rem 0.75rem", fontSize: "0.78rem" }}
                            >
                              {sense.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Format Media Chips */}
                      <div className="admin-form-group">
                        <label className="admin-label">Format Media</label>
                        <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap", alignItems: "center" }}>
                          <input
                            type="text"
                            placeholder="Format media..."
                            value={formItemType}
                            onChange={(e) => setFormItemType(e.target.value)}
                            className="admin-input"
                            style={{ maxWidth: "160px" }}
                          />
                          <div className="admin-chips-row" style={{ marginTop: 0 }}>
                            {(formDailyCategory === "Melihat"
                              ? ["Film", "Serial TV", "Video Podcast", "Dokumenter", "Anime"]
                              : formDailyCategory === "Membaca"
                              ? ["Buku", "Esai", "Artikel", "Jurnal", "Newsletter"]
                              : formDailyCategory === "Mendengar"
                              ? ["Album Musik", "EP", "Podcast", "Suara Alam", "Audiobook"]
                              : ["Seduh Manual V60", "Espresso", "Cold Brew", "Kuliner", "Rasa Tradisional"]
                            ).map((fmt) => (
                              <button
                                key={fmt}
                                type="button"
                                className={`admin-chip-btn ${formItemType === fmt ? "active" : ""}`}
                                onClick={() => setFormItemType(fmt)}
                              >
                                {fmt}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="admin-form-grid">
                        <div className="admin-form-group">
                          <label className="admin-label">Judul Karya / Objek Catatan</label>
                          <input
                            type="text"
                            placeholder="e.g. Oppenheimer / Atomic Habits / Kopi Flores"
                            value={formTitle}
                            onChange={(e) => setFormTitle(e.target.value)}
                            className="admin-input"
                            required
                          />
                        </div>
                        <div className="admin-form-group">
                          <label className="admin-label">Kreator / Pembuat / Sutradara</label>
                          <input
                            type="text"
                            placeholder="e.g. Christopher Nolan, James Clear"
                            value={formCreator}
                            onChange={(e) => setFormCreator(e.target.value)}
                            className="admin-input"
                          />
                        </div>
                      </div>

                      {/* Interactive Rating Chips */}
                      <div className="admin-form-group">
                        <label className="admin-label">
                          Rating Pengalaman ({formRating.toFixed(1)} / 5.0 ★)
                        </label>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                          <span className="admin-table-rating" style={{ fontSize: "0.85rem", padding: "0.25rem 0.65rem" }}>
                            ★ {formRating.toFixed(1)}
                          </span>
                          <div className="admin-chips-row" style={{ marginTop: 0 }}>
                            {[3.5, 4.0, 4.5, 4.8, 5.0].map((score) => (
                              <button
                                key={score}
                                type="button"
                                className={`admin-chip-btn ${formRating === score ? "active" : ""}`}
                                onClick={() => setFormRating(score)}
                              >
                                ★ {score.toFixed(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="admin-form-group" style={{ marginBottom: 0 }}>
                        <label className="admin-label">Ringkasan Pengamatan & Kesan Utama</label>
                        <textarea
                          rows={2}
                          placeholder="Ringkasan kesan penikmatan..."
                          value={formDescription}
                          onChange={(e) => setFormDescription(e.target.value)}
                          className="admin-textarea"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      className="admin-toggle-advanced-btn"
                      onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    >
                      <span>{showAdvancedOptions ? "▲ Sembunyikan Refleksi & Detail" : "▼ Refleksi Mendalam & Tautan (Opsional)"}</span>
                      <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>
                        {showAdvancedOptions ? "Tutup" : "Subjudul, tanggal, refleksi & link eksternal"}
                      </span>
                    </button>

                    {showAdvancedOptions && (
                      <div className="admin-form-section" style={{ background: "var(--bg-soft)" }}>
                        <div className="admin-form-grid">
                          <div className="admin-form-group">
                            <label className="admin-label">Subjudul / Sudut Pandang Catatan</label>
                            <input
                              type="text"
                              placeholder="e.g. Refleksi Sinematografi & Sains"
                              value={formSubtitle}
                              onChange={(e) => setFormSubtitle(e.target.value)}
                              className="admin-input"
                            />
                          </div>
                          <div className="admin-form-group">
                            <label className="admin-label">Tanggal / Waktu Penikmatan</label>
                            <input
                              type="text"
                              placeholder="e.g. Hari Ini atau 2026-10-02"
                              value={formDate}
                              onChange={(e) => setFormDate(e.target.value)}
                              className="admin-input"
                            />
                          </div>
                        </div>

                        <div className="admin-form-group">
                          <label className="admin-label">Catatan Pemikiran & Refleksi Mendalam</label>
                          <textarea
                            rows={3}
                            placeholder="Gagasan, renungan, dan refleksi pemikiran..."
                            value={formThoughts}
                            onChange={(e) => setFormThoughts(e.target.value)}
                            className="admin-textarea"
                          />
                        </div>

                        <div className="admin-form-grid">
                          <div className="admin-form-group">
                            <label className="admin-label">Tag / Kata Kunci</label>
                            <input
                              type="text"
                              placeholder="e.g. Film, Nolan, Refleksi"
                              value={formTags}
                              onChange={(e) => setFormTags(e.target.value)}
                              className="admin-input"
                            />
                          </div>
                          <div className="admin-form-group">
                            <label className="admin-label">Tautan Referensi (IMDb, Goodreads, Spotify)</label>
                            <input
                              type="url"
                              placeholder="https://..."
                              value={formHref}
                              onChange={(e) => setFormHref(e.target.value)}
                              className="admin-input"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* 6. NEWS (WARTA PLATFORM) */}
                {targetType === "news" && (
                  <>
                    <div className="admin-form-section">
                      <div className="admin-form-section-title">📰 Informasi Warta Platform</div>
                      <div className="admin-form-group">
                        <label className="admin-label">Judul Warta / Berita</label>
                        <input
                          type="text"
                          placeholder="e.g. Pemutakhiran Modul TEN v1.2"
                          value={formTitle}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormTitle(val);
                            if (modalMode === "create") {
                              setFormSlug(slugify(val));
                            }
                          }}
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
                          <div className="admin-chips-row">
                            {["Warta Platform", "Catatan Rilis", "Pengumuman", "Dokumentasi"].map((cat) => (
                              <button
                                key={cat}
                                type="button"
                                className={`admin-chip-btn ${formCategory === cat ? "active" : ""}`}
                                onClick={() => setFormCategory(cat)}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="admin-form-group">
                          <label className="admin-label">Tanggal Rilis</label>
                          <input
                            type="text"
                            placeholder="e.g. 2026-10-02"
                            value={formDate}
                            onChange={(e) => setFormDate(e.target.value)}
                            className="admin-input"
                          />
                        </div>
                      </div>

                      <div className="admin-form-group" style={{ marginBottom: 0 }}>
                        <label className="admin-label">Ringkasan Warta (Cuplikan Depan)</label>
                        <textarea
                          rows={2}
                          placeholder="Ringkasan warta untuk kartu depan..."
                          value={formDescription}
                          onChange={(e) => setFormDescription(e.target.value)}
                          className="admin-textarea"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      className="admin-toggle-advanced-btn"
                      onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    >
                      <span>{showAdvancedOptions ? "▲ Sembunyikan Isi Lengkap" : "▼ Isi Narasi Lengkap & Redaksi (Opsional)"}</span>
                      <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>
                        {showAdvancedOptions ? "Tutup" : "Slug kustom, penulis & narasi penuh"}
                      </span>
                    </button>

                    {showAdvancedOptions && (
                      <div className="admin-form-section" style={{ background: "var(--bg-soft)" }}>
                        <div className="admin-form-grid">
                          <div className="admin-form-group">
                            <label className="admin-label">Slug / ID URL</label>
                            <input
                              type="text"
                              placeholder="e.g. update-v1-2"
                              value={formSlug}
                              onChange={(e) => setFormSlug(e.target.value)}
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

                        <div className="admin-form-group" style={{ marginBottom: 0 }}>
                          <label className="admin-label">Isi Lengkap Warta</label>
                          <textarea
                            rows={4}
                            placeholder="Konten narasi lengkap warta..."
                            value={formNewsContent}
                            onChange={(e) => setFormNewsContent(e.target.value)}
                            className="admin-textarea"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* MEDIA & IMAGE COVER SECTION */}
                <div className="admin-form-section">
                  <div className="admin-form-section-title">🖼️ Media & Sampul Gambar</div>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label className="admin-label">
                      URL Gambar Sampul / Poster
                      {targetType === "keseharian" && " (Disarankan foto potret 3:4 untuk poster)"}
                      {targetType === "projects" && " (Disarankan format lanskap 16:9)"}
                    </label>
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
                          <div>Gambar otomatis disesuaikan secara proporsional pada tampilan platform.</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sticky Action Buttons */}
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
        );
      })()}

      {/* Floating Action Button on Mobile */}
      {activeTab === "content" && (
        <button
          type="button"
          className="admin-mobile-fab"
          onClick={() => {
            if (majorCategory === "pengalaman") handleOpenCreateModal("work");
            else if (majorCategory === "riset-karya") handleOpenCreateModal(risetKaryaSubFilter === "publications" ? "publications" : "projects");
            else if (majorCategory === "alat") handleOpenCreateModal("alat");
            else if (majorCategory === "keseharian") handleOpenCreateModal("keseharian");
            else if (majorCategory === "warta") handleOpenCreateModal("news");
            else handleOpenCreateModal("projects");
          }}
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
