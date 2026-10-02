"use client";

import React, { useRef } from "react";
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
