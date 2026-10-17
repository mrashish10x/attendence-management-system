"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import {
  CalendarCheck2,
  Mail,
  Lock,
  ShieldCheck,
  GraduationCap,
  Users,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

type Role = "admin" | "teacher" | "student";

const ROLES: {
  id: Role;
  label: string;
  icon: typeof ShieldCheck;
  href: string;
}[] = [
  {
    id: "admin",
    label: "Admin",
    icon: ShieldCheck,
    href: "/admin",
  },
  {
    id: "teacher",
    label: "Teacher",
    icon: Users,
    href: "/teacher",
  },
  {
    id: "student",
    label: "Student",
    icon: GraduationCap,
    href: "/student",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  function selectRole(selectedRole: Role) {
    setRole(selectedRole);
  }

  async function handleGoogleLogin() {
    if (googleLoading || loading) return;

    setGoogleLoading(true);

    try {
      await signIn("google", {
        redirectTo: "/auth-redirect",
      });
    } catch (error) {
      console.error("GOOGLE LOGIN ERROR:", error);
      showToast("Could not start Google login.", "error");
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (loading || googleLoading) return;

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        role: role.toUpperCase(),
        redirect: false,
      });

      if (!result || result.error) {
        showToast(
          "Login failed. Check your email, password and selected role.",
          "error"
        );
        return;
      }

      const config = ROLES.find((item) => item.id === role);

      showToast(
        `Welcome back — signed in as ${config?.label || role}`,
        "success"
      );

      router.push(config?.href || "/");
      router.refresh();
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      showToast(
        "Could not complete login. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-sand-50">
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-[46%] lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Link
            href="/"
            className="mb-10 inline-flex items-center gap-2 text-sm text-ink-soft/60 hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <Link href="/" className="mb-8 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-800">
              <CalendarCheck2 className="h-5 w-5 text-white" />
            </span>

            <span className="font-display text-lg font-semibold text-ink">
              Presently
            </span>
          </Link>

          <h1 className="font-display text-2xl font-semibold text-ink">
            Log in to your workspace
          </h1>

          <p className="mt-2 text-sm text-ink-soft/60">
            Select your role and enter your account credentials.
          </p>

          {/* Role selection */}
          <div className="mt-6 grid grid-cols-3 gap-2">
            {ROLES.map((item) => {
              const Icon = item.icon;
              const active = role === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectRole(item.id)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-medium transition-colors",
                    active
                      ? "border-teal-700 bg-teal-50 text-teal-800"
                      : "border-line bg-white text-ink-soft/60 hover:bg-sand-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Email and password login */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                Email
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/40" />

                <input
                  id="login-email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="w-full rounded-lg border border-line bg-white py-2.5 pl-9 pr-3.5 text-sm text-ink focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/30"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/40" />

                <input
                  id="login-password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="w-full rounded-lg border border-line bg-white py-2.5 pl-9 pr-9 text-sm text-ink focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/30"
                />

                <button
                  type="button"
                  aria-label={showPw ? "Hide password" : "Show password"}
                  onClick={() => setShowPw((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft/40 hover:text-ink-soft"
                >
                  {showPw ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-ink-soft/70">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  className="h-4 w-4 rounded border-line text-teal-700 focus:ring-teal-700/30"
                />
                Remember me
              </label>

              <span className="text-xs text-ink-soft/50">
                Secure login
              </span>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={loading}
              disabled={googleLoading}
            >
              Log in as {ROLES.find((item) => item.id === role)?.label}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line" />
            </div>

            <div className="relative flex justify-center text-xs">
              <span className="bg-sand-50 px-3 text-ink-soft/50">
                OR CONTINUE WITH
              </span>
            </div>
          </div>

          {/* Google login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-line bg-white px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-sand-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {googleLoading ? (
              <span>Connecting to Google...</span>
            ) : (
              <>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 48 48"
                  className="h-5 w-5"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 5.38 8.21 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    transform="translate(0 4)"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.88 46.98 31.7 46.98 24.55z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19z"
                    transform="translate(0 4)"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    transform="translate(0 -4)"
                  />
                </svg>

                Continue with Google
              </>
            )}
          </button>

          <p className="mt-6 text-center text-xs text-ink-soft/45">
            Email login uses your local database. Google login requires an
            existing active account.
          </p>
        </div>
      </div>

      {/* Right-side information panel */}
      <div className="relative hidden overflow-hidden bg-teal-950 lg:block lg:w-[54%]">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-teal-600/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl" />

        <div className="relative flex h-full flex-col items-center justify-center px-16 text-center">
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
            Role-based access
          </span>

          <h2 className="mt-5 max-w-md font-display text-3xl font-semibold text-white">
            One login. Three purpose-built panels.
          </h2>

          <p className="mt-4 max-w-sm leading-relaxed text-white/50">
            Admins manage the institution, teachers manage classroom
            attendance, and students track their own attendance records.
          </p>

          <div className="mt-10 grid w-full max-w-md grid-cols-3 gap-4">
            {ROLES.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-5 text-white/70"
                >
                  <Icon className="mx-auto h-5 w-5 text-teal-400" />
                  <p className="mt-2 text-xs font-medium">
                    {item.label} panel
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}