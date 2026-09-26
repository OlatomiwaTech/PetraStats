"use client";

import { Search, Bell, ChevronDown, User } from "lucide-react";

interface HeaderProps {
  seasons: { id: string; name: string; isCurrent: boolean }[];
  activeSeasonName?: string;
}

export function Header({ seasons, activeSeasonName }: HeaderProps) {
  return (
    <header className="h-20 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 px-8 flex items-center justify-between gap-6 shrink-0">
      {/* Title & Season Subtitle */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Football Statistics</h1>
        <p className="text-xs text-slate-400 font-medium">
          Petra School Football League •{" "}
          <span className="text-blue-400 font-semibold">{activeSeasonName || "Current Season"}</span>
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md relative hidden md:block">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search players, teams, or match dates..."
          className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
        />
      </div>

      {/* Season Selector & Profile */}
      <div className="flex items-center gap-4">
        {/* Season Dropdown */}
        <div className="relative">
          <select
            defaultValue={seasons.find((s) => s.isCurrent)?.id || ""}
            className="appearance-none bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl px-4 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
          >
            {seasons.map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
                {s.name} {s.isCurrent ? " (Active)" : ""}
              </option>
            ))}
            {seasons.length === 0 && <option>No Seasons</option>}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Notifications */}
        <button className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-blue-500 absolute top-2.5 right-2.5 ring-2 ring-slate-900" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
            <User className="w-5 h-5" />
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-white">Coach Analyst</p>
            <p className="text-[10px] text-slate-400 font-medium">Head Analyst</p>
          </div>
        </div>
      </div>
    </header>
  );
}
