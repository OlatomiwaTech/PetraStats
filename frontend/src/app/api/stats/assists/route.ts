import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { EventType } from "@prisma/client";

// GET /api/stats/assists - Get top assist providers
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

    const assistEvents = await prisma.matchEvent.findMany({
      where: {
        OR: [
          { type: EventType.ASSIST, match: { seasonId: activeSeasonId } },
          {
            type: EventType.GOAL,
            match: { seasonId: activeSeasonId },
            assistPlayerId: { not: null },
          },
        ],
      },
      include: {
        player: {
          include: {
            team: true,
          },
        },
        assistPlayer: {
          include: {
            team: true,
          },
        },
      },
    });

    const assistCounts: Record<string, { player: any; assists: number }> = {};

    assistEvents.forEach((evt) => {
      // For ASSIST events, the player is the assister
      if (evt.type === EventType.ASSIST && evt.player) {
        if (!assistCounts[evt.playerId]) {
          assistCounts[evt.playerId] = {
            player: evt.player,
            assists: 0,
          };
        }
        assistCounts[evt.playerId].assists += 1;
      }
      // For GOAL events with assistPlayer, the assistPlayer is the assister
      if (evt.type === EventType.GOAL && evt.assistPlayer) {
        if (!assistCounts[evt.assistPlayerId!]) {
          assistCounts[evt.assistPlayerId!] = {
            player: evt.assistPlayer,
            assists: 0,
          };
        }
        assistCounts[evt.assistPlayerId!].assists += 1;
      }
    });

    const topAssisters = Object.values(assistCounts)
      .sort((a, b) => b.assists - a.assists)
      .map((a) => ({
        id: a.player.id,
        name: a.player.name,
        team: a.player.team.name,
        teamId: a.player.teamId,
        position: a.player.position,
        number: a.player.number,
        assists: a.assists,
      }));

    return NextResponse.json(topAssisters);
  } catch (error) {
    console.error("Error fetching top assisters:", error);
    return NextResponse.json(
      { error: "Failed to fetch top assisters" },
      { status: 500 }
    );
  }
}
