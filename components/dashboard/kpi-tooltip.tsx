"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPITooltipProps {
  metric: "quality" | "aht" | "srr" | "voc";
  value: number;
  target: number;
  teamAvg: number;
  trend: "up" | "down" | "stable";
  insight: string;
}

export function KPITooltipContent({ metric, value, target, teamAvg, trend, insight }: KPITooltipProps) {
  const isLowerBetter = metric === "aht";
  const percentFromTarget = ((value - target) / target) * 100;
  const percentFromTeam = ((value - teamAvg) / teamAvg) * 100;

  const getStatus = () => {
    if (isLowerBetter) {
      if (value <= target) return { status: "success", label: "On Target", color: "text-emerald-400" };
      if (value <= target * 1.1) return { status: "warning", label: "Borderline", color: "text-amber-400" };
      return { status: "danger", label: "Critical", color: "text-red-400" };
    } else {
      if (value >= target) return { status: "success", label: "On Target", color: "text-emerald-400" };
      if (value >= target * 0.89) return { status: "warning", label: "Borderline", color: "text-amber-400" };
      return { status: "danger", label: "Critical", color: "text-red-400" };
    }
  };

  const { status, label, color } = getStatus();
  const metricLabels = {
    quality: "Quality Score",
    aht: "Avg Handle Time",
    srr: "Sales Retention Rate",
    voc: "Voice of Customer",
  };

  return (
    <div className="w-72 p-4 bg-slate-900 text-white rounded-2xl shadow-premium-xl border border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700/50">
        <h4 className="font-semibold text-sm text-slate-200">{metricLabels[metric]}</h4>
        <span className={cn("text-3xl font-bold", color)}>
          {metric === "aht" ? `${value}s` : `${value.toFixed(0)}%`}
        </span>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 mb-4">
        <div className={cn("w-2.5 h-2.5 rounded-full shadow-lg", 
          status === "success" && "bg-emerald-400",
          status === "warning" && "bg-amber-400",
          status === "danger" && "bg-red-400 animate-pulse"
        )} />
        <span className={cn("text-sm font-semibold", color)}>{label}</span>
      </div>

      {/* Comparisons */}
      <div className="space-y-2.5 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-300 font-medium">vs Target ({metric === "aht" ? `${target}s` : `${target}%`})</span>
          <span className={cn(
            "font-bold px-2 py-0.5 rounded-md",
            isLowerBetter 
              ? (percentFromTarget <= 0 ? "text-emerald-400 bg-emerald-950/50" : "text-red-400 bg-red-950/50")
              : (percentFromTarget >= 0 ? "text-emerald-400 bg-emerald-950/50" : "text-red-400 bg-red-950/50")
          )}>
            {percentFromTarget > 0 ? "+" : ""}{percentFromTarget.toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-300 font-medium">vs Team Avg ({metric === "aht" ? `${teamAvg.toFixed(0)}s` : `${teamAvg.toFixed(0)}%`})</span>
          <span className={cn(
            "font-bold px-2 py-0.5 rounded-md",
            isLowerBetter
              ? (percentFromTeam <= 0 ? "text-emerald-400 bg-emerald-950/50" : "text-amber-400 bg-amber-950/50")
              : (percentFromTeam >= 0 ? "text-emerald-400 bg-emerald-950/50" : "text-amber-400 bg-amber-950/50")
          )}>
            {percentFromTeam > 0 ? "+" : ""}{percentFromTeam.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Trend */}
      <div className="flex items-center gap-2.5 mb-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
        {trend === "up" && <TrendingUp className="w-5 h-5 text-blue-400" />}
        {trend === "down" && <TrendingDown className="w-5 h-5 text-red-400" />}
        {trend === "stable" && <Minus className="w-5 h-5 text-slate-400" />}
        <span className="text-sm text-slate-200 font-medium">
          {trend === "up" && "Improving trend"}
          {trend === "down" && "Declining trend"}
          {trend === "stable" && "Stable performance"}
        </span>
      </div>

      {/* Insight */}
      <div className="p-3 bg-gradient-to-br from-blue-900/40 to-blue-950/40 border border-blue-800/50 rounded-xl text-sm">
        <p className="text-blue-100 leading-relaxed">{insight}</p>
      </div>

      {/* Mini Sparkline */}
      <div className="mt-4 flex items-end gap-1 h-10 bg-slate-800/30 rounded-xl p-2">
        {[0.6, 0.7, 0.65, 0.8, 0.75, 0.85, 0.9, 0.88, 0.92, 0.95, 0.93, 1].map((height, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-lg transition-all hover:opacity-80",
              status === "success" && "bg-emerald-400/70",
              status === "warning" && "bg-amber-400/70",
              status === "danger" && "bg-red-400/70"
            )}
            style={{ height: `${height * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}

