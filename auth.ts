import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

function normalizeEmail(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim()
    .toLowerCase();
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),

    Credentials({
      id: "credentials",
      name: "Email and Password",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
        role: {
          label: "Role",
          type: "text",
        },
      },

      async authorize(credentials) {
        const email = normalizeEmail(
          String(credentials?.email ?? "")
        );

        const password = String(credentials?.password ?? "");
        const role = String(credentials?.role ?? "")
          .trim()
          .toUpperCase();

        if (!email || !password || !role) {
          return null;
        }

        if (!["ADMIN", "TEACHER", "STUDENT"].includes(role)) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              name: true,
              email: true,
              passwordHash: true,
              role: true,
              status: true,
            },
          });

          if (!user || user.status !== "active") {
            return null;
          }

          if (user.role.trim().toUpperCase() !== role) {
            return null;
          }

          // Support bcrypt hashes for newly created accounts.
          // Legacy plaintext passwords are temporarily supported
          // for existing local-development accounts.
          const storedPassword = user.passwordHash;
          let passwordValid = false;

          if (
            storedPassword.startsWith("$2a$") ||
            storedPassword.startsWith("$2b$") ||
            storedPassword.startsWith("$2y$")
          ) {
            passwordValid = await bcrypt.compare(
              password,
              storedPassword
            );
          } else {
            passwordValid = storedPassword === password;
          }

          if (!passwordValid) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("CREDENTIALS AUTHENTICATION ERROR:", error);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async signIn({ account, profile, user }) {
      // Credentials accounts have already been validated by authorize().
      if (account?.provider === "credentials") {
        return Boolean(user?.id && user?.role);
      }

      if (account?.provider !== "google") {
        return false;
      }

      const email = profile?.email?.trim().toLowerCase();

      if (!email || profile?.email_verified !== true) {
        return false;
      }

      try {
        const existingUser = await prisma.user.findFirst({
          where: {
            email,
            status: "active",
          },
          select: {
            id: true,
            role: true,
          },
        });

        return Boolean(existingUser);
      } catch (error) {
        console.error("GOOGLE SIGN-IN DATABASE ERROR:", error);
        return false;
      }
    },

    async jwt({ token, account, user }) {
      if (account?.provider === "credentials" && user) {
        token.userId = user.id;
        token.role = (user as { role?: string }).role;
      }

      if (account?.provider === "google" && token.email) {
        const email = normalizeEmail(token.email);

        try {
          const existingUser = await prisma.user.findFirst({
            where: {
              email,
              status: "active",
            },
            select: {
              id: true,
              role: true,
            },
          });

          if (existingUser) {
            token.userId = existingUser.id;
            token.role = existingUser.role;
          } else {
            token.userId = undefined;
            token.role = undefined;
          }
        } catch (error) {
          console.error("GOOGLE JWT DATABASE ERROR:", error);
          token.userId = undefined;
          token.role = undefined;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.userId && token.role) {
        session.user.id = token.userId;
        session.user.role = token.role;
      }

      return session;
    },
  },
});