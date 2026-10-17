"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { STUDENT_NAV } from "@/lib/nav";
import { CURRENT_STUDENT } from "@/data/mock";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell
      navItems={STUDENT_NAV}
      roleLabel="Student Panel"
      pageTitle="Student Panel"
      user={{ name: CURRENT_STUDENT.name, role: "Student", avatarColor: CURRENT_STUDENT.avatarColor }}
      profileHref="/student/profile"
    >
      {children}
    </DashboardShell>
  );
}
