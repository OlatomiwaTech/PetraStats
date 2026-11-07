import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { z } from "zod";
import { EventType } from "@prisma/client";

const updateEventSchema = z.object({
  type: z.nativeEnum(EventType).optional(),
  minute: z.number().int().positive().optional(),
  playerId: z.string().optional(),
  assistPlayerId: z.string().optional().nullable(),
});

// GET /api/matches/:id/events/:eventId - Get a specific event
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    const { id, eventId } = await params;
    const event = await prisma.matchEvent.findUnique({
      where: { id: eventId, matchId: id },
      include: {
        player: true,
        assistPlayer: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching match event:", error);
    return NextResponse.json(
      { error: "Failed to fetch match event" },
      { status: 500 }
    );
  }
}

// PATCH /api/matches/:id/events/:eventId - Update an event (Admin only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, eventId } = await params;
    const body = await request.json();
    const validatedData = updateEventSchema.parse(body);

    const event = await prisma.matchEvent.findUnique({
      where: { id: eventId, matchId: id },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const updatedEvent = await prisma.matchEvent.update({
      where: { id: eventId },
      data: validatedData,
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating match event:", error);
    return NextResponse.json(
      { error: "Failed to update match event" },
      { status: 500 }
    );
  }
}

// DELETE /api/matches/:id/events/:eventId - Delete an event (Admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, eventId } = await params;

    const event = await prisma.matchEvent.findUnique({
      where: { id: eventId, matchId: id },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await prisma.matchEvent.delete({
      where: { id: eventId },
    });

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting match event:", error);
    return NextResponse.json(
      { error: "Failed to delete match event" },
      { status: 500 }
    );
  }
}
