import { auth } from "@/auth";
import { redirect } from "next/navigation";

export type AppRole = "ADMIN" | "TEACHER" | "STUDENT";

export async function requireRole(
  allowedRoles: AppRole[]
) {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    redirect("/login");
  }

  const role = session.user.role.toUpperCase() as AppRole;

  if (!allowedRoles.includes(role)) {
    redirect("/unauthorized");
  }

  return session;
}