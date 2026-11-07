import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { EventType } from "@prisma/client";

// GET /api/stats/scorers - Get top scorers
export async function GET() {
  try {
    const seasons = await prisma.season.findMany({
      orderBy: { startDate: "desc" },
    });

    const activeSeason = seasons.find((s) => s.isCurrent) || seasons[0];
    const activeSeasonId = activeSeason?.id;

    if (!activeSeasonId) {
      return NextResponse.json([]);
    }

    const goalEvents = await prisma.matchEvent.findMany({
      where: {
        type: EventType.GOAL,
        match: { seasonId: activeSeasonId },
      },
      include: {
        player: {
          include: {
            team: true,
          },
        },
      },
    });

    const scorerCounts: Record<string, { player: any; goals: number }> = {};

    goalEvents.forEach((evt) => {
      if (evt.player) {
        if (!scorerCounts[evt.playerId]) {
          scorerCounts[evt.playerId] = {
            player: evt.player,
            goals: 0,
          };
        }
        scorerCounts[evt.playerId].goals += 1;
      }
    });

    const topScorers = Object.values(scorerCounts)
      .sort((a, b) => b.goals - a.goals)
      .map((s) => ({
        id: s.player.id,
        name: s.player.name,
        team: s.player.team.name,
        teamId: s.player.teamId,
        position: s.player.position,
        number: s.player.number,
        goals: s.goals,
      }));

    return NextResponse.json(topScorers);
  } catch (error) {
    console.error("Error fetching top scorers:", error);
    return NextResponse.json(
      { error: "Failed to fetch top scorers" },
      { status: 500 }
    );
  }
}
