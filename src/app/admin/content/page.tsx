"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ProjectItem,
  WorkItem,
  PublicationItem,
  StackItem,
  DailyLogItem,
  SenseCategory,
} from "@/data/profileData";
import {
  useProjectsData,
  useWorkData,
  usePublicationsData,
  useStackData,
  useDailyData,
} from "@/data/contentStore";
import { useAdmin } from "../AdminContext";

type MajorCategory = "pengalaman" | "riset-karya" | "alat" | "keseharian";
type ItemType = "work" | "projects" | "publications" | "alat" | "keseharian";

const getTodayIso = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateToIso = (dateStr: string): string => {
  if (!dateStr || dateStr === "Hari Ini") return getTodayIso();
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  const months: Record<string, string> = {
    jan: "01", feb: "02", mar: "03", apr: "04", mei: "05", jun: "06",
    jul: "07", agu: "08", ags: "08", sep: "09", okt: "10", nov: "11", des: "12"
  };
  const parts = dateStr.trim().split(/\s+/);
  if (parts.length === 3) {
    const day = parts[0].padStart(2, "0");
    const mon = months[parts[1].toLowerCase().slice(0, 3)] || "01";
    const yr = parts[2];
    if (yr.length === 4) return `${yr}-${mon}-${day}`;
  }
  return getTodayIso();
};

const formatIsoToDisplay = (isoStr: string): string => {
  if (!isoStr) return "Hari Ini";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoStr)) return isoStr;
  const [yr, mo, da] = isoStr.split("-");
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const mIndex = parseInt(mo, 10) - 1;
  const mName = monthNames[mIndex] || mo;
  return `${parseInt(da, 10)} ${mName} ${yr}`;
};

