import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "OWNER" || !session.user.schoolId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const admins = await prisma.user.findMany({
    where: { schoolId: session.user.schoolId, role: "ADMIN" },
    select: { id: true, name: true, email: true, phone: true, status: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ admins });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "OWNER" || !session.user.schoolId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const phone = String(body.phone ?? "").trim();
    const password = String(body.password ?? "");

    if (!name || !email || password.length < 8) {
      return NextResponse.json({ message: "Name, valid email and password (minimum 8 characters) are required." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      return NextResponse.json({ message: "This email is already registered." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const admin = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash,
        role: "ADMIN",
        status: "active",
        schoolId: session.user.schoolId,
      },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });

    return NextResponse.json({ success: true, admin }, { status: 201 });
  } catch (error) {
    console.error("CREATE ADMIN ERROR:", error);
    return NextResponse.json({ message: "Could not create admin." }, { status: 500 });
  }
}
