import { Layers, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { CURRENT_TEACHER, CLASSES, studentsByTeacher } from "@/data/mock";
import { pctBadgeClasses } from "@/lib/utils";

export default function TeacherClassesPage() {
  const myClasses = CLASSES.filter((c) => c.name === CURRENT_TEACHER.assignedClass);
  const myStudents = studentsByTeacher(CURRENT_TEACHER.name);

  return (
    <div>
      <PageHeader title="My Classes" description="Classes and sections assigned to you this term." />

      <div className="grid gap-4 sm:grid-cols-2">
        {myClasses.map((c) => (
          <div key={c.id} className="rounded-2xl border border-line bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <Layers className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${pctBadgeClasses(c.attendancePct)}`}>
                {c.attendancePct}% attendance
              </span>
            </div>
            <h3 className="mt-4 font-display font-semibold text-ink">{c.name}</h3>
            <p className="text-sm text-ink-soft/55">Section {c.section}</p>
            <div className="mt-4 flex items-center gap-2 text-sm text-ink-soft/60 pt-4 border-t border-line">
              <Users className="h-4 w-4" />
              {myStudents.filter((s) => s.section === c.section).length} students in this section
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