function ContentManagerInner() {
  const searchParams = useSearchParams();
  const initialCat = (searchParams.get("cat") as MajorCategory) || "pengalaman";
  const initialAction = searchParams.get("action");
  const initialType = (searchParams.get("type") as ItemType) || "projects";

  const { showToast, requestConfirm } = useAdmin();

  // Active Category State
  const [majorCategory, setMajorCategory] = useState<MajorCategory>(
    ["pengalaman", "riset-karya", "alat", "keseharian"].includes(initialCat)
      ? initialCat
      : "pengalaman"
  );

  // Sub-filters & Search State
  const [risetKaryaSubFilter, setRisetKaryaSubFilter] = useState<"all" | "projects" | "publications">("all");
  const [alatSubFilter, setAlatSubFilter] = useState<string>("all");
  const [keseharianSubFilter, setKeseharianSubFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Reactive Data Stores
  const { projects, updateProjects } = useProjectsData();
  const { work, updateWork } = useWorkData();
  const { publications, updatePublications } = usePublicationsData();
  const { stack, updateStack } = useStackData();
  const { dailyLogs, updateDailyLogs } = useDailyData();

  // Counts for Badges
  const watchedCount = useMemo(() => dailyLogs.filter((d) => d.category === "Melihat").length, [dailyLogs]);
  const readCount = useMemo(() => dailyLogs.filter((d) => d.category === "Membaca").length, [dailyLogs]);
  const listenedCount = useMemo(() => dailyLogs.filter((d) => d.category === "Mendengar").length, [dailyLogs]);
  const tastedCount = useMemo(() => dailyLogs.filter((d) => d.category === "Mengecap").length, [dailyLogs]);

  // Modal State for Add & Edit
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [targetType, setTargetType] = useState<ItemType>("projects");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Structured Form States
  // Common
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formSummary, setFormSummary] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formHref, setFormHref] = useState("");

  // Pengalaman Specific
  const [formCompany, setFormCompany] = useState("");
  const [formPeriod, setFormPeriod] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formDuties, setFormDuties] = useState("");
  const [formSkills, setFormSkills] = useState("");

  // Karya & Riset Specific
  const [formIcon, setFormIcon] = useState("⚡");
  const [formProjectStatus, setFormProjectStatus] = useState<"completed" | "in-progress" | "planned">("completed");
  const [formTech, setFormTech] = useState("");
  const [formPublisher, setFormPublisher] = useState("");
  const [formYear, setFormYear] = useState("2026");
  const [formAbstract, setFormAbstract] = useState("");

  // Alat Specific
  const [formStackCategory, setFormStackCategory] = useState<"Software & Otomasi" | "Hardware & EDC" | "Infrastruktur & Cloud">("Software & Otomasi");
  const [formStackStatus, setFormStackStatus] = useState<"active" | "evaluating" | "retired">("active");
  const [formPlatforms, setFormPlatforms] = useState("Web, Desktop");
  const [formReview, setFormReview] = useState("");

  // Keseharian Specific
  const [formSense, setFormSense] = useState<SenseCategory>("Melihat");
  const [formItemFormat, setFormItemFormat] = useState("Film");
  const [formCreator, setFormCreator] = useState("");
  const [formRating, setFormRating] = useState<number>(5.0);
  const [formDate, setFormDate] = useState<string>(getTodayIso());
  const [formThoughts, setFormThoughts] = useState("");
  const [showExtraDetails, setShowExtraDetails] = useState(false);

  // Auto-open modal if URL query specifies action=create
  useEffect(() => {
    if (initialAction === "create") {
      handleOpenCreate(initialType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAction]);

  // Open Create Modal
  const handleOpenCreate = (typeToCreate?: ItemType) => {
    let resolvedType: ItemType = "projects";
    if (typeToCreate) {
      resolvedType = typeToCreate;
    } else if (majorCategory === "pengalaman") {
      resolvedType = "work";
    } else if (majorCategory === "riset-karya") {
      resolvedType = risetKaryaSubFilter === "publications" ? "publications" : "projects";
    } else if (majorCategory === "alat") {
      resolvedType = "alat";
    } else if (majorCategory === "keseharian") {
      resolvedType = "keseharian";
    }

    setModalMode("create");
    setTargetType(resolvedType);
    setEditingId(null);

    // Reset All Inputs
    setFormTitle("");
    setFormCategory("");
    setFormSummary("");
    setFormImageUrl("");
    setFormHref("");

    setFormCompany("");
    setFormPeriod("2026 - Sekarang");
    setFormLocation("Indonesia • Remote");
    setFormDuties("Memimpin rekayasa dan digitalisasi platform.");
    setFormSkills("TypeScript, Next.js, Cloudflare");

    setFormIcon("⚡");
    setFormProjectStatus("completed");
    setFormTech("TypeScript, Next.js, Cloudflare Workers");
    setFormPublisher("TEN Riset / Editorial");
    setFormYear("2026");
    setFormAbstract("");

    setFormStackCategory("Software & Otomasi");
    setFormStackStatus("active");
    setFormPlatforms("Web, Desktop");
    setFormReview("Sangat menunjang performa komputasi dan alur kerja.");

    setFormSense("Melihat");
    setFormItemFormat("Film");
    setFormCreator("");
    setFormRating(5.0);
    setFormDate(getTodayIso());
    setFormThoughts("");
    setShowExtraDetails(false);

    setShowModal(true);
  };

  // Open Edit Modal for Work
  const handleEditWork = (item: WorkItem) => {
    setModalMode("edit");
    setTargetType("work");
    setEditingId(item.id);
    setFormTitle(item.role);
    setFormCompany(item.company);
    setFormPeriod(item.period);
    setFormLocation(item.location);
    setFormSummary(item.summary);
    setFormDuties(item.details.join("\n"));
    setFormSkills(item.skills.join(", "));
    setFormHref(item.href || "");
    setFormImageUrl(item.imageUrl || "");
    setShowModal(true);
  };

  // Open Edit Modal for Project
  const handleEditProject = (p: ProjectItem) => {
    setModalMode("edit");
    setTargetType("projects");
    setEditingId(p.slug);
    setFormTitle(p.name);
    setFormCategory(p.category);
    setFormIcon(p.icon || "⚡");
    setFormProjectStatus(p.status || "completed");
    setFormSummary(p.description);
    setFormTech(p.tech.join(", "));
    setFormHref(p.externalHref || p.href);
    setFormImageUrl(p.imageUrl || "");
    setShowModal(true);
  };

  // Open Edit Modal for Publication
  const handleEditPublication = (pub: PublicationItem) => {
    setModalMode("edit");
    setTargetType("publications");
    setEditingId(pub.id);
    setFormTitle(pub.title);
    setFormPublisher(pub.publisher);
    setFormYear(pub.year);
    setFormSummary(pub.summary);
    setFormAbstract(pub.abstract);
    setFormHref(pub.href || "");
    setFormImageUrl(pub.imageUrl || "");
    setShowModal(true);
  };

  // Open Edit Modal for Stack
  const handleEditStack = (s: StackItem) => {
    setModalMode("edit");
    setTargetType("alat");
    setEditingId(s.id);
    setFormTitle(s.name);
    setFormIcon(s.icon || "🛠");
    setFormStackCategory(s.category);
    setFormStackStatus(s.status);
    setFormPlatforms(s.platforms.join(", "));
    setFormSummary(s.description);
    setFormReview(s.review);
    setFormHref(s.href || "");
    setShowModal(true);
  };

  // Open Edit Modal for Daily
  const handleEditDaily = (d: DailyLogItem) => {
    setModalMode("edit");
    setTargetType("keseharian");
    setEditingId(d.id);
    setFormTitle(d.title);
    setFormSense(d.category);
    setFormItemFormat(d.itemType || (d.category === "Melihat" ? "Film" : d.category === "Membaca" ? "Buku" : d.category === "Mendengar" ? "Musik" : "Kopi"));
    setFormCreator(d.creator || "");
    setFormRating(d.rating ?? 5.0);
    setFormDate(parseDateToIso(d.date));
    setFormSummary(d.summary || "");
    setFormThoughts(d.thoughts || "");
    setFormHref(d.link || "");
    setFormImageUrl(d.imageUrl || "");
    setShowExtraDetails(Boolean(d.creator || (d.summary && d.summary !== d.thoughts) || d.link));
    setShowModal(true);
  };

  // Duplicate Handler
  const handleDuplicate = (type: ItemType, title: string, itemData: unknown) => {
    requestConfirm({
      title: "Konfirmasi Duplikasi Konten",
      message: `Apakah Anda yakin ingin menggandakan "${title}"? Salinan baru akan dibuat ke dalam daftar aktif.`,
      confirmLabel: "Duplikasi",
      cancelLabel: "Batal",
      isDanger: false,
      onConfirm: () => {
        const timestamp = Date.now().toString().slice(-4);
        if (type === "work") {
          const w = itemData as WorkItem;
          updateWork([{ ...w, id: `work-${Date.now()}`, role: `${w.role} (Salinan)` }, ...work]);
        } else if (type === "projects") {
          const p = itemData as ProjectItem;
          updateProjects([{ ...p, slug: `${p.slug}-salinan-${timestamp}`, name: `${p.name} (Salinan)` }, ...projects]);
        } else if (type === "publications") {
          const pub = itemData as PublicationItem;
          updatePublications([{ ...pub, id: `pub-${Date.now()}`, title: `${pub.title} (Salinan)` }, ...publications]);
        } else if (type === "alat") {
          const s = itemData as StackItem;
          updateStack([{ ...s, id: `stack-${Date.now()}`, name: `${s.name} (Salinan)` }, ...stack]);
        } else if (type === "keseharian") {
          const d = itemData as DailyLogItem;
          updateDailyLogs([{ ...d, id: `daily-${Date.now()}`, title: `${d.title} (Salinan)` }, ...dailyLogs]);
        }
        showToast(`Berhasil menduplikasi "${title}".`);
      },
    });
  };

  // Delete Handler
  const handleDelete = (type: ItemType, id: string, title: string) => {
    requestConfirm({
      title: "Konfirmasi Hapus Konten",
      message: `Apakah Anda yakin ingin menghapus "${title}"? Aksi ini akan menghapus data tersebut dari daftar aktif platform.`,
      confirmLabel: "Hapus Sekarang",
      cancelLabel: "Batal",
      isDanger: true,
      onConfirm: () => {
        if (type === "work") updateWork(work.filter((w) => w.id !== id));
        else if (type === "projects") updateProjects(projects.filter((p) => p.slug !== id));
        else if (type === "publications") updatePublications(publications.filter((p) => p.id !== id));
        else if (type === "alat") updateStack(stack.filter((s) => s.id !== id));
        else if (type === "keseharian") updateDailyLogs(dailyLogs.filter((d) => d.id !== id));
        showToast(`"${title}" berhasil dihapus.`);
      },
    });
  };

  // Submit Modal Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert("Nama atau Judul Konten wajib diisi!");
      return;
    }

    if (targetType === "work") {
      const skillsArr = formSkills.split(",").map((s) => s.trim()).filter(Boolean);
      const dutiesArr = formDuties.split("\n").map((s) => s.trim()).filter(Boolean);
      const payload: WorkItem = {
        id: modalMode === "create" ? `work-${Date.now()}` : (editingId as string),
        role: formTitle,
        company: formCompany || "Inisiatif Mandiri",
        period: formPeriod || "2026 - Sekarang",
        location: formLocation || "Indonesia",
        summary: formSummary || "Ringkasan pengalaman dan peran profesional.",
        details: dutiesArr.length > 0 ? dutiesArr : ["Mengelola dan mengembangkan inisiatif digital."],
        skills: skillsArr.length > 0 ? skillsArr : ["Manajemen Proyek", "Sistem Digital"],
        href: formHref || "https://ten.my.id",
        imageUrl: formImageUrl || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80",
      };

      if (modalMode === "create") {
        updateWork([payload, ...work]);
        showToast("Pengalaman baru berhasil ditambahkan!");
      } else {
        updateWork(work.map((w) => (w.id === editingId ? payload : w)));
        showToast("Pengalaman berhasil diperbarui!");
      }
    } else if (targetType === "projects") {
      const slugVal = formTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const techArr = formTech.split(",").map((s) => s.trim()).filter(Boolean);
      const payload: ProjectItem = {
        slug: modalMode === "create" ? slugVal : (editingId as string),
        name: formTitle,
        category: formCategory || "Tools & Utilitas",
        icon: formIcon || "⚡",
        description: formSummary || "Deskripsi inisiatif karya pada platform TEN.",
        details: "Arsitektur modular terintegrasi pada ekosistem platform TEN.",
        metrics: "Digital Product",
        tech: techArr.length > 0 ? techArr : ["TypeScript", "Next.js"],
        liveApp: true,
        status: formProjectStatus,
        href: `/karya/details?id=proj-${slugVal}`,
        externalHref: formHref || "https://ten.my.id",
        imageUrl: formImageUrl || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80",
      };

      if (modalMode === "create") {
        updateProjects([payload, ...projects]);
        showToast("Karya digital baru berhasil ditambahkan!");
      } else {
        updateProjects(projects.map((p) => (p.slug === editingId ? payload : p)));
        showToast("Karya digital berhasil diperbarui!");
      }
    } else if (targetType === "publications") {
      const payload: PublicationItem = {
        id: modalMode === "create" ? `pub-${Date.now()}` : (editingId as string),
        title: formTitle,
        publisher: formPublisher || "Jurnal Ilmiah / Riset",
        year: formYear || "2026",
        summary: formSummary || "Telaah riset ilmiah dalam rekayasa sistem.",
        abstract: formAbstract || "Abstraksi penelitian dan rancang bangun platform terdistribusi.",
        tags: ["Riset", "Inovasi"],
        imageUrl: formImageUrl || "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80",
        href: formHref || "/karya/details",
      };

      if (modalMode === "create") {
        updatePublications([payload, ...publications]);
        showToast("Riset & publikasi baru berhasil ditambahkan!");
      } else {
        updatePublications(publications.map((p) => (p.id === editingId ? payload : p)));
        showToast("Riset & publikasi berhasil diperbarui!");
      }
    } else if (targetType === "alat") {
      const platformsArr = formPlatforms.split(",").map((s) => s.trim()).filter(Boolean);
      const payload: StackItem = {
        id: modalMode === "create" ? `stack-${Date.now()}` : (editingId as string),
        name: formTitle,
        category: formStackCategory,
        description: formSummary || "Instrumen produktivitas harian.",
        review: formReview || "Sangat menunjang performa komputasi dan alur kerja.",
        platforms: platformsArr.length > 0 ? platformsArr : ["Web", "Desktop"],
        status: formStackStatus,
        icon: formIcon || "🛠",
        href: formHref || "https://ten.my.id",
        likes: 1,
      };

      if (modalMode === "create") {
        updateStack([payload, ...stack]);
        showToast("Alat / stack baru berhasil ditambahkan!");
      } else {
        updateStack(stack.map((s) => (s.id === editingId ? payload : s)));
        showToast("Alat / stack berhasil diperbarui!");
      }
    } else if (targetType === "keseharian") {
      const existing = dailyLogs.find((d) => d.id === editingId);
      const defaultImg =
        formSense === "Melihat"
          ? "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80"
          : formSense === "Membaca"
          ? "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"
          : formSense === "Mendengar"
          ? "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80"
          : "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80";

      const displayDate = formatIsoToDisplay(formDate);

      const payload: DailyLogItem = {
        ...existing,
        id: modalMode === "create" ? `daily-${Date.now()}` : (editingId as string),
        title: formTitle.trim(),
        category: formSense,
        itemType: formItemFormat || (formSense === "Melihat" ? "Film" : formSense === "Membaca" ? "Buku" : formSense === "Mendengar" ? "Musik" : "Seduh Manual"),
        creator: formCreator.trim() || undefined,
        rating: Number(formRating) || 5.0,
        date: displayDate,
        summary: formSummary.trim() || formThoughts.trim() || "Catatan pengamatan dan refleksi rasa.",
        thoughts: formThoughts.trim() || formSummary.trim() || "Ulasan catatan personal.",
        tags: ["Keseharian", formSense],
        imageUrl: formImageUrl.trim() || defaultImg,
        link: formHref.trim() || undefined,
      };

      if (modalMode === "create") {
        updateDailyLogs([payload, ...dailyLogs]);
        showToast("Catatan keseharian baru berhasil ditambahkan!");
      } else {
        updateDailyLogs(dailyLogs.map((d) => (d.id === editingId ? payload : d)));
        showToast("Catatan keseharian berhasil diperbarui!");
      }
    }

    setShowModal(false);
  };

  // Filtered Lists for Non-Bloated Concise Tables
  const filteredWork = useMemo(() => {
    return work.filter((w) => {
      const q = searchQuery.toLowerCase().trim();
      return !q || w.role.toLowerCase().includes(q) || w.company.toLowerCase().includes(q) || w.location.toLowerCase().includes(q);
    });
  }, [work, searchQuery]);

  const filteredRisetKarya = useMemo(() => {
    const list: {
      id: string;
      itemType: "projects" | "publications";
      title: string;
      category: string;
      statusText: string;
      statusColor: string;
      previewUrl: string;
      raw: ProjectItem | PublicationItem;
    }[] = [];

    if (risetKaryaSubFilter === "all" || risetKaryaSubFilter === "projects") {
      projects.forEach((p) => {
        const matchStatus = statusFilter === "all" || p.status === statusFilter;
        const q = searchQuery.toLowerCase().trim();
        const matchSearch = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
        if (matchStatus && matchSearch) {
          list.push({
            id: p.slug,
            itemType: "projects",
            title: `${p.icon || "⚡"} ${p.name}`,
            category: p.category,
            statusText: p.status === "in-progress" ? "Proses" : p.status === "planned" ? "Rencana" : "Selesai",
            statusColor: p.status === "in-progress" ? "progress" : p.status === "planned" ? "planned" : "active",
            previewUrl: `/karya/details?id=proj-${p.slug}`,
            raw: p,
          });
        }
      });
    }

    if (risetKaryaSubFilter === "all" || risetKaryaSubFilter === "publications") {
      publications.forEach((pub) => {
        const q = searchQuery.toLowerCase().trim();
        const matchSearch = !q || pub.title.toLowerCase().includes(q) || pub.publisher.toLowerCase().includes(q);
        if (matchSearch) {
          list.push({
            id: pub.id,
            itemType: "publications",
            title: `📑 ${pub.title}`,
            category: pub.publisher,
            statusText: `Riset ${pub.year}`,
            statusColor: "active",
            previewUrl: `/karya/details?id=pub-${pub.id}`,
            raw: pub,
          });
        }
      });
    }

    return list;
  }, [projects, publications, risetKaryaSubFilter, statusFilter, searchQuery]);

  const filteredStack = useMemo(() => {
    return stack.filter((s) => {
      const matchCategory = alatSubFilter === "all" || s.category === alatSubFilter;
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
      return matchCategory && matchStatus && matchSearch;
    });
  }, [stack, alatSubFilter, statusFilter, searchQuery]);

  const filteredDaily = useMemo(() => {
    return dailyLogs.filter((d) => {
      const matchCategory = keseharianSubFilter === "all" || d.category === keseharianSubFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || d.title.toLowerCase().includes(q) || (d.creator && d.creator.toLowerCase().includes(q));
      return matchCategory && matchSearch;
    });
  }, [dailyLogs, keseharianSubFilter, searchQuery]);

  return (
    <div className="admin-tab-body">
      {/* 4 Major Category Selector Pills */}
      <div className="admin-major-tabs">
        <button
          type="button"
          className={`admin-major-card ${majorCategory === "pengalaman" ? "active" : ""}`}
          onClick={() => {
            setMajorCategory("pengalaman");
            setSearchQuery("");
          }}
        >
          <div className="admin-major-icon">💼</div>
          <div className="admin-major-text">
            <div className="admin-major-title">Pengalaman</div>
            <div className="admin-major-meta">{work.length} riwayat</div>
          </div>
        </button>

        <button
          type="button"
          className={`admin-major-card ${majorCategory === "riset-karya" ? "active" : ""}`}
          onClick={() => {
            setMajorCategory("riset-karya");
            setSearchQuery("");
            setRisetKaryaSubFilter("all");
          }}
        >
          <div className="admin-major-icon">🚀</div>
          <div className="admin-major-text">
            <div className="admin-major-title">Riset & Karya</div>
            <div className="admin-major-meta">{projects.length + publications.length} item</div>
          </div>
        </button>

        <button
          type="button"
          className={`admin-major-card ${majorCategory === "alat" ? "active" : ""}`}
          onClick={() => {
            setMajorCategory("alat");
            setSearchQuery("");
            setAlatSubFilter("all");
          }}
        >
          <div className="admin-major-icon">🛠️</div>
          <div className="admin-major-text">
            <div className="admin-major-title">Alat</div>
            <div className="admin-major-meta">{stack.length} stack</div>
          </div>
        </button>

        <button
          type="button"
          className={`admin-major-card ${majorCategory === "keseharian" ? "active" : ""}`}
          onClick={() => {
            setMajorCategory("keseharian");
            setSearchQuery("");
            setKeseharianSubFilter("all");
          }}
        >
          <div className="admin-major-icon">☕</div>
          <div className="admin-major-text">
            <div className="admin-major-title">Keseharian</div>
            <div className="admin-major-meta">{dailyLogs.length} catatan</div>
          </div>
        </button>
      </div>

      {/* Section Header with Quick Add Button */}
      <div className="admin-section-bar">
        <div>
          <h2 className="admin-section-title">
            {majorCategory === "pengalaman" && "Daftar Riwayat Pengalaman"}
            {majorCategory === "riset-karya" && "Daftar Proyek Karya & Riset Ilmiah"}
            {majorCategory === "alat" && "Daftar Alat, Software & Infrastruktur"}
            {majorCategory === "keseharian" && "Daftar Catatan Keseharian & Indera"}
          </h2>
          <p className="admin-section-subtitle">
            Ringkasan data penting. Tidak memakan banyak ruang layar dan mudah dipantau.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            className="admin-btn-primary"
            onClick={() => handleOpenCreate()}
          >
            + Tambah {majorCategory === "pengalaman" ? "Pengalaman" : majorCategory === "riset-karya" ? "Karya / Riset" : majorCategory === "alat" ? "Alat" : "Catatan"}
          </button>
        </div>
      </div>

      {/* Filter Bar with Sub-categories & Search */}
      <div className="admin-filter-bar">
        <div className="admin-category-pills">
          {majorCategory === "pengalaman" && (
            <button type="button" className="admin-category-btn active">
              Semua Pengalaman ({work.length})
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
                🚀 Karya ({projects.length})
              </button>
              <button
                type="button"
                className={`admin-category-btn ${risetKaryaSubFilter === "publications" ? "active" : ""}`}
                onClick={() => setRisetKaryaSubFilter("publications")}
              >
                📑 Riset ({publications.length})
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
                Semua ({stack.length})
              </button>
              <button
                type="button"
                className={`admin-category-btn ${alatSubFilter === "Software & Otomasi" ? "active" : ""}`}
                onClick={() => setAlatSubFilter("Software & Otomasi")}
              >
                Software
              </button>
              <button
                type="button"
                className={`admin-category-btn ${alatSubFilter === "Hardware & EDC" ? "active" : ""}`}
                onClick={() => setAlatSubFilter("Hardware & EDC")}
              >
                Hardware
              </button>
              <button
                type="button"
                className={`admin-category-btn ${alatSubFilter === "Infrastruktur & Cloud" ? "active" : ""}`}
                onClick={() => setAlatSubFilter("Infrastruktur & Cloud")}
              >
                Cloud
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
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          {majorCategory === "riset-karya" && (
            <select
              className="admin-select"
              style={{ width: "auto", fontSize: "0.75rem", padding: "0.3rem 0.5rem" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="completed">Selesai</option>
              <option value="in-progress">Sedang Dibuat</option>
              <option value="planned">Rencana</option>
            </select>
          )}

          {majorCategory === "alat" && (
            <select
              className="admin-select"
              style={{ width: "auto", fontSize: "0.75rem", padding: "0.3rem 0.5rem" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif Dipakai</option>
              <option value="evaluating">Dievaluasi</option>
              <option value="retired">Arsip</option>
            </select>
          )}

          {/* Search Box */}
          <div className="admin-search-input-wrap">
            <input
              type="text"
              placeholder="Cari kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
          </div>
        </div>
      </div>

      {/* DYNAMICALLY BOUNDED, NON-BLOATED CONCISE TABLE VIEW */}
      <div className="admin-table-container">
        <div className="admin-table-scroll-hint">
          <span>↔ Geser ke samping jika tabel melebihi batas layar ponsel</span>
        </div>

        {/* 1. TABLE: PENGALAMAN (RINGKAS & TIDAK GEMBUNG) */}
        {majorCategory === "pengalaman" && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Peran & Instansi</th>
                <th>Periode</th>
                <th>Lokasi</th>
                <th style={{ textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredWork.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-dim)" }}>
                    Tidak ada riwayat pengalaman ditemukan.
                  </td>
                </tr>
              ) : (
                filteredWork.map((w) => (
                  <tr key={w.id}>
                    <td>
                      <div className="admin-table-title" style={{ fontSize: "0.82rem" }}>
                        {w.role}
                      </div>
                      <div className="admin-table-sub" style={{ fontSize: "0.72rem" }}>
                        {w.company}
                      </div>
                    </td>
                    <td className="admin-table-meta" style={{ whiteSpace: "nowrap" }}>
                      {w.period}
                    </td>
                    <td className="admin-table-sub" style={{ fontSize: "0.75rem" }}>
                      {w.location}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="admin-table-actions">
                        <Link
                          href={`/pengalaman/details?id=${w.id}`}
                          className="admin-btn-sm admin-btn-view"
                          title="Buka pratinjau"
                        >
                          Lihat ↗
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleEditWork(w)}
                          className="admin-btn-sm admin-btn-edit"
                          title="Sunting item ini"
                        >
                          ✎ Sunting
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicate("work", w.role, w)}
                          className="admin-btn-sm admin-btn-dup"
                          title="Duplikasi item ini"
                        >
                          ⎘ Duplikat
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete("work", w.id, w.role)}
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

        {/* 2. TABLE: RISET & KARYA (RINGKAS & TIDAK GEMBUNG) */}
        {majorCategory === "riset-karya" && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Judul & Tipe</th>
                <th>Kategori</th>
                <th>Status / Tahun</th>
                <th style={{ textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredRisetKarya.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-dim)" }}>
                    Tidak ada karya atau riset ditemukan.
                  </td>
                </tr>
              ) : (
                filteredRisetKarya.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="admin-table-title" style={{ fontSize: "0.82rem" }}>
                        {item.title}
                      </div>
                    </td>
                    <td>
                      <span className="admin-table-badge">{item.category}</span>
                    </td>
                    <td>
                      <span className={`admin-status-pill ${item.statusColor}`}>
                        {item.statusText}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="admin-table-actions">
                        <Link
                          href={item.previewUrl}
                          className="admin-btn-sm admin-btn-view"
                          title="Buka pratinjau"
                        >
                          Lihat ↗
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            if (item.itemType === "projects") handleEditProject(item.raw as ProjectItem);
                            else handleEditPublication(item.raw as PublicationItem);
                          }}
                          className="admin-btn-sm admin-btn-edit"
                          title="Sunting item ini"
                        >
                          ✎ Sunting
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicate(item.itemType, item.title, item.raw)}
                          className="admin-btn-sm admin-btn-dup"
                          title="Duplikasi item ini"
                        >
                          ⎘ Duplikat
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.itemType, item.id, item.title)}
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

        {/* 3. TABLE: ALAT & STACK (RINGKAS & TIDAK GEMBUNG) */}
        {majorCategory === "alat" && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nama Alat</th>
                <th>Kelompok</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredStack.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-dim)" }}>
                    Tidak ada instrumen alat ditemukan.
                  </td>
                </tr>
              ) : (
                filteredStack.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="admin-table-title" style={{ fontSize: "0.82rem" }}>
                        {s.icon || "🛠"} {s.name}
                      </div>
                    </td>
                    <td>
                      <span className="admin-table-badge">{s.category}</span>
                    </td>
                    <td>
                      <span className={`admin-status-pill ${s.status === "active" ? "active" : s.status === "evaluating" ? "progress" : "planned"}`}>
                        {s.status === "active" ? "Aktif" : s.status === "evaluating" ? "Evaluasi" : "Arsip"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="admin-table-actions">
                        <Link
                          href={`/alat/details?id=${s.id}`}
                          className="admin-btn-sm admin-btn-view"
                          title="Buka pratinjau"
                        >
                          Lihat ↗
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleEditStack(s)}
                          className="admin-btn-sm admin-btn-edit"
                          title="Sunting alat ini"
                        >
                          ✎ Sunting
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicate("alat", s.name, s)}
                          className="admin-btn-sm admin-btn-dup"
                          title="Duplikasi alat ini"
                        >
                          ⎘ Duplikat
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete("alat", s.id, s.name)}
                          className="admin-btn-sm admin-btn-del"
                          title="Hapus alat ini"
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

        {/* 4. TABLE: KESEHARIAN (RINGKAS & TIDAK GEMBUNG) */}
        {majorCategory === "keseharian" && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Judul & Kreator</th>
                <th>Sense</th>
                <th>Rating</th>
                <th style={{ textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredDaily.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-dim)" }}>
                    Tidak ada catatan keseharian ditemukan.
                  </td>
                </tr>
              ) : (
                filteredDaily.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <div className="admin-table-title" style={{ fontSize: "0.82rem" }}>
                        {d.title}
                      </div>
                      {d.creator && (
                        <div className="admin-table-sub" style={{ fontSize: "0.72rem" }}>
                          {d.creator}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="admin-table-badge">
                        {d.category === "Melihat" ? "👁️ Watched" : d.category === "Membaca" ? "📖 Read" : d.category === "Mendengar" ? "🎧 Listened" : "☕ Tasted"}
                      </span>
                    </td>
                    <td>
                      <span className="admin-table-rating">
                        ★ {d.rating?.toFixed(1) || "5.0"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="admin-table-actions">
                        <Link
                          href={`/keseharian/details?id=${d.id}`}
                          className="admin-btn-sm admin-btn-view"
                          title="Buka pratinjau"
                        >
                          Lihat ↗
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleEditDaily(d)}
                          className="admin-btn-sm admin-btn-edit"
                          title="Sunting catatan ini"
                        >
                          ✎ Sunting
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicate("keseharian", d.title, d)}
                          className="admin-btn-sm admin-btn-dup"
                          title="Duplikasi catatan ini"
                        >
                          ⎘ Duplikat
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete("keseharian", d.id, d.title)}
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
      </div>

      {/* INTUITIVE, ORGANIZED, STEP-BY-STEP ADD/EDIT FORM MODAL */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="admin-modal-box admin-modal-lg"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="admin-modal-drag-handle"></div>

            {/* Modal Header */}
            <div className="admin-modal-header">
              <div>
                <h3 className="admin-modal-title">
                  {modalMode === "create"
                    ? targetType === "keseharian"
                      ? "Tambah Catatan Keseharian"
                      : "Tambah Konten Baru"
                    : `Sunting Konten: ${formTitle || "Item"}`}
                </h3>
                <p className="admin-modal-desc">
                  {targetType === "keseharian"
                    ? "Isi review & rating, lalu pilih objek yang diulas secara cepat dan fokus."
                    : "Isi informasi penting dengan alur bertahap yang teratur."}
                </p>
              </div>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setShowModal(false)}
                title="Tutup dialog"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-modal-scroll-body">
              {/* LANGKAH 1: PILIH KATEGORI (Hanya saat tambah baru) */}
              {modalMode === "create" && (
                <div className="admin-form-section">
                  <div className="admin-form-section-title">1. Pilih Kategori Konten</div>
                  <div className="admin-type-pill-switcher">
                    {[
                      { id: "work" as const, label: "Pengalaman", icon: "💼" },
                      { id: "projects" as const, label: "Karya", icon: "🚀" },
                      { id: "publications" as const, label: "Riset", icon: "📑" },
                      { id: "alat" as const, label: "Alat", icon: "🛠️" },
                      { id: "keseharian" as const, label: "Keseharian", icon: "☕" },
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
                </div>
              )}

              {/* LANGKAH 2: FORM TERSTRUKTUR SESUAI KATEGORI */}
              {/* A. FORM PENGALAMAN */}
              {targetType === "work" && (
                <>
                  <div className="admin-form-section">
                    <div className="admin-form-section-title">2. Posisi & Instansi</div>
                    <div className="admin-form-grid">
                      <div className="admin-form-group">
                        <label className="admin-label">Peran / Posisi Jabatan *</label>
                        <input
                          type="text"
                          placeholder="e.g. Lead Software Engineer"
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          className="admin-input"
                          required
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-label">Nama Perusahaan / Organisasi *</label>
                        <input
                          type="text"
                          placeholder="e.g. PT Solusi Digital Indonesia"
                          value={formCompany}
                          onChange={(e) => setFormCompany(e.target.value)}
                          className="admin-input"
                          required
                        />
                      </div>
                    </div>

                    <div className="admin-form-grid">
                      <div className="admin-form-group">
                        <label className="admin-label">Periode Waktu *</label>
                        <input
                          type="text"
                          placeholder="e.g. 2024 - Sekarang"
                          value={formPeriod}
                          onChange={(e) => setFormPeriod(e.target.value)}
                          className="admin-input"
                          required
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-label">Lokasi *</label>
                        <input
                          type="text"
                          placeholder="e.g. Jakarta, Indonesia • Remote"
                          value={formLocation}
                          onChange={(e) => setFormLocation(e.target.value)}
                          className="admin-input"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="admin-form-section">
                    <div className="admin-form-section-title">3. Ringkasan & Tanggung Jawab</div>
                    <div className="admin-form-group">
                      <label className="admin-label">Ringkasan Peran</label>
                      <textarea
                        rows={2}
                        placeholder="1-2 kalimat ringkas mengenai fokus peran Anda..."
                        value={formSummary}
                        onChange={(e) => setFormSummary(e.target.value)}
                        className="admin-textarea"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Poin Tanggung Jawab / Pencapaian (1 baris per poin)</label>
                      <textarea
                        rows={3}
                        placeholder="Memimpin arsitektur sistem&#10;Meningkatkan performa aplikasi hingga 40%&#10;Mengelola alur kerja tim"
                        value={formDuties}
                        onChange={(e) => setFormDuties(e.target.value)}
                        className="admin-textarea"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Keahlian & Teknologi (pisahkan koma)</label>
                      <input
                        type="text"
                        placeholder="TypeScript, Next.js, Cloudflare, PostgreSQL"
                        value={formSkills}
                        onChange={(e) => setFormSkills(e.target.value)}
                        className="admin-input"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* B. FORM KARYA (PROYEK DIGITAL) */}
              {targetType === "projects" && (
                <>
                  <div className="admin-form-section">
                    <div className="admin-form-section-title">2. Identitas Karya & Status</div>
                    <div className="admin-form-grid">
                      <div className="admin-form-group">
                        <label className="admin-label">Nama Aplikasi / Proyek *</label>
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
                        <label className="admin-label">Ikon Emoji</label>
                        <input
                          type="text"
                          placeholder="⚡"
                          value={formIcon}
                          onChange={(e) => setFormIcon(e.target.value)}
                          className="admin-input"
                          style={{ maxWidth: "100px" }}
                        />
                      </div>
                    </div>

                    <div className="admin-form-grid">
                      <div className="admin-form-group">
                        <label className="admin-label">Kategori Proyek</label>
                        <input
                          type="text"
                          placeholder="e.g. Tools & Utilitas"
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value)}
                          className="admin-input"
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-label">Status Pengerjaan</label>
                        <select
                          className="admin-select"
                          value={formProjectStatus}
                          onChange={(e) => setFormProjectStatus(e.target.value as "completed" | "in-progress" | "planned")}
                        >
                          <option value="completed">🟢 Selesai / Aktif</option>
                          <option value="in-progress">🟡 Sedang Dikerjakan</option>
                          <option value="planned">🔵 Tahap Perencanaan</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="admin-form-section">
                    <div className="admin-form-section-title">3. Deskripsi & Tautan</div>
                    <div className="admin-form-group">
                      <label className="admin-label">Deskripsi Ringkas</label>
                      <textarea
                        rows={2}
                        placeholder="Solusi atau nilai guna yang dihadirkan karya ini..."
                        value={formSummary}
                        onChange={(e) => setFormSummary(e.target.value)}
                        className="admin-textarea"
                      />
                    </div>
                    <div className="admin-form-grid">
                      <div className="admin-form-group">
                        <label className="admin-label">Teknologi Utama (pisahkan koma)</label>
                        <input
                          type="text"
                          placeholder="TypeScript, Next.js, Cloudflare Workers"
                          value={formTech}
                          onChange={(e) => setFormTech(e.target.value)}
                          className="admin-input"
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-label">URL Aplikasi / Repositori</label>
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
                </>
              )}

              {/* C. FORM RISET (PUBLIKASI) */}
              {targetType === "publications" && (
                <>
                  <div className="admin-form-section">
                    <div className="admin-form-section-title">2. Identitas Publikasi Ilmiah</div>
                    <div className="admin-form-group">
                      <label className="admin-label">Judul Riset / Makalah *</label>
                      <input
                        type="text"
                        placeholder="e.g. Analisis Performa Arsitektur Edge Serverless"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="admin-input"
                        required
                      />
                    </div>
                    <div className="admin-form-grid">
                      <div className="admin-form-group">
                        <label className="admin-label">Penerbit / Wadah</label>
                        <input
                          type="text"
                          placeholder="e.g. Jurnal Ilmiah / IEEE"
                          value={formPublisher}
                          onChange={(e) => setFormPublisher(e.target.value)}
                          className="admin-input"
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-label">Tahun Rilis</label>
                        <input
                          type="text"
                          placeholder="2026"
                          value={formYear}
                          onChange={(e) => setFormYear(e.target.value)}
                          className="admin-input"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="admin-form-section">
                    <div className="admin-form-section-title">3. Ringkasan & Dokumen</div>
                    <div className="admin-form-group">
                      <label className="admin-label">Ringkasan Kajian</label>
                      <textarea
                        rows={2}
                        placeholder="Ringkasan inti temuan penelitian..."
                        value={formSummary}
                        onChange={(e) => setFormSummary(e.target.value)}
                        className="admin-textarea"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Tautan Dokumen / Paper</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={formHref}
                        onChange={(e) => setFormHref(e.target.value)}
                        className="admin-input"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* D. FORM ALAT & STACK */}
              {targetType === "alat" && (
                <>
                  <div className="admin-form-section">
                    <div className="admin-form-section-title">2. Nama Alat & Kelompok</div>
                    <div className="admin-form-grid">
                      <div className="admin-form-group">
                        <label className="admin-label">Nama Instrumen / Alat *</label>
                        <input
                          type="text"
                          placeholder="e.g. Visual Studio Code"
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          className="admin-input"
                          required
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-label">Ikon Emoji</label>
                        <input
                          type="text"
                          placeholder="💻"
                          value={formIcon}
                          onChange={(e) => setFormIcon(e.target.value)}
                          className="admin-input"
                          style={{ maxWidth: "100px" }}
                        />
                      </div>
                    </div>

                    <div className="admin-form-grid">
                      <div className="admin-form-group">
                        <label className="admin-label">Kelompok Alat</label>
                        <select
                          className="admin-select"
                          value={formStackCategory}
                          onChange={(e) => setFormStackCategory(e.target.value as "Software & Otomasi" | "Hardware & EDC" | "Infrastruktur & Cloud")}
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
                          <option value="active">🟢 Aktif Digunakan</option>
                          <option value="evaluating">🟡 Sedang Evaluasi</option>
                          <option value="retired">⚪ Arsip</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="admin-form-section">
                    <div className="admin-form-section-title">3. Reviewku &amp; Tautan</div>
                    <div className="admin-form-group">
                      <label className="admin-label">Reviewku (Ulasan Pemakaian Nyata) *</label>
                      <textarea
                        rows={2}
                        placeholder="Kesan dan alasan mengapa alat ini efektif..."
                        value={formReview}
                        onChange={(e) => setFormReview(e.target.value)}
                        className="admin-textarea"
                      />
                    </div>
                    <div className="admin-form-grid">
                      <div className="admin-form-group">
                        <label className="admin-label">Platform (Web, macOS, Windows, Linux)</label>
                        <input
                          type="text"
                          placeholder="Web, Desktop"
                          value={formPlatforms}
                          onChange={(e) => setFormPlatforms(e.target.value)}
                          className="admin-input"
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-label">Tautan Resmi</label>
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
                </>
              )}

              {/* E. FORM KESEHARIAN (Sangat Cepat & Sederhana) */}
              {targetType === "keseharian" && (
                <>
                  {/* TAHAP 1: REVIEW, RATING & TANGGAL */}
                  <div className="admin-form-section" style={{ borderLeft: "3px solid var(--mono-black)" }}>
                    <div className="admin-form-section-title">
                      <span>✍️ 1. Review, Rating &amp; Tanggal</span>
                    </div>

                    {/* Review / Ulasan Personal */}
                    <div className="admin-form-group">
                      <label className="admin-label">Review / Ulasanmu *</label>
                      <textarea
                        rows={3}
                        placeholder="Tulis ulasan, kesan mendalam, atau pendapatmu tentang ini..."
                        value={formThoughts}
                        onChange={(e) => setFormThoughts(e.target.value)}
                        className="admin-textarea"
                        required
                        autoFocus
                      />
                    </div>

                    <div className="admin-form-grid" style={{ alignItems: "center" }}>
                      {/* Rating */}
                      <div className="admin-form-group" style={{ marginBottom: 0 }}>
                        <label className="admin-label">Rating</label>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <div style={{ display: "flex", gap: "0.15rem" }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setFormRating(star)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  fontSize: "1.35rem",
                                  cursor: "pointer",
                                  padding: "0 0.05rem",
                                  color: star <= Math.round(formRating) ? "#eab308" : "var(--border-subtle)",
                                  lineHeight: 1,
                                }}
                                title={`Beri ${star} bintang`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                          <input
                            type="number"
                            min="1.0"
                            max="5.0"
                            step="0.1"
                            value={formRating}
                            onChange={(e) => setFormRating(parseFloat(e.target.value))}
                            className="admin-input"
                            style={{ width: "65px", fontWeight: "700", textAlign: "center", padding: "0.4rem 0.5rem" }}
                            required
                          />
                          <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>/ 5.0</span>
                        </div>
                      </div>

                      {/* Tanggal (Kalender Date Picker) */}
                      <div className="admin-form-group" style={{ marginBottom: 0 }}>
                        <label className="admin-label">Tanggal Review (Pilih Kalender)</label>
                        <input
                          type="date"
                          value={formDate}
                          onChange={(e) => setFormDate(e.target.value)}
                          className="admin-input"
                          required
                          style={{ cursor: "pointer", padding: "0.45rem 0.65rem" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* TAHAP 2: APA YANG DIREVIEW & DETAILNYA */}
                  <div className="admin-form-section" style={{ borderLeft: "3px solid #6366f1" }}>
                    <div className="admin-form-section-title">
                      <span>🎬 2. Objek yang Direview</span>
                    </div>

                    {/* Segmented Button: Watched, Read, Listened, Tasted */}
                    <div className="admin-form-group">
                      <label className="admin-label">Apa yang Direview? *</label>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.35rem" }}>
                        {[
                          { val: "Melihat" as const, label: "👁️ Watched", defaultFormat: "Film" },
                          { val: "Membaca" as const, label: "📖 Read", defaultFormat: "Buku" },
                          { val: "Mendengar" as const, label: "🎧 Listened", defaultFormat: "Musik" },
                          { val: "Mengecap" as const, label: "☕ Tasted", defaultFormat: "Kopi" },
                        ].map((s) => (
                          <button
                            key={s.val}
                            type="button"
                            className={`admin-category-btn ${formSense === s.val ? "active" : ""}`}
                            onClick={() => {
                              setFormSense(s.val);
                              setFormItemFormat(s.defaultFormat);
                            }}
                            style={{
                              padding: "0.5rem 0.25rem",
                              textAlign: "center",
                              justifyContent: "center",
                              fontSize: "0.82rem",
                              fontWeight: 600,
                              borderRadius: "6px"
                            }}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Judul Objek */}
                    <div className="admin-form-group">
                      <label className="admin-label">
                        Judul {formSense === "Melihat" ? "Film / Series" : formSense === "Membaca" ? "Buku / Bacaan" : formSense === "Mendengar" ? "Musik / Podcast" : "Kopi / Menu"} *
                      </label>
                      <input
                        type="text"
                        placeholder={
                          formSense === "Melihat"
                            ? "e.g. Dune: Part Two"
                            : formSense === "Membaca"
                            ? "e.g. Atomic Habits"
                            : formSense === "Mendengar"
                            ? "e.g. Random Access Memories"
                            : "e.g. Flores Bajawa V60"
                        }
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="admin-input"
                        required
                      />
                    </div>

                    {/* Gambar Sampul / Poster */}
                    <div className="admin-form-group" style={{ marginBottom: showExtraDetails ? "0.85rem" : 0 }}>
                      <label className="admin-label">URL Gambar Sampul / Poster (Opsional)</label>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        {formImageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={formImageUrl}
                            alt="Thumbnail"
                            style={{ width: "36px", height: "48px", objectFit: "cover", borderRadius: "4px", flexShrink: 0, border: "1px solid var(--border-subtle)" }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        )}
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/... atau URL poster"
                          value={formImageUrl}
                          onChange={(e) => setFormImageUrl(e.target.value)}
                          className="admin-input"
                        />
                        {formImageUrl && (
                          <button
                            type="button"
                            className="admin-btn-sm admin-btn-outline"
                            onClick={() => setFormImageUrl("")}
                            style={{ padding: "0.45rem 0.6rem", whiteSpace: "nowrap" }}
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Tombol Toggle Detail Tambahan (Deskripsi, Kreator, Link) */}
                    <div style={{ marginTop: "0.6rem" }}>
                      <button
                        type="button"
                        onClick={() => setShowExtraDetails(!showExtraDetails)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--text-dim)",
                          fontSize: "0.76rem",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          padding: "0.2rem 0",
                          fontWeight: 600,
                        }}
                      >
                        <span>{showExtraDetails ? "▾ Sembunyikan Detail Tambahan" : "▸ + Tambah Detail Tambahan (Deskripsi, Kreator, Link)"}</span>
                      </button>
                    </div>

                    {/* Form Ekstra Opsional (Tidak mengalihkan fokus) */}
                    {showExtraDetails && (
                      <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px dashed var(--border-subtle)" }}>
                        <div className="admin-form-group">
                          <label className="admin-label">Deskripsi / Sinopsis (Opsional)</label>
                          <textarea
                            rows={2}
                            placeholder="Sinopsis singkat atau info tambahan mengenai karya..."
                            value={formSummary}
                            onChange={(e) => setFormSummary(e.target.value)}
                            className="admin-textarea"
                          />
                        </div>

                        <div className="admin-form-grid">
                          <div className="admin-form-group" style={{ marginBottom: 0 }}>
                            <label className="admin-label">Kreator / Pembuat (Opsional)</label>
                            <input
                              type="text"
                              placeholder={
                                formSense === "Melihat"
                                  ? "e.g. Sutradara / Studio"
                                  : formSense === "Membaca"
                                  ? "e.g. Penulis"
                                  : formSense === "Mendengar"
                                  ? "e.g. Musisi / Host"
                                  : "e.g. Roastery / Asal"
                              }
                              value={formCreator}
                              onChange={(e) => setFormCreator(e.target.value)}
                              className="admin-input"
                            />
                          </div>
                          <div className="admin-form-group" style={{ marginBottom: 0 }}>
                            <label className="admin-label">Tautan Rujukan / Web (Opsional)</label>
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
                  </div>
                </>
              )}

              {/* MEDIA & SAMPUL GAMBAR (Khusus Pengalaman, Karya, Riset, Alat) */}
              {targetType !== "keseharian" && (
                <div className="admin-form-section">
                  <div className="admin-form-section-title">Media & Sampul Gambar (Opsional)</div>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label className="admin-label">
                      URL Gambar Sampul
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
                          <strong>Pratinjau Sampul:</strong>
                          <div>Gambar akan otomatis disesuaikan secara proporsional.</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Modal Sticky Actions */}
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
      <button
        type="button"
        className="admin-mobile-fab"
        onClick={() => handleOpenCreate()}
        title="Tambah Konten Baru"
        aria-label="Tambah Konten Baru"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}

export default function ContentManagerPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-dim)" }}>
          Memuat Pengelola Konten...
        </div>
      }
    >
      <ContentManagerInner />
    </Suspense>
  );
}
