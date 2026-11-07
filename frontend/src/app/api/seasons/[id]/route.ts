import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET /api/seasons/:id - Get a specific season
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const season = await prisma.season.findUnique({
      where: { id },
    });

    if (!season) {
      return NextResponse.json({ error: "Season not found" }, { status: 404 });
    }

    return NextResponse.json(season);
  } catch (error) {
    console.error("Error fetching season:", error);
    return NextResponse.json(
      { error: "Failed to fetch season" },
      { status: 500 }
    );
  }
}

// PATCH /api/seasons/:id - Update a season (Admin only)
export async function PATCH(
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

    const season = await prisma.season.findUnique({
      where: { id },
    });

    if (!season) {
      return NextResponse.json({ error: "Season not found" }, { status: 404 });
    }

    if (body.isCurrent === true) {
      await prisma.season.updateMany({
        where: { isCurrent: true, id: { not: id } },
        data: { isCurrent: false },
      });
    }

    const updatedSeason = await prisma.season.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updatedSeason);
  } catch (error) {
    console.error("Error updating season:", error);
    return NextResponse.json(
      { error: "Failed to update season" },
      { status: 500 }
    );
  }
}

// DELETE /api/seasons/:id - Delete a season (Admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const season = await prisma.season.findUnique({
      where: { id },
    });

    if (!season) {
      return NextResponse.json({ error: "Season not found" }, { status: 404 });
    }

    await prisma.season.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Season deleted successfully" });
  } catch (error) {
    console.error("Error deleting season:", error);
    return NextResponse.json(
      { error: "Failed to delete season" },
      { status: 500 }
    );
  }
}
