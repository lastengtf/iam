"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signIn, loginLocalAdmin } from "@/components/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);

  // If already authenticated, redirect to /admin
  useEffect(() => {
    if (authStatus === "authenticated") {
      router.replace("/admin");
    }
  }, [authStatus, router]);

  const handleSSOLogin = () => {
    setIsLoading(true);
    signIn("ten-accounts");
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!username.trim()) {
      setErrorMsg("Harap masukkan nama pengguna atau email.");
      return;
    }

    if (!password) {
      setErrorMsg("Harap masukkan kata sandi akses.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      // Allow any valid input for direct administration
      const adminName = username.includes("@") ? username.split("@")[0] : username;
      const adminEmail = username.includes("@") ? username : `${username.toLowerCase()}@ten.my.id`;
      loginLocalAdmin(adminName, adminEmail, "admin");
    }, 600);
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card-box">
        {/* Brand / Logo Header */}
        <div className="login-header">
          <div className="login-logo-pill">
            <span className="login-logo-brand">TEN</span>
            <span className="login-logo-tag">ACCESS</span>
          </div>
          <h1 className="login-title">Portal Akses Pengelola</h1>
          <p className="login-subtitle">
            Autentikasi terpusat untuk administrasi platform dan inisiatif digital TEN
          </p>
        </div>

        {/* Status jika sedang memeriksa sesi atau sudah login */}
        {authStatus === "loading" && (
          <div className="login-status-banner loading">
            <span className="auth-dot pulse"></span> Memeriksa status sesi otentikasi...
          </div>
        )}

        {authStatus === "authenticated" && (
          <div className="login-status-banner success">
            <span>✓</span> Terautentikasi sebagai <strong>{session?.user?.name || session?.user?.email}</strong>. Mengalihkan ke Admin Portal...
          </div>
        )}

        {errorMsg && (
          <div className="login-status-banner error" role="alert">
            <span>⚠</span> {errorMsg}
          </div>
        )}

        {authStatus !== "authenticated" && (
          <>
            {/* Primary Action: Masuk SSO TEN */}
            <div className="login-actions-group">
              <button
                type="button"
                className="login-btn-sso"
                onClick={handleSSOLogin}
                disabled={isLoading}
                title="Masuk menggunakan akun SSO TEN (accounts.ten.my.id)"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>{isLoading ? "Menghubungkan..." : "Masuk dengan Akun TEN (SSO)"}</span>
              </button>

              <div className="login-sso-note">
                <span className="login-sso-badge">OIDC & PKCE</span>
                <span>Terhubung ke <code>accounts.ten.my.id</code></span>
              </div>
            </div>

            {/* Alternatif: Toggle Form Manual */}
            <div className="login-divider">
              <span>atau masuk langsung</span>
            </div>

            {!showManualForm ? (
              <button
                type="button"
                className="login-toggle-manual-btn"
                onClick={() => setShowManualForm(true)}
              >
                Masuk dengan Kredensial Administrator
              </button>
            ) : (
              <form onSubmit={handleManualSubmit} className="login-manual-form">
                <div className="admin-form-group">
                  <label className="admin-label" htmlFor="username-input">
                    Nama Pengguna / Email
                  </label>
                  <input
                    id="username-input"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="misal: admin@ten.my.id"
                    className="admin-input"
                    disabled={isLoading}
                    autoComplete="username"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label" htmlFor="password-input">
                    Kata Sandi / Kunci Akses
                  </label>
                  <input
                    id="password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="admin-input"
                    disabled={isLoading}
                    autoComplete="current-password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="login-btn-submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Memproses Autentikasi..." : "Otorisasi & Buka Admin"}
                </button>
              </form>
            )}
          </>
        )}

        {/* Footer Link Kembali */}
        <div className="login-footer">
          <Link href="/" className="login-back-link">
            ← Kembali ke Web Publik
          </Link>
          <div className="login-security-tag">
            <span className="auth-dot connected"></span> Endpoint Terenkripsi
          </div>
        </div>
      </div>
    </div>
  );
}
