import { BookMarked } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { CURRENT_STUDENT, SUBJECTS, ATTENDANCE_RECORDS } from "@/data/mock";
import { pctBadgeClasses } from "@/lib/utils";

export default function StudentSubjectsPage() {
  const mySubjects = SUBJECTS.filter((s) => s.className === CURRENT_STUDENT.className);
  const myRecords = ATTENDANCE_RECORDS.filter((r) => r.studentId === CURRENT_STUDENT.id);

  return (
    <div>
      <PageHeader title="Subjects" description="Subjects offered for your class this term." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mySubjects.map((s) => {
          const records = myRecords.filter((r) => r.subject === s.name);
          const present = records.filter((r) => r.status === "present" || r.status === "late").length;
          const pct = records.length ? Math.round((present / records.length) * 100) : 0;
          return (
            <div key={s.id} className="rounded-2xl border border-line bg-white p-5">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <BookMarked className="h-5 w-5" strokeWidth={1.8} />
                </div>
                {records.length > 0 && (
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${pctBadgeClasses(pct)}`}>{pct}%</span>
                )}
              </div>
              <h3 className="mt-4 font-display font-semibold text-ink">{s.name}</h3>
              <p className="text-sm text-ink-soft/55">{s.code}</p>
              <p className="text-sm text-ink-soft/55 mt-1">Taught by {s.teacher}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
