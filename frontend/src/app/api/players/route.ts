import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const createPlayerSchema = z.object({
  name: z.string().min(1),
  number: z.number().int().positive(),
  position: z.string().min(1),
  teamId: z.string(),
  isGoalkeeper: z.boolean().optional().default(false),
});

// GET /api/players - Get all players
export async function GET() {
  try {
    const players = await prisma.player.findMany({
      include: {
        team: true,
        events: {
          include: {
            match: true,
          },
        },
        assistedEvents: true,
        goalkeeperStats: true,
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(players);
  } catch (error) {
    console.error("Error fetching players:", error);
    return NextResponse.json(
      { error: "Failed to fetch players" },
      { status: 500 }
    );
  }
}

// POST /api/players - Create a new player (Admin only)
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createPlayerSchema.parse(body);

    const player = await prisma.player.create({
      data: validatedData,
    });

    return NextResponse.json(player, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating player:", error);
    return NextResponse.json(
      { error: "Failed to create player" },
      { status: 500 }
    );
  }
}
