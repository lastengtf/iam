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

    // 6. Default: Layani seluruh file statis dari directory ./out
    return env.ASSETS.fetch(request);
  },
};
