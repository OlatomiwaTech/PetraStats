export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import {
  addMatchEvent,
  deleteMatchEvent,
  updateGoalkeeperStats,
  updateMatchStatus,
} from "./actions";
import { EventType, MatchStatus } from "@prisma/client";

export default async function MatchEventsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: matchId } = await params;

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      homeTeam: { include: { players: true } },
      awayTeam: { include: { players: true } },
      events: {
        include: {
          player: true,
          assistPlayer: true,
        },
        orderBy: { minute: "asc" },
      },
      goalkeeperStats: {
        include: { player: true },
      },
      season: true,
    },
  });

  if (!match) {
    notFound();
  }

  const allPlayers = [...match.homeTeam.players, ...match.awayTeam.players];
  const goalkeepers = allPlayers.filter((p) => p.isGoalkeeper);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase">
            {match.season.name}
          </span>
          <h1 className="text-2xl font-bold mt-1">
            {match.homeTeam.name} {match.homeScore} - {match.awayScore}{" "}
            {match.awayTeam.name}
          </h1>
          <p className="text-sm text-gray-500">
            {new Date(match.matchDate).toLocaleString()} | Status: {match.status}
          </p>
        </div>

        <div className="flex gap-2">
          {(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as MatchStatus[]).map(
            (s) => (
              <form
                key={s}
                action={async () => {
                  "use server";
                  await updateMatchStatus(matchId, s);
                }}
              >
                <button
                  type="submit"
                  className={`px-3 py-1 text-xs rounded-md font-semibold ${
                    match.status === s
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {s}
                </button>
              </form>
            )
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">Log Match Event</h2>
          <form
            action={async (formData) => {
              "use server";
              await addMatchEvent(matchId, formData);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1">Event Type</label>
              <select
                name="type"
                required
                className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800"
              >
                {Object.values(EventType).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Minute</label>
              <input
                type="number"
                name="minute"
                required
                min="1"
                max="120"
                placeholder="45"
                className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Player</label>
              <select
                name="playerId"
                required
                className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800"
              >
                <option value="">-- Select Player --</option>
                <optgroup label={match.homeTeam.name}>
                  {match.homeTeam.players.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.number} {p.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label={match.awayTeam.name}>
                  {match.awayTeam.players.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.number} {p.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Assisting Player (Goals only)
              </label>
              <select
                name="assistPlayerId"
                className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800"
              >
                <option value="">-- None --</option>
                <optgroup label={match.homeTeam.name}>
                  {match.homeTeam.players.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.number} {p.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label={match.awayTeam.name}>
                  {match.awayTeam.players.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.number} {p.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
            >
              Log Event
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">Logged Events</h2>
          <div className="divide-y max-h-[400px] overflow-y-auto">
            {match.events.map((e) => (
              <div key={e.id} className="py-2.5 flex justify-between items-center text-sm">
                <div>
                  <span className="font-bold text-blue-600">{e.minute}&apos;</span>{" "}
                  <span className="font-semibold">{e.type}</span> - {e.player.name}
                  {e.assistPlayer && (
                    <span className="text-gray-500 text-xs block">
                      Assist: {e.assistPlayer.name}
                    </span>
                  )}
                </div>
                <form
                  action={async () => {
                    "use server";
                    await deleteMatchEvent(e.id, matchId);
                  }}
                >
                  <button type="submit" className="text-red-500 text-xs font-medium">
                    Remove
                  </button>
                </form>
              </div>
            ))}
            {match.events.length === 0 && (
              <p className="text-gray-500 text-sm py-2">No events logged yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border shadow-sm space-y-4">
        <h2 className="text-xl font-semibold">Goalkeeper Match Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goalkeepers.map((gk) => {
            const stats = match.goalkeeperStats.find((s) => s.playerId === gk.id);
            return (
              <form
                key={gk.id}
                action={async (formData) => {
                  "use server";
                  await updateGoalkeeperStats(matchId, formData);
                }}
                className="p-4 border rounded-md space-y-3 dark:bg-zinc-800/50"
              >
                <input type="hidden" name="playerId" value={gk.id} />
                <div className="font-bold">
                  {gk.name} ({gk.teamId === match.homeTeamId ? match.homeTeam.name : match.awayTeam.name})
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Saves</label>
                    <input
                      type="number"
                      name="saves"
                      defaultValue={stats?.saves ?? 0}
                      className="w-full px-2 py-1 text-sm border rounded dark:bg-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Goals Conceded</label>
                    <input
                      type="number"
                      name="goalsConceded"
                      defaultValue={stats?.goalsConceded ?? 0}
                      className="w-full px-2 py-1 text-sm border rounded dark:bg-zinc-800"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="cleanSheet"
                    value="true"
                    defaultChecked={stats?.cleanSheet ?? false}
                    id={`cs-${gk.id}`}
                  />
                  <label htmlFor={`cs-${gk.id}`} className="text-xs font-medium">
                    Clean Sheet
                  </label>
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 bg-gray-900 text-white dark:bg-zinc-700 rounded text-xs font-medium hover:bg-gray-800"
                >
                  Save GK Stats
                </button>
              </form>
            );
          })}
          {goalkeepers.length === 0 && (
            <p className="text-gray-500 text-sm">No goalkeepers found on either team.</p>
          )}
        </div>
      </div>
    </div>
  );
}
