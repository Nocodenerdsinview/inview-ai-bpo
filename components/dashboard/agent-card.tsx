"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, Calendar, Sparkles } from "lucide-react";
import type { Agent, KPI } from "@/types";
import { cn } from "@/lib/utils";

interface AgentCardProps {
  agent: Agent;
  latestKPI?: KPI | null;
  lastAuditDate?: string | null;
  nextCoachingDate?: string | null;
  attentionFlags?: string[];
}

export function AgentCard({
  agent,
  latestKPI,
  lastAuditDate,
  nextCoachingDate,
  attentionFlags = [],
}: AgentCardProps) {
  const hasFlags = attentionFlags.length > 0;

  // Clear color coding: GREEN = on target, AMBER = borderline, RED = not on target
  const getKPIStatus = (value: number | null | undefined, metric: "quality" | "aht" | "srr" | "voc") => {
    if (!value) return "neutral";
    
    if (metric === "aht") {
      // Lower is better for AHT: target is 550s
      if (value <= 550) return "good"; // GREEN - on target
      if (value <= 600) return "neutral"; // AMBER - borderline
      return "bad"; // RED - not on target (urgent)
    }
    
    // Higher is better for quality, srr, voc: target is 90%+
    if (value >= 90) return "good"; // GREEN - on target
    if (value >= 80) return "neutral"; // AMBER - borderline
    return "bad"; // RED - not on target (urgent)
  };

  const qualityStatus = getKPIStatus(latestKPI?.quality, "quality");
  const ahtStatus = getKPIStatus(latestKPI?.aht, "aht");

  // Determine if agent is a top performer or needs urgent attention
  const isTopPerformer = latestKPI?.quality && latestKPI.quality >= 95;
  const avgPerformance = latestKPI
    ? ((latestKPI.quality || 0) + (latestKPI.srr || 0) + (latestKPI.voc || 0)) / 3
    : 0;
  
  const performanceLevel = avgPerformance >= 90 ? "excellent" : avgPerformance >= 80 ? "good" : avgPerformance >= 70 ? "warning" : "danger";
  const isUrgent = performanceLevel === "danger" || (qualityStatus === "bad" || ahtStatus === "bad"); // Critical state

  return (
    <Card className={cn(
      "relative p-6 overflow-hidden rounded-2xl transition-all duration-300 group",
      "hover:scale-102 hover:-translate-y-1 hover:shadow-2xl",
      hasFlags && "ring-2 ring-amber-500 shadow-amber-200",
      isTopPerformer && "ring-2 ring-purple-400 shadow-purple-200",
      isUrgent && !isTopPerformer && !hasFlags && "ring-2 ring-red-500 shadow-red-200 animate-pulse-slow" // Urgent - pulse
    )}>
      {/* Top performer gradient border effect */}
      {isTopPerformer && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-10 rounded-2xl" />
      )}
      
      {/* Attention flag */}
      {hasFlags && (
        <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg animate-pulse">
          !
        </div>
      )}

      {/* Top performer badge */}
      {isTopPerformer && !hasFlags && (
        <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg animate-glow">
          ★
        </div>
      )}

      <div className="relative flex items-start gap-4 z-10">
        {/* Avatar */}
        <div className="relative">
          <div className={cn(
            "rounded-full p-[2px]",
            isTopPerformer && "bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 shadow-lg shadow-purple-300"
          )}>
            <img
              src={agent.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.name}`}
              alt={agent.name}
              className="w-14 h-14 rounded-full bg-white ring-2 ring-white"
            />
          </div>
          <div className={cn(
            "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm",
            agent.status === "active" ? "bg-green-500 animate-pulse-slow" : "bg-slate-400"
          )} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">{agent.name}</h3>
          <p className="text-sm text-slate-600">{agent.tenure} months tenure</p>

          {/* KPIs with urgency indicators */}
          <div className="mt-3 flex gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-500">Quality:</span>
              <span className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-bold shadow-md",
                qualityStatus === "good" && "bg-gradient-to-r from-emerald-500 to-green-600 text-white", // GREEN - on target
                qualityStatus === "bad" && "bg-gradient-to-r from-rose-500 to-red-600 text-white animate-pulse-slow", // RED - urgent, pulse
                qualityStatus === "neutral" && "bg-gradient-to-r from-amber-500 to-orange-600 text-white" // AMBER - borderline
              )}>
                {qualityStatus === "good" && "✓ "}
                {qualityStatus === "bad" && "✕ "}
                {qualityStatus === "neutral" && "⚠ "}
                {latestKPI?.quality?.toFixed(0) || "N/A"}%
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-500">AHT:</span>
              <span className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-bold shadow-md",
                ahtStatus === "good" && "bg-gradient-to-r from-emerald-500 to-green-600 text-white", // GREEN - on target
                ahtStatus === "bad" && "bg-gradient-to-r from-rose-500 to-red-600 text-white animate-pulse-slow", // RED - urgent, pulse
                ahtStatus === "neutral" && "bg-gradient-to-r from-amber-500 to-orange-600 text-white" // AMBER - borderline
              )}>
                {ahtStatus === "good" && "✓ "}
                {ahtStatus === "bad" && "✕ "}
                {ahtStatus === "neutral" && "⚠ "}
                {latestKPI?.aht || "N/A"}s
              </span>
            </div>
          </div>

          {/* Dates */}
          <div className="mt-3 space-y-1 text-xs text-slate-600">
            {lastAuditDate && (
              <div>Last audit: {new Date(lastAuditDate).toLocaleDateString()}</div>
            )}
            {nextCoachingDate && (
              <div className="font-medium text-blue-600">
                Next coaching: {new Date(nextCoachingDate).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Flags */}
          {hasFlags && (
            <div className="mt-2 space-y-1">
              {attentionFlags.map((flag, i) => (
                <div key={i} className="text-xs font-semibold text-amber-800 bg-gradient-to-r from-amber-100 to-orange-100 px-2.5 py-1.5 rounded-lg border border-amber-200 shadow-sm">
                  ⚠️ {flag}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions - shown on hover */}
      <div className="relative mt-4 pt-4 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-y-0 translate-y-2 z-10">
        <div className="flex gap-2">
          <Link href={`/agents/${agent.id}`} className="flex-1">
            <Button size="sm" className="w-full gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all">
              <Eye className="w-4 h-4" />
              View Profile
            </Button>
          </Link>
          <Link href={`/coaching/quick-prep/${agent.id}`}>
            <Button size="sm" className="gap-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all">
              <Sparkles className="w-4 h-4" />
              Quick Prep
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

