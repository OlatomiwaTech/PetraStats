import { prisma } from "@/lib/db";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { StatsCards } from "@/components/stats-cards";
import { RecentFixtures } from "@/components/recent-fixtures";
import { TopScorersWidget } from "@/components/top-scorers-widget";
import { LiveActivity } from "@/components/live-activity";
import { StandingsTable } from "@/components/standings-table";
import { EventType } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const seasons = await prisma.season.findMany({
    orderBy: { startDate: "desc" },
  });

  const activeSeason = seasons.find((s) => s.isCurrent) || seasons[0];
  const activeSeasonId = activeSeason?.id;

  const activeTeamsCount = activeSeasonId
    ? await prisma.team.count({
        where: { seasons: { some: { seasonId: activeSeasonId } } },
      })
    : 0;

  const registeredPlayersCount = await prisma.player.count();

  const totalMatches = activeSeasonId
    ? await prisma.match.count({
        where: { seasonId: activeSeasonId },
      })
    : 0;

  const completedMatches = activeSeasonId
    ? await prisma.match.findMany({
        where: { seasonId: activeSeasonId, status: "COMPLETED" },
      })
    : [];

  const matchesPlayed = completedMatches.length;

  const goalEvents = activeSeasonId
    ? await prisma.matchEvent.findMany({
        where: { type: EventType.GOAL, match: { seasonId: activeSeasonId } },
        include: {
          player: { include: { team: true } },
          assistPlayer: { include: { team: true } },
        },
      })
    : [];

  const goalsScored = goalEvents.length;

  const assistEvents = activeSeasonId
    ? await prisma.matchEvent.findMany({
        where: { type: EventType.ASSIST, match: { seasonId: activeSeasonId } },
      })
    : [];

  const totalAssists = assistEvents.length + goalEvents.filter((e) => e.assistPlayerId).length;

  const recentFixtures = activeSeasonId
    ? await prisma.match.findMany({
        where: { seasonId: activeSeasonId },
        include: {
          homeTeam: true,
          awayTeam: true,
          events: {
            include: { player: true },
            orderBy: { minute: "asc" },
          },
        },
        orderBy: { matchDate: "desc" },
        take: 4,
      })
    : [];

  const scorerCounts: Record<
    string,
    { id: string; name: string; team: string; position: string; goals: number; appearances: number }
  > = {};

  goalEvents.forEach((evt) => {
    if (evt.player) {
      if (!scorerCounts[evt.playerId]) {
        scorerCounts[evt.playerId] = {
          id: evt.playerId,
          name: evt.player.name,
          team: evt.player.team.name,
          position: evt.player.position,
          goals: 0,
          appearances: 1,
        };
      }
      scorerCounts[evt.playerId].goals += 1;
    }
  });

  const topScorers = Object.values(scorerCounts).sort((a, b) => b.goals - a.goals);

  const standingsTeams = activeSeasonId
    ? await prisma.team.findMany({
        where: { seasons: { some: { seasonId: activeSeasonId } } },
      })
    : [];

  const standingsMap: Record<
    string,
    {
      id: string;
      name: string;
      played: number;
      won: number;
      drawn: number;
      lost: number;
      gf: number;
      ga: number;
      gd: number;
      points: number;
    }
  > = {};

  standingsTeams.forEach((t) => {
    standingsMap[t.id] = {
      id: t.id,
      name: t.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      points: 0,
    };
  });

  completedMatches.forEach((m) => {
    const home = standingsMap[m.homeTeamId];
    const away = standingsMap[m.awayTeamId];

    if (home) {
      home.played += 1;
      home.gf += m.homeScore;
      home.ga += m.awayScore;
      if (m.homeScore > m.awayScore) {
        home.won += 1;
        home.points += 3;
      } else if (m.homeScore === m.awayScore) {
        home.drawn += 1;
        home.points += 1;
      } else {
        home.lost += 1;
      }
    }

    if (away) {
      away.played += 1;
      away.gf += m.awayScore;
      away.ga += m.homeScore;
      if (m.awayScore > m.homeScore) {
        away.won += 1;
        away.points += 3;
      } else if (m.homeScore === m.awayScore) {
        away.drawn += 1;
        away.points += 1;
      } else {
        away.lost += 1;
      }
    }
  });

  Object.values(standingsMap).forEach((s) => {
    s.gd = s.gf - s.ga;
  });

  const standings = Object.values(standingsMap).sort(
    (a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf
  );

  const recentEvents = activeSeasonId
    ? await prisma.matchEvent.findMany({
        where: { match: { seasonId: activeSeasonId } },
        include: {
          player: true,
          match: {
            include: {
              homeTeam: true,
              awayTeam: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      })
    : [];

  return (
    <div className="flex min-h-screen bg-[#090d16] text-slate-100 font-sans antialiased">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          seasons={seasons.map((s) => ({ id: s.id, name: s.name, isCurrent: s.isCurrent }))}
          activeSeasonName={activeSeason?.name}
        />

        <main className="p-8 space-y-8 max-w-[1600px] w-full mx-auto">
          {/* Summary Stat Cards */}
          <StatsCards
            matchesPlayed={matchesPlayed}
            totalMatches={totalMatches}
            goalsScored={goalsScored}
            totalAssists={totalAssists}
            activeTeamsCount={activeTeamsCount}
            registeredPlayersCount={registeredPlayersCount}
          />

          {/* Grid section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left 2 Columns */}
            <div className="lg:col-span-2 space-y-8">
              <RecentFixtures fixtures={recentFixtures} />
              <StandingsTable
                standings={standings}
                seasonName={activeSeason?.name || "Active Season"}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <TopScorersWidget scorers={topScorers} />
              <LiveActivity events={recentEvents} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
