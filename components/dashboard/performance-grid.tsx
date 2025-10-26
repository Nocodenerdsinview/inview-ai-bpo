"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, TrendingUp, TrendingDown, Eye } from "lucide-react";
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
  needsAttention: boolean;
}

interface PerformanceGridProps {
  agents: Agent[];
}

type SortField = "name" | "quality" | "aht" | "srr" | "voc";
type SortDirection = "asc" | "desc";

export function PerformanceGrid({ agents }: PerformanceGridProps) {
  const [sortField, setSortField] = useState<SortField>("quality");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filterMode, setFilterMode] = useState<"all" | "critical" | "borderline">("all");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getStatus = (value: number | null, field: string) => {
    if (value === null) return "unknown";
    if (field === "aht") {
      if (value <= 550) return "success";
      if (value <= 605) return "warning";
      return "danger";
    } else {
      if (value >= 90) return "success";
      if (value >= 80) return "warning";
      return "danger";
    }
  };

  const filteredAndSortedAgents = useMemo(() => {
    let filtered = [...agents];

    // Apply filter
    if (filterMode === "critical") {
      filtered = filtered.filter((agent) => agent.needsAttention);
    } else if (filterMode === "borderline") {
      filtered = filtered.filter((agent) => {
        if (!agent.latestKPIs) return false;
        const quality = agent.latestKPIs.quality || 0;
        const srr = agent.latestKPIs.srr || 0;
        return (quality >= 80 && quality < 90) || (srr >= 75 && srr < 80);
      });
    }

    // Apply sort
    filtered.sort((a, b) => {
      if (sortField === "name") {
        return sortDirection === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }

      const aValue = a.latestKPIs?.[sortField] || 0;
      const bValue = b.latestKPIs?.[sortField] || 0;

      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [agents, sortField, sortDirection, filterMode]);

  return (
    <Card className="p-0 overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-premium">
      {/* Header */}
      <div className="p-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900">Team Performance Grid</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterMode("all")}
            className={cn(
              "px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200",
              filterMode === "all"
                ? "bg-emerald-500 text-white shadow-md hover:-translate-y-0.5"
                : "bg-white text-slate-600 hover:bg-slate-100 shadow-sm"
            )}
          >
            All ({agents.length})
          </button>
          <button
            onClick={() => setFilterMode("critical")}
            className={cn(
              "px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200",
              filterMode === "critical"
                ? "bg-red-500 text-white shadow-md hover:-translate-y-0.5"
                : "bg-white text-slate-600 hover:bg-slate-100 shadow-sm"
            )}
          >
            Critical ({agents.filter((a) => a.needsAttention).length})
          </button>
          <button
            onClick={() => setFilterMode("borderline")}
            className={cn(
              "px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200",
              filterMode === "borderline"
                ? "bg-amber-500 text-white shadow-md hover:-translate-y-0.5"
                : "bg-white text-slate-600 hover:bg-slate-100 shadow-sm"
            )}
          >
            Borderline
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50/80 border-b border-slate-200">
            <tr>
              <th className="px-5 py-4 text-left">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider hover:text-emerald-600 transition-colors"
                >
                  Agent
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </th>
              <th className="px-5 py-4 text-center">
                <button
                  onClick={() => handleSort("quality")}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider hover:text-emerald-600 transition-colors mx-auto"
                >
                  Quality
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </th>
              <th className="px-5 py-4 text-center">
                <button
                  onClick={() => handleSort("aht")}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider hover:text-emerald-600 transition-colors mx-auto"
                >
                  AHT
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </th>
              <th className="px-5 py-4 text-center">
                <button
                  onClick={() => handleSort("srr")}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider hover:text-emerald-600 transition-colors mx-auto"
                >
                  SRR
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </th>
              <th className="px-5 py-4 text-center">
                <button
                  onClick={() => handleSort("voc")}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider hover:text-emerald-600 transition-colors mx-auto"
                >
                  VOC
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </th>
              <th className="px-5 py-4 text-center">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Status
                </span>
              </th>
              <th className="px-5 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAndSortedAgents.map((agent) => {
              const qualityStatus = getStatus(agent.latestKPIs?.quality || null, "quality");
              const ahtStatus = getStatus(agent.latestKPIs?.aht || null, "aht");
              const srrStatus = getStatus(agent.latestKPIs?.srr || null, "srr");
              const vocStatus = getStatus(agent.latestKPIs?.voc || null, "voc");

              return (
                <tr
                  key={agent.id}
                  className="hover:bg-slate-50/80 transition-all duration-200 group"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={agent.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.name}`}
                        alt={agent.name}
                        className="w-9 h-9 rounded-xl ring-2 ring-slate-200 group-hover:ring-emerald-400 transition-all"
                      />
                      <span className="font-semibold text-slate-900 text-sm">{agent.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span
                      className={cn(
                        "inline-flex items-center justify-center px-4 py-1.5 rounded-xl font-bold text-sm min-w-[70px] transition-transform duration-200 hover:scale-105",
                        qualityStatus === "success" && "bg-emerald-50/80 text-emerald-700 border border-emerald-200",
                        qualityStatus === "warning" && "bg-amber-50/80 text-amber-700 border border-amber-200",
                        qualityStatus === "danger" && "bg-red-50/80 text-red-700 border border-red-200"
                      )}
                    >
                      {agent.latestKPIs?.quality?.toFixed(0) || "N/A"}%
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span
                      className={cn(
                        "inline-flex items-center justify-center px-4 py-1.5 rounded-xl font-bold text-sm min-w-[70px] transition-transform duration-200 hover:scale-105",
                        ahtStatus === "success" && "bg-emerald-50/80 text-emerald-700 border border-emerald-200",
                        ahtStatus === "warning" && "bg-amber-50/80 text-amber-700 border border-amber-200",
                        ahtStatus === "danger" && "bg-red-50/80 text-red-700 border border-red-200"
                      )}
                    >
                      {agent.latestKPIs?.aht || "N/A"}s
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span
                      className={cn(
                        "inline-flex items-center justify-center px-4 py-1.5 rounded-xl font-bold text-sm min-w-[70px] transition-transform duration-200 hover:scale-105",
                        srrStatus === "success" && "bg-emerald-50/80 text-emerald-700 border border-emerald-200",
                        srrStatus === "warning" && "bg-amber-50/80 text-amber-700 border border-amber-200",
                        srrStatus === "danger" && "bg-red-50/80 text-red-700 border border-red-200"
                      )}
                    >
                      {agent.latestKPIs?.srr?.toFixed(0) || "N/A"}%
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span
                      className={cn(
                        "inline-flex items-center justify-center px-4 py-1.5 rounded-xl font-bold text-sm min-w-[70px] transition-transform duration-200 hover:scale-105",
                        vocStatus === "success" && "bg-emerald-50/80 text-emerald-700 border border-emerald-200",
                        vocStatus === "warning" && "bg-amber-50/80 text-amber-700 border border-amber-200",
                        vocStatus === "danger" && "bg-red-50/80 text-red-700 border border-red-200"
                      )}
                    >
                      {agent.latestKPIs?.voc?.toFixed(0) || "N/A"}%
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    {agent.needsAttention ? (
                      <Badge className="bg-red-100 text-red-700 border-red-200 font-bold px-3 py-1 rounded-full shadow-sm">
                        Attention
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-bold px-3 py-1 rounded-full shadow-sm">
                        On Track
                      </Badge>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/agents/${agent.id}`}
                      className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-semibold hover:gap-2 transition-all duration-200"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

