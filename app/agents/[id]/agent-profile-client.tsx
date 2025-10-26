"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useDateFilter } from "@/contexts/DateFilterContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { KPIChart } from "@/components/agents/kpi-chart";
import { EditProfileDialog } from "@/components/agents/edit-profile-dialog";
import { InsightDialog } from "@/components/agents/insight-dialog";
import { Calendar, TrendingUp, Award, MessageSquare, Loader2, Pencil, Crown, AlertTriangle, Plane, HeartPulse, Heart, GraduationCap, CheckCircle, Sparkles, Link2, TrendingDown, Minus, Target, ArrowRight, ChevronDown, Share2, Clock, AlertCircle } from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { calculateOverallScore } from "@/lib/calculateAgentScore";
import type { Agent, KPI, Audit, CoachingSession, LeaveRecord } from "@/types";

interface AttendanceRecord {
  id: number;
  agentId: number;
  date: string;
  status: string;
  createdAt: string;
}

interface AgentData {
  agent: Agent;
  kpis: KPI[];
  audits: Audit[];
  coachingSessions: CoachingSession[];
  leaveRecords: LeaveRecord[];
  attendanceRecords: AttendanceRecord[];
  stats: {
    avgQuality: number;
    avgAHT: number;
    avgSRR: number;
    avgVOC: number;
    totalAudits: number;
    totalCoaching: number;
    totalDays: number;
    activeDays: number;
    sickDays: number;
    holidayDays: number;
  };
}

// Helper functions for calculations
function calculateTrend(kpis: KPI[], metric: string) {
  if (kpis.length < 14) return 0;
  const recent = kpis.slice(0, 7);
  const older = kpis.slice(7, 14);
  const metricKey = metric.toLowerCase() as keyof KPI;
  const recentAvg = recent.reduce((sum, k) => sum + (Number(k[metricKey]) || 0), 0) / recent.length;
  const olderAvg = older.reduce((sum, k) => sum + (Number(k[metricKey]) || 0), 0) / older.length;
  if (olderAvg === 0) return 0;
  return ((recentAvg - olderAvg) / olderAvg) * 100;
}

function calculate90DayComparison(kpis: KPI[], metric: string) {
  if (kpis.length < 30) return 0;
  const recent = kpis.slice(0, 30);
  const older = kpis.slice(30, 90);
  if (older.length === 0) return 0;
  const metricKey = metric.toLowerCase() as keyof KPI;
  const recentAvg = recent.reduce((sum, k) => sum + (Number(k[metricKey]) || 0), 0) / recent.length;
  const olderAvg = older.reduce((sum, k) => sum + (Number(k[metricKey]) || 0), 0) / older.length;
  if (olderAvg === 0) return 0;
  return ((recentAvg - olderAvg) / olderAvg) * 100;
}

function calculateVelocity(kpis: any[], metric: string) {
  const trend = calculateTrend(kpis, metric);
  return (trend / 2).toFixed(1); // 2 weeks of data
}

function calculateRiskScore(current: number, target: number, trend: number, inverse: boolean = false) {
  let gap = inverse ? (current > target ? current - target : 0) : (current < target ? target - current : 0);
  const trendPenalty = trend < 0 ? 20 : 0;
  return Math.min(100, Math.round((gap / target * 100) + trendPenalty));
}

function getKPIsBeforeCoaching(kpis: any[], coachingDate: string, days: number = 7) {
  const coaching = parseISO(coachingDate);
  const before = kpis.filter(k => {
    const kpiDate = parseISO(k.date);
    const daysDiff = differenceInDays(coaching, kpiDate);
    return daysDiff > 0 && daysDiff <= days;
  });
  
  if (before.length === 0) return { avgQuality: 0, avgAHT: 0, avgSRR: 0, avgVOC: 0 };
  
  return {
    avgQuality: Math.round(before.reduce((sum, k) => sum + (k.quality || 0), 0) / before.length),
    avgAHT: Math.round(before.reduce((sum, k) => sum + (k.aht || 0), 0) / before.length),
    avgSRR: Math.round(before.reduce((sum, k) => sum + (k.srr || 0), 0) / before.length),
    avgVOC: Math.round(before.reduce((sum, k) => sum + (k.voc || 0), 0) / before.length),
  };
}

function getKPIsAfterCoaching(kpis: any[], coachingDate: string, days: number = 7) {
  const coaching = parseISO(coachingDate);
  const after = kpis.filter(k => {
    const kpiDate = parseISO(k.date);
    const daysDiff = differenceInDays(kpiDate, coaching);
    return daysDiff > 0 && daysDiff <= days;
  });
  
  if (after.length === 0) return { avgQuality: 0, avgAHT: 0, avgSRR: 0, avgVOC: 0 };
  
  return {
    avgQuality: Math.round(after.reduce((sum, k) => sum + (k.quality || 0), 0) / after.length),
    avgAHT: Math.round(after.reduce((sum, k) => sum + (k.aht || 0), 0) / after.length),
    avgSRR: Math.round(after.reduce((sum, k) => sum + (k.srr || 0), 0) / after.length),
    avgVOC: Math.round(after.reduce((sum, k) => sum + (k.voc || 0), 0) / after.length),
  };
}

