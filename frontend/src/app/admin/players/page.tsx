export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { createPlayer, deletePlayer } from "./actions";

export default async function PlayersPage() {
  const players = await prisma.player.findMany({
    include: { team: true },
    orderBy: { name: "asc" },
  });

  const teams = await prisma.team.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Manage Players</h1>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Create New Player</h2>
        <form action={createPlayer} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Player Name</label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. John Doe"
                className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Jersey Number</label>
              <input
                type="number"
                name="number"
                required
                min="1"
                max="99"
                placeholder="10"
                className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Position</label>
              <input
                type="text"
                name="position"
                required
                placeholder="Forward, Midfielder, Defender, Goalkeeper"
                className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Team</label>
              <select
                name="teamId"
                required
                className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800"
              >
                <option value="">-- Select Team --</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="isGoalkeeper" value="true" id="isGoalkeeper" />
            <label htmlFor="isGoalkeeper" className="text-sm font-medium">
              Is Goalkeeper
            </label>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Create Player
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Existing Players</h2>
        <div className="divide-y">
          {players.map((p) => (
            <div key={p.id} className="py-3 flex justify-between items-center">
              <div>
                <span className="font-semibold">
                  #{p.number} {p.name}
                </span>{" "}
                <span className="text-sm text-gray-500">
                  ({p.position} {p.isGoalkeeper ? "• GK" : ""}) - {p.team.name}
                </span>
              </div>
              <form
                action={async () => {
                  "use server";
                  await deletePlayer(p.id);
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
          {players.length === 0 && (
            <p className="text-gray-500 text-sm py-2">No players registered yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
