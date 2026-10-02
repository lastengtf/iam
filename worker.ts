interface D1PreparedStatement {
  bind: (...values: unknown[]) => D1PreparedStatement;
  first: <T = unknown>(colName?: string) => Promise<T | null>;
  run: <T = unknown>() => Promise<D1Result<T>>;
  all: <T = unknown>() => Promise<D1Result<T>>;
  raw: <T = unknown>() => Promise<T[]>;
}

interface D1Result<T = unknown> {
  results?: T[];
  success: boolean;
  error?: string;
  meta: Record<string, unknown>;
}

interface D1Database {
  prepare: (query: string) => D1PreparedStatement;
  dump: () => Promise<ArrayBuffer>;
  batch: <T = unknown>(statements: D1PreparedStatement[]) => Promise<D1Result<T>[]>;
  exec: (query: string) => Promise<{ count: number; duration: number }>;
}

interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
  DB?: D1Database;
  TEN_CLIENT_ID?: string;
  TEN_CLIENT_SECRET?: string;
  AUTH_SECRET?: string;
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD?: string;
  ADMIN_NAME?: string;
  ADMIN_EMAIL?: string;
}

interface UserProfile {
  sub?: string;
  name?: string;
  email?: string;
  role?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // 0. Proteksi Akses /admin: Jika belum ada cookie sesi, alihkan langsung ke /login
    if (url.pathname === "/admin" || url.pathname === "/admin/") {
      const cookieHeader = request.headers.get("Cookie") || "";
      if (!cookieHeader.includes("ten_session=")) {
        return Response.redirect(`${url.origin}/login`, 302);
      }
    }

    // 1. Sign In: Arahkan pengguna ke IdP accounts.ten.my.id
    if (url.pathname === "/api/auth/signin" || url.pathname.startsWith("/api/auth/signin/")) {
      const clientId = env.TEN_CLIENT_ID || "iam-app";
      const redirectUri = `${url.origin}/api/auth/callback/ten-accounts`;
      const authUrl = new URL("https://accounts.ten.my.id/api/auth/oauth2/authorize");
      authUrl.searchParams.set("client_id", clientId);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", "openid profile email");
      authUrl.searchParams.set("state", crypto.randomUUID());
      return Response.redirect(authUrl.toString(), 302);
    }

