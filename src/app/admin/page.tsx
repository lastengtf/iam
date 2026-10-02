"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  useProjectsData,
  useWorkData,
  usePublicationsData,
  useStackData,
  useDailyData,
} from "@/data/contentStore";
import { useVisitorLogs } from "@/data/visitStore";

export default function AdminOverviewPage() {
  const { projects } = useProjectsData();
  const { work } = useWorkData();
  const { publications } = usePublicationsData();
  const { stack } = useStackData();
  const { dailyLogs } = useDailyData();
  const { totalVisits, stats } = useVisitorLogs();

  const watchedCount = useMemo(() => dailyLogs.filter((d) => d.category === "Melihat").length, [dailyLogs]);
  const readCount = useMemo(() => dailyLogs.filter((d) => d.category === "Membaca").length, [dailyLogs]);
  const listenedCount = useMemo(() => dailyLogs.filter((d) => d.category === "Mendengar").length, [dailyLogs]);
  const tastedCount = useMemo(() => dailyLogs.filter((d) => d.category === "Mengecap").length, [dailyLogs]);

  const softwareCount = useMemo(() => stack.filter((s) => s.category === "Software & Otomasi").length, [stack]);
  const hardwareCount = useMemo(() => stack.filter((s) => s.category === "Hardware & EDC").length, [stack]);
  const infraCount = useMemo(() => stack.filter((s) => s.category === "Infrastruktur & Cloud").length, [stack]);

  const totalItems = projects.length + work.length + publications.length + stack.length + dailyLogs.length;

  return (
    <div className="admin-tab-body">
      {/* 4 Major Pillars Statistics Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Total Kunjungan</span>
            <span className="admin-stat-badge">Real Live</span>
          </div>
          <div className="admin-stat-value">{totalVisits}</div>
          <div className="admin-stat-desc">
            {stats.todayVisits} kunjungan hari ini • {stats.uniqueVisitors} sesi unik
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Total Inisiatif</span>
            <span className="admin-stat-badge">{totalItems} Total</span>
          </div>
          <div className="admin-stat-value">{totalItems}</div>
          <div className="admin-stat-desc">
            {work.length} Pengalaman • {projects.length + publications.length} Riset/Karya • {stack.length} Alat
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Alat & Review</span>
            <span className="admin-stat-badge">Aktif</span>
          </div>
          <div className="admin-stat-value">{stack.length}</div>
          <div className="admin-stat-desc">
            {softwareCount} Software • {hardwareCount} Hardware • {infraCount} Cloud
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Keseharian</span>
            <span className="admin-stat-badge">Sensory</span>
          </div>
          <div className="admin-stat-value">{dailyLogs.length}</div>
          <div className="admin-stat-desc">
            {watchedCount} Watched • {readCount} Read • {listenedCount} Listened • {tastedCount} Tasted
          </div>
        </div>
      </div>

      <div className="admin-grid-two">
        {/* Quick Action Shortcuts to Kelola Konten & Log */}
        <div className="admin-box-card">
          <h3 className="admin-card-title">Aksi Cepat Pengelolaan</h3>
          <p className="admin-card-text">
            Pilih modul kategori di bawah ini untuk langsung mengelola atau menambah konten:
          </p>
          <div className="admin-quick-actions">
            <Link
              href="/admin/visits"
              className="admin-btn-outline"
              style={{ textDecoration: "none", borderColor: "var(--mono-black)" }}
            >
              👁️ Buka Log Kunjungan Publik ({totalVisits} Hits)
            </Link>
            <Link
              href="/admin/profile"
              className="admin-btn-outline"
              style={{ textDecoration: "none" }}
            >
              👤 Atur Bio & Beranda Personal
            </Link>
            <Link
              href="/admin/content?cat=keseharian&action=create"
              className="admin-btn-outline"
              style={{ textDecoration: "none" }}
            >
              ☕ + Tambah Keseharian (Rating & Review)
            </Link>
            <Link
              href="/admin/content?cat=alat&action=create"
              className="admin-btn-outline"
              style={{ textDecoration: "none" }}
            >
              🛠️ + Tambah Alat (Alat & Reviewku)
            </Link>
            <Link
              href="/admin/content?cat=pengalaman&action=create"
              className="admin-btn-outline"
              style={{ textDecoration: "none" }}
            >
              💼 + Tambah Riwayat Pengalaman
            </Link>
            <Link
              href="/admin/content?cat=riset-karya&action=create&type=projects"
              className="admin-btn-outline"
              style={{ textDecoration: "none" }}
            >
              🚀 + Tambah Karya / Proyek
            </Link>
            <Link
              href="/admin/content"
              className="admin-btn-primary"
              style={{ textDecoration: "none", textAlign: "center" }}
            >
              Buka Semua Tabel Konten →
            </Link>
          </div>
        </div>

        {/* Runtime & Infrastructure Environment */}
        <div className="admin-box-card">
          <h3 className="admin-card-title">Infrastruktur & Lingkungan Komputasi</h3>
          <ul className="admin-info-list">
            <li><strong>Runtime Host:</strong> Cloudflare Workers (Edge Static Assets)</li>
            <li><strong>Framework:</strong> Next.js 16 (App Router • Turbopack Build)</li>
            <li><strong>Struktur Route:</strong> Root terpusat di <code>/admin/*</code></li>
            <li><strong>Sinkronisasi:</strong> Reaktif Otomatis (External Store Cross-Tab)</li>
            <li><strong>Autentikasi:</strong> OpenID Connect (OIDC PKCE) via accounts.ten.my.id</li>
            <li><strong>Penyimpanan:</strong> Persistent Cache Lokal + Impor/Ekspor JSON</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
