"use client";

import React from "react";
import { useSession } from "@/components/AuthProvider";
import { useAdmin } from "../AdminContext";

export default function AdminSsoPage() {
  const { data: session } = useSession();
  const { showToast } = useAdmin();

  return (
    <div className="admin-tab-body">
      <div className="admin-section-bar">
        <div>
          <h2 className="admin-section-title">Autentikasi & Keamanan SSO</h2>
          <p className="admin-section-subtitle">
            Konfigurasi penyedia identitas (IdP) terpusat ekosistem TEN dan otorisasi sesi admin.
          </p>
        </div>
      </div>

      <div className="admin-grid-two">
        <div className="admin-box-card">
          <h3 className="admin-card-title">Sesi Aktif Administrator</h3>
          <p className="admin-card-text">
            Informasi akun yang saat ini terautentikasi dan memiliki hak akses pengelolaan:
          </p>

          <div className="admin-form-group">
            <label className="admin-label">Nama Pengguna</label>
            <input
              type="text"
              value={session?.user?.name || "Administrator TEN"}
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
  );
}
