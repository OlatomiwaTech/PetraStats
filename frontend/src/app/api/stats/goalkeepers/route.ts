import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/stats/goalkeepers - Get goalkeeper statistics
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

    const goalkeeperStats = await prisma.goalkeeperStats.findMany({
      where: { match: { seasonId: activeSeasonId } },
      include: {
        player: {
          include: {
            team: true,
          },
        },
        match: true,
      },
    });

    const gkStats: Record<string, any> = {};

    goalkeeperStats.forEach((stats) => {
      if (!gkStats[stats.playerId]) {
        gkStats[stats.playerId] = {
          id: stats.player.id,
          name: stats.player.name,
          team: stats.player.team.name,
          teamId: stats.player.teamId,
          number: stats.player.number,
          appearances: 0,
          saves: 0,
          goalsConceded: 0,
          cleanSheets: 0,
        };
      }
      gkStats[stats.playerId].appearances += 1;
      gkStats[stats.playerId].saves += stats.saves;
      gkStats[stats.playerId].goalsConceded += stats.goalsConceded;
      if (stats.cleanSheet) {
        gkStats[stats.playerId].cleanSheets += 1;
      }
    });

    const goalkeeperLeaderboard = Object.values(gkStats).sort(
      (a, b) => b.cleanSheets - a.cleanSheets || b.saves - a.saves
    );

    return NextResponse.json(goalkeeperLeaderboard);
  } catch (error) {
    console.error("Error fetching goalkeeper stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch goalkeeper stats" },
      { status: 500 }
    );
  }
}
