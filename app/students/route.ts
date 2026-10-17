import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: {
        user: true,
        schoolClass: true,
      },
      orderBy: {
        rollNo: "asc",
      },
    });

    return Response.json({
      success: true,
      students,
    });
  } catch (error) {
    console.error("GET STUDENTS ERROR:", error);

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