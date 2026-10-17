import "dotenv/config";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const userCount = await prisma.user.count();

    return Response.json({
      success: true,
      message: "Database connected successfully!",
      userCount,
    });
  } catch (error) {
    console.error("DATABASE ERROR:", error);

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