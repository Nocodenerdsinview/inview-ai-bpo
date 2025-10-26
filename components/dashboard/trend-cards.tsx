"use client";

import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Award, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Agent {
  id: number;
  name: string;
  avatarUrl?: string;
  latestKPIs: {
    quality: number | null;
    aht: number | null;
    srr: number | null;
    voc: number | null;
  } | null;
}

interface TrendCardsProps {
  agents: Agent[];
}

export function TrendCards({ agents }: TrendCardsProps) {
  // Calculate top performers (by quality score)
  const topPerformers = [...agents]
    .filter((a) => a.latestKPIs?.quality)
    .sort((a, b) => (b.latestKPIs?.quality || 0) - (a.latestKPIs?.quality || 0))
    .slice(0, 3);

  // Calculate bottom performers (needs attention)
  const bottomPerformers = [...agents]
    .filter((a) => a.latestKPIs?.quality)
    .sort((a, b) => (a.latestKPIs?.quality || 0) - (b.latestKPIs?.quality || 0))
    .slice(0, 3);

  // Calculate team averages
  const avgQuality =
    agents.reduce((sum, a) => sum + (a.latestKPIs?.quality || 0), 0) / agents.length;
  const avgAHT =
    agents.reduce((sum, a) => sum + (a.latestKPIs?.aht || 0), 0) / agents.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Top Performers */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-premium">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 bg-emerald-50 rounded-2xl ring-2 ring-emerald-100">
            <Award className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">Top Performers</h3>
        </div>
        <div className="space-y-3">
          {topPerformers.map((agent, index) => (
            <Link
              key={agent.id}
              href={`/agents/${agent.id}`}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-emerald-50/50 hover:shadow-md transition-all duration-200 group"
            >
              <span className="text-xl font-bold text-emerald-500 w-7 flex-shrink-0">{index + 1}</span>
              <img
                src={agent.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.name}`}
                alt={agent.name}
                className="w-10 h-10 rounded-xl ring-2 ring-emerald-200 group-hover:ring-emerald-400 transition-all"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm truncate">{agent.name}</p>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Quality: <span className="text-emerald-600 font-bold">{agent.latestKPIs?.quality?.toFixed(0)}%</span>
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
            </Link>
          ))}
        </div>
      </Card>

      {/* Bottom Performers */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-premium">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 bg-red-50 rounded-2xl ring-2 ring-red-100">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">Needs Attention</h3>
        </div>
        <div className="space-y-3">
          {bottomPerformers.map((agent, index) => (
            <Link
              key={agent.id}
              href={`/agents/${agent.id}`}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-red-50/50 hover:shadow-md transition-all duration-200 group"
            >
              <span className="text-xl font-bold text-red-500 w-7 flex-shrink-0">{index + 1}</span>
              <img
                src={agent.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.name}`}
                alt={agent.name}
                className="w-10 h-10 rounded-xl ring-2 ring-red-200 group-hover:ring-red-400 transition-all"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm truncate">{agent.name}</p>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Quality: <span className="text-red-600 font-bold">{agent.latestKPIs?.quality?.toFixed(0)}%</span>
                </p>
              </div>
              <TrendingDown className="w-5 h-5 text-red-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
            </Link>
          ))}
        </div>
      </Card>

      {/* Team Analytics */}
      <Card className="p-6 md:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-premium">
        <h3 className="font-bold text-slate-900 text-lg mb-6">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100 hover:shadow-md transition-all duration-200">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Team Avg Quality</p>
            <p className="text-3xl font-bold text-slate-900 mb-2">{avgQuality.toFixed(0)}%</p>
            <p className={cn(
              "text-xs font-bold px-2 py-1 rounded-full inline-block",
              avgQuality >= 90 ? "bg-emerald-100 text-emerald-700" :
              avgQuality >= 80 ? "bg-amber-100 text-amber-700" :
              "bg-red-100 text-red-700"
            )}>
              {avgQuality >= 90 ? "On Target" : avgQuality >= 80 ? "Borderline" : "Below Target"}
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100 hover:shadow-md transition-all duration-200">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Team Avg AHT</p>
            <p className="text-3xl font-bold text-slate-900 mb-2">{Math.round(avgAHT)}s</p>
            <p className={cn(
              "text-xs font-bold px-2 py-1 rounded-full inline-block",
              avgAHT <= 550 ? "bg-emerald-100 text-emerald-700" :
              avgAHT <= 605 ? "bg-amber-100 text-amber-700" :
              "bg-red-100 text-red-700"
            )}>
              {avgAHT <= 550 ? "On Target" : avgAHT <= 605 ? "Borderline" : "Above Target"}
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-100 hover:shadow-md transition-all duration-200">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">High Performers</p>
            <p className="text-3xl font-bold text-emerald-600 mb-2">
              {agents.filter((a) => (a.latestKPIs?.quality || 0) >= 90).length}
            </p>
            <p className="text-xs text-slate-600 font-semibold">Quality ≥90%</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-red-50 to-white rounded-2xl border border-red-100 hover:shadow-md transition-all duration-200">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Needs Coaching</p>
            <p className="text-3xl font-bold text-red-600 mb-2">
              {agents.filter((a) => (a.latestKPIs?.quality || 0) < 80).length}
            </p>
            <p className="text-xs text-slate-600 font-semibold">Quality &lt;80%</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