export function AgentProfileClient() {
  const params = useParams();
  const { dateFilter } = useDateFilter();
  const [data, setData] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<any>(null);
  const [insightDialogOpen, setInsightDialogOpen] = useState(false);
  const [currentInsightType, setCurrentInsightType] = useState<string>('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams({
          startDate: format(dateFilter.startDate, 'yyyy-MM-dd'),
          endDate: format(dateFilter.endDate, 'yyyy-MM-dd'),
        });

        const response = await fetch(`/api/agents/${params.id}?${queryParams}`);
        if (!response.ok) {
          throw new Error("Failed to fetch agent data");
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error("Error fetching agent:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchData();
    }
  }, [params.id, dateFilter]);

  // Auto-refresh every 30 seconds to keep data synced
  useEffect(() => {
    const interval = setInterval(() => {
      if (params.id && !loading) {
        const refetch = async () => {
          try {
            const queryParams = new URLSearchParams({
              startDate: format(dateFilter.startDate, 'yyyy-MM-dd'),
              endDate: format(dateFilter.endDate, 'yyyy-MM-dd'),
            });
            const response = await fetch(`/api/agents/${params.id}?${queryParams}`);
            if (response.ok) {
              const result = await response.json();
              setData(result);
            }
          } catch (err) {
            console.error("Error auto-refreshing:", err);
          }
        };
        refetch();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [params.id, dateFilter, loading]);

  // Open insight dialog
  const openInsightDialog = (type: string) => {
    setCurrentInsightType(type);
    setInsightDialogOpen(true);
  };

  // Handle insight generated
  const handleInsightGenerated = (insight: any) => {
    setSelectedInsight(insight);
  };

  // Calculate overall score (MUST be before early returns!)
  const overallScore = useMemo(() => {
    if (!data?.stats) return 0;
    return calculateOverallScore({
      quality: data.stats.avgQuality,
      aht: data.stats.avgAHT,
      srr: data.stats.avgSRR,
      voc: data.stats.avgVOC
    });
  }, [data]);

  // Check for underperforming KPIs (MUST be before early returns!)
  const underperformingKPIs = useMemo(() => {
    if (!data?.stats) return [];
    const issues = [];
    if (data.stats.avgQuality < 70) issues.push('Quality');
    if (data.stats.avgAHT > 600) issues.push('AHT');
    if (data.stats.avgSRR < 70) issues.push('SRR');
    if (data.stats.avgVOC < 70) issues.push('VOC');
    return issues;
  }, [data]);

  // Calculate next coaching date
  const nextCoaching = useMemo(() => {
    if (!data?.coachingSessions) return null;
    const future = data.coachingSessions.filter((s: any) => new Date(s.scheduledDate) > new Date());
    future.sort((a: any, b: any) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
    return future.length > 0 ? future[0].scheduledDate : null;
  }, [data]);

  // Calculate next leave date
  const nextLeave = useMemo(() => {
    if (!data?.leaveRecords) return null;
    const future = data.leaveRecords.filter((l: any) => {
      const leaveDate = new Date(l.startDate || l.date);
      return leaveDate > new Date() && l.status === 'approved';
    });
    future.sort((a: any, b: any) => {
      const aDate = new Date(a.startDate || a.date);
      const bDate = new Date(b.startDate || b.date);
      return aDate.getTime() - bDate.getTime();
    });
    return future.length > 0 ? (future[0].startDate || future[0].date) : null;
  }, [data]);

  // Days since last audit
  const daysSinceLastAudit = useMemo(() => {
    if (!data?.audits || data.audits.length === 0) return 999;
    const lastAudit = data.audits[0];
    return differenceInDays(new Date(), new Date(lastAudit.date));
  }, [data]);

  // Days since last coaching
  const daysSinceLastCoaching = useMemo(() => {
    if (!data?.coachingSessions || data.coachingSessions.length === 0) return 999;
    const completed = data.coachingSessions.filter((s: any) => s.status === 'completed');
    if (completed.length === 0) return 999;
    const lastCoaching = completed[0];
    return differenceInDays(new Date(), new Date(lastCoaching.scheduledDate || lastCoaching.createdAt));
  }, [data]);

  // Pending actions (uncoached audits + pending follow-ups)
  const pendingActions = useMemo(() => {
    if (!data) return 0;
    
    // Count uncoached audits (status null or 'not_coached' or score < 80%)
    const uncoachedAudits = data.audits.filter((audit: any) => {
      return !audit.coaching_status || 
             audit.coaching_status === 'not_coached' || 
             ((audit.score || 0) < 80 && audit.coaching_status !== 'coached');
    }).length;
    
    // Count pending follow-ups
    const pendingFollowUps = data.coachingSessions.filter((session: any) => {
      return session.status === 'completed' && session.follow_up_status === 'pending';
    }).length;
    
    return uncoachedAudits + pendingFollowUps;
  }, [data]);

  // Calculate coaching effectiveness metrics
  const coachingEffectiveness = useMemo(() => {
    if (!data || !data.coachingSessions.length || !data.kpis.length) {
      return { successRate: '—', avgQualityImpact: '—', avgAHTImpact: '—' };
    }

    const completedSessions = data.coachingSessions.filter((s: any) => s.status === 'completed');
    if (completedSessions.length === 0) {
      return { successRate: '—', avgQualityImpact: '—', avgAHTImpact: '—' };
    }

    let totalQualityImpact = 0;
    let totalAHTImpact = 0;
    let successCount = 0;
    let impactCount = 0;

    completedSessions.forEach((session: any) => {
      const before = getKPIsBeforeCoaching(data.kpis, session.scheduledDate, 7);
      const after = getKPIsAfterCoaching(data.kpis, session.scheduledDate, 7);

      if (before.avgQuality > 0 && after.avgQuality > 0) {
        const qualityDiff = after.avgQuality - before.avgQuality;
        totalQualityImpact += qualityDiff;
        if (qualityDiff > 0) successCount++;
        impactCount++;
      }

      if (before.avgAHT > 0 && after.avgAHT > 0) {
        const ahtDiff = before.avgAHT - after.avgAHT;
        totalAHTImpact += ahtDiff;
        if (ahtDiff > 0) successCount++;
        impactCount++;
      }
    });

    const successRate = impactCount > 0 ? Math.round((successCount / impactCount) * 100) : 0;
    const avgQualityImpact = impactCount > 0 ? Math.round(totalQualityImpact / completedSessions.length) : 0;
    const avgAHTImpact = impactCount > 0 ? Math.round(totalAHTImpact / completedSessions.length) : 0;

    return {
      successRate: `${successRate}%`,
      avgQualityImpact: `${avgQualityImpact > 0 ? '+' : ''}${avgQualityImpact}%`,
      avgAHTImpact: `${avgAHTImpact > 0 ? '-' : ''}${Math.abs(avgAHTImpact)}s`,
    };
  }, [data]);

  // Determine score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-[#A4E83C]';
    if (score >= 70) return 'text-[#FF8C42]';
    return 'text-[#EF4444]';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-[#A4E83C]/20 border-[#A4E83C]/30';
    if (score >= 70) return 'bg-[#FF8C42]/20 border-[#FF8C42]/30';
    return 'bg-[#EF4444]/20 border-[#EF4444]/30';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-[#A4E83C]" />
          <p className="text-gray-400 font-semibold uppercase tracking-wide">Loading agent profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="glass-card p-12 text-center max-w-md mx-auto border-[#EF4444]/30">
          <p className="text-[#EF4444] font-bold text-2xl uppercase mb-3">Error loading agent profile</p>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { agent, kpis, audits, coachingSessions, leaveRecords, attendanceRecords, stats } = data;
  const latestKPI = kpis[kpis.length - 1];

  return (
    <>
      {/* Agent Header */}
      <div className="glass-card p-8 mb-8 shadow-premium animate-fade-scale">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={agent.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.name}`}
                alt={agent.name}
                className="w-24 h-24 rounded-2xl bg-[#2A2A2A] ring-4 ring-[#A4E83C]/30"
              />
              <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-4 border-[#1A1A1A] ${
                agent.status === "active" ? "bg-[#A4E83C]" : "bg-gray-500"
              }`} />
            </div>
            
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-5xl font-black uppercase tracking-wide text-white">{agent.name}</h1>
                <Badge className={
                  agent.status === "active" ? "bg-[#A4E83C]/20 text-[#A4E83C] border border-[#A4E83C]/30" :
                  agent.status === "on_leave" ? "bg-[#FF8C42]/20 text-[#FF8C42] border border-[#FF8C42]/30" :
                  "bg-white/10 text-gray-400 border border-white/10"
                }>
                  {agent.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-gray-400 uppercase tracking-wide font-semibold text-sm mb-4">
                {agent.role} • {agent.tenure} months tenure
              </p>
              
              {/* Overall Score Badge */}
              <div className="flex items-center gap-4">
                <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl border ${getScoreBg(overallScore)}`}>
                  <Crown className={`w-6 h-6 ${getScoreColor(overallScore)}`} />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Overall Score</p>
                    <p className={`text-3xl font-black ${getScoreColor(overallScore)}`}>
                      {Math.round(overallScore)}%
                    </p>
                  </div>
                </div>
                
                {underperformingKPIs.length > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                    <span className="text-sm text-[#EF4444] font-semibold">
                      {underperformingKPIs.length} KPI{underperformingKPIs.length > 1 ? 's' : ''} Need Attention
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <p className="text-sm text-gray-400">{agent.email}</p>
            <Button
              onClick={() => setEditDialogOpen(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 hover-lift"
            >
              <Pencil className="w-4 h-4" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Intelligent Stats - 3 Rows */}
        <div className="space-y-4 mt-8 pt-8 border-t border-white/10">
          {/* Row 1: KPIs with Trend Arrows, Velocity & Risk Scores */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Quality', value: stats.avgQuality, color: '#A4E83C', target: 85, inverse: false },
              { label: 'AHT', value: stats.avgAHT, color: '#3B82F6', target: 480, inverse: true },
              { label: 'SRR', value: stats.avgSRR, color: '#FF8C42', target: 80, inverse: false },
              { label: 'VOC', value: stats.avgVOC, color: '#10B981', target: 85, inverse: false }
            ].map((kpi, index) => {
              const trend = calculateTrend(kpis, kpi.label);
              const vs90Day = calculate90DayComparison(kpis, kpi.label);
              const riskScore = calculateRiskScore(kpi.value, kpi.target, trend, kpi.inverse);
              
              return (
                <div key={index} className="glass-card p-6 shadow-premium hover-lift animate-fade-scale" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs uppercase text-gray-500 font-bold tracking-wider">{kpi.label}</p>
                    <div className={`flex items-center gap-1 text-xs font-bold ${
                      trend > 0 ? 'text-[#A4E83C]' : trend < 0 ? 'text-[#EF4444]' : 'text-gray-400'
                    }`}>
                      {trend > 0 ? <TrendingUp className="w-3 h-3" /> : 
                       trend < 0 ? <TrendingDown className="w-3 h-3" /> : 
                       <Minus className="w-3 h-3" />}
                      <span>{Math.abs(trend).toFixed(1)}%</span>
                    </div>
                  </div>
                  
                  <p className="text-4xl font-black mb-1" style={{ color: kpi.color }}>
                    {Math.round(kpi.value)}{kpi.label === 'AHT' ? 's' : '%'}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400">
                      vs 90d: <span className={vs90Day >= 0 ? 'text-[#A4E83C]' : 'text-[#EF4444]'}>
                        {vs90Day >= 0 ? '+' : ''}{vs90Day.toFixed(1)}%
                      </span>
                    </span>
                    <span className={`font-bold ${
                      riskScore > 70 ? 'text-[#EF4444]' : 
                      riskScore > 40 ? 'text-[#FFB800]' : 'text-[#A4E83C]'
                    }`}>
                      Risk: {riskScore}%
                    </span>
                  </div>
                  
                  <div className="text-[10px] text-gray-500 font-medium">
                    Velocity: {calculateVelocity(kpis, kpi.label)}/week
                  </div>
                </div>
              );
            })}
          </div>

          {/* Row 2: Combined Metrics - 3 Column Grid */}
          <div className="grid grid-cols-3 gap-4">
            {/* Combined: Total Audits + Days Since Audit */}
            <div className="glass-card p-6 shadow-premium">
              <p className="text-xs uppercase text-gray-500 font-bold tracking-wider mb-2">Total Audits</p>
              <p className="text-4xl font-black text-white mb-3">{stats.totalAudits}</p>
              <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                <div className={`w-2 h-2 rounded-full ${
                  daysSinceLastAudit > 14 ? 'bg-[#EF4444] animate-pulse' :
                  daysSinceLastAudit > 7 ? 'bg-[#FFB800]' : 'bg-[#A4E83C]'
                }`} />
                <p className="text-sm text-gray-400">
                  Last audit: <span className={`font-bold ${
                    daysSinceLastAudit > 14 ? 'text-[#EF4444]' :
                    daysSinceLastAudit > 7 ? 'text-[#FFB800]' : 'text-white'
                  }`}>{daysSinceLastAudit} days ago</span>
                </p>
              </div>
            </div>

            {/* Combined: Coaching Sessions + Next Coaching */}
            <div className="glass-card p-6 shadow-premium">
              <p className="text-xs uppercase text-gray-500 font-bold tracking-wider mb-2">Coaching Sessions</p>
              <p className="text-4xl font-black text-white mb-3">{stats.totalCoaching}</p>
              <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                <Calendar className="w-4 h-4 text-[#A4E83C]" />
                <p className="text-sm text-gray-400">
                  Next: <span className="font-bold text-white">
                    {nextCoaching ? format(new Date(nextCoaching), 'MMM dd') : 'Not scheduled'}
                  </span>
                </p>
              </div>
            </div>

            {/* Combined: Leave Days + Next Leave (Planned) */}
            <div className="glass-card p-6 shadow-premium">
              <p className="text-xs uppercase text-gray-500 font-bold tracking-wider mb-2">Leave Days</p>
              <p className="text-4xl font-black text-[#EF4444] mb-3">{stats.sickDays + stats.holidayDays}</p>
              <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                <Calendar className="w-4 h-4 text-[#FFB800]" />
                <p className="text-sm text-gray-400">
                  Planned: <span className="font-bold text-white">
                    {nextLeave ? format(new Date(nextLeave), 'MMM dd') : 'None'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Row 3: Active Days & Pending Actions */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-6 shadow-premium border-[#A4E83C]/20">
              <p className="text-xs uppercase text-gray-500 font-bold tracking-wider mb-2">Active Days</p>
              <p className="text-4xl font-black text-[#A4E83C]">{stats.activeDays}</p>
              <p className="text-xs text-gray-400 mt-2">of {stats.totalDays} total days</p>
            </div>
            
            <div className="glass-card p-6 shadow-premium">
              <p className="text-xs uppercase text-gray-500 font-bold tracking-wider mb-2">Pending Actions</p>
              <p className={`text-4xl font-black mb-1 ${
                pendingActions > 5 ? 'text-[#EF4444]' :
                pendingActions > 2 ? 'text-[#FFB800]' : 'text-white'
              }`}>
                {pendingActions}
              </p>
              <div className="flex items-center gap-2 pt-3 border-t border-white/10 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Uncoached audits & follow-ups</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Button with Dropdown Menu */}
      <div className="glass-card p-8 shadow-premium mb-8 animate-fade-scale">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold uppercase tracking-wide text-white flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-[#A4E83C]" />
            AI Insights
          </h3>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-[#A4E83C] text-black hover:bg-[#A4E83C]/90 font-bold px-6">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Insights
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-[#1A1A1A] border-white/10">
              <DropdownMenuItem onClick={() => openInsightDialog('quality')} className="text-white hover:bg-white/10 cursor-pointer">
                <AlertCircle className="w-4 h-4 mr-2 text-[#A4E83C]" />
                Quality Analysis
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openInsightDialog('aht')} className="text-white hover:bg-white/10 cursor-pointer">
                <Clock className="w-4 h-4 mr-2 text-[#3B82F6]" />
                AHT Analysis
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openInsightDialog('voc')} className="text-white hover:bg-white/10 cursor-pointer">
                <MessageSquare className="w-4 h-4 mr-2 text-[#10B981]" />
                VOC Analysis
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openInsightDialog('srr')} className="text-white hover:bg-white/10 cursor-pointer">
                <TrendingUp className="w-4 h-4 mr-2 text-[#FF8C42]" />
                SRR Analysis
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openInsightDialog('leave')} className="text-white hover:bg-white/10 cursor-pointer">
                <Calendar className="w-4 h-4 mr-2 text-[#EF4444]" />
                Leave Impact Analysis
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openInsightDialog('coaching')} className="text-white hover:bg-white/10 cursor-pointer">
                <Target className="w-4 h-4 mr-2 text-[#A4E83C]" />
                Coaching Effectiveness
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Display insights result here after generation */}
        {selectedInsight && (
          <div className="mt-6 p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-white uppercase">{selectedInsight.title}</h4>
              <Badge className="bg-[#A4E83C]/20 text-[#A4E83C] border-0">
                {selectedInsight.dateRange}
              </Badge>
            </div>
            <div className="space-y-4">
              {selectedInsight.findings?.map((finding: any, i: number) => (
                <div key={i} className="p-4 bg-[#A4E83C]/10 border border-[#A4E83C]/30 rounded-xl">
                  <h5 className="font-bold text-white mb-2">{finding.title}</h5>
                  <p className="text-sm text-gray-300 mb-2">{finding.description}</p>
                  <p className="text-xs text-[#A4E83C]">Evidence: {finding.evidence}</p>
                  {finding.recommendation && (
                    <p className="text-xs text-gray-400 mt-2">💡 {finding.recommendation}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Coaching Effectiveness Section - Standalone */}
      {coachingSessions.length > 0 && (
        <div className="glass-card p-8 shadow-premium mb-8 animate-fade-scale">
          <h3 className="text-2xl font-bold uppercase tracking-wide text-white mb-6 flex items-center gap-3">
            <Target className="w-7 h-7 text-[#A4E83C]" />
            Coaching Effectiveness
          </h3>
          
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="text-center p-6 bg-[#A4E83C]/10 rounded-xl border border-[#A4E83C]/30">
              <p className="text-4xl font-black text-[#A4E83C] mb-2">
                {coachingEffectiveness.successRate}
              </p>
              <p className="text-sm text-gray-400 uppercase tracking-wider font-bold">Success Rate</p>
            </div>
            <div className="text-center p-6 bg-[#3B82F6]/10 rounded-xl border border-[#3B82F6]/30">
              <p className="text-4xl font-black text-[#3B82F6] mb-2">
                {coachingEffectiveness.avgQualityImpact}
              </p>
              <p className="text-sm text-gray-400 uppercase tracking-wider font-bold">Avg Quality Impact</p>
            </div>
            <div className="text-center p-6 bg-[#FF8C42]/10 rounded-xl border border-[#FF8C42]/30">
              <p className="text-4xl font-black text-[#FF8C42] mb-2">
                {coachingEffectiveness.avgAHTImpact}
              </p>
              <p className="text-sm text-gray-400 uppercase tracking-wider font-bold">Avg AHT Impact</p>
            </div>
          </div>
          
          {/* Before/After for each coaching session */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">Recent Coaching Impact</h4>
            {coachingSessions.slice(0, 3).map((session: any, i: number) => {
              const before = getKPIsBeforeCoaching(kpis, session.scheduledDate, 7);
              const after = getKPIsAfterCoaching(kpis, session.scheduledDate, 7);
              const qualityDiff = after.avgQuality - before.avgQuality;
              
              return (
                <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover-lift">
                  <div className="flex-1">
                    <p className="text-white font-semibold">{format(new Date(session.scheduledDate), 'MMM dd, yyyy')}</p>
                    <p className="text-xs text-gray-400">{session.type || 'Regular Session'}</p>
                  </div>
                  <div className="flex gap-6 items-center">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Before</p>
                      <p className="text-sm text-white font-semibold">Q: {before.avgQuality}% | AHT: {before.avgAHT}s</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">After</p>
                      <p className="text-sm text-white font-semibold">Q: {after.avgQuality}% | AHT: {after.avgAHT}s</p>
                    </div>
                    <div className={`text-lg font-black px-3 py-1 rounded-lg ${
                      qualityDiff > 0 ? 'bg-[#A4E83C]/20 text-[#A4E83C]' : 'bg-[#EF4444]/20 text-[#EF4444]'
                    }`}>
                      {qualityDiff > 0 ? '↑' : '↓'} {Math.abs(qualityDiff).toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="performance">
            <TrendingUp className="w-4 h-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="audits">
            <Award className="w-4 h-4 mr-2" />
            Audits ({audits.length})
          </TabsTrigger>
          <TabsTrigger value="coaching">
            <MessageSquare className="w-4 h-4 mr-2" />
            Coaching ({coachingSessions.length})
          </TabsTrigger>
          <TabsTrigger value="leave">
            <Calendar className="w-4 h-4 mr-2" />
            Leave ({leaveRecords.length})
          </TabsTrigger>
          <TabsTrigger value="attendance">
            <TrendingUp className="w-4 h-4 mr-2" />
            Attendance ({stats.totalDays})
          </TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <KPIChart data={kpis} metric="quality" title="Quality Score" color="#A4E83C" />
            <KPIChart data={kpis} metric="aht" title="Average Handle Time" color="#3B82F6" />
            <KPIChart data={kpis} metric="srr" title="Sales Retention Rate" color="#FF8C42" />
            <KPIChart data={kpis} metric="voc" title="Voice of Customer" color="#10B981" />
          </div>

          {/* Current Performance with Red Warnings */}
          {latestKPI && (
            <div className="glass-card p-8 shadow-premium hover-lift">
              <h3 className="text-2xl font-bold uppercase tracking-wide text-white mb-6">Latest Performance</h3>
              <div className="grid grid-cols-4 gap-6">
                {/* Quality */}
                <div className={`relative text-center p-6 rounded-2xl border shadow-premium ${
                  latestKPI.quality! >= 90 ? 'bg-[#A4E83C]/10 border-[#A4E83C]/20' :
                  latestKPI.quality! >= 70 ? 'bg-[#FF8C42]/10 border-[#FF8C42]/20' :
                  'bg-[#EF4444]/10 border-[#EF4444]/30'
                }`}>
                  {latestKPI.quality! < 70 && (
                    <div className="absolute top-3 right-3">
                      <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                    </div>
                  )}
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-3">Quality Score</p>
                  <p className={`text-6xl font-black ${
                    latestKPI.quality! >= 90 ? 'text-[#A4E83C]' :
                    latestKPI.quality! >= 70 ? 'text-[#FF8C42]' :
                    'text-[#EF4444]'
                  }`}>
                    {Math.round(latestKPI.quality!)}
                    <span className="text-3xl">%</span>
                  </p>
                </div>
                
                {/* AHT */}
                <div className={`relative text-center p-6 rounded-2xl border shadow-premium ${
                  latestKPI.aht! < 450 ? 'bg-[#A4E83C]/10 border-[#A4E83C]/20' :
                  latestKPI.aht! < 550 ? 'bg-[#3B82F6]/10 border-[#3B82F6]/20' :
                  latestKPI.aht! < 600 ? 'bg-[#FF8C42]/10 border-[#FF8C42]/20' :
                  'bg-[#EF4444]/10 border-[#EF4444]/30'
                }`}>
                  {latestKPI.aht! > 600 && (
                    <div className="absolute top-3 right-3">
                      <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                    </div>
                  )}
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-3">AHT</p>
                  <p className={`text-6xl font-black ${
                    latestKPI.aht! < 450 ? 'text-[#A4E83C]' :
                    latestKPI.aht! < 550 ? 'text-[#3B82F6]' :
                    latestKPI.aht! < 600 ? 'text-[#FF8C42]' :
                    'text-[#EF4444]'
                  }`}>
                    {Math.round(latestKPI.aht!)}
                    <span className="text-3xl">s</span>
                  </p>
                </div>
                
                {/* SRR */}
                <div className={`relative text-center p-6 rounded-2xl border shadow-premium ${
                  latestKPI.srr! >= 90 ? 'bg-[#A4E83C]/10 border-[#A4E83C]/20' :
                  latestKPI.srr! >= 70 ? 'bg-[#FF8C42]/10 border-[#FF8C42]/20' :
                  'bg-[#EF4444]/10 border-[#EF4444]/30'
                }`}>
                  {latestKPI.srr! < 70 && (
                    <div className="absolute top-3 right-3">
                      <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                    </div>
                  )}
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-3">SRR</p>
                  <p className={`text-6xl font-black ${
                    latestKPI.srr! >= 90 ? 'text-[#A4E83C]' :
                    latestKPI.srr! >= 70 ? 'text-[#FF8C42]' :
                    'text-[#EF4444]'
                  }`}>
                    {Math.round(latestKPI.srr!)}
                    <span className="text-3xl">%</span>
                  </p>
                </div>
                
                {/* VOC */}
                <div className={`relative text-center p-6 rounded-2xl border shadow-premium ${
                  latestKPI.voc! >= 90 ? 'bg-[#A4E83C]/10 border-[#A4E83C]/20' :
                  latestKPI.voc! >= 70 ? 'bg-[#FF8C42]/10 border-[#FF8C42]/20' :
                  'bg-[#EF4444]/10 border-[#EF4444]/30'
                }`}>
                  {latestKPI.voc! < 70 && (
                    <div className="absolute top-3 right-3">
                      <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                    </div>
                  )}
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-3">VOC</p>
                  <p className={`text-6xl font-black ${
                    latestKPI.voc! >= 90 ? 'text-[#A4E83C]' :
                    latestKPI.voc! >= 70 ? 'text-[#FF8C42]' :
                    'text-[#EF4444]'
                  }`}>
                    {Math.round(latestKPI.voc!)}
                    <span className="text-3xl">%</span>
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-6 text-center uppercase tracking-wide">Last updated: {latestKPI.date}</p>
            </div>
          )}
        </TabsContent>

        {/* Audits Tab */}
        <TabsContent value="audits" className="space-y-4">
          {audits.length === 0 ? (
            <div className="glass-card p-12 text-center shadow-premium">
              <Award className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-bold uppercase tracking-wide text-white mb-2">No audits in this period</h3>
              <p className="text-gray-400">No audits found for the selected date range</p>
            </div>
          ) : (
            audits.map((audit) => (
              <div key={audit.id} className="glass-card p-6 shadow-premium hover:shadow-premium-xl transition-all">
                  <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wide">Audit</h4>
                    <p className="text-sm text-gray-500 mt-1">{audit.date}</p>
                  </div>
                  <Badge className={
                    (audit.score || 0) >= 90 ? "bg-[#A4E83C]/20 text-[#A4E83C] border border-[#A4E83C]/30" :
                    (audit.score || 0) >= 75 ? "bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30" :
                    (audit.score || 0) >= 60 ? "bg-[#FF8C42]/20 text-[#FF8C42] border border-[#FF8C42]/30" :
                    "bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30"
                  }>
                    {audit.score || 0}%
                  </Badge>
                </div>
                <p className="text-sm text-gray-300">{audit.notes}</p>
              </div>
            ))
          )}
        </TabsContent>

        {/* Coaching Tab - ENHANCED */}
        <TabsContent value="coaching" className="space-y-4">
          {coachingSessions.length === 0 ? (
            <div className="glass-card p-12 text-center shadow-premium">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-bold uppercase tracking-wide text-white mb-2">No coaching sessions in this period</h3>
              <p className="text-gray-400">No coaching sessions found for the selected date range</p>
            </div>
          ) : (
            coachingSessions.map((session) => (
              <div key={session.id} className="glass-card p-6 shadow-premium hover:shadow-premium-xl transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-white uppercase tracking-wide">{session.type || 'Regular Session'}</h4>
                      {session.aiGenerated === 1 && (
                        <Badge className="bg-[#A4E83C]/20 text-[#A4E83C] border-0 px-2 py-0.5 text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          AI Prep
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{session.scheduledDate ? format(new Date(session.scheduledDate), 'MMM dd, yyyy') : 'Date not set'}</p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge className={
                      session.status === "completed" ? "bg-[#A4E83C]/20 text-[#A4E83C] border border-[#A4E83C]/30" :
                      session.status === "scheduled" ? "bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30" :
                      "bg-white/10 text-gray-400 border border-white/10"
                    }>
                      {session.status}
                    </Badge>
                  </div>
                </div>
                
                
                {session.status === "completed" && session.actionPlan && (
                  <div className="mt-3 p-3 bg-[#A4E83C]/10 border border-[#A4E83C]/30 rounded-lg">
                    <p className="text-xs text-[#A4E83C] uppercase tracking-wide mb-1">Action Plan</p>
                    <p className="text-sm text-white">{session.actionPlan}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </TabsContent>

        {/* Leave Tab - ENHANCED */}
        <TabsContent value="leave" className="space-y-4">
          {leaveRecords.length === 0 ? (
            <div className="glass-card p-12 text-center shadow-premium">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-bold uppercase tracking-wide text-white mb-2">No leave records in this period</h3>
              <p className="text-gray-400">No leave records found for the selected date range</p>
            </div>
          ) : (
            leaveRecords.map((leave) => {
              const getLeaveColor = (type: string) => {
                const colors: Record<string, string> = {
                  holiday: '#10B981',
                  vacation: '#10B981',
                  sick: '#EF4444',
                  personal: '#3B82F6',
                  compassionate: '#A855F7',
                  study: '#06B6D4',
                };
                return colors[type] || '#6B7280';
              };

              const getLeaveIcon = (type: string) => {
                const icons: Record<string, any> = {
                  holiday: Plane,
                  vacation: Plane,
                  sick: HeartPulse,
                  personal: Calendar,
                  compassionate: Heart,
                  study: GraduationCap,
                };
                return icons[type] || Calendar;
              };

              const getStatusBadge = (status: string) => {
                if (status === 'pending') return 'bg-[#FFB800] text-black border-0';
                if (status === 'approved') return 'bg-[#10B981] text-white border-0';
                if (status === 'declined') return 'bg-[#EF4444] text-white border-0';
                return 'bg-gray-500 text-white border-0';
              };

              const LeaveIcon = getLeaveIcon(leave.type);
              const color = getLeaveColor(leave.type);
              
              return (
                <div key={leave.id} className="glass-card p-6 shadow-premium hover:shadow-premium-xl transition-all animate-fade-scale">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div 
                        className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <LeaveIcon className="w-7 h-7" style={{ color }} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white capitalize tracking-wide text-lg mb-1">
                          {leave.type.replace('_', ' ')}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {leave.startDate && leave.endDate ? (
                            <>
                              <span className="text-white">{format(new Date(leave.startDate), 'MMM dd')}</span>
                              {' - '}
                              <span className="text-white">{format(new Date(leave.endDate), 'MMM dd, yyyy')}</span>
                              {' • '}
                              <span className="text-[#A4E83C] font-semibold">
                                {Math.ceil((new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} day
                                {Math.ceil((new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1 > 1 ? 's' : ''}
                              </span>
                            </>
                          ) : (
                            <span className="text-white">{format(new Date(leave.date), 'MMM dd, yyyy')}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${getStatusBadge(leave.status)} px-4 py-1.5 font-bold uppercase text-sm`}>
                      {leave.status}
                    </Badge>
                  </div>

                  {leave.reason && (
                    <div className="mb-3 p-4 bg-white/5 rounded-lg border-l-4" style={{ borderColor: color }}>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Reason</p>
                      <p className="text-sm text-gray-300">{leave.reason}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div className="text-xs text-gray-500">
                      {leave.requestedDate && (
                        <span>Requested on {format(new Date(leave.requestedDate), 'MMM dd, yyyy')}</span>
                      )}
                    </div>
                    {leave.approvedBy && leave.status === 'approved' && (
                      <div className="text-xs text-[#A4E83C] flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Approved by {leave.approvedBy}
                        {leave.approvedDate && ` on ${format(new Date(leave.approvedDate), 'MMM dd')}`}
                      </div>
                    )}
                    {leave.declinedReason && leave.status === 'declined' && (
                      <div className="text-xs text-[#EF4444]">
                        Reason: {leave.declinedReason}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>

        {/* Attendance Tab - NEW */}
        <TabsContent value="attendance" className="space-y-6">
          {/* Attendance Summary Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="glass-card p-6 text-center shadow-premium animate-fade-scale">
              <div className="w-12 h-12 rounded-xl bg-[#A4E83C]/20 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-[#A4E83C]" />
              </div>
              <p className="text-4xl font-black text-[#A4E83C] mb-2">{stats.activeDays}</p>
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Active Days</p>
            </div>
            <div className="glass-card p-6 text-center border-[#EF4444]/20 shadow-premium animate-fade-scale" style={{ animationDelay: '100ms' }}>
              <div className="w-12 h-12 rounded-xl bg-[#EF4444]/20 flex items-center justify-center mx-auto mb-3">
                <HeartPulse className="w-6 h-6 text-[#EF4444]" />
              </div>
              <p className="text-4xl font-black text-[#EF4444] mb-2">{stats.sickDays}</p>
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Sick Days</p>
            </div>
            <div className="glass-card p-6 text-center border-[#3B82F6]/20 shadow-premium animate-fade-scale" style={{ animationDelay: '200ms' }}>
              <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center mx-auto mb-3">
                <Plane className="w-6 h-6 text-[#3B82F6]" />
              </div>
              <p className="text-4xl font-black text-[#3B82F6] mb-2">{stats.holidayDays}</p>
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Holiday Days</p>
            </div>
            <div className="glass-card p-6 text-center shadow-premium animate-fade-scale" style={{ animationDelay: '300ms' }}>
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <p className="text-4xl font-black text-white mb-2">{stats.totalDays}</p>
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Total Days Tracked</p>
            </div>
          </div>

          {/* Attendance Records */}
          {attendanceRecords.length === 0 ? (
            <div className="glass-card p-12 text-center shadow-premium">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-bold uppercase tracking-wide text-white mb-2">No Attendance Records</h3>
              <p className="text-gray-400">No attendance data available for the selected date range</p>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="text-lg font-bold uppercase tracking-wide text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#A4E83C]" />
                Daily Attendance Log
              </h3>
              {attendanceRecords.map((record) => {
                const getStatusColor = (status: string) => {
                  if (status === 'active') return { bg: 'bg-[#A4E83C]/10', border: 'border-[#A4E83C]/30', text: 'text-[#A4E83C]', dot: 'bg-[#A4E83C]' };
                  if (status === 'sick') return { bg: 'bg-[#EF4444]/10', border: 'border-[#EF4444]/30', text: 'text-[#EF4444]', dot: 'bg-[#EF4444]' };
                  return { bg: 'bg-[#3B82F6]/10', border: 'border-[#3B82F6]/30', text: 'text-[#3B82F6]', dot: 'bg-[#3B82F6]' };
                };

                const colors = getStatusColor(record.status);

                return (
                  <div 
                    key={record.id} 
                    className={`glass-card p-4 flex items-center justify-between hover:shadow-premium-xl transition-all border ${colors.border} ${colors.bg}`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-4 h-4 rounded-full ${colors.dot} animate-pulse`} />
                      <div className="flex-1">
                        <p className="text-white font-semibold">
                          {format(new Date(record.date), 'EEEE, MMMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${colors.text} ${colors.bg} border-0 uppercase font-bold px-4 py-2`}>
                      {record.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        agent={{...agent, email: agent.email || '', avatarUrl: agent.avatarUrl || undefined}}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={() => {
          // Refetch data after successful update
          const refetch = async () => {
            try {
              const queryParams = new URLSearchParams({
                startDate: format(dateFilter.startDate, 'yyyy-MM-dd'),
                endDate: format(dateFilter.endDate, 'yyyy-MM-dd'),
              });

              const response = await fetch(`/api/agents/${params.id}?${queryParams}`);
              if (response.ok) {
                const result = await response.json();
                setData(result);
              }
            } catch (err) {
              console.error("Error refetching agent data:", err);
            }
          };
          refetch();
        }}
      />

      {/* Insight Dialog */}
      <InsightDialog
        isOpen={insightDialogOpen}
        onClose={() => setInsightDialogOpen(false)}
        insightType={currentInsightType}
        agentId={parseInt(params.id as string)}
        onInsightGenerated={handleInsightGenerated}
      />
    </>
  );
}


