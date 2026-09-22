interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
  TEN_CLIENT_ID?: string;
  TEN_CLIENT_SECRET?: string;
  AUTH_SECRET?: string;
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
      headers.set("Location", "/");
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
