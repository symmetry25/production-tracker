import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";
import type { Role } from "@/generated/prisma/enums";

const authConfig = {
  secret:
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    (process.env.NODE_ENV === "production" ? undefined : "development-only-production-tracker-secret"),
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;
      const isSignedIn = Boolean(auth?.user);

      if (pathname === "/login" && isSignedIn) {
        return NextResponse.redirect(new URL("/app", request.url));
      }

      if (pathname.startsWith("/app")) {
        return isSignedIn;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.department = user.department;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        if (typeof token.id === "string") {
          session.user.id = token.id;
        }

        if (isRole(token.role)) {
          session.user.role = token.role;
        }

        session.user.department = typeof token.department === "string" ? token.department : null;
      }

      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;

export default authConfig;

function isRole(value: unknown): value is Role {
  return (
    value === "ADMIN" ||
    value === "PRODUCER" ||
    value === "SUPERVISOR" ||
    value === "ARTIST" ||
    value === "REVIEWER"
  );
}
