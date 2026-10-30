import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function getAccess() {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    return { error: Response.json({ message: "Please login first." }, { status: 401 }) };
  }

  const role = session.user.role.toUpperCase();

  if (!["ADMIN", "TEACHER"].includes(role)) {
    return { error: Response.json({ message: "Access denied." }, { status: 403 }) };
  }

  if (!session.user.schoolId) {
    return { error: Response.json({ message: "Account is not linked to a school." }, { status: 403 }) };
  }

  return { userId: session.user.id, role, schoolId: session.user.schoolId };
}

export async function GET() {
  try {
    const access = await getAccess();
    if ("error" in access) return access.error;

    let teacherId: string | null = null;

    if (access.role === "TEACHER") {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: access.userId },
        select: { id: true, user: { select: { schoolId: true } } },
      });

      if (!teacher || teacher.user.schoolId !== access.schoolId) {
        return Response.json({ message: "Teacher profile not found." }, { status: 403 });
      }

      teacherId = teacher.id;
    }

    const [students, subjects, attendance] = await Promise.all([
      prisma.student.findMany({
        where: { schoolClass: { is: { schoolId: access.schoolId } } },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarColor: true },
          },
          schoolClass: {
            select: { id: true, name: true, section: true },
          },
        },
        orderBy: { rollNo: "asc" },
      }),

      prisma.subject.findMany({
        where: {
          schoolId: access.schoolId,
          ...(teacherId ? { teacherId } : {}),
        },
        select: { id: true, name: true, code: true, classId: true },
        orderBy: { name: "asc" },
      }),

      prisma.attendance.findMany({
        where: {
          student: {
            is: { schoolClass: { is: { schoolId: access.schoolId } } },
          },
          subject: {
            is: {
              schoolId: access.schoolId,
              ...(teacherId ? { teacherId } : {}),
            },
          },
          ...(teacherId ? { teacherId } : {}),
        },
        include: {
          student: {
            include: {
              user: { select: { id: true, name: true, email: true, avatarColor: true } },
              schoolClass: true,
            },
          },
          subject: true,
          teacher: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
        },
        orderBy: { date: "desc" },
      }),
    ]);

    return Response.json({ success: true, students, subjects, attendance });
  } catch (error) {
    console.error("GET ATTENDANCE ERROR:", error);
    return Response.json({ message: "Unable to fetch attendance." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const access = await getAccess();
    if ("error" in access) return access.error;

    const body = await request.json();
    const { studentId, subjectId, date, status } = body ?? {};

    if (
      typeof studentId !== "string" ||
      typeof subjectId !== "string" ||
      typeof date !== "string" ||
      !["present", "absent", "late"].includes(status)
    ) {
      return Response.json({ message: "Invalid attendance details." }, { status: 400 });
    }

    const parsedDate = new Date(`${date}T00:00:00.000Z`);

    if (Number.isNaN(parsedDate.getTime())) {
      return Response.json({ message: "Invalid date." }, { status: 400 });
    }

    const [student, subject] = await Promise.all([
      prisma.student.findUnique({
        where: { id: studentId },
        select: {
          id: true,
          schoolClass: { select: { schoolId: true } },
        },
      }),
      prisma.subject.findUnique({
        where: { id: subjectId },
        select: { id: true, schoolId: true, teacherId: true },
      }),
    ]);

    if (!student || !subject) {
      return Response.json({ message: "Student or subject not found." }, { status: 404 });
    }

    if (
      student.schoolClass.schoolId !== access.schoolId ||
      subject.schoolId !== access.schoolId
    ) {
      return Response.json({ message: "Cross-school access denied." }, { status: 403 });
    }

    let teacherId: string | null = null;

    if (access.role === "TEACHER") {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: access.userId },
        select: { id: true, user: { select: { schoolId: true } } },
      });

      if (!teacher || teacher.user.schoolId !== access.schoolId) {
        return Response.json({ message: "Teacher profile not found." }, { status: 403 });
      }

      if (subject.teacherId !== teacher.id) {
        return Response.json(
          { message: "You can only mark attendance for your assigned subjects." },
          { status: 403 }
        );
      }

      teacherId = teacher.id;
    } else if (body.teacherId) {
      const teacher = await prisma.teacher.findFirst({
        where: {
          id: body.teacherId,
          user: { is: { schoolId: access.schoolId } },
        },
        select: { id: true },
      });

      if (!teacher) {
        return Response.json({ message: "Teacher not found in your school." }, { status: 404 });
      }

      teacherId = teacher.id;
    }

    const existing = await prisma.attendance.findFirst({
      where: { studentId, subjectId, date: parsedDate },
      select: { id: true },
    });

    const attendance = existing
      ? await prisma.attendance.update({
          where: { id: existing.id },
          data: { status, ...(teacherId ? { teacherId } : {}) },
        })
      : await prisma.attendance.create({
          data: { studentId, subjectId, teacherId, date: parsedDate, status },
        });

    return Response.json({
      success: true,
      message: existing ? "Attendance updated successfully." : "Attendance saved successfully.",
      attendance,
    });
  } catch (error) {
    console.error("SAVE ATTENDANCE ERROR:", error);
    return Response.json({ message: "Unable to save attendance." }, { status: 500 });
  }
}
