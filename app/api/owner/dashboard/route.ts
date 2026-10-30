import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "OWNER" || !session.user.schoolId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const school = await prisma.school.findUnique({
    where: { id: session.user.schoolId },
    select: { id: true, name: true, slug: true, status: true, createdAt: true },
  });

  if (!school) return NextResponse.json({ message: "Institution not found" }, { status: 404 });

  return NextResponse.json({ school });
}
