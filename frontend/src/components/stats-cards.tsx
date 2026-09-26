"use client";

import { motion } from "framer-motion";
import { Activity, Target, Sparkles, Shield, Users } from "lucide-react";

interface StatsCardsProps {
  matchesPlayed: number;
  totalMatches: number;
  goalsScored: number;
  totalAssists: number;
  activeTeamsCount: number;
  registeredPlayersCount: number;
}

export function StatsCards({
  matchesPlayed,
  totalMatches,
  goalsScored,
  totalAssists,
  activeTeamsCount,
  registeredPlayersCount,
}: StatsCardsProps) {
  const avgGoalsPerMatch =
    matchesPlayed > 0 ? (goalsScored / matchesPlayed).toFixed(2) : "0.00";
  const assistGoalRate =
    goalsScored > 0 ? Math.round((totalAssists / goalsScored) * 100) : 0;

  const cards = [
    {
      title: "Matches Played",
      value: `${matchesPlayed}`,
      total: totalMatches > 0 ? `/ ${totalMatches}` : "",
      sub: matchesPlayed > 0 ? `+${matchesPlayed} recorded` : "Season scheduled",
      icon: Activity,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      title: "Goals Scored",
      value: `${goalsScored}`,
      sub: `${avgGoalsPerMatch} avg per match`,
      icon: Target,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      title: "Total Assists",
      value: `${totalAssists}`,
      sub: `${assistGoalRate}% Goal Assist Rate`,
      icon: Sparkles,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
    },
    {
      title: "Active Teams",
      value: `${activeTeamsCount}`,
      sub: "Inter-House & League",
      icon: Shield,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      title: "Registered Players",
      value: `${registeredPlayersCount}`,
      sub: "100% verified rosters",
      icon: Users,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.08 }}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700/80 transition-all shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">{card.title}</span>
              <div className={`p-2 rounded-xl ${card.bg} ${card.border} border`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-white tracking-tight">
                  {card.value}
                </span>
                {card.total && (
                  <span className="text-xs text-slate-500 font-medium">{card.total}</span>
                )}
              </div>
              <p className="text-[11px] font-medium text-slate-400 mt-1">{card.sub}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
