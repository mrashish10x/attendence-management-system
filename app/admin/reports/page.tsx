"use client";

import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { ChartCard } from "@/components/charts/ChartCard";
import { AttendanceBarChart } from "@/components/charts/AttendanceBarChart";
import { AttendanceLineChart } from "@/components/charts/AttendanceLineChart";
import { ClassWiseBarChart } from "@/components/charts/ClassWiseBarChart";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { pctBadgeClasses, cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import {
  WEEKLY_ATTENDANCE,
  MONTHLY_ATTENDANCE,
  CLASS_WISE_ATTENDANCE,
  STUDENTS,
  SUBJECTS,
  ATTENDANCE_RECORDS,
  RECENT_DATES,
} from "@/data/mock";
import type { Student, Subject } from "@/types";

const TABS = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "student", label: "Student-wise" },
  { id: "class", label: "Class-wise" },
  { id: "subject", label: "Subject-wise" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ReportsPage() {
  const { showToast } = useToast();
  const [tab, setTab] = useState<TabId>("weekly");

  function exportReport(label: string) {
    showToast(`${label} report export started — this is a UI demo.`, "info");
  }

  const studentColumns: Column<Student>[] = [
    { header: "Student", accessor: (s) => s.name },
    { header: "Class", accessor: (s) => s.className.replace("B.Tech ", "") },
    {
      header: "Attendance %",
      accessor: (s) => (
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${pctBadgeClasses(s.attendancePct)}`}>
          {s.attendancePct}%
        </span>
      ),
    },
  ];

  const subjectAttendance = SUBJECTS.map((sub) => {
    const records = ATTENDANCE_RECORDS.filter((r) => r.subject === sub.name);
    const present = records.filter((r) => r.status === "present" || r.status === "late").length;
    const pct = records.length ? Math.round((present / records.length) * 100) : 0;
    return { ...sub, pct, sessions: records.length };
  });

  const subjectColumns: Column<Subject & { pct: number; sessions: number }>[] = [
    { header: "Subject", accessor: (s) => s.name },
    { header: "Code", accessor: (s) => s.code },
    { header: "Sessions Logged", accessor: (s) => s.sessions },
    {
      header: "Attendance %",
      accessor: (s) => (
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${pctBadgeClasses(s.pct)}`}>{s.pct}%</span>
      ),
    },
  ];

  const dailyRecords = ATTENDANCE_RECORDS.filter((r) => r.date === RECENT_DATES[RECENT_DATES.length - 1]);
  const dailyPresent = dailyRecords.filter((r) => r.status === "present" || r.status === "late").length;

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Generate and review attendance reports across every dimension."
        actions={
          <Button icon={<Download />} onClick={() => exportReport(TABS.find((t) => t.id === tab)!.label)}>
            Export {TABS.find((t) => t.id === tab)!.label} Report
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap gap-1.5 rounded-xl border border-line bg-white p-1.5 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
              tab === t.id ? "bg-teal-800 text-white" : "text-ink-soft/60 hover:bg-sand-100"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "daily" && (
        <ChartCard title="Today's attendance" subtitle={`${dailyPresent} of ${dailyRecords.length} sessions marked present`}>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-sand-50 border border-line p-4">
              <p className="text-xs text-ink-soft/50">Sessions Logged</p>
              <p className="font-display text-2xl font-semibold text-ink mt-1">{dailyRecords.length}</p>
            </div>
            <div className="rounded-xl bg-sand-50 border border-line p-4">
              <p className="text-xs text-ink-soft/50">Present / Late</p>
              <p className="font-display text-2xl font-semibold text-teal-700 mt-1">{dailyPresent}</p>
            </div>
            <div className="rounded-xl bg-sand-50 border border-line p-4">
              <p className="text-xs text-ink-soft/50">Attendance %</p>
              <p className="font-display text-2xl font-semibold text-ink mt-1">
                {dailyRecords.length ? Math.round((dailyPresent / dailyRecords.length) * 100) : 0}%
              </p>
            </div>
          </div>
        </ChartCard>
      )}

      {tab === "weekly" && (
        <ChartCard title="Weekly attendance report" subtitle="Present vs. absent over the last 7 days">
          <AttendanceBarChart data={WEEKLY_ATTENDANCE} />
        </ChartCard>
      )}

      {tab === "monthly" && (
        <ChartCard title="Monthly attendance report" subtitle="Institution average across the semester">
          <AttendanceLineChart data={MONTHLY_ATTENDANCE} />
        </ChartCard>
      )}

      {tab === "student" && (
        <DataTable columns={studentColumns} rows={STUDENTS} keyField={(s) => s.id} />
      )}

      {tab === "class" && (
        <ChartCard title="Class-wise attendance report" subtitle="Average attendance by class & section">
          <ClassWiseBarChart data={CLASS_WISE_ATTENDANCE} />
        </ChartCard>
      )}

      {tab === "subject" && (
        <DataTable columns={subjectColumns} rows={subjectAttendance} keyField={(s) => s.id} />
      )}

      <div className="mt-4 flex items-center gap-2 text-xs text-ink-soft/40">
        <FileText className="h-3.5 w-3.5" />
        Export buttons are UI-only in this frontend demo.
      </div>
    </div>
  );
}
