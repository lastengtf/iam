"use client";

import React, { useState, useEffect } from "react";
import { useProfileData } from "@/data/contentStore";
import { useAdmin } from "../AdminContext";

export default function AdminProfilePage() {
  const { profile, updateProfile } = useProfileData();
  const { showToast } = useAdmin();

  const [profileForm, setProfileForm] = useState(profile);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setProfileForm(profile);
    });
    return () => cancelAnimationFrame(frame);
  }, [profile]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profileForm);
    showToast("Pengaturan profil berhasil disimpan & disinkronkan!");
  };

  return (
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
            <label className="admin-label">Nama Lengkap / Inisial Brand</label>
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
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

          <h3 className="admin-card-title" style={{ marginTop: "1.5rem" }}>
            Metrik Angka Profil (Statistik Beranda)
          </h3>
          <div className="admin-form-grid" style={{ gap: "0.5rem" }}>
            {profileForm.stats.map((st, idx) => (
              <div key={idx} className="admin-form-group" style={{ marginBottom: "0.5rem" }}>
                <label className="admin-label" style={{ fontSize: "0.7rem" }}>
                  {st.label} (Nilai)
                </label>
                <input
                  type="text"
                  value={st.value}
                  onChange={(e) => {
                    const newStats = [...profileForm.stats];
                    newStats[idx] = { ...newStats[idx], value: e.target.value };
                    setProfileForm({ ...profileForm, stats: newStats });
                  }}
                  className="admin-input"
                />
              </div>
            ))}
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <button type="submit" className="admin-btn-primary" style={{ width: "100%", justifyContent: "center" }}>
              Simpan Pengaturan Profil
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
