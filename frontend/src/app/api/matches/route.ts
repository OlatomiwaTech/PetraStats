import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { z } from "zod";
import { MatchStatus } from "@prisma/client";

const createMatchSchema = z.object({
  seasonId: z.string(),
  homeTeamId: z.string(),
  awayTeamId: z.string(),
  matchDate: z.string().transform((str) => new Date(str)),
  homeScore: z.number().int().nonnegative().optional().default(0),
  awayScore: z.number().int().nonnegative().optional().default(0),
  status: z
    .nativeEnum(MatchStatus)
    .optional()
    .default(MatchStatus.SCHEDULED),
});

// GET /api/matches - Get all matches
export async function GET() {
  try {
    const matches = await prisma.match.findMany({
      include: {
        season: true,
        homeTeam: true,
        awayTeam: true,
        events: {
          include: {
            player: true,
            assistPlayer: true,
          },
          orderBy: { minute: "asc" },
        },
        goalkeeperStats: {
          include: {
            player: true,
          },
        },
      },
      orderBy: { matchDate: "desc" },
    });
    return NextResponse.json(matches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}

// POST /api/matches - Create a new match (Admin only)
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createMatchSchema.parse(body);

    const match = await prisma.match.create({
      data: validatedData,
    });

    return NextResponse.json(match, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating match:", error);
    return NextResponse.json(
      { error: "Failed to create match" },
      { status: 500 }
    );
  }
}
