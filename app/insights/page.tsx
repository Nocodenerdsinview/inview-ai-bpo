import { AppLayout } from "@/components/shared/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import {
  AlertCircle,
  Eye,
  Trophy,
  TrendingUp,
  Target,
  Sparkles,
} from "lucide-react";
import type { Insight } from "@/types";

async function getInsights() {
  const insights = await db
    .select({
      insight: schema.insights,
      agent: schema.agents,
    })
    .from(schema.insights)
    .leftJoin(schema.agents, eq(schema.insights.agentId, schema.agents.id))
    .orderBy(desc(schema.insights.priority), desc(schema.insights.createdAt))
    .limit(50);

  const unresolved = insights.filter((i) => i.insight.resolved === 0);
  const byType = {
    "red-flag": unresolved.filter((i) => i.insight.type === "red-flag"),
    "watch-list": unresolved.filter((i) => i.insight.type === "watch-list"),
    win: unresolved.filter((i) => i.insight.type === "win"),
    correlation: unresolved.filter((i) => i.insight.type === "correlation"),
    action: unresolved.filter((i) => i.insight.type === "action"),
  };

  return { insights: unresolved, byType };
}

export default async function InsightsPage() {
  const { insights, byType } = await getInsights();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "red-flag":
        return <AlertCircle className="w-5 h-5 text-[#EF4444]" />;
      case "watch-list":
        return <Eye className="w-5 h-5 text-[#FF8C42]" />;
      case "win":
        return <Trophy className="w-5 h-5 text-[#A4E83C]" />;
      case "correlation":
        return <TrendingUp className="w-5 h-5 text-[#3B82F6]" />;
      default:
        return <Target className="w-5 h-5 text-[#EC4899]" />;
    }
  };

  const getTypeBorder = (type: string) => {
    switch (type) {
      case "red-flag":
        return "border-[#EF4444]/30";
      case "watch-list":
        return "border-[#FF8C42]/30";
      case "win":
        return "border-[#A4E83C]/30";
      case "correlation":
        return "border-[#3B82F6]/30";
      default:
        return "border-[#EC4899]/30";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High Priority</Badge>;
      case "medium":
        return <Badge variant="warning">Medium</Badge>;
      default:
        return <Badge variant="info">Low</Badge>;
    }
  };

  return (
    <AppLayout
      title="AI Insights & Patterns"
      description="Proactive pattern detection and actionable insights"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-[#EF4444]/10 backdrop-blur-xl rounded-2xl border border-[#EF4444]/30 p-8 shadow-premium">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-[#EF4444]" />
            <p className="text-xs text-[#EF4444] uppercase font-bold tracking-wider">Red Flags</p>
          </div>
          <p className="metric-number text-[#EF4444]">{byType["red-flag"].length}</p>
        </div>
        <div className="bg-[#FF8C42]/10 backdrop-blur-xl rounded-2xl border border-[#FF8C42]/30 p-8 shadow-premium">
          <div className="flex items-center gap-3 mb-3">
            <Eye className="w-5 h-5 text-[#FF8C42]" />
            <p className="text-xs text-[#FF8C42] uppercase font-bold tracking-wider">Watch List</p>
          </div>
          <p className="metric-number text-[#FF8C42]">{byType["watch-list"].length}</p>
        </div>
        <div className="bg-[#A4E83C]/10 backdrop-blur-xl rounded-2xl border border-[#A4E83C]/30 p-8 shadow-premium">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="w-5 h-5 text-[#A4E83C]" />
            <p className="text-xs text-[#A4E83C] uppercase font-bold tracking-wider">Wins</p>
          </div>
          <p className="metric-number text-[#A4E83C]">{byType.win.length}</p>
        </div>
        <div className="bg-[#3B82F6]/10 backdrop-blur-xl rounded-2xl border border-[#3B82F6]/30 p-8 shadow-premium">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-[#3B82F6]" />
            <p className="text-xs text-[#3B82F6] uppercase font-bold tracking-wider">Correlations</p>
          </div>
          <p className="metric-number text-[#3B82F6]">{byType.correlation.length}</p>
        </div>
        <div className="bg-[#EC4899]/10 backdrop-blur-xl rounded-2xl border border-[#EC4899]/30 p-8 shadow-premium">
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-5 h-5 text-[#EC4899]" />
            <p className="text-xs text-[#EC4899] uppercase font-bold tracking-wider">Actions</p>
          </div>
          <p className="metric-number text-[#EC4899]">{byType.action.length}</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Link href="/insights/correlations">
          <div className="glass-card p-6 hover:border-white/20 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-[#EC4899]/20 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-[#EC4899]" />
              </div>
              <div>
                <div className="font-bold text-white uppercase tracking-wide">Correlations</div>
                <div className="text-xs text-gray-400">Cross-KPI analysis</div>
              </div>
            </div>
          </div>
        </Link>
        <Link href="/insights/benchmarking">
          <div className="glass-card p-6 hover:border-white/20 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-[#3B82F6]/20 rounded-2xl flex items-center justify-center">
                <Target className="w-7 h-7 text-[#3B82F6]" />
              </div>
              <div>
                <div className="font-bold text-white uppercase tracking-wide">Benchmarking</div>
                <div className="text-xs text-gray-400">Team vs company</div>
              </div>
            </div>
          </div>
        </Link>
        <div className="glass-card p-6 border-[#A4E83C]/30">
          <div className="flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-[#A4E83C]" />
            <div>
              <div className="font-bold text-[#A4E83C] uppercase tracking-wide">AI-Powered</div>
              <div className="text-xs text-gray-400">Real-time analysis</div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="all" className="data-[state=active]:bg-[#A4E83C] data-[state=active]:text-black">
            All Insights ({insights.length})
          </TabsTrigger>
          <TabsTrigger value="red-flag" className="data-[state=active]:bg-[#EF4444] data-[state=active]:text-white">
            🔴 Red Flags ({byType["red-flag"].length})
          </TabsTrigger>
          <TabsTrigger value="watch-list" className="data-[state=active]:bg-[#FF8C42] data-[state=active]:text-white">
            🟡 Watch List ({byType["watch-list"].length})
          </TabsTrigger>
          <TabsTrigger value="win" className="data-[state=active]:bg-[#A4E83C] data-[state=active]:text-black">
            🟢 Wins ({byType.win.length})
          </TabsTrigger>
          <TabsTrigger value="correlation" className="data-[state=active]:bg-[#3B82F6] data-[state=active]:text-white">
            📊 Correlations ({byType.correlation.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="space-y-4">
            {insights.map(({ insight, agent }) => (
              <div
                key={insight.id}
                className={`glass-card p-6 border ${getTypeBorder(insight.type)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(insight.type)}
                    <div>
                      <h3 className="font-bold text-xl text-white">{insight.title}</h3>
                      {agent && (
                        <p className="text-sm text-gray-400 mt-1">Agent: {agent.name}</p>
                      )}
                    </div>
                  </div>
                  {getPriorityBadge(insight.priority)}
                </div>

                <p className="text-gray-300 mb-3">{insight.description}</p>

                {insight.evidence && (
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl mb-3 text-sm text-gray-300">
                    <strong className="text-white">Evidence:</strong> {insight.evidence}
                  </div>
                )}

                {agent && (
                  <Link href={`/agents/${agent.id}`}>
                    <Button size="sm" variant="outline">
                      View Agent Profile
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        {Object.entries(byType).map(([type, items]) => (
          <TabsContent key={type} value={type}>
            <div className="space-y-4">
              {items.map(({ insight, agent }) => (
                <div
                  key={insight.id}
                  className={`glass-card p-6 border ${getTypeBorder(insight.type)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(insight.type)}
                      <div>
                        <h3 className="font-bold text-xl text-white">{insight.title}</h3>
                        {agent && (
                          <p className="text-sm text-gray-400 mt-1">Agent: {agent.name}</p>
                        )}
                      </div>
                    </div>
                    {getPriorityBadge(insight.priority)}
                  </div>

                  <p className="text-gray-300 mb-3">{insight.description}</p>

                  {insight.evidence && (
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl mb-3 text-sm text-gray-300">
                      <strong className="text-white">Evidence:</strong> {insight.evidence}
                    </div>
                  )}

                  {agent && (
                    <Link href={`/agents/${agent.id}`}>
                      <Button size="sm" variant="outline">
                        View Agent Profile
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </AppLayout>
  );
}
