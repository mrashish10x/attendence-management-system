import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AuthRedirectPage() {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    redirect("/login");
  }

  const role = session.user.role.toUpperCase();

  if (role === "ADMIN") {
    redirect("/admin");
  }

  if (role === "TEACHER") {
    redirect("/teacher");
  }

  if (role === "STUDENT") {
    redirect("/student");
  }

  redirect("/login");
}