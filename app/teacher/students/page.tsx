"use client";

import { useState } from "react";
import { Search, GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/Badge";
import { CURRENT_TEACHER, studentsByTeacher } from "@/data/mock";
import { pctBadgeClasses } from "@/lib/utils";
import type { Student } from "@/types";

export default function TeacherStudentsPage() {
  const [search, setSearch] = useState("");
  const students = studentsByTeacher(CURRENT_TEACHER.name).filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Student>[] = [
    {
      header: "Student",
      accessor: (s) => (
        <div className="flex items-center gap-3 min-w-[180px]">
          <Avatar name={s.name} color={s.avatarColor} size="sm" />
          <div>
            <p className="font-medium text-ink">{s.name}</p>
            <p className="text-xs text-ink-soft/50">{s.email}</p>
          </div>
        </div>
      ),
    },
    { header: "Roll No.", accessor: (s) => s.rollNo },
    { header: "Section", accessor: (s) => `Sec ${s.section}` },
    {
      header: "Attendance",
      accessor: (s) => (
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${pctBadgeClasses(s.attendancePct)}`}>
          {s.attendancePct}%
        </span>
      ),
    },
    { header: "Status", accessor: (s) => <StatusBadge status={s.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Students" description={`${students.length} students in your assigned classes`} />

      <div className="mb-4 flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink-soft/50 max-w-sm">
        <Search className="h-4 w-4" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search students…"
          className="w-full bg-transparent outline-none placeholder:text-ink-soft/40 text-ink"
        />
      </div>

      <DataTable
        columns={columns}
        rows={students}
        keyField={(s) => s.id}
        emptyState={<EmptyState icon={GraduationCap} title="No students found" description="Try a different search." />}
      />
    </div>
  );
}
