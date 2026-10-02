"use client";

import React, { useState, useEffect } from "react";
import { useProfileData } from "@/data/contentStore";
import { ProfileDataType, BioFocusItem, BioPrincipleItem } from "@/data/profileData";
import { useAdmin } from "../AdminContext";

export default function AdminProfilePage() {
  const { profile, updateProfile } = useProfileData();
  const { showToast } = useAdmin();

  const [profileForm, setProfileForm] = useState<ProfileDataType>(profile);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setProfileForm(profile);
    });
    return () => cancelAnimationFrame(frame);
  }, [profile]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profileForm);
    showToast("Pengaturan Bio & Profil Beranda berhasil disimpan!");
  };

  // Helper for paragraphs
  const handleParagraphChange = (idx: number, val: string) => {
    const updated = [...(profileForm.aboutParagraphs || [])];
    updated[idx] = val;
    setProfileForm({ ...profileForm, aboutParagraphs: updated });
  };

  const handleAddParagraph = () => {
    const updated = [...(profileForm.aboutParagraphs || []), ""];
    setProfileForm({ ...profileForm, aboutParagraphs: updated });
  };

  const handleRemoveParagraph = (idx: number) => {
    const updated = (profileForm.aboutParagraphs || []).filter((_, i) => i !== idx);
    setProfileForm({ ...profileForm, aboutParagraphs: updated });
  };

  // Helper for Focus Items
  const handleFocusChange = (idx: number, field: keyof BioFocusItem, val: string) => {
    const updated = [...(profileForm.currentFocus || [])];
    updated[idx] = { ...updated[idx], [field]: val };
    setProfileForm({ ...profileForm, currentFocus: updated });
  };

  const handleAddFocus = () => {
    const newItem: BioFocusItem = {
      id: "focus-" + Date.now(),
      title: "Inisiatif Baru",
      desc: "Deskripsi fokus atau inisiatif yang sedang ditekuni.",
      badge: "Inisiatif",
      icon: "⚡",
    };
    setProfileForm({
      ...profileForm,
      currentFocus: [...(profileForm.currentFocus || []), newItem],
    });
  };

  const handleRemoveFocus = (idx: number) => {
    const updated = (profileForm.currentFocus || []).filter((_, i) => i !== idx);
    setProfileForm({ ...profileForm, currentFocus: updated });
  };

  // Helper for Principles
  const handlePrincipleChange = (idx: number, field: keyof BioPrincipleItem, val: string) => {
    const updated = [...(profileForm.principles || [])];
    updated[idx] = { ...updated[idx], [field]: val };
    setProfileForm({ ...profileForm, principles: updated });
  };

  const handleAddPrinciple = () => {
    const newItem: BioPrincipleItem = {
      id: "pr-" + Date.now(),
      title: "Prinsip Baru",
      desc: "Panduan fundamental dalam merancang dan mengeksekusi karya.",
      icon: "✦",
    };
    setProfileForm({
      ...profileForm,
      principles: [...(profileForm.principles || []), newItem],
    });
  };

  const handleRemovePrinciple = (idx: number) => {
    const updated = (profileForm.principles || []).filter((_, i) => i !== idx);
    setProfileForm({ ...profileForm, principles: updated });
  };

  return (
    <div className="admin-tab-body">
      <div className="admin-section-bar">
        <div>
          <h2 className="admin-section-title">Kelola Bio & Profil Beranda</h2>
          <p className="admin-section-subtitle">
            Atur narasi personal halaman Bio (Beranda), fokus inisiatif, prinsip kerja, serta kontak.
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="admin-form-grid">
        {/* Box 1: Brand & Identitas Utama */}
        <div className="admin-box-card">
          <h3 className="admin-card-title">1. Identitas & Header Profil</h3>

          {/* Avatar Preview */}
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
            <div style={{ flex: 1 }}>
              <label className="admin-label">URL Foto Avatar</label>
              <input
                type="url"
                value={profileForm.avatarUrl}
                onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                className="admin-input"
                placeholder="https://..."
                required
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Nama Inisial / Brand</label>
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
              value={profileForm.fullName || ""}
              onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
              className="admin-input"
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
            <label className="admin-label">Bio Singkat (Tampil di Header)</label>
            <textarea
              rows={3}
              value={profileForm.bio}
              onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
              className="admin-textarea"
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
              placeholder="e.g. Terbuka untuk Kolaborasi & Diskusi"
              required
            />
          </div>
        </div>

        {/* Box 2: Narasi Bio Beranda */}
        <div className="admin-box-card">
          <h3 className="admin-card-title">2. Narasi Bio Beranda (Tentang Saya)</h3>

          <div className="admin-form-group">
            <label className="admin-label">Kalimat Pembuka / Lead Statement</label>
            <textarea
              rows={3}
              value={profileForm.aboutIntro || ""}
              onChange={(e) => setProfileForm({ ...profileForm, aboutIntro: e.target.value })}
              className="admin-textarea"
              placeholder="Pengantar personal yang menggarisbawahi identitas dan visi..."
            />
          </div>

          <div className="admin-form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <label className="admin-label" style={{ margin: 0 }}>Paragraf Narasi Lengkap</label>
              <button
                type="button"
                onClick={handleAddParagraph}
                className="admin-btn-outline"
                style={{ padding: "0.2rem 0.6rem", fontSize: "0.75rem" }}
              >
                + Tambah Paragraf
              </button>
            </div>

            {(profileForm.aboutParagraphs || []).map((p, pIdx) => (
              <div key={pIdx} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <textarea
                  rows={3}
                  value={p}
                  onChange={(e) => handleParagraphChange(pIdx, e.target.value)}
                  className="admin-textarea"
                  style={{ flex: 1 }}
                  placeholder={`Paragraf ke-${pIdx + 1}...`}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveParagraph(pIdx)}
                  className="admin-btn-danger"
                  style={{ alignSelf: "flex-start", padding: "0.4rem 0.6rem" }}
                  title="Hapus paragraf"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <h3 className="admin-card-title" style={{ marginTop: "1.5rem" }}>
            Tautan Kontak & Kanal Komunikasi
          </h3>

          <div className="admin-form-group">
            <label className="admin-label">Alamat Email Korespondensi</label>
            <input
              type="email"
              value={profileForm.contact?.email || ""}
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
              value={profileForm.contact?.website || ""}
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
            <label className="admin-label">Tautan Dokumentasi Panduan</label>
            <input
              type="url"
              value={profileForm.contact?.docsUrl || ""}
              onChange={(e) =>
                setProfileForm({
                  ...profileForm,
                  contact: { ...profileForm.contact, docsUrl: e.target.value },
                })
              }
              className="admin-input"
            />
          </div>
        </div>

        {/* Box 3: Fokus & Inisiatif Saat Ini */}
        <div className="admin-box-card" style={{ gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div>
              <h3 className="admin-card-title" style={{ margin: 0 }}>3. Fokus & Inisiatif Saat Ini</h3>
              <p className="admin-card-text">Daftar kartu fokus yang tampil di halaman Bio (Beranda).</p>
            </div>
            <button
              type="button"
              onClick={handleAddFocus}
              className="admin-btn-outline"
              style={{ padding: "0.35rem 0.8rem", fontSize: "0.82rem" }}
            >
              + Tambah Kartu Fokus
            </button>
          </div>

          <div className="admin-form-grid" style={{ gap: "1rem" }}>
            {(profileForm.currentFocus || []).map((focus, fIdx) => (
              <div key={focus.id || fIdx} className="admin-item-card-preview" style={{ padding: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>Kartu Fokus #{fIdx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFocus(fIdx)}
                    className="admin-btn-danger"
                    style={{ padding: "0.2rem 0.5rem", fontSize: "0.75rem" }}
                  >
                    Hapus
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 120px", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <div>
                    <label className="admin-label" style={{ fontSize: "0.7rem" }}>Icon</label>
                    <input
                      type="text"
                      value={focus.icon || "⚡"}
                      onChange={(e) => handleFocusChange(fIdx, "icon", e.target.value)}
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label className="admin-label" style={{ fontSize: "0.7rem" }}>Judul Fokus</label>
                    <input
                      type="text"
                      value={focus.title}
                      onChange={(e) => handleFocusChange(fIdx, "title", e.target.value)}
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label className="admin-label" style={{ fontSize: "0.7rem" }}>Badge Kategori</label>
                    <input
                      type="text"
                      value={focus.badge || ""}
                      onChange={(e) => handleFocusChange(fIdx, "badge", e.target.value)}
                      className="admin-input"
                      placeholder="e.g. Riset"
                    />
                  </div>
                </div>

                <div>
                  <label className="admin-label" style={{ fontSize: "0.7rem" }}>Deskripsi / Uraian</label>
                  <textarea
                    rows={2}
                    value={focus.desc}
                    onChange={(e) => handleFocusChange(fIdx, "desc", e.target.value)}
                    className="admin-textarea"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Box 4: Prinsip & Nilai Kerja */}
        <div className="admin-box-card" style={{ gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div>
              <h3 className="admin-card-title" style={{ margin: 0 }}>4. Prinsip & Nilai Kerja</h3>
              <p className="admin-card-text">Prinsip filosofi kerja yang ditampilkan di halaman Bio.</p>
            </div>
            <button
              type="button"
              onClick={handleAddPrinciple}
              className="admin-btn-outline"
              style={{ padding: "0.35rem 0.8rem", fontSize: "0.82rem" }}
            >
              + Tambah Prinsip
            </button>
          </div>

          <div className="admin-form-grid" style={{ gap: "1rem" }}>
            {(profileForm.principles || []).map((pr, pIdx) => (
              <div key={pr.id || pIdx} className="admin-item-card-preview" style={{ padding: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>Prinsip #{pIdx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePrinciple(pIdx)}
                    className="admin-btn-danger"
                    style={{ padding: "0.2rem 0.5rem", fontSize: "0.75rem" }}
                  >
                    Hapus
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <div>
                    <label className="admin-label" style={{ fontSize: "0.7rem" }}>Icon</label>
                    <input
                      type="text"
                      value={pr.icon || "✦"}
                      onChange={(e) => handlePrincipleChange(pIdx, "icon", e.target.value)}
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label className="admin-label" style={{ fontSize: "0.7rem" }}>Judul Prinsip</label>
                    <input
                      type="text"
                      value={pr.title}
                      onChange={(e) => handlePrincipleChange(pIdx, "title", e.target.value)}
                      className="admin-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="admin-label" style={{ fontSize: "0.7rem" }}>Deskripsi Nilai</label>
                  <textarea
                    rows={2}
                    value={pr.desc}
                    onChange={(e) => handlePrincipleChange(pIdx, "desc", e.target.value)}
                    className="admin-textarea"
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "2rem" }}>
            <button
              type="submit"
              className="admin-btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "0.85rem 1.5rem", fontSize: "1rem" }}
            >
              Simpan Seluruh Pengaturan Bio & Beranda
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
