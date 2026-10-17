"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { TextField } from "@/components/ui/FormField";
import { useToast } from "@/components/ui/Toast";
import { CURRENT_STUDENT } from "@/data/mock";

export default function StudentProfilePage() {
  const { showToast } = useToast();

  return (
    <div>
      <PageHeader title="Profile" description="Your personal and academic details." />

      <div className="rounded-2xl border border-line bg-white p-6 max-w-lg">
        <div className="flex items-center gap-4 pb-6 border-b border-line">
          <Avatar name={CURRENT_STUDENT.name} color={CURRENT_STUDENT.avatarColor} size="lg" />
          <div>
            <p className="font-display font-semibold text-ink">{CURRENT_STUDENT.name}</p>
            <p className="text-sm text-ink-soft/55">{CURRENT_STUDENT.email}</p>
            <p className="text-xs text-ink-soft/45 mt-1">
              {CURRENT_STUDENT.className} · Section {CURRENT_STUDENT.section} · Roll No. {CURRENT_STUDENT.rollNo}
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            showToast("Profile updated.", "success");
          }}
          className="space-y-4 pt-6"
        >
          <TextField label="Full name" defaultValue={CURRENT_STUDENT.name} />
          <TextField label="Email" type="email" defaultValue={CURRENT_STUDENT.email} />
          <TextField label="Phone" defaultValue={CURRENT_STUDENT.phone} />
          <TextField label="Guardian name" defaultValue={CURRENT_STUDENT.guardianName} />
          <Button type="submit">Save Changes</Button>
        </form>
      </div>
    </div>
  );
}
