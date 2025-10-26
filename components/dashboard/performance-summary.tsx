"use client";

import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PerformanceSummaryProps {
  teamKPIs: {
    quality: { current: number; target: number; trend: "up" | "down" | "stable" };
    aht: { current: number; target: number; trend: "up" | "down" | "stable" };
    srr: { current: number; target: number; trend: "up" | "down" | "stable" };
    voc: { current: number; target: number; trend: "up" | "down" | "stable" };
  };
  agentCount: number;
  criticalCount: number;
}

export function PerformanceSummary({ teamKPIs, agentCount, criticalCount }: PerformanceSummaryProps) {
  const metrics = [
    {
      label: "Quality",
      value: teamKPIs.quality.current,
      target: teamKPIs.quality.target,
      unit: "%",
      trend: teamKPIs.quality.trend,
      isLowerBetter: false,
    },
    {
      label: "AHT",
      value: teamKPIs.aht.current,
      target: teamKPIs.aht.target,
      unit: "s",
      trend: teamKPIs.aht.trend,
      isLowerBetter: true,
    },
    {
      label: "SRR",
      value: teamKPIs.srr.current,
      target: teamKPIs.srr.target,
      unit: "%",
      trend: teamKPIs.srr.trend,
      isLowerBetter: false,
    },
    {
      label: "VOC",
      value: teamKPIs.voc.current,
      target: teamKPIs.voc.target,
      unit: "%",
      trend: teamKPIs.voc.trend,
      isLowerBetter: false,
    },
  ];

  const getStatus = (value: number, target: number, isLowerBetter: boolean) => {
    const percentage = (value / target) * 100;
    if (isLowerBetter) {
      if (percentage <= 100) return "success";
      if (percentage <= 110) return "warning";
      return "danger";
    } else {
      if (percentage >= 100) return "success";
      if (percentage >= 89) return "warning";
      return "danger";
    }
  };

  return (
    <Card className="p-6 mb-6 bg-white border border-gray-200 rounded-2xl shadow-md card-soft">
      <div className="flex items-center justify-between gap-8">
        {/* Left: Team Overview */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-100 rounded-2xl ring-2 ring-slate-200">
              <Users className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-bold uppercase tracking-wide">Active Agents</p>
              <p className="text-4xl font-bold text-gray-900 mt-1 metric-value">{agentCount}</p>
            </div>
          </div>

          {criticalCount > 0 && (
            <div className="flex items-center gap-4 pl-8 border-l-2 border-gray-200">
              <div className="p-3 bg-red-50 rounded-2xl ring-2 ring-red-100 animate-pulse">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-bold uppercase tracking-wide">Needs Attention</p>
                <p className="text-4xl font-bold text-red-600 mt-1 metric-value">{criticalCount}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: KPI Metrics */}
        <div className="flex items-center gap-6">
          {metrics.map((metric, index) => {
            const status = getStatus(metric.value, metric.target, metric.isLowerBetter);
            return (
              <div key={metric.label} className={cn(
                "flex items-center gap-4 transition-all duration-200 hover:scale-105",
                index > 0 && "pl-6 border-l-2 border-gray-200"
              )}>
                <div>
                  <p className="text-xs text-gray-600 font-bold uppercase tracking-wide">
                    {metric.label}
                  </p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span
                      className={cn(
                        "text-4xl font-bold leading-none metric-value",
                        status === "success" && "text-green-600",
                        status === "warning" && "text-yellow-600",
                        status === "danger" && "text-red-600"
                      )}
                    >
                      {metric.value}
                    </span>
                    <span className="text-base font-semibold text-gray-400">{metric.unit}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    {metric.trend === "up" && (
                      <TrendingUp
                        className={cn(
                          "w-4 h-4",
                          metric.isLowerBetter ? "text-red-600" : "text-slate-500"
                        )}
                      />
                    )}
                    {metric.trend === "down" && (
                      <TrendingDown
                        className={cn(
                          "w-4 h-4",
                          metric.isLowerBetter ? "text-slate-500" : "text-red-600"
                        )}
                      />
                    )}
                    <span className="text-xs text-gray-500 font-medium">
                      vs {metric.target}{metric.unit}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

