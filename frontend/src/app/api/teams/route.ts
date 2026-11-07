import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const createTeamSchema = z.object({
  name: z.string().min(1),
  logoUrl: z.string().url().optional().nullable(),
  seasonId: z.string().optional(),
});

// GET /api/teams - Get all teams
export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        seasons: {
          include: {
            season: true,
          },
        },
        players: true,
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}

// POST /api/teams - Create a new team (Admin only)
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createTeamSchema.parse(body);

    const team = await prisma.team.create({
      data: {
        name: validatedData.name,
        logoUrl: validatedData.logoUrl || null,
      },
    });

    if (validatedData.seasonId) {
      await prisma.teamSeason.create({
        data: {
          teamId: team.id,
          seasonId: validatedData.seasonId,
        },
      });
    }

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating team:", error);
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    );
  }
}
