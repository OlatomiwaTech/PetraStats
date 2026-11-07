import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { z } from "zod";
import { EventType } from "@prisma/client";

const createEventSchema = z.object({
  type: z.nativeEnum(EventType),
  minute: z.number().int().positive(),
  playerId: z.string(),
  assistPlayerId: z.string().optional().nullable(),
});

// GET /api/matches/:id/events - Get all events for a match
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const match = await prisma.match.findUnique({
      where: { id },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    const events = await prisma.matchEvent.findMany({
      where: { matchId: id },
      include: {
        player: true,
        assistPlayer: true,
      },
      orderBy: { minute: "asc" },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching match events:", error);
    return NextResponse.json(
      { error: "Failed to fetch match events" },
      { status: 500 }
    );
  }
}

// POST /api/matches/:id/events - Create a new event (Admin only)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = createEventSchema.parse(body);

    const match = await prisma.match.findUnique({
      where: { id },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    const event = await prisma.matchEvent.create({
      data: {
        ...validatedData,
        matchId: id,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating match event:", error);
    return NextResponse.json(
      { error: "Failed to create match event" },
      { status: 500 }
    );
  }
}
