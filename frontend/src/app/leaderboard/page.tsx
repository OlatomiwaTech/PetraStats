import { prisma } from "@/lib/db";
import { EventType } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const activeSeason = await prisma.season.findFirst({
    where: { isCurrent: true },
  });

  const seasonId = activeSeason?.id;

  const teams = seasonId
    ? await prisma.team.findMany({
        where: { seasons: { some: { seasonId } } },
      })
    : [];

  const completedMatches = seasonId
    ? await prisma.match.findMany({
        where: { seasonId, status: "COMPLETED" },
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

  teams.forEach((t) => {
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

  const goalEvents = seasonId
    ? await prisma.matchEvent.findMany({
        where: { type: EventType.GOAL, match: { seasonId } },
        include: { player: { include: { team: true } }, assistPlayer: { include: { team: true } } },
      })
    : [];

  const scorersMap: Record<string, { id: string; name: string; team: string; goals: number }> = {};
  const assistsMap: Record<string, { id: string; name: string; team: string; assists: number }> = {};

  goalEvents.forEach((e) => {
    if (e.player) {
      if (!scorersMap[e.playerId]) {
        scorersMap[e.playerId] = {
          id: e.playerId,
          name: e.player.name,
          team: e.player.team.name,
          goals: 0,
        };
      }
      scorersMap[e.playerId].goals += 1;
    }

    if (e.assistPlayer) {
      if (!assistsMap[e.assistPlayerId!]) {
        assistsMap[e.assistPlayerId!] = {
          id: e.assistPlayerId!,
          name: e.assistPlayer.name,
          team: e.assistPlayer.team.name,
          assists: 0,
        };
      }
      assistsMap[e.assistPlayerId!].assists += 1;
    }
  });

  const topScorers = Object.values(scorersMap)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 5);

  const topAssists = Object.values(assistsMap)
    .sort((a, b) => b.assists - a.assists)
    .slice(0, 5);

  const gkStats = seasonId
    ? await prisma.goalkeeperStats.findMany({
        where: { match: { seasonId } },
        include: { player: { include: { team: true } } },
      })
    : [];

  const gkMap: Record<
    string,
    { id: string; name: string; team: string; saves: number; goalsConceded: number; cleanSheets: number }
  > = {};

  gkStats.forEach((s) => {
    if (!gkMap[s.playerId]) {
      gkMap[s.playerId] = {
        id: s.playerId,
        name: s.player.name,
        team: s.player.team.name,
        saves: 0,
        goalsConceded: 0,
        cleanSheets: 0,
      };
    }
    gkMap[s.playerId].saves += s.saves;
    gkMap[s.playerId].goalsConceded += s.goalsConceded;
    if (s.cleanSheet) gkMap[s.playerId].cleanSheets += 1;
  });

  const topGoalkeepers = Object.values(gkMap)
    .sort((a, b) => b.cleanSheets - a.cleanSheets || b.saves - a.saves)
    .slice(0, 5);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      <div>
        <h1 className="text-4xl font-bold">PetraStats League Leaderboard</h1>
        <p className="text-gray-500 mt-1">
          Active Season: {activeSeason ? activeSeason.name : "No active season"}
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-lg border shadow-sm p-6 space-y-4">
        <h2 className="text-2xl font-bold">League Standings</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 dark:bg-zinc-800 text-xs font-semibold uppercase text-gray-500">
              <tr>
                <th className="py-3 px-4">Pos</th>
                <th className="py-3 px-4">Team</th>
                <th className="py-3 px-4 text-center">P</th>
                <th className="py-3 px-4 text-center">W</th>
                <th className="py-3 px-4 text-center">D</th>
                <th className="py-3 px-4 text-center">L</th>
                <th className="py-3 px-4 text-center">GF</th>
                <th className="py-3 px-4 text-center">GA</th>
                <th className="py-3 px-4 text-center">GD</th>
                <th className="py-3 px-4 text-center font-bold">PTS</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {standings.map((s, idx) => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                  <td className="py-3 px-4 font-bold">{idx + 1}</td>
                  <td className="py-3 px-4 font-semibold">{s.name}</td>
                  <td className="py-3 px-4 text-center">{s.played}</td>
                  <td className="py-3 px-4 text-center">{s.won}</td>
                  <td className="py-3 px-4 text-center">{s.drawn}</td>
                  <td className="py-3 px-4 text-center">{s.lost}</td>
                  <td className="py-3 px-4 text-center">{s.gf}</td>
                  <td className="py-3 px-4 text-center">{s.ga}</td>
                  <td className="py-3 px-4 text-center">{s.gd}</td>
                  <td className="py-3 px-4 text-center font-bold text-blue-600">{s.points}</td>
                </tr>
              ))}
              {standings.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-4 text-center text-gray-500">
                    No standings data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div id="scorers" className="bg-white dark:bg-zinc-900 rounded-lg border shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-bold">Top Goal Scorers</h2>
          <div className="divide-y">
            {topScorers.map((s, idx) => (
              <div key={s.id} className="py-2.5 flex justify-between items-center text-sm">
                <div>
                  <span className="font-bold text-gray-400 mr-2">#{idx + 1}</span>
                  <span className="font-semibold">{s.name}</span>
                  <p className="text-xs text-gray-500">{s.team}</p>
                </div>
                <span className="font-bold text-lg text-blue-600">{s.goals} G</span>
              </div>
            ))}
            {topScorers.length === 0 && (
              <p className="text-gray-500 text-sm py-2">No goal stats recorded.</p>
            )}
          </div>
        </div>

        <div id="assists" className="bg-white dark:bg-zinc-900 rounded-lg border shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-bold">Top Assists</h2>
          <div className="divide-y">
            {topAssists.map((a, idx) => (
              <div key={a.id} className="py-2.5 flex justify-between items-center text-sm">
                <div>
                  <span className="font-bold text-gray-400 mr-2">#{idx + 1}</span>
                  <span className="font-semibold">{a.name}</span>
                  <p className="text-xs text-gray-500">{a.team}</p>
                </div>
                <span className="font-bold text-lg text-blue-600">{a.assists} A</span>
              </div>
            ))}
            {topAssists.length === 0 && (
              <p className="text-gray-500 text-sm py-2">No assist stats recorded.</p>
            )}
          </div>
        </div>

        <div id="goalkeepers" className="bg-white dark:bg-zinc-900 rounded-lg border shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-bold font-mono">Goalkeeper Stats</h2>
          <div className="divide-y">
            {topGoalkeepers.map((gk, idx) => (
              <div key={gk.id} className="py-2.5 flex justify-between items-center text-sm">
                <div>
                  <span className="font-bold text-gray-400 mr-2">#{idx + 1}</span>
                  <span className="font-semibold">{gk.name}</span>
                  <p className="text-xs text-gray-500">{gk.team}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-green-600 block">{gk.cleanSheets} CS</span>
                  <span className="text-xs text-gray-500">{gk.saves} Saves</span>
                </div>
              </div>
            ))}
            {topGoalkeepers.length === 0 && (
              <p className="text-gray-500 text-sm py-2">No goalkeeper stats recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
