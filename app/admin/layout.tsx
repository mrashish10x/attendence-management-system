import { requireRole } from "@/lib/auth-guard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ADMIN_NAV } from "@/lib/nav";
import { CURRENT_ADMIN } from "@/data/mock";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["ADMIN"]);

  return (
    <DashboardShell
      navItems={ADMIN_NAV}
      roleLabel="Admin Panel"
      pageTitle="Admin Panel"
      user={{
        name: CURRENT_ADMIN.name,
        role: "Admin",
        avatarColor: CURRENT_ADMIN.avatarColor,
      }}
      profileHref="/admin/settings"
    >
      {children}
    </DashboardShell>
  );
}
