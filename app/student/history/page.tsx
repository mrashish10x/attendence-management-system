"use client";

import { useMemo, useState } from "react";
import { History } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { AttendanceStatusBadge } from "@/components/ui/Badge";
import { SelectField } from "@/components/ui/FormField";
import { formatDate } from "@/lib/utils";
import { CURRENT_STUDENT, ATTENDANCE_RECORDS, SUBJECT_LIST } from "@/data/mock";
import type { AttendanceRecord } from "@/types";

export default function StudentHistoryPage() {
  const [subject, setSubject] = useState("all");

  const myRecords = useMemo(
    () =>
      ATTENDANCE_RECORDS.filter(
        (r) => r.studentId === CURRENT_STUDENT.id && (subject === "all" || r.subject === subject)
      ).sort((a, b) => (a.date < b.date ? 1 : -1)),
    [subject]
  );

  const columns: Column<AttendanceRecord>[] = [
    { header: "Date", accessor: (r) => formatDate(r.date) },
    { header: "Subject", accessor: (r) => r.subject },
    { header: "Status", accessor: (r) => <AttendanceStatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Attendance History" description="Your day-by-day attendance record." />

      <div className="mb-4 max-w-xs">
        <SelectField
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          options={[{ label: "All subjects", value: "all" }, ...SUBJECT_LIST.map((s) => ({ label: s, value: s }))]}
        />
      </div>

      <DataTable
        columns={columns}
        rows={myRecords}
        keyField={(r) => r.id}
        emptyState={<EmptyState icon={History} title="No records yet" description="Your attendance history will appear here." />}
      />
    </div>
  );
}
