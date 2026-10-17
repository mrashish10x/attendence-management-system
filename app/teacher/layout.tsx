"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { TEACHER_NAV } from "@/lib/nav";
import { CURRENT_TEACHER } from "@/data/mock";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell
      navItems={TEACHER_NAV}
      roleLabel="Teacher Panel"
      pageTitle="Teacher Panel"
      user={{ name: CURRENT_TEACHER.name, role: "Teacher", avatarColor: CURRENT_TEACHER.avatarColor }}
      profileHref="/teacher/profile"
    >
      {children}
    </DashboardShell>
  );
}
