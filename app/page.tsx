import Link from "next/link";
import {
  ClipboardCheck,
  LineChart,
  FileBarChart2,
  GraduationCap,
  Users,
  ShieldCheck,
  ArrowRight,
  UserPlus,
  CalendarClock,
  BarChart3,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { HeroMock } from "@/components/landing/HeroMock";
import { STUDENTS, TEACHERS, CLASSES } from "@/data/mock";

const FEATURES = [
  {
    icon: ClipboardCheck,
    title: "Easy attendance",
    description:
      "Teachers mark a full class in under a minute with roll-call, bulk actions and keyboard shortcuts.",
  },
  {
    icon: LineChart,
    title: "Real-time dashboard",
    description:
      "Admins see today's attendance, class trends and at-risk students the moment they log in.",
  },
  {
    icon: FileBarChart2,
    title: "Attendance reports",
    description:
      "Daily, weekly, monthly, student-wise and class-wise reports, ready to review or export.",
  },
  {
    icon: GraduationCap,
    title: "Student management",
    description:
      "Keep every student's profile, class, section and attendance history in one place.",
  },
  {
    icon: Users,
    title: "Teacher management",
    description:
      "Assign classes and subjects, and track each teacher's attendance-marking activity.",
  },
  {
    icon: ShieldCheck,
    title: "Secure role-based panels",
    description:
      "Admins, teachers and students each get a dedicated panel scoped to what they need to see.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Set up your institution",
    description: "Add classes, sections, subjects and teachers — or import them in bulk.",
  },
  {
    number: "02",
    title: "Mark attendance in class",
    description: "Teachers open Mark Attendance, tap present, absent or late, and save.",
  },
  {
    number: "03",
    title: "Track and report",
    description: "Admins and students see live percentages, trends and downloadable reports.",
  },
];

export default function LandingPage() {
  const avgAttendance = Math.round(
    STUDENTS.reduce((a, s) => a + s.attendancePct, 0) / STUDENTS.length
  );
  const activeStudents = STUDENTS.filter((s) => s.status === "active").length;

  const STATS = [
    { label: "Students tracked", value: STUDENTS.length, icon: GraduationCap },
    { label: "Teaching staff", value: TEACHERS.length, icon: Users },
    { label: "Classes & sections", value: CLASSES.length, icon: CalendarClock },
    { label: "Avg. attendance", value: `${avgAttendance}%`, icon: BarChart3 },
  ];

  return (
    <div id="home" className="flex flex-col min-h-screen">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24 grid lg:grid-cols-2 gap-14 items-center">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-ink-soft/70">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
              Built for schools & colleges
            </span>
            <h1 className="font-display mt-5 text-4xl sm:text-5xl font-semibold leading-[1.08] text-ink text-balance">
              Attendance, without the paperwork.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-ink-soft/70 max-w-lg leading-relaxed">
              Presently gives admins, teachers and students one clear, role-based
              home for every roll call — mark it, track it and report on it, in
              minutes instead of hours.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-teal-800 px-5 py-3 text-sm font-medium text-white hover:bg-teal-900 transition-colors"
              >
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-5 py-3 text-sm font-medium text-ink hover:bg-sand-100 transition-colors"
              >
                Explore features
              </a>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-ink-soft/60">
              <div>
                <span className="font-display text-xl font-semibold text-ink">{activeStudents}</span>
                <span className="block text-xs">active students</span>
              </div>
              <div className="h-8 w-px bg-line" />
              <div>
                <span className="font-display text-xl font-semibold text-ink">{TEACHERS.length}</span>
                <span className="block text-xs">teachers onboard</span>
              </div>
              <div className="h-8 w-px bg-line" />
              <div>
                <span className="font-display text-xl font-semibold text-ink">{avgAttendance}%</span>
                <span className="block text-xs">avg. attendance</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <HeroMock />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl font-semibold text-ink">
            Everything a campus needs to run attendance
          </h2>
          <p className="mt-3 text-ink-soft/65 leading-relaxed">
            One platform, three panels — each built around what that person
            actually needs to do each day.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-line bg-white p-6 hover:border-teal-700/30 hover:shadow-sm transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <f.icon className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <h3 className="mt-4 font-display font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm text-ink-soft/60 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-y border-line bg-white">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-semibold text-ink">How it works</h2>
            <p className="mt-3 text-ink-soft/65 leading-relaxed">
              Three steps from a blank institution to a fully tracked classroom.
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.number} className="relative">
                <span className="font-display text-4xl font-semibold text-teal-700/25">
                  {s.number}
                </span>
                <h3 className="mt-3 font-display font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm text-ink-soft/60 leading-relaxed">{s.description}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden sm:block absolute top-5 left-[calc(100%+1rem)] w-8 border-t border-dashed border-line" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="about" className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-2xl border border-line bg-white p-6">
              <s.icon className="h-5 w-5 text-teal-700" strokeWidth={1.8} />
              <p className="font-display mt-4 text-3xl font-semibold text-ink">{s.value}</p>
              <p className="mt-1 text-sm text-ink-soft/55">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-ink-soft/40">
          Figures reflect this demo workspace and update as data changes.
        </p>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-20 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-teal-950 px-8 py-14 text-center sm:px-16">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-teal-600/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-gold-500/10 blur-3xl" />
          <div className="relative">
            <UserPlus className="mx-auto h-8 w-8 text-teal-400" />
            <h2 className="font-display mt-4 text-3xl font-semibold text-white">
              Ready to see it on your own classes?
            </h2>
            <p className="mt-3 text-white/55 max-w-md mx-auto">
              Log in with any of the three demo roles and explore the full
              attendance workflow — no setup required.
            </p>
            <Link
              href="/login"
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-teal-950 hover:bg-sand-100 transition-colors"
            >
              Try the live demo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
