"use client";

import { useMemo, useState } from "react";
import { History } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { SelectField } from "@/components/ui/FormField";
import { pctBadgeClasses, formatDate } from "@/lib/utils";
import { CURRENT_TEACHER, ATTENDANCE_SESSIONS, SECTIONS } from "@/data/mock";
import type { AttendanceSessionSummary } from "@/types";

export default function AttendanceHistoryPage() {
  const [section, setSection] = useState("all");
  const [subject, setSubject] = useState("all");

  const sessions = useMemo(
    () =>
      ATTENDANCE_SESSIONS.filter(
        (s) =>
          s.className === CURRENT_TEACHER.assignedClass &&
          CURRENT_TEACHER.subjects.includes(s.subject) &&
          (section === "all" || s.section === section) &&
          (subject === "all" || s.subject === subject)
      ),
    [section, subject]
  );

  const columns: Column<AttendanceSessionSummary>[] = [
    { header: "Date", accessor: (s) => formatDate(s.date) },
    { header: "Class", accessor: (s) => `${s.className.replace("B.Tech ", "")} · Sec ${s.section}` },
    { header: "Subject", accessor: (s) => s.subject },
    { header: "Present", accessor: (s) => <span className="text-teal-700 font-medium">{s.present}</span> },
    { header: "Absent", accessor: (s) => <span className="text-clay-600 font-medium">{s.absent}</span> },
    {
      header: "Percentage",
      accessor: (s) => (
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${pctBadgeClasses(s.percentage)}`}>
          {s.percentage}%
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Attendance History" description="Previous sessions you've recorded attendance for." />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 max-w-md">
        <SelectField
          label="Section"
          value={section}
          onChange={(e) => setSection(e.target.value)}
          options={[{ label: "All sections", value: "all" }, ...SECTIONS.map((s) => ({ label: `Section ${s}`, value: s }))]}
        />
        <SelectField
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          options={[
            { label: "All subjects", value: "all" },
            ...CURRENT_TEACHER.subjects.map((s) => ({ label: s, value: s })),
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        rows={sessions}
        keyField={(s) => s.id}
        emptyState={
          <EmptyState icon={History} title="No history yet" description="Sessions you mark will appear here." />
        }
      />
    </div>
  );
}
