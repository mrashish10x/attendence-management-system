import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const attendanceInclude = {
  student: {
    include: {
      user: true,
      schoolClass: true,
    },
  },
  subject: true,
  teacher: {
    include: {
      user: true,
    },
  },
} as const;

async function getAuthorizedUser() {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    return {
      error: Response.json(
        { success: false, message: "Please sign in first" },
        { status: 401 }
      ),
    };
  }

  const role = session.user.role.toUpperCase();

  if (role !== "ADMIN" && role !== "TEACHER") {
    return {
      error: Response.json(
        { success: false, message: "You are not allowed to access attendance" },
        { status: 403 }
      ),
    };
  }

  return {
    userId: session.user.id,
    role,
  };
}

export async function GET() {
  try {
    const access = await getAuthorizedUser();

    if ("error" in access) {
      return access.error;
    }

    const attendance = await prisma.attendance.findMany({
      include: attendanceInclude,
      orderBy: {
        date: "desc",
      },
    });

    return Response.json({
      success: true,
      attendance,
    });
  } catch (error) {
    console.error("GET ATTENDANCE ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to fetch attendance",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const access = await getAuthorizedUser();

    if ("error" in access) {
      return access.error;
    }

    const body = await request.json();

    const { studentId, subjectId, date, status } = body;

    if (
      typeof studentId !== "string" ||
      !studentId ||
      typeof subjectId !== "string" ||
      !subjectId ||
      typeof date !== "string" ||
      !date ||
      typeof status !== "string"
    ) {
      return Response.json(
        {
          success: false,
          message: "studentId, subjectId, date and status are required",
        },
        { status: 400 }
      );
    }

    const allowedStatuses = ["present", "absent", "late"];

    if (!allowedStatuses.includes(status)) {
      return Response.json(
        {
          success: false,
          message: "status must be present, absent or late",
        },
        { status: 400 }
      );
    }

    // Resolve the teacher from the authenticated account.
    // Never trust a teacherId supplied by the browser.
    let teacherId: string | null = null;

    if (access.role === "TEACHER") {
      const teacher = await prisma.teacher.findFirst({
        where: {
          userId: access.userId,
        },
        select: {
          id: true,
        },
      });

      if (!teacher) {
        return Response.json(
          {
            success: false,
            message: "No teacher profile is linked to your account",
          },
          { status: 403 }
        );
      }

      teacherId = teacher.id;
    } else if (
      body.teacherId !== undefined &&
      body.teacherId !== null &&
      typeof body.teacherId !== "string"
    ) {
      return Response.json(
        { success: false, message: "Invalid teacherId" },
        { status: 400 }
      );
    }

    if (access.role === "ADMIN" && body.teacherId) {
      const teacher = await prisma.teacher.findUnique({
        where: { id: body.teacherId },
        select: { id: true },
      });

      if (!teacher) {
        return Response.json(
          { success: false, message: "Teacher not found" },
          { status: 404 }
        );
      }

      teacherId = teacher.id;
    }

    const attendanceDate = new Date(date);

    if (Number.isNaN(attendanceDate.getTime())) {
      return Response.json(
        { success: false, message: "Invalid date" },
        { status: 400 }
      );
    }

    attendanceDate.setHours(0, 0, 0, 0);

    const [student, subject] = await Promise.all([
      prisma.student.findUnique({
        where: { id: studentId },
        select: { id: true },
      }),
      prisma.subject.findUnique({
        where: { id: subjectId },
        select: { id: true },
      }),
    ]);

    if (!student) {
      return Response.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    if (!subject) {
      return Response.json(
        { success: false, message: "Subject not found" },
        { status: 404 }
      );
    }

    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        studentId,
        subjectId,
        date: attendanceDate,
      },
      select: { id: true },
    });

    const attendance = existingAttendance
      ? await prisma.attendance.update({
          where: { id: existingAttendance.id },
          data: {
            status,
            ...(access.role === "ADMIN" && {
              teacherId,
            }),
          },
          include: attendanceInclude,
        })
      : await prisma.attendance.create({
          data: {
            studentId,
            subjectId,
            teacherId,
            date: attendanceDate,
            status,
          },
          include: attendanceInclude,
        });

    return Response.json({
      success: true,
      message: existingAttendance
        ? "Attendance updated successfully"
        : "Attendance marked successfully",
      attendance,
    });
  } catch (error) {
    console.error("SAVE ATTENDANCE ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to save attendance",
      },
      { status: 500 }
    );
  }
}