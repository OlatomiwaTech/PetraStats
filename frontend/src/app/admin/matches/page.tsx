export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { createMatch, deleteMatch } from "./actions";

export default async function MatchesPage() {
  const matches = await prisma.match.findMany({
    include: {
      homeTeam: true,
      awayTeam: true,
      season: true,
    },
    orderBy: { matchDate: "desc" },
  });

  const seasons = await prisma.season.findMany({
    orderBy: { startDate: "desc" },
  });

  const teams = await prisma.team.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Manage Matches</h1>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Schedule New Match</h2>
        <form action={createMatch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Season</label>
            <select
              name="seasonId"
              required
              className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800"
            >
              <option value="">-- Select Season --</option>
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Home Team</label>
              <select
                name="homeTeamId"
                required
                className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800"
              >
                <option value="">-- Select Home Team --</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Away Team</label>
              <select
                name="awayTeamId"
                required
                className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800"
              >
                <option value="">-- Select Away Team --</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Match Date & Time</label>
            <input
              type="datetime-local"
              name="matchDate"
              required
              className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Schedule Match
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Matches</h2>
        <div className="divide-y">
          {matches.map((m) => (
            <div key={m.id} className="py-3 flex justify-between items-center">
              <div>
                <span className="font-semibold">
                  {m.homeTeam.name} {m.homeScore} - {m.awayScore} {m.awayTeam.name}
                </span>
                <p className="text-sm text-gray-500">
                  {new Date(m.matchDate).toLocaleString()} | Status: {m.status} | Season:{" "}
                  {m.season.name}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/admin/matches/${m.id}/events`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Manage Events & Stats
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await deleteMatch(m.id);
                  }}
                >
                  <button
                    type="submit"
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
          {matches.length === 0 && (
            <p className="text-gray-500 text-sm py-2">No matches scheduled yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
