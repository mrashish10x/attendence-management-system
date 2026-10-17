"use client";

import { useState } from "react";
import { User, Building2, Palette, BellRing, Check } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { TextField, TextAreaField } from "@/components/ui/FormField";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { CURRENT_ADMIN, INSTITUTION } from "@/data/mock";

const TABS = [
  { id: "profile", label: "Admin Profile", icon: User },
  { id: "institution", label: "Institution", icon: Building2 },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: BellRing },
] as const;

type TabId = (typeof TABS)[number]["id"];

const ACCENTS = [
  { name: "Teal", value: "#1F8460" },
  { name: "Gold", value: "#D2953D" },
  { name: "Clay", value: "#C85B45" },
  { name: "Indigo", value: "#2447A8" },
];

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [tab, setTab] = useState<TabId>("profile");
  const [accent, setAccent] = useState(ACCENTS[0].value);
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [notifPrefs, setNotifPrefs] = useState({
    lowAttendance: true,
    weeklyDigest: true,
    newSignups: false,
    systemAlerts: true,
  });

  function save(label: string) {
    showToast(`${label} saved.`, "success");
  }

  return (
    <div>
      <PageHeader title="Settings" description="Manage your profile, institution and workspace preferences." />

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <div className="flex gap-1.5 overflow-x-auto lg:flex-col lg:overflow-visible">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
                  tab === t.id ? "bg-teal-800 text-white" : "text-ink-soft/65 hover:bg-sand-100"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-line bg-white p-6">
          {tab === "profile" && (
            <div className="space-y-5 max-w-md">
              <div className="flex items-center gap-4">
                <Avatar name={CURRENT_ADMIN.name} color={CURRENT_ADMIN.avatarColor} size="lg" />
                <div>
                  <Button variant="secondary" size="sm">Change photo</Button>
                  <p className="text-xs text-ink-soft/45 mt-1.5">JPG or PNG, up to 2MB.</p>
                </div>
              </div>
              <TextField label="Full name" defaultValue={CURRENT_ADMIN.name} />
              <TextField label="Email" type="email" defaultValue={CURRENT_ADMIN.email} />
              <TextField label="Role" defaultValue={CURRENT_ADMIN.role} disabled />
              <Button onClick={() => save("Profile")}>Save Profile</Button>
            </div>
          )}

          {tab === "institution" && (
            <div className="space-y-5 max-w-md">
              <TextField label="Institution name" defaultValue={INSTITUTION.name} />
              <TextAreaField label="Address" defaultValue={INSTITUTION.address} />
              <div className="grid grid-cols-2 gap-4">
                <TextField label="Established" defaultValue={String(INSTITUTION.established)} />
                <TextField label="Affiliation" defaultValue={INSTITUTION.affiliation} />
              </div>
              <Button onClick={() => save("Institution information")}>Save Institution Info</Button>
            </div>
          )}

          {tab === "appearance" && (
            <div className="space-y-6 max-w-md">
              <div>
                <p className="text-sm font-medium text-ink mb-2.5">Accent color</p>
                <div className="flex gap-2.5">
                  {ACCENTS.map((a) => (
                    <button
                      key={a.value}
                      onClick={() => setAccent(a.value)}
                      className="h-9 w-9 rounded-full flex items-center justify-center ring-2 ring-offset-2 ring-offset-white transition-all"
                      style={{
                        backgroundColor: a.value,
                        // @ts-expect-error css var
                        "--tw-ring-color": accent === a.value ? a.value : "transparent",
                      }}
                      title={a.name}
                    >
                      {accent === a.value && <Check className="h-4 w-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-ink mb-2.5">Layout density</p>
                <div className="flex gap-2.5">
                  {(["comfortable", "compact"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDensity(d)}
                      className={cn(
                        "rounded-lg border px-4 py-2 text-sm font-medium capitalize",
                        density === d ? "border-teal-700 bg-teal-50 text-teal-800" : "border-line text-ink-soft/60"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={() => save("Appearance preferences")}>Save Appearance</Button>
            </div>
          )}

          {tab === "notifications" && (
            <div className="space-y-1 max-w-md">
              {[
                { key: "lowAttendance", label: "Low attendance alerts", hint: "When a student drops below 75%" },
                { key: "weeklyDigest", label: "Weekly digest", hint: "Summary email every Monday" },
                { key: "newSignups", label: "New teacher/student sign-ups", hint: "When a profile is added" },
                { key: "systemAlerts", label: "System alerts", hint: "Maintenance and platform updates" },
              ].map((n) => (
                <label
                  key={n.key}
                  className="flex items-center justify-between gap-4 py-3.5 border-b border-line last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">{n.label}</p>
                    <p className="text-xs text-ink-soft/50 mt-0.5">{n.hint}</p>
                  </div>
                  <button
                    onClick={() =>
                      setNotifPrefs((prev) => ({
                        ...prev,
                        [n.key]: !prev[n.key as keyof typeof prev],
                      }))
                    }
                    className={cn(
                      "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                      notifPrefs[n.key as keyof typeof notifPrefs] ? "bg-teal-700" : "bg-sand-200"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                        notifPrefs[n.key as keyof typeof notifPrefs] ? "translate-x-[22px]" : "translate-x-0.5"
                      )}
                    />
                  </button>
                </label>
              ))}
              <div className="pt-5">
                <Button onClick={() => save("Notification preferences")}>Save Notification Settings</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
