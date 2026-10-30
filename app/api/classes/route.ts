import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function getSchoolId() {
const session = await auth();

if (!session?.user?.id || !session.user.schoolId) {
return null;
}

return session.user.schoolId;
}

export async function GET() {
try {
const schoolId = await getSchoolId();

if (!schoolId) {
  return Response.json(
    { success: false, message: "Unauthorized or school not assigned" },
    { status: 401 }
  );
}

const classes = await prisma.schoolClass.findMany({
  where: { schoolId },
  include: {
    students: true,
    classTeacher: { include: { user: true } },
    subjects: true,
  },
  orderBy: { name: "asc" },
});

return Response.json({ success: true, classes });

} catch (error) {
console.error("GET CLASSES ERROR:", error);

return Response.json(
  {
    success: false,
    message: error instanceof Error ? error.message : String(error),
  },
  { status: 500 }
);

}
}

export async function POST(request: Request) {
try {
const schoolId = await getSchoolId();

if (!schoolId) {
  return Response.json(
    { success: false, message: "Unauthorized or school not assigned" },
    { status: 401 }
  );
}

const body = await request.json();
const { name, section, classTeacherId } = body;

if (
  typeof name !== "string" ||
  !name.trim() ||
  typeof section !== "string" ||
  !section.trim()
) {
  return Response.json(
    { success: false, message: "name and section are required" },
    { status: 400 }
  );
}

const cleanName = name.trim();
const cleanSection = section.trim();

const existingClass = await prisma.schoolClass.findUnique({
  where: {
    schoolId_name_section: {
      schoolId,
      name: cleanName,
      section: cleanSection,
    },
  },
});

if (existingClass) {
  return Response.json(
    { success: false, message: "This class already exists" },
    { status: 409 }
  );
}

if (classTeacherId) {
  const teacher = await prisma.teacher.findFirst({
    where: {
      id: classTeacherId,
      user: { schoolId },
    },
  });

  if (!teacher) {
    return Response.json(
      { success: false, message: "Class teacher not found in this school" },
      { status: 400 }
    );
  }
}

const schoolClass = await prisma.schoolClass.create({
  data: {
    name: cleanName,
    section: cleanSection,
    schoolId,
    classTeacherId: classTeacherId || null,
  },
  include: {
    students: true,
    classTeacher: { include: { user: true } },
    subjects: true,
  },
});

return Response.json(
  {
    success: true,
    message: "Class created successfully",
    class: schoolClass,
  },
  { status: 201 }
);

} catch (error) {
console.error("CREATE CLASS ERROR:", error);

return Response.json(
  {
    success: false,
    message: error instanceof Error ? error.message : String(error),
  },
  { status: 500 }
);

}
}

export async function PATCH(request: Request) {
try {
const schoolId = await getSchoolId();

if (!schoolId) {
  return Response.json(
    { success: false, message: "Unauthorized or school not assigned" },
    { status: 401 }
  );
}

const body = await request.json();
const { classId, name, section, classTeacherId } = body;

if (!classId) {
  return Response.json(
    { success: false, message: "classId is required" },
    { status: 400 }
  );
}

if (
  typeof name !== "string" ||
  !name.trim() ||
  typeof section !== "string" ||
  !section.trim()
) {
  return Response.json(
    { success: false, message: "name and section are required" },
    { status: 400 }
  );
}

const existingClass = await prisma.schoolClass.findFirst({
  where: { id: classId, schoolId },
});

if (!existingClass) {
  return Response.json(
    { success: false, message: "Class not found" },
    { status: 404 }
  );
}

const cleanName = name.trim();
const cleanSection = section.trim();

const duplicateClass = await prisma.schoolClass.findFirst({
  where: {
    schoolId,
    name: cleanName,
    section: cleanSection,
    id: { not: classId },
  },
});

if (duplicateClass) {
  return Response.json(
    { success: false, message: "This class already exists" },
    { status: 409 }
  );
}

if (classTeacherId) {
  const teacher = await prisma.teacher.findFirst({
    where: {
      id: classTeacherId,
      user: { schoolId },
    },
  });

  if (!teacher) {
    return Response.json(
      { success: false, message: "Class teacher not found in this school" },
      { status: 400 }
    );
  }
}

const updatedClass = await prisma.schoolClass.update({
  where: { id: classId },
  data: {
    name: cleanName,
    section: cleanSection,
    classTeacherId: classTeacherId || null,
  },
  include: {
    students: true,
    classTeacher: { include: { user: true } },
    subjects: true,
  },
});

return Response.json({
  success: true,
  message: "Class updated successfully",
  class: updatedClass,
});

} catch (error) {
console.error("UPDATE CLASS ERROR:", error);

return Response.json(
  {
    success: false,
    message: error instanceof Error ? error.message : String(error),
  },
  { status: 500 }
);

}
}

export async function DELETE(request: Request) {
try {
const schoolId = await getSchoolId();

if (!schoolId) {
  return Response.json(
    { success: false, message: "Unauthorized or school not assigned" },
    { status: 401 }
  );
}

const body = await request.json();
const { classId } = body;

if (!classId) {
  return Response.json(
    { success: false, message: "classId is required" },
    { status: 400 }
  );
}

const existingClass = await prisma.schoolClass.findFirst({
  where: { id: classId, schoolId },
  include: { students: true },
});

if (!existingClass) {
  return Response.json(
    { success: false, message: "Class not found" },
    { status: 404 }
  );
}

if (existingClass.students.length > 0) {
  return Response.json(
    {
      success: false,
      message: "Cannot delete a class that still has students. Move or delete the students first.",
    },
    { status: 409 }
  );
}

await prisma.schoolClass.delete({
  where: { id: classId },
});

return Response.json({
  success: true,
  message: "Class deleted successfully",
});

} catch (error) {
console.error("DELETE CLASS ERROR:", error);

return Response.json(
  {
    success: false,
    message: error instanceof Error ? error.message : String(error),
  },
  { status: 500 }
);

}
}

