"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentOverviewCardProps {
  agent: {
    id: number;
    name: string;
    avatarUrl?: string;
    role: string;
    status: string;
  };
  latestKPI: {
    quality: number | null;
    aht: number | null;
    srr: number | null;
    voc: number | null;
  } | null;
  trend: "up" | "down" | "stable";
}

export function AgentOverviewCard({ agent, latestKPI, trend }: AgentOverviewCardProps) {
  // Calculate average performance
  const avgPerformance = latestKPI
    ? ((latestKPI.quality || 0) + (latestKPI.srr || 0) + (latestKPI.voc || 0)) / 3
    : 0;

  // Determine performance level and gradient with clear targets - more subtle colors
  const getPerformanceGradient = (avg: number) => {
    if (avg >= 90) return "bg-gradient-to-br from-emerald-300/60 via-teal-300/50 to-green-400/60"; // On target - GREEN
    if (avg >= 80) return "bg-gradient-to-br from-amber-300/60 via-orange-300/50 to-yellow-400/60"; // Borderline - AMBER
    return "bg-gradient-to-br from-rose-400/70 via-red-400/60 to-red-500/70"; // Not on target - RED
  };

  const getPerformanceBadge = (avg: number) => {
    if (avg >= 90) return { text: "✓ On Target", color: "bg-emerald-500", pulse: false };
    if (avg >= 80) return { text: "⚠ Borderline", color: "bg-amber-500", pulse: false };
    return { text: "✕ Urgent", color: "bg-red-500", pulse: true }; // Urgent cases pulse
  };

  const performanceGradient = getPerformanceGradient(avgPerformance);
  const badge = getPerformanceBadge(avgPerformance);

  return (
    <Link href={`/agents/${agent.id}`}>
      <div className={cn(
        "relative w-[300px] h-[200px] rounded-2xl p-[2px] overflow-hidden",
        "hover:scale-105 transition-all duration-300 cursor-pointer group",
        "shadow-lg hover:shadow-2xl"
      )}>
        {/* Gradient Border */}
        <div className={cn("absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity", performanceGradient)} />
        
        {/* Card Content */}
        <div className="relative h-full bg-white rounded-2xl p-5 flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={agent.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.name}`}
                  alt={agent.name}
                  className="w-12 h-12 rounded-full bg-slate-100 ring-2 ring-white"
                />
                <div className={cn(
                  "absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white",
                  agent.status === "active" ? "bg-green-500 animate-pulse-slow" : "bg-slate-400"
                )} />
              </div>

              {/* Name & Role */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 truncate text-sm">{agent.name}</h3>
                <p className="text-xs text-slate-600 truncate">{agent.role}</p>
              </div>
            </div>

            {/* Trend Icon */}
            <div className="flex-shrink-0">
              {trend === "up" && <TrendingUp className="w-5 h-5 text-green-600" />}
              {trend === "down" && <TrendingDown className="w-5 h-5 text-red-600" />}
              {trend === "stable" && <Minus className="w-5 h-5 text-slate-600" />}
            </div>
          </div>

          {/* KPI Stats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Quality</span>
              <span className="text-sm font-bold text-slate-900">{latestKPI?.quality?.toFixed(0) || "N/A"}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">AHT</span>
              <span className="text-sm font-bold text-slate-900">{latestKPI?.aht || "N/A"}s</span>
            </div>
          </div>

          {/* Performance Badge */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white shadow-md",
              badge.color,
              badge.pulse && "animate-pulse-slow"
            )}>
              <div className={cn(
                "w-1.5 h-1.5 bg-white rounded-full",
                badge.pulse && "animate-pulse"
              )} />
              {badge.text}
            </div>
            <span className={cn(
              "text-xs font-semibold",
              avgPerformance >= 90 ? "text-emerald-600" :
              avgPerformance >= 80 ? "text-amber-600" :
              "text-red-600"
            )}>
              Avg: {avgPerformance.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

