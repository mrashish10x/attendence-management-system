import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        user: true,
        assignedClass: true,
        subjects: true,
      },
      orderBy: {
        joinedOn: "desc",
      },
    });

    return Response.json({
      success: true,
      teachers,
    });
  } catch (error) {
    console.error("GET TEACHERS ERROR:", error);

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
      name,
      email,
      phone,
      assignedClassId,
    } = body;

    if (!name || !email) {
      return Response.json(
        {
          success: false,
          message: "name and email are required",
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return Response.json(
        {
          success: false,
          message: "A user with this email already exists",
        },
        { status: 409 }
      );
    }

    if (assignedClassId) {
      const schoolClass = await prisma.schoolClass.findUnique({
        where: {
          id: assignedClassId,
        },
      });

      if (!schoolClass) {
        return Response.json(
          {
            success: false,
            message: "Assigned class not found",
          },
          { status: 400 }
        );
      }
    }

    const teacher = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash: "temporary-password",
          role: "TEACHER",
          status: "active",
          phone: phone || null,
        },
      });

      return tx.teacher.create({
        data: {
          userId: user.id,
          assignedClassId: assignedClassId || null,
        },
        include: {
          user: true,
          assignedClass: true,
          subjects: true,
        },
      });
    });

    return Response.json(
      {
        success: true,
        message: "Teacher created successfully",
        teacher,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE TEACHER ERROR:", error);

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

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const {
      teacherId,
      name,
      email,
      phone,
      assignedClassId,
    } = body;

    if (!teacherId) {
      return Response.json(
        {
          success: false,
          message: "teacherId is required",
        },
        { status: 400 }
      );
    }

    if (!name || !email) {
      return Response.json(
        {
          success: false,
          message: "name and email are required",
        },
        { status: 400 }
      );
    }

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

    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: {
          not: teacher.userId,
        },
      },
    });

    if (existingUser) {
      return Response.json(
        {
          success: false,
          message: "Another user already uses this email",
        },
        { status: 409 }
      );
    }

    if (assignedClassId) {
      const schoolClass = await prisma.schoolClass.findUnique({
        where: {
          id: assignedClassId,
        },
      });

      if (!schoolClass) {
        return Response.json(
          {
            success: false,
            message: "Assigned class not found",
          },
          { status: 400 }
        );
      }
    }

    const updatedTeacher = await prisma.$transaction(
      async (tx) => {
        await tx.user.update({
          where: {
            id: teacher.userId,
          },
          data: {
            name,
            email,
            phone: phone || null,
          },
        });

        return tx.teacher.update({
          where: {
            id: teacherId,
          },
          data: {
            assignedClassId: assignedClassId || null,
          },
          include: {
            user: true,
            assignedClass: true,
            subjects: true,
          },
        });
      }
    );

    return Response.json({
      success: true,
      message: "Teacher updated successfully",
      teacher: updatedTeacher,
    });
  } catch (error) {
    console.error("UPDATE TEACHER ERROR:", error);

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

export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    const { teacherId } = body;

    if (!teacherId) {
      return Response.json(
        {
          success: false,
          message: "teacherId is required",
        },
        { status: 400 }
      );
    }

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

    const attendanceCount = await prisma.attendance.count({
      where: {
        teacherId,
      },
    });

    if (attendanceCount > 0) {
      return Response.json(
        {
          success: false,
          message:
            "Cannot delete a teacher who has attendance records.",
        },
        { status: 409 }
      );
    }

    await prisma.user.delete({
      where: {
        id: teacher.userId,
      },
    });

    return Response.json({
      success: true,
      message: "Teacher deleted successfully",
    });
  } catch (error) {
    console.error("DELETE TEACHER ERROR:", error);

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