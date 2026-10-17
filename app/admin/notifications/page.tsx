"use client";

import { useState } from "react";
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import { NOTIFICATIONS as INITIAL } from "@/data/mock";

const ICONS = { info: Info, warning: AlertTriangle, success: CheckCircle2 };
const TONE = {
  info: "bg-sand-100 text-ink-soft",
  warning: "bg-gold-100 text-gold-600",
  success: "bg-teal-100 text-teal-800",
};

export default function AdminNotificationsPage() {
  const [items, setItems] = useState(INITIAL);

  return (
    <div>
      <PageHeader
        title="Notifications"
        description={`${items.filter((n) => !n.read).length} unread notifications`}
        actions={
          <Button
            variant="secondary"
            icon={<CheckCheck />}
            onClick={() => setItems((prev) => prev.map((n) => ({ ...n, read: true })))}
          >
            Mark all as read
          </Button>
        }
      />

      {items.length === 0 ? (
        <EmptyState icon={Bell} title="You're all caught up" description="New notifications will show up here." />
      ) : (
        <div className="rounded-2xl border border-line bg-white divide-y divide-line overflow-hidden">
          {items.map((n) => {
            const Icon = ICONS[n.type];
            return (
              <button
                key={n.id}
                onClick={() =>
                  setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
                }
                className={cn(
                  "flex w-full items-start gap-4 px-5 py-4 text-left hover:bg-sand-50 transition-colors",
                  !n.read && "bg-teal-50/40"
                )}
              >
                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", TONE[n.type])}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-ink">{n.title}</p>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-teal-600 shrink-0" />}
                  </div>
                  <p className="text-sm text-ink-soft/60 mt-0.5">{n.description}</p>
                  <p className="text-xs text-ink-soft/40 mt-1.5">{n.time}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
