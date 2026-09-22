"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ScratchpadApp() {
  const [content, setContent] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ten_next_scratchpad") || "";
    }
    return "";
  });
  const [status, setStatus] = useState<string>("Tersimpan secara lokal");

  const handleChange = (val: string) => {
    setContent(val);
    localStorage.setItem("ten_next_scratchpad", val);
    setStatus("Menyimpan...");
    setTimeout(() => setStatus("Tersimpan secara lokal"), 400);
  };

  const handleClear = () => {
    if (confirm("Hapus semua isi scratchpad?")) {
      setContent("");
      localStorage.removeItem("ten_next_scratchpad");
      setStatus("Dibersihkan");
    }
  };

  return (
    <div style={{ paddingBottom: "2.5rem" }}>
      <div className="detail-top-nav">
        <Link href="/projects" className="action-btn-detail">
          ← Kembali ke Karya & Proyek
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <span style={{ fontSize: "0.78rem", color: "var(--mono-gray-mid)", fontFamily: "var(--font-mono)" }}>
            ● {status}
          </span>
          <button onClick={handleClear} className="action-btn-detail" style={{ color: "#ef4444", borderColor: "#fecaca" }}>
            Bersihkan
          </button>
          <Link href="/" className="detail-brand-badge" title="Ke Halaman Utama">
            TEN
          </Link>
        </div>
      </div>

      <div className="content-card" style={{ padding: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "1.75rem" }}>📝</span>
          <div>
            <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-main)" }}>
              Quick Scratchpad (Live App)
            </h1>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Editor catatan instan browser dengan auto-save lokal di localStorage.
            </p>
          </div>
        </div>

        <textarea
          className="scratchpad-area"
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Ketik catatan instan, snippet kode, atau checklist di sini... Perubahan akan otomatis tersimpan di peramban."
          rows={14}
        />
      </div>
    </div>
  );
}
