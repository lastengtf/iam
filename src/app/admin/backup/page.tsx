"use client";

import React, { useRef, useState } from "react";
import {
  useProfileData,
  useProjectsData,
  useWorkData,
  usePublicationsData,
  useStackData,
  useDailyData,
  useNewsData,
  resetAllToDefault,
  pushAllLocalToD1,
  hydrateFromD1,
} from "@/data/contentStore";
import { useAdmin } from "../AdminContext";

export default function AdminBackupPage() {
  const { profile, updateProfile } = useProfileData();
  const { projects, updateProjects } = useProjectsData();
  const { work, updateWork } = useWorkData();
  const { publications, updatePublications } = usePublicationsData();
  const { stack, updateStack } = useStackData();
  const { dailyLogs, updateDailyLogs } = useDailyData();
  const { news, updateNews } = useNewsData();

  const { showToast, requestConfirm } = useAdmin();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Cloudflare D1 Push All Local
  const handlePushToD1 = async () => {
    setIsSyncing(true);
    try {
      const res = await pushAllLocalToD1();
      if (res.success) {
        showToast(`Berhasil mengunggah ${res.count} tabel data lokal ke Cloudflare D1 (tenmyid_db).`);
      } else {
        showToast(res.error ? `Gagal: ${res.error}` : "Gagal mengunggah ke D1.");
      }
    } catch {
      showToast("Terjadi kesalahan saat sinkronisasi ke D1.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Cloudflare D1 Pull
  const handlePullFromD1 = async () => {
    setIsSyncing(true);
    try {
      const res = await hydrateFromD1();
      if (res.success) {
        showToast(res.updated ? `Berhasil menarik ${res.count} tabel dari Cloudflare D1.` : "Data lokal sudah mutakhir dengan Cloudflare D1.");
      } else {
        showToast("Gagal menarik data dari D1 (mungkin offline atau dalam mode lokal).");
      }
    } catch {
      showToast("Terjadi kesalahan saat menarik data dari D1.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Export JSON Backup
  const handleExportJSON = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      platform: "TEN Personal Knowledge Platform",
      profile,
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

  // Import JSON Backup with Confirmation
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        requestConfirm({
          title: "Pulihkan Cadangan Platform",
          message: "Apakah Anda yakin ingin memulihkan data dari berkas cadangan ini? Seluruh data aktif di platform akan disinkronkan dengan isi cadangan.",
          confirmLabel: "Pulihkan Cadangan",
          cancelLabel: "Batal",
          isDanger: true,
          onConfirm: () => {
            if (parsed.profile) updateProfile(parsed.profile);
            if (parsed.projects) updateProjects(parsed.projects);
            if (parsed.work) updateWork(parsed.work);
            if (parsed.publications) updatePublications(parsed.publications);
            if (parsed.stack) updateStack(parsed.stack);
            if (parsed.dailyLogs) updateDailyLogs(parsed.dailyLogs);
            if (parsed.news) updateNews(parsed.news);
            showToast("Data backup berhasil dipulihkan & disinkronkan!");
            if (fileInputRef.current) fileInputRef.current.value = "";
          },
        });
      } catch {
        alert("Gagal membaca berkas JSON. Pastikan format cadangan valid.");
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  // Factory Reset Handler with Confirmation
  const handleResetDefaults = () => {
    requestConfirm({
      title: "Reset ke Pengaturan Awal (Factory Reset)",
      message: "PENTING: Apakah Anda yakin ingin mengembalikan seluruh konten dan profil ke data awal bawaan? Semua modifikasi lokal akan diatur ulang.",
      confirmLabel: "Reset Semua Data",
      cancelLabel: "Batal",
      isDanger: true,
      onConfirm: () => {
        resetAllToDefault();
        showToast("Data platform berhasil diatur ulang ke kondisi awal bawaan.");
      },
    });
  };

  return (
    <div className="admin-tab-body">
      <div className="admin-section-bar">
        <div>
          <h2 className="admin-section-title">Cadangan Data & Reset Platform</h2>
          <p className="admin-section-subtitle">
            Unduh berkas JSON cadangan seluruh platform, pulihkan dari cadangan, atau atur ulang ke data awal.
          </p>
        </div>
      </div>

      <div className="admin-grid-two">
        {/* Export JSON Card */}
        <div className="admin-box-card">
          <h3 className="admin-card-title">Ekspor Cadangan Lengkap (JSON)</h3>
          <p className="admin-card-text">
            Simpan seluruh data profil, karya proyek, riwayat pekerjaan, riset ilmiah, alat, dan catatan keseharian ke dalam satu berkas JSON terstruktur.
          </p>
          <button
            type="button"
            className="admin-btn-primary"
            onClick={handleExportJSON}
          >
            ↓ Unduh Berkas Cadangan JSON
          </button>
        </div>

        {/* Import JSON Card */}
        <div className="admin-box-card">
          <h3 className="admin-card-title">Pulihkan Data dari Berkas JSON</h3>
          <p className="admin-card-text">
            Unggah berkas cadangan JSON yang pernah Anda simpan sebelumnya untuk memulihkan seluruh konten platform:
          </p>
          <label className="admin-btn-outline" style={{ display: "inline-block", cursor: "pointer" }}>
            ↑ Pilih Berkas Cadangan JSON
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: "none" }}
              onChange={handleImportJSON}
            />
          </label>
        </div>
      </div>

      {/* Cloudflare D1 Database Sync Card */}
      <div className="admin-box-card" style={{ marginTop: "1.5rem", border: "1px solid rgba(59, 130, 246, 0.3)", background: "rgba(59, 130, 246, 0.03)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h3 className="admin-card-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>☁️</span> Sinkronisasi Database Cloudflare D1 (Multi-Perangkat)
            </h3>
            <p className="admin-card-text" style={{ maxWidth: "650px", marginBottom: "0.5rem" }}>
              Database Cloudflare D1 (<code>tenmyid_db</code>) menyatukan data di semua browser dan gawai. Perubahan yang Anda simpan di Laptop akan otomatis diunduh saat membuka web di HP atau browser lain.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              type="button"
              className="admin-btn-primary"
              onClick={handlePushToD1}
              disabled={isSyncing}
            >
              {isSyncing ? "Menyinkronkan..." : "☁️ Unggah Semua Data Lokal ke D1"}
            </button>
            <button
              type="button"
              className="admin-btn-outline"
              onClick={handlePullFromD1}
              disabled={isSyncing}
            >
              🔄 Tarik Data Terbaru dari D1
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone: Factory Reset */}
      <div className="admin-box-card danger-zone" style={{ marginTop: "1.5rem" }}>
        <h3 className="admin-card-title" style={{ color: "#ef4444" }}>
          Zona Berbahaya: Reset ke Data Awal Pabrik
        </h3>
        <p className="admin-card-text">
          Tindakan ini akan menghapus seluruh modifikasi lokal di peramban Anda dan memuat kembali data statis bawaan awal ekosistem TEN.
        </p>
        <button
          type="button"
          className="admin-btn-danger"
          onClick={handleResetDefaults}
        >
          Kembalikan ke Kondisi Awal Bawaan
        </button>
      </div>
    </div>
  );
}
