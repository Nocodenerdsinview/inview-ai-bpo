"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { AppLayout } from "@/components/shared/app-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  FileCheck, 
  Target,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles
} from "lucide-react";
import Link from "next/link";

interface QuickPrepData {
  agent: any;
  lastCoaching: any;
  recentKPIs: {
    latest: any;
    previous: any;
    changes: string;
  };
  recentAudits: any[];
  aiTalkingPoints: string;
  prepTime: string;
}

export default function QuickPrepPage() {
  const params = useParams();
  const [data, setData] = useState<QuickPrepData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuickPrep();
  }, []);

  const fetchQuickPrep = async () => {
    try {
      const response = await fetch(`/api/coaching/quick-prep/${params.id}`);
      const result = await response.json();
      
      // Check if the response contains an error
      if (result.error || !result.agent) {
        const errorMsg = result.error || "Failed to load agent data";
        console.error("API error:", errorMsg);
        setError(errorMsg);
        setData(null);
      } else {
        setData(result);
        setError(null);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to fetch quick prep";
      console.error("Failed to fetch quick prep:", err);
      setError(errorMsg);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (current: number, previous: number, isLowerBetter = false) => {
    const diff = current - previous;
    if (Math.abs(diff) < 1) return null;
    
    const isImproving = isLowerBetter ? diff < 0 : diff > 0;
    return isImproving ? (
      <TrendingUp className="w-4 h-4 text-[#A4E83C]" />
    ) : (
      <TrendingDown className="w-4 h-4 text-[#EF4444]" />
    );
  };

  const getTrendColor = (current: number, previous: number, isLowerBetter = false) => {
    const diff = current - previous;
    if (Math.abs(diff) < 1) return "text-gray-400";
    
    const isImproving = isLowerBetter ? diff < 0 : diff > 0;
    return isImproving ? "text-[#A4E83C]" : "text-[#EF4444]";
  };

  const getKPIColor = (value: number, metric: string) => {
    if (metric === 'aht') {
      if (value < 450) return 'text-[#A4E83C]';
      if (value < 550) return 'text-[#3B82F6]';
      if (value < 600) return 'text-[#FF8C42]';
      return 'text-[#EF4444]';
    }
    if (value >= 90) return 'text-[#A4E83C]';
    if (value >= 70) return 'text-[#FF8C42]';
    return 'text-[#EF4444]';
  };

  if (loading) {
    return (
      <AppLayout title="Quick Prep" description="Loading session prep...">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-[#A4E83C]" />
            <p className="text-gray-400 text-lg font-semibold uppercase tracking-wide">Loading quick prep...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!data) {
    return (
      <AppLayout title="Quick Prep" description="Error loading data">
        <div className="glass-card p-12 text-center max-w-md mx-auto border-[#EF4444]/30">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-[#EF4444]" />
          <h3 className="text-2xl font-bold uppercase tracking-wide text-white mb-3">
            Failed to load quick prep
          </h3>
          {error && (
            <p className="text-sm text-gray-400 mb-6">{error}</p>
          )}
          <Button onClick={fetchQuickPrep} className="bg-[#A4E83C] text-black hover:bg-[#8FC72D]">
            Try Again
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={`Quick Prep: ${data.agent.name}`}
      description="5-minute coaching session preparation"
    >
      {/* Header Card */}
      <div className="glass-card p-8 mb-8 shadow-premium animate-fade-scale">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <img
              src={data.agent.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.agent.name}`}
              alt={data.agent.name}
              className="w-20 h-20 rounded-2xl ring-4 ring-[#A4E83C]/30 bg-[#2A2A2A]"
            />
            <div>
              <h2 className="text-4xl font-black uppercase tracking-wide text-white mb-2">
                {data.agent.name}
              </h2>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#3B82F6]" />
                <span className="text-sm text-gray-400 uppercase tracking-wide">
                  Estimated Prep Time: {data.prepTime}
                </span>
              </div>
            </div>
          </div>
          <Link href={`/agents/${data.agent.id}`}>
            <Button variant="outline" className="hover-lift">
              View Full Profile
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Last Session Recap */}
          {data.lastCoaching && (
            <div className="glass-card p-8 shadow-premium animate-fade-scale hover-lift">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-[#A4E83C]/20 rounded-2xl flex items-center justify-center">
                  <FileCheck className="w-8 h-8 text-[#A4E83C]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold uppercase tracking-wide text-white">Last Session Recap</h3>
                  <p className="text-sm text-gray-500 uppercase mt-1">{data.lastCoaching.date}</p>
                </div>
              </div>

              {data.lastCoaching.focusAreas && (
                <div className="mb-6">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">Benefits Scripting</div>
                  <div className="flex flex-wrap gap-2">
                    {JSON.parse(data.lastCoaching.focusAreas).map((area: string, i: number) => (
                      <Badge key={i} className="bg-[#3B82F6]/20 text-[#3B82F6] border-none px-3 py-1">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {data.lastCoaching.commitments && (
                <div className="p-6 bg-[#FF8C42]/10 border border-[#FF8C42]/30 rounded-2xl">
                  <div className="text-sm font-bold uppercase tracking-wide text-[#FF8C42] mb-3">
                    Agent Commitment:
                  </div>
                  <ul className="space-y-2">
                    {JSON.parse(data.lastCoaching.commitments).map((commitment: string, i: number) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#FF8C42]" />
                        {commitment}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Progress Check */}
          <div className="glass-card p-8 shadow-premium animate-fade-scale hover-lift">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-[#3B82F6]/20 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-[#3B82F6]" />
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-wide text-white">Progress Check</h3>
            </div>

            {data.recentKPIs.latest && data.recentKPIs.previous ? (
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 shadow-premium">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">Quality</div>
                  <div className={`text-5xl font-black ${getKPIColor(data.recentKPIs.latest.quality, 'quality')}`}>
                    {Math.round(data.recentKPIs.latest.quality)}
                    <span className="text-2xl">%</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    {getTrendIcon(
                      data.recentKPIs.latest.quality,
                      data.recentKPIs.previous.quality
                    )}
                    <span className={`text-sm font-semibold ${getTrendColor(
                      data.recentKPIs.latest.quality,
                      data.recentKPIs.previous.quality
                    )}`}>
                      {Math.abs(data.recentKPIs.latest.quality - data.recentKPIs.previous.quality).toFixed(1)}% 
                      vs last week
                    </span>
                  </div>
                </div>

                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 shadow-premium">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">AHT</div>
                  <div className={`text-5xl font-black ${getKPIColor(data.recentKPIs.latest.aht, 'aht')}`}>
                    {Math.round(data.recentKPIs.latest.aht)}
                    <span className="text-2xl">s</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    {getTrendIcon(
                      data.recentKPIs.latest.aht,
                      data.recentKPIs.previous.aht,
                      true
                    )}
                    <span className={`text-sm font-semibold ${getTrendColor(
                      data.recentKPIs.latest.aht,
                      data.recentKPIs.previous.aht,
                      true
                    )}`}>
                      {Math.abs(data.recentKPIs.latest.aht - data.recentKPIs.previous.aht).toFixed(0)}s
                      vs last week
                    </span>
                  </div>
                </div>

                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 shadow-premium">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">SRR</div>
                  <div className={`text-5xl font-black ${getKPIColor(data.recentKPIs.latest.srr, 'srr')}`}>
                    {Math.round(data.recentKPIs.latest.srr)}
                    <span className="text-2xl">%</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    {getTrendIcon(
                      data.recentKPIs.latest.srr,
                      data.recentKPIs.previous.srr
                    )}
                    <span className={`text-sm font-semibold ${getTrendColor(
                      data.recentKPIs.latest.srr,
                      data.recentKPIs.previous.srr
                    )}`}>
                      {Math.abs(data.recentKPIs.latest.srr - data.recentKPIs.previous.srr).toFixed(1)}%
                      vs last week
                    </span>
                  </div>
                </div>

                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 shadow-premium">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">VOC</div>
                  <div className={`text-5xl font-black ${getKPIColor(data.recentKPIs.latest.voc, 'voc')}`}>
                    {Math.round(data.recentKPIs.latest.voc)}
                    <span className="text-2xl">%</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    {getTrendIcon(
                      data.recentKPIs.latest.voc,
                      data.recentKPIs.previous.voc
                    )}
                    <span className={`text-sm font-semibold ${getTrendColor(
                      data.recentKPIs.latest.voc,
                      data.recentKPIs.previous.voc
                    )}`}>
                      {Math.abs(data.recentKPIs.latest.voc - data.recentKPIs.previous.voc).toFixed(1)}%
                      vs last week
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-400">
                {data.recentKPIs.changes || "No KPI data available"}
              </div>
            )}
          </div>

          {/* AI Talking Points */}
          <div className="glass-card p-8 shadow-premium animate-fade-scale hover-lift">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-[#A4E83C]/20 rounded-2xl flex items-center justify-center">
                <Lightbulb className="w-8 h-8 text-[#A4E83C]" />
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-wide text-white">AI-Generated Talking Points</h3>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-300 leading-relaxed">
                {data.aiTalkingPoints}
              </pre>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Recent Audits */}
          {data.recentAudits.length > 0 && (
            <div className="glass-card p-8 shadow-premium animate-fade-scale hover-lift">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-6 h-6 text-[#3B82F6]" />
                <h3 className="text-xl font-bold uppercase tracking-wide text-white">Recent Audits</h3>
              </div>

              <div className="space-y-4">
                {data.recentAudits.map((audit: any) => (
                  <div key={audit.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">{audit.date}</span>
                      <Badge className={`${
                        audit.score >= 90 ? 'bg-[#A4E83C]/20 text-[#A4E83C]' : 
                        audit.score >= 70 ? 'bg-[#FF8C42]/20 text-[#FF8C42]' :
                        'bg-[#EF4444]/20 text-[#EF4444]'
                      } border-none font-bold`}>
                        {Math.round(audit.score)}%
                      </Badge>
                    </div>
                    {audit.strengths && (
                      <div className="text-xs text-gray-400">
                        <span className="font-semibold text-gray-300">Strengths:</span> {JSON.parse(audit.strengths).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="glass-card p-8 shadow-premium animate-fade-scale hover-lift">
            <h3 className="text-xl font-bold uppercase tracking-wide text-white mb-6">Actions</h3>
            <div className="space-y-3">
              <Link href={`/agents/${data.agent.id}`} className="block">
                <Button variant="outline" className="w-full justify-start hover-lift">
                  View Full Profile
                </Button>
              </Link>
              <Link href={`/coaching/generate?agent=${data.agent.id}`} className="block">
                <Button className="w-full justify-start bg-[#A4E83C] text-black hover:bg-[#8FC72D]">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Coaching Material
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start hover-lift" onClick={() => window.print()}>
                Print This Prep
              </Button>
            </div>
          </div>

          {/* Tips */}
          <div className="glass-card p-8 border-[#A4E83C]/20 shadow-premium animate-fade-scale hover-lift">
            <h3 className="text-xl font-bold uppercase tracking-wide text-[#A4E83C] mb-6">Coaching Tips</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#A4E83C]" />
                <span>Start with a positive - celebrate wins</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#A4E83C]" />
                <span>Listen more than you talk</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#A4E83C]" />
                <span>Set specific, measurable goals</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#A4E83C]" />
                <span>Schedule the follow-up now</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
