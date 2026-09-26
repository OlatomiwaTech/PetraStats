"use client";

import { motion } from "framer-motion";

interface StandingRow {
  id: string;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gd: number;
  points: number;
}

interface StandingsTableProps {
  standings: StandingRow[];
  seasonName: string;
}

export function StandingsTable({ standings, seasonName }: StandingsTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">{seasonName} Standings</h2>
          <p className="text-xs text-slate-400 font-medium">Top teams qualify for Finals</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800/80 bg-slate-800/30 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            <tr>
              <th className="py-3 px-3">POS</th>
              <th className="py-3 px-3">TEAM</th>
              <th className="py-3 px-3 text-center">P</th>
              <th className="py-3 px-3 text-center">W</th>
              <th className="py-3 px-3 text-center">D</th>
              <th className="py-3 px-3 text-center">L</th>
              <th className="py-3 px-3 text-center">GD</th>
              <th className="py-3 px-3 text-center font-extrabold text-slate-200">PTS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {standings.map((row, idx) => (
              <tr
                key={row.id}
                className="hover:bg-slate-800/30 transition-colors text-slate-300"
              >
                <td className="py-3 px-3">
                  <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center font-bold text-[10px] ${
                    idx === 0 ? "bg-blue-600 text-white" :
                    idx === 1 ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                    "text-slate-400"
                  }`}>
                    {idx + 1}
                  </span>
                </td>
                <td className="py-3 px-3 font-bold text-white">{row.name}</td>
                <td className="py-3 px-3 text-center text-slate-400">{row.played}</td>
                <td className="py-3 px-3 text-center text-slate-400">{row.won}</td>
                <td className="py-3 px-3 text-center text-slate-400">{row.drawn}</td>
                <td className="py-3 px-3 text-center text-slate-400">{row.lost}</td>
                <td className="py-3 px-3 text-center font-semibold text-emerald-400">
                  {row.gd > 0 ? `+${row.gd}` : row.gd}
                </td>
                <td className="py-3 px-3 text-center font-black text-white text-sm">
                  {row.points}
                </td>
              </tr>
            ))}

            {standings.length === 0 && (
              <tr>
                <td colSpan={8} className="py-6 text-center text-slate-500 text-xs">
                  No standings calculated for active season.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
