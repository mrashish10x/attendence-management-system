import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
        schoolClass: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return Response.json({
      success: true,
      subjects,
    });
  } catch (error) {
    console.error("GET SUBJECTS ERROR:", error);

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