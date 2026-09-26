export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { createSeason, deleteSeason } from "./actions";

export default async function SeasonsPage() {
  const seasons = await prisma.season.findMany({
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Manage Seasons</h1>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Create New Season</h2>
        <form action={createSeason} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Season Name</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. 2024-2025 Season"
              className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                required
                className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                required
                className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="isCurrent" value="true" id="isCurrent" />
            <label htmlFor="isCurrent" className="text-sm font-medium">
              Set as active/current season
            </label>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Create Season
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Existing Seasons</h2>
        <div className="divide-y">
          {seasons.map((s) => (
            <div key={s.id} className="py-3 flex justify-between items-center">
              <div>
                <span className="font-semibold">{s.name}</span>
                {s.isCurrent && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full font-medium">
                    Active
                  </span>
                )}
                <p className="text-sm text-gray-500">
                  {new Date(s.startDate).toLocaleDateString()} - {new Date(s.endDate).toLocaleDateString()}
                </p>
              </div>
              <form
                action={async () => {
                  "use server";
                  await deleteSeason(s.id);
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
          {seasons.length === 0 && (
            <p className="text-gray-500 text-sm py-2">No seasons created yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
