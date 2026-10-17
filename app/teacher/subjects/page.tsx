import { BookOpen } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { CURRENT_TEACHER, SUBJECTS } from "@/data/mock";

export default function TeacherSubjectsPage() {
  const mySubjects = SUBJECTS.filter((s) => CURRENT_TEACHER.subjects.includes(s.name));

  return (
    <div>
      <PageHeader title="My Subjects" description="Subjects you teach this term." />

      <div className="grid gap-4 sm:grid-cols-2">
        {mySubjects.map((s) => (
          <div key={s.id} className="rounded-2xl border border-line bg-white p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-100 text-gold-600">
              <BookOpen className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <h3 className="mt-4 font-display font-semibold text-ink">{s.name}</h3>
            <p className="text-sm text-ink-soft/55">Code: {s.code}</p>
            <p className="text-sm text-ink-soft/55 mt-1">{s.className}</p>
          </div>
        ))}
        {mySubjects.length === 0 && (
          <p className="text-sm text-ink-soft/50">No subjects assigned yet.</p>
        )}
      </div>
    </div>
  );
}
