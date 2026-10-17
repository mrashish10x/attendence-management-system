"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { TextField } from "@/components/ui/FormField";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { CURRENT_TEACHER } from "@/data/mock";

export default function TeacherProfilePage() {
  const { showToast } = useToast();

  return (
    <div>
      <PageHeader title="Profile" description="Your personal and teaching details." />

      <div className="rounded-2xl border border-line bg-white p-6 max-w-lg">
        <div className="flex items-center gap-4 pb-6 border-b border-line">
          <Avatar name={CURRENT_TEACHER.name} color={CURRENT_TEACHER.avatarColor} size="lg" />
          <div>
            <p className="font-display font-semibold text-ink">{CURRENT_TEACHER.name}</p>
            <p className="text-sm text-ink-soft/55">{CURRENT_TEACHER.email}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {CURRENT_TEACHER.subjects.map((s) => (
                <Badge key={s} tone="teal">{s}</Badge>
              ))}
            </div>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            showToast("Profile updated.", "success");
          }}
          className="space-y-4 pt-6"
        >
          <TextField label="Full name" defaultValue={CURRENT_TEACHER.name} />
          <TextField label="Email" type="email" defaultValue={CURRENT_TEACHER.email} />
          <TextField label="Phone" defaultValue={CURRENT_TEACHER.phone} />
          <TextField label="Assigned Class" defaultValue={CURRENT_TEACHER.assignedClass} disabled />
          <Button type="submit">Save Changes</Button>
        </form>
      </div>
    </div>
  );
}
