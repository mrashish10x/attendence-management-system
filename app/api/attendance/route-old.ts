import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const attendance = await prisma.attendance.findMany({
      include: {
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
      },
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
        message:
          error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      studentId,
      subjectId,
      teacherId,
      date,
      status,
    } = body;

    if (!studentId || !subjectId || !date || !status) {
      return Response.json(
        {
          success: false,
          message:
            "studentId, subjectId, date and status are required",
        },
        { status: 400 }
      );
    }

    const allowedStatuses = [
      "present",
      "absent",
      "late",
    ];

    if (!allowedStatuses.includes(status)) {
      return Response.json(
        {
          success: false,
          message:
            "status must be present, absent or late",
        },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: {
        id: studentId,
      },
    });

    if (!student) {
      return Response.json(
        {
          success: false,
          message: "Student not found",
        },
        { status: 404 }
      );
    }

    const subject = await prisma.subject.findUnique({
      where: {
        id: subjectId,
      },
    });

    if (!subject) {
      return Response.json(
        {
          success: false,
          message: "Subject not found",
        },
        { status: 404 }
      );
    }

    if (teacherId) {
      const teacher = await prisma.teacher.findUnique({
        where: {
          id: teacherId,
        },
      });

      if (!teacher) {
        return Response.json(
          {
            success: false,
            message: "Teacher not found",
          },
          { status: 404 }
        );
      }
    }

    const attendanceDate = new Date(date);

    if (Number.isNaN(attendanceDate.getTime())) {
      return Response.json(
        {
          success: false,
          message: "Invalid date",
        },
        { status: 400 }
      );
    }

    // Keep attendance date at the start of the day
    attendanceDate.setHours(0, 0, 0, 0);

    const existingAttendance =
      await prisma.attendance.findFirst({
        where: {
          studentId,
          subjectId,
          date: attendanceDate,
        },
      });

    let attendance;

    if (existingAttendance) {
      attendance = await prisma.attendance.update({
        where: {
          id: existingAttendance.id,
        },
        data: {
          status,
          ...(teacherId !== undefined && {
            teacherId: teacherId || null,
          }),
        },
        include: {
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
        },
      });
    } else {
      attendance = await prisma.attendance.create({
        data: {
          studentId,
          subjectId,
          teacherId: teacherId || null,
          date: attendanceDate,
          status,
        },
        include: {
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
        },
      });
    }

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
        message:
          error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}