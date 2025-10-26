"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { KPITooltipContent } from "./kpi-tooltip";
import { AgentCardExpanded } from "./agent-card-expanded";
import { Target, Clock, TrendingUp, Star, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface EnhancedAgentCardProps {
  agent: {
    id: number;
    name: string;
    avatarUrl?: string;
    tenure: number;
    status: string;
  };
  kpis: {
    quality: number | null;
    aht: number | null;
    srr: number | null;
    voc: number | null;
  } | null;
  teamAvg: {
    quality: number;
    aht: number;
    srr: number;
    voc: number;
  };
  trends: {
    quality: "up" | "down" | "stable";
    aht: "up" | "down" | "stable";
    srr: "up" | "down" | "stable";
    voc: "up" | "down" | "stable";
  };
  needsAttention: boolean;
  attentionReason?: string;
}

export function EnhancedAgentCard({ agent, kpis, teamAvg, trends, needsAttention, attentionReason }: EnhancedAgentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getKPIStatus = (value: number | null, metric: "quality" | "aht" | "srr" | "voc") => {
    if (!value) return "neutral";
    
    if (metric === "aht") {
      if (value <= 550) return "success";
      if (value <= 605) return "warning";
      return "danger";
    } else {
      if (value >= 90) return "success";
      if (value >= 80) return "warning";
      return "danger";
    }
  };

  const qualityStatus = getKPIStatus(kpis?.quality || null, "quality");
  const ahtStatus = getKPIStatus(kpis?.aht || null, "aht");
  const srrStatus = getKPIStatus(kpis?.srr || null, "srr");
  const vocStatus = getKPIStatus(kpis?.voc || null, "voc");

  const statusColors = {
    success: "text-green-700 bg-green-50 border-green-200",
    warning: "text-yellow-700 bg-yellow-50 border-yellow-200",
    danger: "text-red-700 bg-red-50 border-red-200",
    neutral: "text-slate-700 bg-slate-50 border-slate-200",
  };

  const avgPerformance = kpis
    ? ((kpis.quality || 0) + (kpis.srr || 0) + (kpis.voc || 0)) / 3
    : 0;
  const isCritical = avgPerformance < 80 || (kpis?.aht || 0) > 605;

  const getInsight = (metric: "quality" | "aht" | "srr" | "voc", value: number) => {
    const targets = { quality: 90, aht: 550, srr: 75, voc: 94 };
    const target = targets[metric];
    
    if (metric === "aht") {
      if (value <= target) return "Excellent! Handling calls efficiently while maintaining quality.";
      if (value <= target * 1.1) return "Close to target. Focus on streamlining discovery phase.";
      return "Critical: AHT too high. Shadow top performers and practice efficiency.";
    } else {
      if (value >= target) return "Great job! Consistently meeting targets.";
      if (value >= target * 0.89) return "Almost there! Small improvements needed.";
      return "Needs attention: Schedule coaching session to address gaps.";
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Card 
        className={cn(
          "relative overflow-hidden group bg-white border border-gray-200",
          "rounded-2xl transition-all duration-300 card-lift",
          isExpanded ? "col-span-full shadow-2xl" : "shadow-sm hover:shadow-2xl",
          isCritical && !isExpanded && "ring-2 ring-red-300 border-red-200",
          !isExpanded && "hover:-translate-y-1"
        )}
      >
        {/* Compact View */}
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start gap-4 mb-5">
            <Link href={`/agents/${agent.id}`} className="flex-shrink-0 group/avatar">
              <div className="relative">
                <img
                  src={agent.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.name}`}
                  alt={agent.name}
                  className="w-14 h-14 rounded-xl ring-2 ring-gray-200 group-hover/avatar:ring-slate-400 transition-all duration-300"
                />
                <div className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white",
                  agent.status === "active" ? "bg-green-500" : "bg-gray-400"
                )} />
                {isCritical && (
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full animate-pulse shadow-lg" />
                )}
              </div>
            </Link>

            <div className="flex-1 min-w-0">
              <Link href={`/agents/${agent.id}`} className="hover:text-slate-700 transition-colors duration-200">
                <h3 className="font-bold text-gray-900 text-base truncate">{agent.name}</h3>
              </Link>
              <p className="text-sm text-gray-600 font-medium mt-0.5">{agent.tenure} months</p>
              {needsAttention && attentionReason && (
                <Badge variant="warning" className="mt-2 text-xs px-2.5 py-0.5 font-semibold rounded-full">
                  {attentionReason}
                </Badge>
              )}
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:scale-110"
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-slate-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-600" />
              )}
            </button>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Quality */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "p-4 rounded-2xl border cursor-help kpi-tile",
                  statusColors[qualityStatus]
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 opacity-60" />
                    <span className="text-xs font-semibold uppercase tracking-wide">Quality</span>
                  </div>
                  <p className="text-3xl font-bold leading-none">
                    {kpis?.quality?.toFixed(0) || "N/A"}
                    {kpis?.quality && <span className="text-lg ml-0.5">%</span>}
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="p-0 bg-transparent border-none shadow-none">
                {kpis?.quality && (
                  <KPITooltipContent
                    metric="quality"
                    value={kpis.quality}
                    target={90}
                    teamAvg={teamAvg.quality}
                    trend={trends.quality}
                    insight={getInsight("quality", kpis.quality)}
                  />
                )}
              </TooltipContent>
            </Tooltip>

            {/* AHT */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "p-4 rounded-2xl border cursor-help kpi-tile",
                  statusColors[ahtStatus]
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 opacity-60" />
                    <span className="text-xs font-semibold uppercase tracking-wide">AHT</span>
                  </div>
                  <p className="text-3xl font-bold leading-none">
                    {kpis?.aht || "N/A"}
                    {kpis?.aht && <span className="text-lg ml-0.5">s</span>}
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="p-0 bg-transparent border-none shadow-none">
                {kpis?.aht && (
                  <KPITooltipContent
                    metric="aht"
                    value={kpis.aht}
                    target={550}
                    teamAvg={teamAvg.aht}
                    trend={trends.aht}
                    insight={getInsight("aht", kpis.aht)}
                  />
                )}
              </TooltipContent>
            </Tooltip>

            {/* SRR */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "p-4 rounded-2xl border cursor-help kpi-tile",
                  statusColors[srrStatus]
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 opacity-60" />
                    <span className="text-xs font-semibold uppercase tracking-wide">SRR</span>
                  </div>
                  <p className="text-3xl font-bold leading-none">
                    {kpis?.srr?.toFixed(0) || "N/A"}
                    {kpis?.srr && <span className="text-lg ml-0.5">%</span>}
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="p-0 bg-transparent border-none shadow-none">
                {kpis?.srr && (
                  <KPITooltipContent
                    metric="srr"
                    value={kpis.srr}
                    target={75}
                    teamAvg={teamAvg.srr}
                    trend={trends.srr}
                    insight={getInsight("srr", kpis.srr)}
                  />
                )}
              </TooltipContent>
            </Tooltip>

            {/* VOC */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "p-4 rounded-2xl border cursor-help kpi-tile",
                  statusColors[vocStatus]
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 opacity-60" />
                    <span className="text-xs font-semibold uppercase tracking-wide">VOC</span>
                  </div>
                  <p className="text-3xl font-bold leading-none">
                    {kpis?.voc?.toFixed(0) || "N/A"}
                    {kpis?.voc && <span className="text-lg ml-0.5">%</span>}
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="p-0 bg-transparent border-none shadow-none">
                {kpis?.voc && (
                  <KPITooltipContent
                    metric="voc"
                    value={kpis.voc}
                    target={94}
                    teamAvg={teamAvg.voc}
                    trend={trends.voc}
                    insight={getInsight("voc", kpis.voc)}
                  />
                )}
              </TooltipContent>
            </Tooltip>
          </div>

          {!isExpanded && (
            <p className="text-xs text-center text-gray-400 font-medium mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Hover KPIs for insights • Click to expand
            </p>
          )}
        </div>

        {/* Expanded View */}
        {isExpanded && (
          <AgentCardExpanded
            agent={agent}
            kpis={kpis}
            teamAvg={teamAvg}
          />
        )}
      </Card>
    </TooltipProvider>
  );
}

