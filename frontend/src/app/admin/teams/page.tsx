export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { createTeam, deleteTeam } from "./actions";

export default async function TeamsPage() {
  const teams = await prisma.team.findMany({
    include: {
      seasons: {
        include: { season: true },
      },
      players: true,
    },
    orderBy: { name: "asc" },
  });

  const seasons = await prisma.season.findMany({
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Manage Teams</h1>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Create New Team</h2>
        <form action={createTeam} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Team Name</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Petra Lions FC"
              className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Logo URL (optional)</label>
            <input
              type="url"
              name="logoUrl"
              placeholder="https://..."
              className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Assign to Season (optional)</label>
            <select
              name="seasonId"
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
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Create Team
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Existing Teams</h2>
        <div className="divide-y">
          {teams.map((t) => (
            <div key={t.id} className="py-3 flex justify-between items-center">
              <div>
                <span className="font-semibold">{t.name}</span>
                <p className="text-sm text-gray-500">
                  Players: {t.players.length} | Seasons:{" "}
                  {t.seasons.map((ts) => ts.season.name).join(", ") || "None"}
                </p>
              </div>
              <form
                action={async () => {
                  "use server";
                  await deleteTeam(t.id);
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
          ))}
          {teams.length === 0 && (
            <p className="text-gray-500 text-sm py-2">No teams created yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
