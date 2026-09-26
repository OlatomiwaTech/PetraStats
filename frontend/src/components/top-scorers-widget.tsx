"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Trophy } from "lucide-react";

interface TopScorer {
  id: string;
  name: string;
  team: string;
  position: string;
  goals: number;
  appearances: number;
}

interface TopScorersWidgetProps {
  scorers: TopScorer[];
}

export function TopScorersWidget({ scorers }: TopScorersWidgetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Top Scorers</h2>
            <p className="text-[11px] text-slate-400 font-medium">Golden Boot Race</p>
          </div>
        </div>
        <Link
          href="/leaderboard"
          className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
        >
          Full Leaderboard
        </Link>
      </div>

      <div className="space-y-3">
        {scorers.slice(0, 3).map((scorer, idx) => (
          <motion.div
            key={scorer.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 + idx * 0.1 }}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800/80 hover:border-slate-700/60 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-extrabold text-xs ${
                idx === 0 ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                idx === 1 ? "bg-slate-300/20 text-slate-300 border border-slate-300/30" :
                "bg-amber-700/20 text-amber-600 border border-amber-700/30"
              }`}>
                {idx + 1}
              </div>

              <div className="w-9 h-9 rounded-xl bg-slate-700/50 border border-slate-600/40 flex items-center justify-center text-slate-300 font-bold text-xs uppercase">
                {scorer.name.split(" ").map((n) => n[0]).join("")}
              </div>

              <div>
                <p className="text-xs font-bold text-slate-100">{scorer.name}</p>
                <p className="text-[10px] text-slate-400 font-medium">
                  {scorer.team} • {scorer.position}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-sm font-black text-white">{scorer.goals} <span className="text-[10px] text-slate-400 font-medium">G</span></span>
              <p className="text-[10px] text-slate-500 font-medium">{scorer.appearances} Apps</p>
            </div>
          </motion.div>
        ))}

        {scorers.length === 0 && (
          <div className="text-center py-6 text-slate-500 text-xs">
            No top scorers recorded yet.
          </div>
        )}
      </div>
    </motion.div>
  );
}
