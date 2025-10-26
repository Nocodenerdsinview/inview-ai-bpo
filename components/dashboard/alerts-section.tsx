"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown, Search, PartyPopper, MessageSquare, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Insight } from "@/types";
import Link from "next/link";

interface AlertsSectionProps {
  insights: Insight[];
}

export function AlertsSection({ insights }: AlertsSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(insights.filter((i) => i.type === "red-flag").length === 0);

  const getIcon = (type: string) => {
    switch (type) {
      case "red-flag":
        return AlertTriangle;
      case "watch-list":
        return TrendingDown;
      case "win":
        return PartyPopper;
      default:
        return Search;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "red-flag":
        return "text-red-600 bg-red-50";
      case "watch-list":
        return "text-amber-600 bg-amber-50";
      case "win":
        return "text-green-600 bg-green-50";
      default:
        return "text-blue-600 bg-blue-50";
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case "red-flag":
        return "border-l-red-500";
      case "watch-list":
        return "border-l-amber-500";
      case "win":
        return "border-l-green-500";
      default:
        return "border-l-blue-500";
    }
  };

  if (insights.length === 0) {
    return (
      <Card className="p-8 bg-slate-50 border border-slate-200 rounded-2xl">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-lg font-semibold text-slate-900">All Clear</p>
          <p className="text-sm text-slate-600 mt-2">No alerts at this time</p>
        </div>
      </Card>
    );
  }

  // Separate insights by priority
  const criticalInsights = insights.filter((i) => i.type === "red-flag");
  const otherInsights = insights.filter((i) => i.type !== "red-flag");

  return (
    <Card className="p-0 overflow-hidden border border-red-200 rounded-2xl shadow-md card-soft transition-all duration-300">
      {/* Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full p-6 bg-slate-50 border-b border-slate-200 hover:bg-slate-100 transition-all duration-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-2xl">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-bold text-gray-900">Critical Alerts</h2>
              <p className="text-base text-gray-600 font-semibold mt-1">Requires immediate attention</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="destructive" className="text-xl px-5 py-2 rounded-full font-bold">
              {criticalInsights.length}
            </Badge>
            <div className="p-2 hover:bg-white/50 rounded-xl transition-colors">
              {isCollapsed ? (
                <ChevronDown className="w-6 h-6 text-gray-600" />
              ) : (
                <ChevronUp className="w-6 h-6 text-gray-600" />
              )}
            </div>
          </div>
        </div>
      </button>

      {!isCollapsed && (
        <div className="p-6 space-y-5">
        {/* Critical Alerts */}
        {criticalInsights.length > 0 && (
          <div className="space-y-4">
            {criticalInsights.map((insight) => {
              const Icon = getIcon(insight.type);

              return (
                <div
                  key={insight.id}
                  className="p-6 bg-white border border-red-200 rounded-xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="flex items-start gap-5">
                    <div className="p-4 bg-red-100 rounded-2xl">
                      <Icon className="w-7 h-7 text-red-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-xl text-gray-900">{insight.title}</h3>
                        <Badge variant="destructive" className="text-xs px-3 py-1 rounded-full font-bold">URGENT</Badge>
                      </div>
                      <p className="text-base text-gray-700 leading-relaxed mb-4">{insight.description}</p>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-3">
                        {insight.agentId && (
                          <>
                            <Link href={`/agents/${insight.agentId}`}>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-2" />
                                View Agent
                              </Button>
                            </Link>
                            <Link href={`/coaching?agent=${insight.agentId}`}>
                              <Button size="sm">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Create Coaching
                              </Button>
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Other Insights */}
        {otherInsights.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Other Insights
            </h3>
            <div className="space-y-2.5">
              {otherInsights.map((insight) => {
                const Icon = getIcon(insight.type);
                const colorClass = getColor(insight.type);
                const borderClass = getBorderColor(insight.type);

                return (
                  <div
                    key={insight.id}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-xl border-l-4 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200",
                      borderClass
                    )}
                  >
                    <div className={cn("p-2 rounded-xl", colorClass)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 text-sm">{insight.title}</h3>
                      <p className="mt-1.5 text-sm text-slate-600 line-clamp-2 leading-relaxed">{insight.description}</p>
                      {insight.agentId && (
                        <Link
                          href={`/agents/${insight.agentId}`}
                          className="mt-2 text-xs text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all"
                        >
                          View Details →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </div>
      )}

      {!isCollapsed && (
        <div className="p-5 bg-slate-50 border-t border-slate-200">
        <Link
          href="/insights"
          className="text-base text-slate-700 hover:text-slate-900 font-semibold flex items-center justify-center gap-2 hover:gap-3 transition-all duration-200"
        >
          View all insights →
        </Link>
        </div>
      )}
    </Card>
  );
}

