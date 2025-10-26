"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MessageSquare, FileText, Clock } from "lucide-react";
import Link from "next/link";

interface ActionItemsProps {
  agents: any[];
  insights: any[];
}

export function ActionItems({ agents, insights }: ActionItemsProps) {
  // Agents needing immediate attention
  const criticalAgents = agents.filter((a) => a.needsAttention).slice(0, 5);

  // High priority insights
  const urgentInsights = insights.filter((i) => i.priority === "high").slice(0, 3);

  // Calculate overdue audits (agents with no recent audits)
  const needsAudit = agents.filter((a) => {
    // This is a simplified check - in production, check actual audit dates
    return (a.latestKPIs?.quality || 0) < 85;
  }).slice(0, 4);

  return (
    <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-premium">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-900 text-lg">Action Items</h3>
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-bold text-base px-4 py-1.5 rounded-full shadow-sm">
          {criticalAgents.length + urgentInsights.length}
        </Badge>
      </div>

      <div className="space-y-5">
        {/* Urgent Insights */}
        {urgentInsights.length > 0 && (
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-1.5 h-5 bg-red-500 rounded-full"></div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                High Priority
              </h4>
            </div>
            <div className="space-y-2.5">
              {urgentInsights.map((insight) => (
                <div
                  key={insight.id}
                  className="p-4 bg-gradient-to-r from-red-50 to-red-50/50 border border-red-200/60 rounded-2xl hover:shadow-md transition-all duration-200"
                >
                  <p className="text-sm font-semibold text-slate-900 mb-1.5">{insight.title}</p>
                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{insight.description}</p>
                  {insight.agentId && (
                    <Link
                      href={`/agents/${insight.agentId}`}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all mt-2"
                    >
                      View Details →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Critical Agents */}
        {criticalAgents.length > 0 && (
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-1.5 h-5 bg-amber-500 rounded-full"></div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Needs Attention
              </h4>
            </div>
            <div className="space-y-2.5">
              {criticalAgents.map((agent) => (
                <Link
                  key={agent.id}
                  href={`/agents/${agent.id}`}
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-amber-50/50 border border-amber-200/60 rounded-2xl hover:bg-amber-100/50 hover:shadow-md transition-all duration-200 group"
                >
                  <img
                    src={agent.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.name}`}
                    alt={agent.name}
                    className="w-9 h-9 rounded-xl ring-2 ring-amber-200 group-hover:ring-amber-400 transition-all"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{agent.name}</p>
                    <p className="text-xs text-slate-600 truncate font-medium mt-0.5">{agent.attentionReason}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Audits Needed */}
        {needsAudit.length > 0 && (
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-1.5 h-5 bg-blue-500 rounded-full"></div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Quality Audits Due
              </h4>
            </div>
            <div className="space-y-2.5">
              {needsAudit.map((agent) => (
                <Link
                  key={agent.id}
                  href={`/audits?agent=${agent.id}`}
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-50/50 border border-blue-200/60 rounded-2xl hover:bg-blue-100/50 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="p-2 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform">
                    <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{agent.name}</p>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">Schedule audit</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-5 border-t-2 border-slate-200">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Quick Actions
          </h4>
          <div className="space-y-2.5">
            <Link
              href="/coaching"
              className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="p-2 bg-emerald-50 rounded-xl group-hover:scale-110 transition-transform">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-sm font-semibold text-slate-900">Schedule Coaching</span>
            </Link>
            <Link
              href="/audits"
              className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="p-2 bg-blue-50 rounded-xl group-hover:scale-110 transition-transform">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-slate-900">Create Audit</span>
            </Link>
            <Link
              href="/reports/weekly"
              className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="p-2 bg-purple-50 rounded-xl group-hover:scale-110 transition-transform">
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-sm font-semibold text-slate-900">View Reports</span>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

