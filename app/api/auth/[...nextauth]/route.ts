import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "demo_google_client_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "demo_google_client_secret",
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "fallback_sync_auth_secret_32_characters_long",
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user && token?.sub) {
        // Attach unique user ID to session
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
