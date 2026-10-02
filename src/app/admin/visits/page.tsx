"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useVisitorLogs } from "@/data/visitStore";
import { useAdmin } from "../AdminContext";

export default function AdminVisitsPage() {
  const { logs, totalVisits, stats, clearLogs, addSimulatedVisit } = useVisitorLogs();
  const { showToast, requestConfirm } = useAdmin();

  const [searchQuery, setSearchQuery] = useState("");
  const [deviceFilter, setDeviceFilter] = useState<string>("all");

  const filteredLogs = logs.filter((log) => {
    const matchesDevice = deviceFilter === "all" || log.device === deviceFilter;
    const q = searchQuery.toLowerCase().trim();
    if (!matchesDevice) return false;
    if (!q) return true;

    return (
      log.path.toLowerCase().includes(q) ||
      log.pageTitle.toLowerCase().includes(q) ||
      log.browser.toLowerCase().includes(q) ||
      log.os.toLowerCase().includes(q) ||
      log.referrer.toLowerCase().includes(q) ||
      log.formattedTime.toLowerCase().includes(q)
    );
  });

  const handleClear = () => {
    requestConfirm({
      title: "Konfirmasi Bersihkan Log Kunjungan",
      message: "Apakah Anda yakin ingin mengosongkan seluruh riwayat log kunjungan dan mereset metrik?",
      confirmLabel: "Ya, Bersihkan",
      cancelLabel: "Batal",
      isDanger: true,
      onConfirm: () => {
        clearLogs();
        showToast("Seluruh log kunjungan berhasil dikosongkan.");
      },
    });
  };

  const handleSimulate = () => {
    const paths = ["/", "/karya", "/alat", "/keseharian", "/pengalaman"];
    const randomPath = paths[Math.floor(Math.random() * paths.length)];
    addSimulatedVisit(randomPath);
    showToast(`Kunjungan simulasi baru ke "${randomPath}" berhasil dicatat!`);
  };

  const handleExport = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `ten_visit_logs_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast("Data log kunjungan berhasil diekspor.");
    } catch {
      showToast("Gagal mengekspor data log.");
    }
  };

  return (
    <div className="admin-tab-body">
      <div className="admin-section-bar">
        <div>
          <h2 className="admin-section-title">Log Kunjungan & Metrik Akses</h2>
          <p className="admin-section-subtitle">
            Pencatatan real-time lalu lintas halaman publik, deteksi perangkat, browser, dan metrik otomatis halaman depan.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            className="admin-btn-outline"
            onClick={handleSimulate}
            title="Catat satu kunjungan pengujian baru"
          >
            + Simulasi Kunjungan
          </button>
          <button
            type="button"
            className="admin-btn-outline"
            onClick={handleExport}
            title="Unduh log dalam format JSON"
          >
            📥 Ekspor JSON
          </button>
          <button
            type="button"
            className="admin-btn-danger"
            onClick={handleClear}
            title="Reset seluruh log"
          >
            Bersihkan Log
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="admin-visits-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Total Kunjungan</span>
            <span className="admin-stat-badge">Real Live</span>
          </div>
          <div className="admin-stat-value">{totalVisits}</div>
          <div className="admin-stat-desc">
            Metrik otomatis yang sinkron langsung dengan navbar depan
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Kunjungan Hari Ini</span>
            <span className="admin-stat-badge">Hari Ini</span>
          </div>
          <div className="admin-stat-value">{stats.todayVisits}</div>
          <div className="admin-stat-desc">
            Aktivitas penelusuran tanggal saat ini
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Pengunjung Unik</span>
            <span className="admin-stat-badge">Sesi Unik</span>
          </div>
          <div className="admin-stat-value">{stats.uniqueVisitors}</div>
          <div className="admin-stat-desc">
            Perkiraan perangkat & sesi unik yang terhubung
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Halaman Teratas</span>
            <span className="admin-stat-badge">Populer</span>
          </div>
          <div className="admin-stat-value" style={{ fontSize: "1.2rem", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
            {stats.topPages[0]?.title || "Bio (Beranda)"}
          </div>
          <div className="admin-stat-desc">
            {stats.topPages[0]?.count || 0} tayangan halaman
          </div>
        </div>
      </div>

      {/* Breakdown 2 Kolom: Halaman Terpopuler & Distribusi Perangkat */}
      <div className="admin-grid-two">
        <div className="admin-box-card">
          <h3 className="admin-card-title">Halaman Paling Sering Dikunjungi</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginTop: "0.5rem" }}>
            {stats.topPages.slice(0, 5).map((page) => {
              const maxCount = stats.topPages[0]?.count || 1;
              const pct = Math.round((page.count / maxCount) * 100);
              return (
                <div key={page.path}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "0.2rem" }}>
                    <span style={{ fontWeight: 600 }}>{page.title}</span>
                    <span style={{ color: "var(--text-muted)" }}>
                      <code>{page.path}</code> • <strong>{page.count}</strong> views
                    </span>
                  </div>
                  <div className="admin-bar-progress-wrap">
                    <div className="admin-bar-progress-fill" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="admin-box-card">
          <h3 className="admin-card-title">Distribusi Perangkat & Browser</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginTop: "0.5rem" }}>
            <div>
              <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--mono-gray-mid)" }}>Perangkat:</span>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.35rem" }}>
                {stats.deviceBreakdown.map((dev) => (
                  <span key={dev.device} className="admin-badge-device">
                    {dev.device === "Desktop" ? "💻" : dev.device === "Mobile" ? "📱" : "📟"} {dev.device}: {dev.count} ({dev.percentage}%)
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: "0.5rem" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--mono-gray-mid)" }}>Browser:</span>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.35rem" }}>
                {stats.browserBreakdown.map((b) => (
                  <span key={b.browser} className="admin-badge-browser">
                    🌐 {b.browser}: {b.count} ({b.percentage}%)
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar Filter & Search */}
      <div className="admin-filter-bar">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari log kunjungan berdasarkan halaman, browser, OS, atau waktu..."
          className="admin-filter-input"
        />

        <select
          value={deviceFilter}
          onChange={(e) => setDeviceFilter(e.target.value)}
          className="admin-filter-select"
        >
          <option value="all">Semua Perangkat</option>
          <option value="Desktop">Desktop Only</option>
          <option value="Mobile">Mobile Only</option>
          <option value="Tablet">Tablet Only</option>
        </select>

        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginLeft: "auto" }}>
          Menampilkan <strong>{filteredLogs.length}</strong> dari <strong>{logs.length}</strong> entri
        </span>
      </div>

      {/* Tabel Log Real-Time */}
      <div className="admin-visits-table-wrap">
        <table className="admin-visits-table">
          <thead>
            <tr>
              <th style={{ width: "180px" }}>Waktu Akses</th>
              <th>Halaman Dituju</th>
              <th style={{ width: "130px" }}>Perangkat & OS</th>
              <th style={{ width: "120px" }}>Browser</th>
              <th>Sumber / Referrer</th>
              <th style={{ width: "100px" }}>ID Sesi</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "2.5rem 1rem", color: "var(--text-muted)" }}>
                  Tidak ada catatan log kunjungan yang sesuai dengan filter pencarian.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: "0.78rem", whiteSpace: "nowrap", color: "var(--text-dim)" }}>
                    {log.formattedTime}
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                      <span className="admin-path-pill">{log.path}</span>
                      <span style={{ fontSize: "0.82rem", fontWeight: 500 }}>{log.pageTitle}</span>
                      <Link
                        href={log.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: "0.75rem", textDecoration: "none", color: "var(--text-muted)" }}
                        title="Buka halaman ini di tab baru"
                      >
                        ↗
                      </Link>
                    </div>
                  </td>
                  <td>
                    <span className="admin-badge-device">
                      {log.device === "Desktop" ? "💻" : log.device === "Mobile" ? "📱" : "📟"} {log.os}
                    </span>
                  </td>
                  <td>
                    <span className="admin-badge-browser">
                      🌐 {log.browser}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {log.referrer}
                  </td>
                  <td>
                    <code style={{ fontSize: "0.72rem", color: "var(--mono-gray-mid)" }}>
                      {log.sessionId.slice(0, 10)}
                    </code>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
