import NextAuth from "next-auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "development-local-auth-secret-key-32charsmin",
  providers: [
    {
      id: "ten-accounts",
      name: "TEN Accounts",
      type: "oidc",
      issuer: process.env.TEN_ISSUER || "https://accounts.ten.my.id/api/auth",
      wellKnown: `${process.env.TEN_ISSUER || "https://accounts.ten.my.id/api/auth"}/.well-known/openid-configuration`,
      clientId: process.env.TEN_CLIENT_ID,
      clientSecret: process.env.TEN_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
    },
  ],
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        token.role = (profile as Record<string, unknown>).role as string | undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string | undefined;
      }
      return session;
    },
  },
});
