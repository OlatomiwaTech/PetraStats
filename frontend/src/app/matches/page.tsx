import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PublicMatchesPage() {
  const matches = await prisma.match.findMany({
    include: {
      homeTeam: true,
      awayTeam: true,
      season: true,
      events: {
        include: { player: true },
        orderBy: { minute: "asc" },
      },
    },
    orderBy: { matchDate: "desc" },
  });

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Match Fixtures & Results</h1>

      <div className="space-y-4">
        {matches.map((m) => (
          <div
            key={m.id}
            className="bg-white dark:bg-zinc-900 p-6 rounded-lg border shadow-sm space-y-4"
          >
            <div className="flex justify-between items-center border-b pb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase">
                {m.season.name}
              </span>
              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-zinc-800 rounded font-medium">
                {m.status}
              </span>
            </div>

            <div className="flex justify-between items-center text-center py-2">
              <div className="flex-1 font-bold text-lg">{m.homeTeam.name}</div>
              <div className="px-6 py-2 bg-gray-50 dark:bg-zinc-800 rounded-md font-extrabold text-2xl">
                {m.status === "SCHEDULED" ? "VS" : `${m.homeScore} - ${m.awayScore}`}
              </div>
              <div className="flex-1 font-bold text-lg">{m.awayTeam.name}</div>
            </div>

            <div className="text-center text-xs text-gray-500">
              {new Date(m.matchDate).toLocaleString()}
            </div>

            {m.events.length > 0 && (
              <div className="border-t pt-3 space-y-1 text-xs">
                <span className="font-semibold text-gray-500 block mb-1">Key Events:</span>
                {m.events.map((e) => (
                  <div key={e.id} className="text-gray-600 dark:text-gray-400">
                    <span className="font-bold">{e.minute}&apos;</span> - {e.type}: {e.player.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {matches.length === 0 && (
          <p className="text-gray-500 text-center py-8">No matches scheduled or recorded.</p>
        )}
      </div>
    </div>
  );
}
