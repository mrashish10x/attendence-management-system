import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function getTeacher() {
  const session = await auth();

  if (!session?.user?.id || session.user.role?.toUpperCase() !== "TEACHER" || !session.user.schoolId) {
    return null;
  }

  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
    select: { id: true, user: { select: { schoolId: true } } },
  });

  if (!teacher || teacher.user.schoolId !== session.user.schoolId) return null;

  return { teacher, schoolId: session.user.schoolId };
}

export async function GET() {
  try {
    const access = await getTeacher();
    if (!access) return Response.json({ message: "Unauthorized" }, { status: 403 });

    const [students, classes] = await Promise.all([
      prisma.student.findMany({
        where: { schoolClass: { is: { schoolId: access.schoolId } } },
        select: {
          id: true,
          rollNo: true,
          guardianName: true,
          user: { select: { name: true, email: true } },
          schoolClass: { select: { name: true, section: true } },
        },
        orderBy: { rollNo: "asc" },
      }),
      prisma.schoolClass.findMany({
        where: { schoolId: access.schoolId },
        select: { id: true, name: true, section: true },
        orderBy: [{ name: "asc" }, { section: "asc" }],
      }),
    ]);

    return Response.json({ success: true, students, classes });
  } catch (error) {
    console.error(error);
    return Response.json({ message: "Unable to fetch students" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const access = await getTeacher();
    if (!access) return Response.json({ message: "Unauthorized" }, { status: 403 });

    const body = await request.json();

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const rollNo = String(body.rollNo || "").trim();
    const classId = String(body.classId || "").trim();
    const guardianName = String(body.guardianName || "").trim();
    const phone = String(body.phone || "").trim();

    if (!name || !email || !password || !rollNo || !classId) {
      return Response.json({ message: "Please fill all required fields" }, { status: 400 });
    }

    if (password.length < 8) {
      return Response.json({ message: "Password must contain at least 8 characters" }, { status: 400 });
    }

    const schoolClass = await prisma.schoolClass.findFirst({
      where: { id: classId, schoolId: access.schoolId },
      select: { id: true },
    });

    if (!schoolClass) {
      return Response.json({ message: "Class not found in your college" }, { status: 403 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return Response.json({ message: "This email is already registered" }, { status: 409 });
    }

    const existingRoll = await prisma.student.findFirst({
      where: { classId, rollNo },
      select: { id: true },
    });

    if (existingRoll) {
      return Response.json({ message: "This roll number already exists in this class" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const student = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: "STUDENT",
          schoolId: access.schoolId,
          phone: phone || null,
        },
      });

      return tx.student.create({
        data: {
          userId: user.id,
          rollNo,
          classId,
          guardianName: guardianName || null,
        },
        select: {
          id: true,
          rollNo: true,
          user: { select: { name: true, email: true } },
        },
      });
    });

    return Response.json({
      success: true,
      message: "Student added successfully",
      student,
    }, { status: 201 });
  } catch (error) {
    console.error("TEACHER CREATE STUDENT:", error);
    return Response.json({ message: "Unable to add student" }, { status: 500 });
  }
}
