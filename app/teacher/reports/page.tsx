"use client";

import { Download } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { ChartCard } from "@/components/charts/ChartCard";
import { AttendanceBarChart } from "@/components/charts/AttendanceBarChart";
import { AttendanceDonut } from "@/components/charts/AttendanceDonut";
import { useToast } from "@/components/ui/Toast";
import {
  CURRENT_TEACHER,
  studentsByTeacher,
  WEEKLY_ATTENDANCE,
  ATTENDANCE_RECORDS,
} from "@/data/mock";

export default function TeacherReportsPage() {
  const { showToast } = useToast();
  const myStudents = studentsByTeacher(CURRENT_TEACHER.name);
  const myRecords = ATTENDANCE_RECORDS.filter((r) => CURRENT_TEACHER.subjects.includes(r.subject));
  const present = myRecords.filter((r) => r.status === "present").length;
  const late = myRecords.filter((r) => r.status === "late").length;
  const absent = myRecords.filter((r) => r.status === "absent").length;

  const topAttendees = [...myStudents].sort((a, b) => b.attendancePct - a.attendancePct).slice(0, 5);
  const atRisk = [...myStudents].sort((a, b) => a.attendancePct - b.attendancePct).slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Attendance statistics for the classes you teach."
        actions={
          <Button icon={<Download />} onClick={() => showToast("Report export started — UI demo.", "info")}>
            Export Report
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <ChartCard title="Weekly attendance" subtitle="Present vs. absent" className="lg:col-span-2">
          <AttendanceBarChart data={WEEKLY_ATTENDANCE} />
        </ChartCard>
        <ChartCard title="Overall split" subtitle="Across all sessions">
          <div className="flex justify-center">
            <AttendanceDonut present={present} absent={absent} late={late} />
          </div>
        </ChartCard>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <ChartCard title="Most consistent students">
          <ul className="space-y-3">
            {topAttendees.map((s) => (
              <li key={s.id} className="flex items-center justify-between text-sm">
                <span className="text-ink font-medium">{s.name}</span>
                <span className="text-teal-700 font-semibold">{s.attendancePct}%</span>
              </li>
            ))}
          </ul>
        </ChartCard>
        <ChartCard title="Needs attention" subtitle="Lowest attendance in your classes">
          <ul className="space-y-3">
            {atRisk.map((s) => (
              <li key={s.id} className="flex items-center justify-between text-sm">
                <span className="text-ink font-medium">{s.name}</span>
                <span className="text-clay-600 font-semibold">{s.attendancePct}%</span>
              </li>
            ))}
          </ul>
        </ChartCard>
      </div>
    </div>
  );
}
