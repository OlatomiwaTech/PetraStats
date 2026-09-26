"use client";

import { motion } from "framer-motion";
import { Activity, Zap, AlertTriangle } from "lucide-react";

interface MatchEventItem {
  id: string;
  type: string;
  minute: number;
  player: { name: string };
  match: {
    homeTeam: { name: string };
    awayTeam: { name: string };
  };
}

interface LiveActivityProps {
  events: MatchEventItem[];
}

export function LiveActivity({ events }: LiveActivityProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Recent Live Activity</h2>
          <p className="text-[11px] text-slate-400 font-medium">Real-time Match Events</p>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-[10px] uppercase tracking-wider">
          Feed
        </span>
      </div>

      <div className="space-y-3">
        {events.slice(0, 4).map((evt, idx) => {
          const isGoal = evt.type === "GOAL";
          const isCard = evt.type.includes("CARD");
          return (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + idx * 0.08 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-800/60"
            >
              <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${
                isGoal ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                isCard ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                "bg-blue-500/10 text-blue-400 border-blue-500/20"
              }`}>
                {isGoal ? <Zap className="w-3.5 h-3.5" /> : isCard ? <AlertTriangle className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
              </div>

              <div className="space-y-0.5 text-left">
                <p className="text-xs font-bold text-slate-200">
                  <span className="text-blue-400">{evt.minute}&apos;</span> {evt.type === "GOAL" ? "Goal Scored!" : evt.type}
                </p>
                <p className="text-[11px] text-slate-300 font-semibold">{evt.player.name}</p>
                <p className="text-[10px] text-slate-500">
                  {evt.match.homeTeam.name} vs {evt.match.awayTeam.name}
                </p>
              </div>
            </motion.div>
          );
        })}

        {events.length === 0 && (
          <div className="text-center py-6 text-slate-500 text-xs">
            No live match activity logged.
          </div>
        )}
      </div>
    </motion.div>
  );
}
