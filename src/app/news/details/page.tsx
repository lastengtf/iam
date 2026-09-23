"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useNewsData } from "@/data/contentStore";
import ShareButton from "@/components/ShareButton";

function NewsDetailContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const { news: newsList } = useNewsData();
  const news = newsList.find((n) => n.slug === slug) || newsList[0];

  return (
    <div style={{ paddingBottom: "2.5rem" }}>
      <div className="detail-top-nav">
        <Link href="/news" className="action-btn-detail">
          ← Kembali ke Kabar & Warta
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ShareButton
            title={`${news.title} — TEN`}
            text={news.summary}
            url={`/news/details?slug=${news.slug}`}
          />
          <Link href="/" className="detail-brand-badge" title="Ke Halaman Utama">
            TEN
          </Link>
        </div>
      </div>

      <article className="content-card-detail">
        {/* Banner Gambar */}
        <div style={{ width: "100%", height: "220px", borderRadius: "var(--radius-md)", overflow: "hidden", marginBottom: "1.5rem", border: "1px solid var(--border-subtle)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={news.imageUrl}
            alt={news.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
          <span className="card-badge-overlay" style={{ position: "static", display: "inline-block" }}>
            {news.category}
          </span>
          <span className="card-period-tag">{news.date}</span>
        </div>

        <h1 style={{ fontSize: "1.65rem", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.3, marginBottom: "0.3rem" }}>
          {news.title}
        </h1>

        <div style={{ fontSize: "0.82rem", color: "var(--text-dim)", fontFamily: "var(--font-mono)", marginBottom: "1.25rem" }}>
          Penulis: {news.author} • Ekosistem TEN
        </div>

        <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1.25rem" }}>
          <p style={{ fontSize: "0.95rem", color: "var(--text-main)", lineHeight: 1.65, marginBottom: "1.25rem", fontStyle: "italic" }}>
            {news.summary}
          </p>

          <div style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.75 }}>
            <p style={{ marginBottom: "1rem" }}>{news.content}</p>
            <p>
              Pembaruan ini merupakan bagian dari komitmen berkelanjutan dalam menyediakan fondasi modular berkecepatan tinggi, aman, dan mudah diintegrasikan untuk kebutuhan digitalisasi organisasi maupun layanan utilitas publik.
            </p>
          </div>
        </div>

        <div style={{ marginTop: "1.75rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
          <Link href="/news" className="action-btn-detail">
            ← Daftar Berita Lainnya
          </Link>
          <Link href="/" className="action-btn-goto">
            Kembali ke Beranda ↗
          </Link>
        </div>
      </article>
    </div>
  );
}

export default function NewsDetailPage() {
  return (
    <Suspense fallback={<div style={{ padding: "3rem 0", textAlign: "center", color: "var(--text-dim)" }}>Memuat detail berita...</div>}>
      <NewsDetailContent />
    </Suspense>
  );
}
