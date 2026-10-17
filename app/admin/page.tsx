import {
  GraduationCap,
  Users,
  Layers,
  CalendarCheck2,
  UserCheck,
  UserX,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { ChartCard } from "@/components/charts/ChartCard";
import { AttendanceBarChart } from "@/components/charts/AttendanceBarChart";
import { AttendanceLineChart } from "@/components/charts/AttendanceLineChart";
import { ClassWiseBarChart } from "@/components/charts/ClassWiseBarChart";
import { Avatar } from "@/components/ui/Avatar";
import {
  STUDENTS,
  TEACHERS,
  CLASSES,
  WEEKLY_ATTENDANCE,
  MONTHLY_ATTENDANCE,
  CLASS_WISE_ATTENDANCE,
  ACTIVITY,
  RECENT_DATES,
  ATTENDANCE_RECORDS,
} from "@/data/mock";

export default function AdminDashboardPage() {
  const today = RECENT_DATES[RECENT_DATES.length - 1];
  const todayRecords = ATTENDANCE_RECORDS.filter((r) => r.date === today);
  const present = todayRecords.filter((r) => r.status === "present" || r.status === "late").length;
  const absent = todayRecords.filter((r) => r.status === "absent").length;
  const todayPct = todayRecords.length ? Math.round((present / todayRecords.length) * 100) : 0;
  const avgAttendance = Math.round(
    STUDENTS.reduce((a, s) => a + s.attendancePct, 0) / STUDENTS.length
  );

  return (
    <div>
      <PageHeader
        title="Welcome back, Rekha"
        description="Here's what's happening across the institution today."
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <DashboardCard label="Total Students" value={STUDENTS.length} icon={GraduationCap} tone="teal" trend={4} />
        <DashboardCard label="Total Teachers" value={TEACHERS.length} icon={Users} tone="gold" trend={0} trendLabel="no change" />
        <DashboardCard label="Total Classes" value={CLASSES.length} icon={Layers} tone="ink" />
        <DashboardCard label="Today's Attendance" value={`${todayPct}%`} icon={CalendarCheck2} tone="teal" trend={2} />
        <DashboardCard label="Present Today" value={present} icon={UserCheck} tone="teal" />
        <DashboardCard label="Absent Today" value={absent} icon={UserX} tone="clay" trend={-3} />
        <DashboardCard label="Average Attendance" value={`${avgAttendance}%`} icon={TrendingUp} tone="gold" trend={1} />
        <DashboardCard label="Active Classes Today" value={CLASSES.length} icon={Layers} tone="ink" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <ChartCard title="Weekly attendance" subtitle="Present vs. absent, last 7 days" className="lg:col-span-2">
          <AttendanceBarChart data={WEEKLY_ATTENDANCE} />
        </ChartCard>
        <ChartCard title="Monthly attendance" subtitle="Institution-wide average">
          <AttendanceLineChart data={MONTHLY_ATTENDANCE} />
        </ChartCard>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <ChartCard title="Class-wise attendance" subtitle="Average attendance by class & section" className="lg:col-span-2">
          <ClassWiseBarChart data={CLASS_WISE_ATTENDANCE} />
        </ChartCard>

        <ChartCard title="Recent activity" subtitle="Latest actions across the platform">
          <div className="space-y-4">
            {ACTIVITY.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <Avatar name={a.actor} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm text-ink leading-snug">
                    <span className="font-medium">{a.actor}</span>{" "}
                    <span className="text-ink-soft/60">{a.action}</span>{" "}
                    <span className="font-medium">{a.target}</span>
                  </p>
                  <p className="text-xs text-ink-soft/40 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
