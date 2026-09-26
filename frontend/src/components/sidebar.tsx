"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Trophy,
  Award,
  Shield,
  Users,
  UserCheck,
  Settings,
  Globe,

} from "lucide-react";

const navItems = [
  { group: "CORE DASHBOARD", items: [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Matches & Fixtures", href: "/matches", icon: Calendar, badge: "Live" },
  ]},
  { group: "LEADERBOARDS", items: [
    { name: "Top Scorers", href: "/leaderboard#scorers", icon: Trophy },
    { name: "Top Assists", href: "/leaderboard#assists", icon: Award },
    { name: "Goalkeepers", href: "/leaderboard#goalkeepers", icon: Shield },
  ]},
  { group: "DIRECTORY", items: [
    { name: "Teams & Houses", href: "/admin/teams", icon: Users },
    { name: "All Players", href: "/admin/players", icon: UserCheck },
  ]},
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0f172a] text-slate-300 min-h-screen flex flex-col justify-between p-4 border-r border-slate-800 shrink-0">
      <div className="space-y-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white tracking-wide">PetraStats</h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Petra Football</p>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="space-y-6">
          {navItems.map((section) => (
            <div key={section.group} className="space-y-2">
              <h3 className="text-[11px] font-bold text-slate-500 px-3 tracking-wider uppercase">
                {section.group}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                          : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer / Admin Switch */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        <Link
          href="/admin/seasons"
          className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Admin Settings</span>
        </Link>

        <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <p className="text-xs font-semibold text-slate-200">Admin Mode</p>
              <p className="text-[10px] text-slate-500">Authorized View</p>
            </div>
          </div>
          <Link
            href="/admin/seasons"
            className="text-[11px] font-bold text-blue-400 hover:text-blue-300 underline"
          >
            Manage
          </Link>
        </div>
      </div>
    </aside>
  );
}
