import { CalendarClock, Users, CalendarCheck2, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { ChartCard } from "@/components/charts/ChartCard";
import { AttendanceDonut } from "@/components/charts/AttendanceDonut";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import {
  CURRENT_TEACHER,
  studentsByTeacher,
  ATTENDANCE_RECORDS,
  RECENT_DATES,
  ACTIVITY,
  SUBJECT_LIST,
} from "@/data/mock";

export default function TeacherDashboardPage() {
  const myStudents = studentsByTeacher(CURRENT_TEACHER.name);
  const today = RECENT_DATES[RECENT_DATES.length - 1];
  const todayRecords = ATTENDANCE_RECORDS.filter(
    (r) => r.date === today && CURRENT_TEACHER.subjects.includes(r.subject)
  );
  const present = todayRecords.filter((r) => r.status === "present").length;
  const late = todayRecords.filter((r) => r.status === "late").length;
  const absent = todayRecords.filter((r) => r.status === "absent").length;
  const avgAttendance = myStudents.length
    ? Math.round(myStudents.reduce((a, s) => a + s.attendancePct, 0) / myStudents.length)
    : 0;

  const todaysClasses = CURRENT_TEACHER.subjects.map((subject, i) => ({
    subject,
    time: i === 0 ? "9:00 AM" : "11:30 AM",
    room: i === 0 ? "Room 204" : "Lab 3",
  }));

  return (
    <div>
      <PageHeader
        title={`Good morning, ${CURRENT_TEACHER.name.replace("Dr. ", "")}`}
        description={`You teach ${CURRENT_TEACHER.subjects.join(" & ")} for ${CURRENT_TEACHER.assignedClass}.`}
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <DashboardCard label="Today's Classes" value={todaysClasses.length} icon={CalendarClock} tone="teal" />
        <DashboardCard label="Total Students" value={myStudents.length} icon={Users} tone="gold" />
        <DashboardCard label="Today's Attendance" value={`${present + late}/${todayRecords.length || myStudents.length}`} icon={CalendarCheck2} tone="teal" />
        <DashboardCard label="Average Attendance" value={`${avgAttendance}%`} icon={TrendingUp} tone="ink" trend={2} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <ChartCard title="Today's schedule" subtitle="Your classes for today" className="lg:col-span-2">
          <div className="space-y-3">
            {todaysClasses.map((c) => (
              <div key={c.subject} className="flex items-center justify-between rounded-xl border border-line bg-sand-50 px-4 py-3.5">
                <div>
                  <p className="text-sm font-medium text-ink">{c.subject}</p>
                  <p className="text-xs text-ink-soft/50 mt-0.5">{CURRENT_TEACHER.assignedClass} · {c.room}</p>
                </div>
                <Badge tone="info">{c.time}</Badge>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-5 border-t border-line">
            <p className="text-sm font-semibold text-ink mb-3">Recent activity</p>
            <div className="space-y-4">
              {ACTIVITY.filter((a) => a.actor === CURRENT_TEACHER.name || a.actor === "Admin").slice(0, 3).map((a) => (
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
          </div>
        </ChartCard>

        <ChartCard title="Today's split" subtitle={SUBJECT_LIST.includes(CURRENT_TEACHER.subject) ? CURRENT_TEACHER.subject : "All subjects"}>
          <div className="flex flex-col items-center">
            <AttendanceDonut present={present} absent={absent} late={late} />
            <div className="mt-5 grid w-full grid-cols-3 gap-2 text-center">
              <div>
                <p className="font-display font-semibold text-teal-700">{present}</p>
                <p className="text-[11px] text-ink-soft/50">Present</p>
              </div>
              <div>
                <p className="font-display font-semibold text-gold-600">{late}</p>
                <p className="text-[11px] text-ink-soft/50">Late</p>
              </div>
              <div>
                <p className="font-display font-semibold text-clay-600">{absent}</p>
                <p className="text-[11px] text-ink-soft/50">Absent</p>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
