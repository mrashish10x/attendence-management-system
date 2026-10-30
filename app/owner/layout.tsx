import { requireRole } from "@/lib/auth-guard";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["OWNER"]);
  return <>{children}</>;
}
