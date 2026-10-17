import { prisma } from "@/lib/prisma";

function normalizeEmail(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim()
    .toLowerCase();
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    return Response.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("LOGIN GET ERROR:", error);

    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = normalizeEmail(
      String(body.email ?? "")
    );

    const password = String(body.password ?? "");

    const role = String(body.role ?? "")
      .trim()
      .toUpperCase();

    if (!email || !password || !role) {
      return Response.json(
        {
          success: false,
          message: "Email, password and role are required",
        },
        { status: 400 }
      );
    }

    const allowedRoles = [
      "ADMIN",
      "TEACHER",
      "STUDENT",
    ];

    if (!allowedRoles.includes(role)) {
      return Response.json(
        {
          success: false,
          message: "Invalid role",
        },
        { status: 400 }
      );
    }

    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        role: true,
        status: true,
      },
    });

    const user = allUsers.find(
      (item) => normalizeEmail(item.email) === email
    );

    console.log("LOGIN EMAIL CHECK:", {
      receivedEmail: JSON.stringify(email),
      found: Boolean(user),
      databaseEmails: allUsers.map((item) => ({
        email: JSON.stringify(item.email),
        matches: normalizeEmail(item.email) === email,
      })),
    });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "Email not found in database",
          receivedEmail: email,
          databaseEmails: allUsers.map(
            (item) => item.email
          ),
        },
        { status: 401 }
      );
    }

    if (user.role.trim().toUpperCase() !== role) {
      return Response.json(
        {
          success: false,
          message: `This account is registered as ${user.role}`,
        },
        { status: 401 }
      );
    }

    // Local development only.
    // Replace plain-text password storage with proper
    // password hashing before production deployment.
    if (user.passwordHash !== password) {
      return Response.json(
        {
          success: false,
          message: "Invalid password",
        },
        { status: 401 }
      );
    }

    if (user.status !== "active") {
      return Response.json(
        {
          success: false,
          message: "This account is inactive",
        },
        { status: 403 }
      );
    }

    return Response.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}