    // 2. Callback OAuth: Tukar code dengan token & ambil profil dari IdP
    if (url.pathname === "/api/auth/callback" || url.pathname === "/api/auth/callback/ten-accounts") {
      const code = url.searchParams.get("code");
      if (!code) {
        return new Response("Missing authorization code", { status: 400 });
      }

      const redirectUri = `${url.origin}/api/auth/callback/ten-accounts`;
      try {
        const tokenRes = await fetch("https://accounts.ten.my.id/api/auth/oauth2/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: redirectUri,
            client_id: env.TEN_CLIENT_ID || "",
            client_secret: env.TEN_CLIENT_SECRET || "",
          }),
        });

        if (!tokenRes.ok) {
          const errText = await tokenRes.text();
          return new Response(`Token exchange failed: ${errText}`, { status: 500 });
        }

        const tokens = (await tokenRes.json()) as { access_token: string };
        const userRes = await fetch("https://accounts.ten.my.id/api/auth/oauth2/userinfo", {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });

        const userProfile = (await userRes.json()) as UserProfile;

        // Simpan sesi dalam cookie HttpOnly
        const sessionPayload = {
          user: {
            id: userProfile.sub,
            name: userProfile.name,
            email: userProfile.email,
            role: userProfile.role || "user",
          },
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };

        const cookieValue = btoa(encodeURIComponent(JSON.stringify(sessionPayload)));
        const isHttps = url.protocol === "https:";
        const headers = new Headers();
        headers.set(
          "Set-Cookie",
          `ten_session=${cookieValue}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${isHttps ? "; Secure" : ""}`
        );
        headers.set("Location", "/admin");
        return new Response(null, { status: 302, headers });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        return new Response(`Authentication error: ${errorMsg}`, { status: 500 });
      }
    }

    // 2.5. Manual Admin Login: Validasi kredensial administrator dari Cloudflare Environment Variables
    if (url.pathname === "/api/auth/login-admin" && request.method === "POST") {
      try {
        const body = (await request.json()) as { username?: string; password?: string };
        const inputUser = (body.username || "").trim().toLowerCase();
        const inputPass = body.password || "";

        // Kredensial dari Cloudflare Environment Variables (Secret / Env)
        const cfUser = (env.ADMIN_USERNAME || env.ADMIN_EMAIL || "admin").trim().toLowerCase();
        const cfPass = env.ADMIN_PASSWORD || "admin123";

        // Periksa apakah username cocok (bisa username lengkap, format email, atau user prefix)
        const isUserMatch =
          inputUser === cfUser ||
          (cfUser.includes("@") && inputUser === cfUser.split("@")[0]) ||
          (!cfUser.includes("@") && inputUser === `${cfUser}@ten.my.id`);

        // Periksa apakah password cocok
        const isPassMatch = inputPass === cfPass;

        if (!isUserMatch || !isPassMatch) {
          return new Response(
            JSON.stringify({
              success: false,
              message: "Nama pengguna atau kata sandi administrator tidak cocok.",
            }),
            {
              status: 401,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        // Kredensial terverifikasi -> buat sesi admin
        const adminName = env.ADMIN_NAME || (cfUser.includes("@") ? cfUser.split("@")[0] : cfUser);
        const adminEmail = cfUser.includes("@") ? cfUser : `${cfUser}@ten.my.id`;

        const sessionPayload = {
          user: {
            id: "admin-cf",
            name: adminName,
            email: adminEmail,
            role: "admin",
          },
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };

        const cookieValue = btoa(encodeURIComponent(JSON.stringify(sessionPayload)));
        const isHttps = url.protocol === "https:";
        const headers = new Headers();
        headers.set("Content-Type", "application/json");
        headers.set(
          "Set-Cookie",
          `ten_session=${cookieValue}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${isHttps ? "; Secure" : ""}`
        );

        return new Response(
          JSON.stringify({
            success: true,
            user: sessionPayload.user,
          }),
          { status: 200, headers }
        );
      } catch {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Format data login tidak valid.",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // 3. Sesi Aktif: Mengembalikan informasi pengguna login
    if (url.pathname === "/api/auth/session") {
      const cookieHeader = request.headers.get("Cookie") || "";
      const match = cookieHeader.match(/ten_session=([^;]+)/);
      if (!match) {
        return new Response(JSON.stringify({ user: null }), {
          headers: { "Content-Type": "application/json" },
        });
      }

      try {
        const decoded = decodeURIComponent(atob(match[1]));
        const session = JSON.parse(decoded);
        return new Response(JSON.stringify(session), {
          headers: { "Content-Type": "application/json" },
        });
      } catch {
        return new Response(JSON.stringify({ user: null }), {
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // 4. Sign Out: Hapus cookie sesi
    if (url.pathname === "/api/auth/signout") {
      const isHttps = url.protocol === "https:";
      const headers = new Headers();
      headers.set(
        "Set-Cookie",
        `ten_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isHttps ? "; Secure" : ""}`
      );
      headers.set("Location", "/login");
      return new Response(null, { status: 302, headers });
    }

    // 5. Providers info
    if (url.pathname === "/api/auth/providers") {
      return new Response(
        JSON.stringify({
          "ten-accounts": {
            id: "ten-accounts",
            name: "TEN Accounts",
            type: "oidc",
            signinUrl: `${url.origin}/api/auth/signin/ten-accounts`,
            callbackUrl: `${url.origin}/api/auth/callback/ten-accounts`,
          },
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // ========================================================
    // 5.5. CLOUDFLARE D1 DATABASE INTEGRATION (tenmyid_db)
    // Database ID: 67f82f52-6f07-457b-b971-861c8b4a15f0
    // ========================================================
    if (url.pathname.startsWith("/api/d1/")) {
      const corsHeaders = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      };

      if (request.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
      }

      const db = env.DB;
      const dbInfo = {
        database_name: "tenmyid_db",
        database_id: "67f82f52-6f07-457b-b971-861c8b4a15f0",
        binding: "DB",
      };

      if (!db) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "D1 Database binding 'DB' is not configured or offline.",
            dbInfo,
          }),
          { status: 503, headers: corsHeaders }
        );
      }

      // Helper initializing tables
      const initTables = async () => {
        try {
          await db.exec(`
            CREATE TABLE IF NOT EXISTS visit_logs (
              id TEXT PRIMARY KEY,
              timestamp TEXT,
              path TEXT,
              page_title TEXT,
              device TEXT,
              browser TEXT,
              os TEXT,
              referrer TEXT,
              session_id TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS sync_store (
              key TEXT PRIMARY KEY,
              data TEXT,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
          `);
        } catch {}
      };

      // 5.5.1. D1 Connection & Status check
      if (url.pathname === "/api/d1/status") {
        await initTables();
        let visitCount = 0;
        let syncCount = 0;
        try {
          const vRes = await db.prepare("SELECT COUNT(*) as cnt FROM visit_logs").first<{ cnt: number }>();
          visitCount = vRes?.cnt || 0;
          const sRes = await db.prepare("SELECT COUNT(*) as cnt FROM sync_store").first<{ cnt: number }>();
          syncCount = sRes?.cnt || 0;
        } catch {}

        return new Response(
          JSON.stringify({
            success: true,
            status: "online",
            message: "Cloudflare D1 Database tenmyid_db is connected and synchronized.",
            dbInfo,
            tables: {
              visit_logs: visitCount,
              sync_store: syncCount,
            },
            timestamp: new Date().toISOString(),
          }),
          { headers: corsHeaders }
        );
      }

      // 5.5.2. Record / Get Visit Logs in D1
      if (url.pathname === "/api/d1/visits") {
        await initTables();

        if (request.method === "POST") {
          try {
            const body = (await request.json()) as {
              id?: string;
              timestamp?: string;
              path?: string;
              pageTitle?: string;
              device?: string;
              browser?: string;
              os?: string;
              referrer?: string;
              sessionId?: string;
            };

            const logId = body.id || `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            await db
              .prepare(
                `INSERT INTO visit_logs (id, timestamp, path, page_title, device, browser, os, referrer, session_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
              )
              .bind(
                logId,
                body.timestamp || new Date().toISOString(),
                body.path || "/",
                body.pageTitle || "Bio",
                body.device || "Desktop",
                body.browser || "Unknown",
                body.os || "Unknown",
                body.referrer || "Direct",
                body.sessionId || "ses_anon"
              )
              .run();

            return new Response(JSON.stringify({ success: true, id: logId }), { headers: corsHeaders });
          } catch (err) {
            return new Response(JSON.stringify({ success: false, error: String(err) }), {
              status: 500,
              headers: corsHeaders,
            });
          }
        }

        // GET visits
        try {
          const totalRes = await db.prepare("SELECT COUNT(*) as cnt FROM visit_logs").first<{ cnt: number }>();
          const recentLogs = await db
            .prepare("SELECT * FROM visit_logs ORDER BY created_at DESC LIMIT 50")
            .all();

          return new Response(
            JSON.stringify({
              success: true,
              total: totalRes?.cnt || 0,
              logs: recentLogs.results || [],
            }),
            { headers: corsHeaders }
          );
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: String(err) }), {
            status: 500,
            headers: corsHeaders,
          });
        }
      }

      // 5.5.3. Content Store Sync in D1
      if (url.pathname === "/api/d1/sync") {
        await initTables();

        if (request.method === "POST") {
          try {
            const body = (await request.json()) as { key: string; data: unknown };
            if (!body.key) {
              return new Response(JSON.stringify({ success: false, message: "Missing key" }), {
                status: 400,
                headers: corsHeaders,
              });
            }

            const dataStr = typeof body.data === "string" ? body.data : JSON.stringify(body.data);
            await db
              .prepare(
                `INSERT INTO sync_store (key, data, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
                 ON CONFLICT(key) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP`
              )
              .bind(body.key, dataStr)
              .run();

            return new Response(JSON.stringify({ success: true, key: body.key }), { headers: corsHeaders });
          } catch (err) {
            return new Response(JSON.stringify({ success: false, error: String(err) }), {
              status: 500,
              headers: corsHeaders,
            });
          }
        }

        // GET sync
        try {
          const key = url.searchParams.get("key");
          if (key) {
            const row = await db.prepare("SELECT * FROM sync_store WHERE key = ?").bind(key).first<{ key: string; data: string; updated_at: string }>();
            return new Response(
              JSON.stringify({
                success: true,
                key,
                data: row ? JSON.parse(row.data) : null,
                updatedAt: row?.updated_at || null,
              }),
              { headers: corsHeaders }
            );
          }

          const allRows = await db.prepare("SELECT key, updated_at FROM sync_store").all();
          return new Response(
            JSON.stringify({
              success: true,
              keys: allRows.results || [],
            }),
            { headers: corsHeaders }
          );
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: String(err) }), {
            status: 500,
            headers: corsHeaders,
          });
        }
      }
    }

    // 6. Default: Layani seluruh file statis dari directory ./out
    return env.ASSETS.fetch(request);
  },
};
