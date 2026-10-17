"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, RotateCcw, Save, Check, X, Clock3 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { SelectField } from "@/components/ui/FormField";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { CURRENT_TEACHER, SECTIONS, STUDENTS, RECENT_DATES } from "@/data/mock";
import type { AttendanceStatus } from "@/types";

const TODAY = RECENT_DATES[RECENT_DATES.length - 1];

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; icon: typeof Check }[] = [
  { value: "present", label: "Present", icon: Check },
  { value: "absent", label: "Absent", icon: X },
  { value: "late", label: "Late", icon: Clock3 },
];

export default function MarkAttendancePage() {
  const { showToast } = useToast();
  const [className] = useState(CURRENT_TEACHER.assignedClass);
  const [section, setSection] = useState(SECTIONS[0]);
  const [subject, setSubject] = useState(CURRENT_TEACHER.subjects[0]);
  const [date, setDate] = useState(TODAY);

  const classStudents = useMemo(
    () => STUDENTS.filter((s) => s.className === className && s.section === section),
    [className, section]
  );

  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>(() =>
    Object.fromEntries(classStudents.map((s) => [s.id, "present" as AttendanceStatus]))
  );
  const [saved, setSaved] = useState(false);

  function resetStatusesFor(students: typeof classStudents) {
    setStatuses(Object.fromEntries(students.map((s) => [s.id, "present" as AttendanceStatus])));
    setSaved(false);
  }

  function onSectionChange(newSection: string) {
    setSection(newSection);
    const newStudents = STUDENTS.filter((s) => s.className === className && s.section === newSection);
    resetStatusesFor(newStudents);
  }

  function setStatus(studentId: string, status: AttendanceStatus) {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
    setSaved(false);
  }

  function markAllPresent() {
    setStatuses(Object.fromEntries(classStudents.map((s) => [s.id, "present" as AttendanceStatus])));
    setSaved(false);
    showToast("All students marked present.", "info");
  }

  function reset() {
    resetStatusesFor(classStudents);
    showToast("Attendance sheet reset.", "info");
  }

  function handleSave() {
    setSaved(true);
    showToast(`Attendance saved for ${subject} · Sec ${section} (${classStudents.length} students).`, "success");
  }

  const presentCount = Object.values(statuses).filter((s) => s === "present").length;
  const absentCount = Object.values(statuses).filter((s) => s === "absent").length;
  const lateCount = Object.values(statuses).filter((s) => s === "late").length;

  return (
    <div>
      <PageHeader
        title="Mark Attendance"
        description="Select a class, subject and date, then mark each student."
      />

      <div className="mb-5 grid gap-3 rounded-2xl border border-line bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <SelectField label="Class" value={className} disabled options={[{ label: className, value: className }]} />
        <SelectField
          label="Section"
          value={section}
          onChange={(e) => onSectionChange(e.target.value)}
          options={SECTIONS.map((s) => ({ label: `Section ${s}`, value: s }))}
        />
        <SelectField
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          options={CURRENT_TEACHER.subjects.map((s) => ({ label: s, value: s }))}
        />
        <SelectField
          label="Date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          options={RECENT_DATES.slice()
            .reverse()
            .map((d) => ({ label: d === TODAY ? "Today" : d, value: d }))}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-teal-700 font-medium"><span className="h-1.5 w-1.5 rounded-full bg-teal-600" />{presentCount} Present</span>
          <span className="flex items-center gap-1.5 text-gold-600 font-medium"><span className="h-1.5 w-1.5 rounded-full bg-gold-500" />{lateCount} Late</span>
          <span className="flex items-center gap-1.5 text-clay-600 font-medium"><span className="h-1.5 w-1.5 rounded-full bg-clay-500" />{absentCount} Absent</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" icon={<CheckCircle2 />} onClick={markAllPresent}>
            Mark All Present
          </Button>
          <Button variant="outline" size="sm" icon={<RotateCcw />} onClick={reset}>
            Reset
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-white overflow-hidden">
        <div className="overflow-x-auto scroll-thin">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-sand-50">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-ink-soft/60">Student ID</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-ink-soft/60">Student Name</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-ink-soft/60">Status</th>
              </tr>
            </thead>
            <tbody>
              {classStudents.map((s) => (
                <tr key={s.id} className="border-b border-line last:border-0 hover:bg-sand-50/70">
                  <td className="px-4 py-3.5 text-ink-soft/70">{s.id}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={s.name} color={s.avatarColor} size="sm" />
                      <span className="font-medium text-ink">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="inline-flex rounded-lg border border-line p-0.5 bg-sand-50">
                      {STATUS_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const active = statuses[s.id] === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => setStatus(s.id, opt.value)}
                            className={cn(
                              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                              active
                                ? opt.value === "present"
                                  ? "bg-teal-700 text-white"
                                  : opt.value === "absent"
                                  ? "bg-clay-600 text-white"
                                  : "bg-gold-500 text-white"
                                : "text-ink-soft/50 hover:text-ink"
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end gap-3">
        {saved && <span className="text-xs text-teal-700 font-medium">Saved to this session</span>}
        <Button icon={<Save />} onClick={handleSave}>
          Save Attendance
        </Button>
      </div>
    </div>
  );
}
