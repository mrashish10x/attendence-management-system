import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

function normalizeEmail(value: string) {
return value.normalize("NFKC").replace(/[\u200B-\u200D\uFEFF]/g, "").trim().toLowerCase();
}

export const { handlers, auth, signIn, signOut } = NextAuth({
trustHost: true,

providers: [
Google({
clientId: process.env.AUTH_GOOGLE_ID,
clientSecret: process.env.AUTH_GOOGLE_SECRET,
}),
Credentials({
id: "credentials",
name: "Email and Password",
credentials: {
email: { label: "Email", type: "email" },
password: { label: "Password", type: "password" },
role: { label: "Role", type: "text" },
},
async authorize(credentials) {
const email = normalizeEmail(String(credentials?.email ?? ""));
const password = String(credentials?.password ?? "");
const requestedRole = String(credentials?.role ?? "").trim().toUpperCase();

    if (!email || !password) return null;

    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user || user.status !== "active") return null;

      const validRoles = ["OWNER", "ADMIN", "TEACHER", "STUDENT"];
      if (!validRoles.includes(user.role.toUpperCase())) return null;

      // OWNER is allowed through the existing Admin login selection.
      if (
        requestedRole &&
        requestedRole !== user.role.toUpperCase() &&
        !(requestedRole === "ADMIN" && user.role.toUpperCase() === "OWNER")
      ) return null;

      const hash = user.passwordHash;
      const passwordValid =
        hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$")
          ? await bcrypt.compare(password, hash)
          : hash === password;

      if (!passwordValid) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
      };
    } catch (error) {
      console.error("AUTH ERROR:", error);
      return null;
    }
  },
}),

],

session: { strategy: "jwt" },
pages: { signIn: "/login" },

callbacks: {
async signIn({ account, profile, user }) {
if (account?.provider === "credentials") return Boolean(user?.id && user?.role);
if (account?.provider !== "google") return false;

  const email = profile?.email?.trim().toLowerCase();
  if (!email || profile?.email_verified !== true) return false;

  const existing = await prisma.user.findFirst({
    where: { email: normalizeEmail(email), status: "active" },
    select: { id: true },
  });
  return Boolean(existing);
},

async jwt({ token, account, user }) {
  if (account?.provider === "credentials" && user) {
    const u = user as typeof user & { role?: string; schoolId?: string | null };
    token.userId = user.id;
    token.role = u.role;
    token.schoolId = u.schoolId ?? null;
  }

  if (account?.provider === "google" && token.email) {
    const existing = await prisma.user.findFirst({
      where: { email: normalizeEmail(token.email), status: "active" },
      select: { id: true, role: true, schoolId: true },
    });
    token.userId = existing?.id;
    token.role = existing?.role;
    token.schoolId = existing?.schoolId ?? null;
  }
  return token;
},

async session({ session, token }) {
  if (session.user && token.userId && token.role) {
    session.user.id = token.userId;
    session.user.role = String(token.role);
    session.user.schoolId = typeof token.schoolId === "string" ? token.schoolId : null;
  }
  return session;
},

},
});
