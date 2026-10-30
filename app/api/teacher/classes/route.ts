import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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

    const classes = await prisma.schoolClass.findMany({
      where: { schoolId: access.schoolId },
      select: { id: true, name: true, section: true },
      orderBy: [{ name: "asc" }, { section: "asc" }],
    });

    return Response.json({ success: true, classes });
  } catch (error) {
    console.error(error);
    return Response.json({ message: "Unable to fetch classes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const access = await getTeacher();
    if (!access) return Response.json({ message: "Unauthorized" }, { status: 403 });

    const body = await request.json();
    const name = String(body.name || "").trim();
    const section = String(body.section || "").trim();

    if (!name || !section) {
      return Response.json({ message: "Class name and section are required" }, { status: 400 });
    }

    const existing = await prisma.schoolClass.findUnique({
      where: {
        schoolId_name_section: {
          schoolId: access.schoolId,
          name,
          section,
        },
      },
    });

    if (existing) {
      return Response.json({ message: "This class already exists" }, { status: 409 });
    }

    const schoolClass = await prisma.schoolClass.create({
      data: {
        name,
        section,
        schoolId: access.schoolId,
        classTeacherId: access.teacher.id,
      },
    });

    return Response.json({
      success: true,
      message: "Class created successfully",
      class: schoolClass,
    }, { status: 201 });
  } catch (error) {
    console.error("TEACHER CREATE CLASS:", error);
    return Response.json({ message: "Unable to create class" }, { status: 500 });
  }
}
