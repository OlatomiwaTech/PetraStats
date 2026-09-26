"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

interface MatchFixture {
  id: string;
  matchDate: Date;
  status: string;
  homeScore: number;
  awayScore: number;
  homeTeam: { id: string; name: string };
  awayTeam: { id: string; name: string };
  events: { id: string; type: string; minute: number; player: { name: string } }[];
}

interface RecentFixturesProps {
  fixtures: MatchFixture[];
}

export function RecentFixtures({ fixtures }: RecentFixturesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Recent Fixtures</h2>
          <p className="text-xs text-slate-400 font-medium">Latest Match Results & Schedules</p>
        </div>
        <Link
          href="/matches"
          className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
        >
          <span>View Match Hub</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fixtures.slice(0, 2).map((match, idx) => {
          const goals = match.events.filter((e) => e.type === "GOAL");
          return (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 + idx * 0.1 }}
              className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4 hover:border-slate-700/60 transition-all"
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 border-b border-slate-800/80 pb-2.5">
                <span>{new Date(match.matchDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                  match.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                }`}>
                  {match.status}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-[10px] font-bold text-blue-400">
                      {match.homeTeam.name.charAt(0)}
                    </div>
                    <span className="text-slate-100">{match.homeTeam.name}</span>
                  </div>
                  <span className="text-white font-extrabold text-base">{match.homeScore}</span>
                </div>

                <div className="flex items-center justify-between text-sm font-semibold">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-[10px] font-bold text-emerald-400">
                      {match.awayTeam.name.charAt(0)}
                    </div>
                    <span className="text-slate-100">{match.awayTeam.name}</span>
                  </div>
                  <span className="text-white font-extrabold text-base">{match.awayScore}</span>
                </div>
              </div>

              {goals.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <p className="truncate max-w-[200px]">
                    ⚽ {goals.map((g) => `${g.player.name} ${g.minute}'`).join(", ")}
                  </p>
                  <Link
                    href={`/admin/matches/${match.id}/events`}
                    className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-0.5 shrink-0"
                  >
                    <span>Details</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </motion.div>
          );
        })}

        {fixtures.length === 0 && (
          <div className="col-span-2 text-center py-8 text-slate-500 text-xs">
            No recent match fixtures found.
          </div>
        )}
      </div>
    </motion.div>
  );
}
