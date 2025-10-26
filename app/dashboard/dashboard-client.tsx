"use client";

import { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import { useDateFilter } from "@/contexts/DateFilterContext";
import { RichKPICard } from "@/components/dashboard/rich-kpi-card";
import { AlertsKPICard } from "@/components/dashboard/alerts-kpi-card";
import { TeamHealthCard } from "@/components/dashboard/team-health-card";
import { PremiumAgentCard } from "@/components/dashboard/premium-agent-card";
import { RedFlagAgents } from "@/components/dashboard/red-flag-agents";
import { UpcomingCoachingsWidget } from "@/components/dashboard/upcoming-coachings-widget";
import { AgentsOnLeaveWidget } from "@/components/dashboard/agents-on-leave-widget";
import { UncoachedAuditsWidget } from "@/components/dashboard/uncoached-audits-widget";
import { QuickStatsBar } from "@/components/dashboard/quick-stats-bar";
import { AttendanceHeroSection } from "@/components/dashboard/attendance-hero-section";
import { CollapsibleSection } from "@/components/dashboard/collapsible-section";
import { getAgentRanking, calculateOverallScore } from "@/lib/calculateAgentScore";
import type { AgentWithStats, CoachingSessionWithAgent, LeaveRecordWithAgent, AuditWithAgent } from "@/types";
import { 
  CheckCircle, 
  Clock, 
  Target, 
  MessageSquare, 
  TrendingDown,
  Calendar,
  Loader2,
  Users,
  AlertCircle,
  FileText,
  TrendingUp,
  Activity,
  BarChart3,
  Star
} from "lucide-react";

interface DashboardData {
  teamKPIs: {
    quality: number;
    aht: number;
    srr: number;
    voc: number;
  };
  agents: AgentWithStats[];
  insights: string[];
  dateRange: {
    start: string;
    end: string;
    daysDiff: number;
  };
}

export function DashboardClient() {
  const { dateFilter } = useDateFilter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendance, setAttendance] = useState({
    activeCount: 0,
    holidayCount: 0,
    sickCount: 0,
    totalAgents: 0,
    lastUpdated: null as string | null,
  });
  
  const [upcomingCoachings, setUpcomingCoachings] = useState<CoachingSessionWithAgent[]>([]);
  const [agentsOnLeave, setAgentsOnLeave] = useState<LeaveRecordWithAgent[]>([]);
  const [uncoachedAudits, setUncoachedAudits] = useState<AuditWithAgent[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          startDate: dateFilter.startDate.toISOString(),
          endDate: dateFilter.endDate.toISOString(),
        });

        // Fetch dashboard data
        const response = await fetch(`/api/dashboard?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const result = await response.json();
        setData(result);

        // Fetch attendance summary
        const attendanceRes = await fetch("/api/attendance/summary");
        if (attendanceRes.ok) {
          const attendanceData = await attendanceRes.json();
          setAttendance({
            activeCount: attendanceData.activeCount || 0,
            holidayCount: attendanceData.holidayCount || 0,
            sickCount: attendanceData.sickCount || 0,
            totalAgents: attendanceData.totalAgents || 0,
            lastUpdated: attendanceData.lastUpdated || null,
          });
        }
        
        // Fetch upcoming coachings (next 7 days)
        const coachingsRes = await fetch("/api/coaching/upcoming?daysAhead=7");
        if (coachingsRes.ok) {
          const coachingsData = await coachingsRes.json();
          setUpcomingCoachings(coachingsData);
        }
        
        // Fetch agents on leave today
        const onLeaveRes = await fetch("/api/attendance/on-leave");
        if (onLeaveRes.ok) {
          const onLeaveData = await onLeaveRes.json();
          setAgentsOnLeave(onLeaveData);
        }
        
        // Fetch uncoached audits
        const uncoachedRes = await fetch("/api/audits/uncoached?limit=10");
        if (uncoachedRes.ok) {
          const uncoachedData = await uncoachedRes.json();
          setUncoachedAudits(uncoachedData);
        }
      } catch (err) {
        console.error("Error fetching dashboard:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [dateFilter]);

  // Generate rich KPI data with distributions and sparklines
  const richKPIData = useMemo(() => {
    if (!data) return null;

    const agents = data.agents;

    // Generate realistic 7-day sparkline data that matches current value
    const generateRealisticSparkline = (
      currentValue: number, 
      lastWeekValue: number,
      variance: number = 3
    ) => {
      const sparkData = [];
      const days = 7;
      const startValue = lastWeekValue;
      const endValue = currentValue;
      const totalChange = endValue - startValue;
      
      for (let i = 0; i < days; i++) {
        // Linear progression with some variance
        const progress = i / (days - 1);
        const baseValue = startValue + (totalChange * progress);
        const randomVariance = (Math.random() - 0.5) * variance;
        const value = Math.max(0, baseValue + randomVariance);
        sparkData.push(Math.round(value));
      }
      
      // Ensure last value matches current exactly
      sparkData[sparkData.length - 1] = Math.round(currentValue);
      
      return sparkData;
    };

    // Quality KPI
    const qualityAgents = agents.filter(a => a.latestKPIs?.quality !== null && a.latestKPIs?.quality !== undefined);
    const qualityValues = qualityAgents.map(a => a.latestKPIs.quality!);
    const avgQuality = qualityValues.reduce((sum, v) => sum + v, 0) / qualityValues.length || 0;
    
    const qualityDistribution = [
      { 
        label: "Good", 
        count: qualityAgents.filter(a => a.latestKPIs.quality! >= 90).length,
        percentage: (qualityAgents.filter(a => a.latestKPIs.quality! >= 90).length / qualityAgents.length) * 100,
        color: "#A4E83C"
      },
      { 
        label: "Room for Improvement", 
        count: qualityAgents.filter(a => a.latestKPIs.quality! >= 70 && a.latestKPIs.quality! < 90).length,
        percentage: (qualityAgents.filter(a => a.latestKPIs.quality! >= 70 && a.latestKPIs.quality! < 90).length / qualityAgents.length) * 100,
        color: "#FF8C42"
      },
      { 
        label: "Poor/Harmful", 
        count: qualityAgents.filter(a => a.latestKPIs.quality! < 70).length,
        percentage: (qualityAgents.filter(a => a.latestKPIs.quality! < 70).length / qualityAgents.length) * 100,
        color: "#EF4444"
      }
    ];

    const topQualityPerformers = [...qualityAgents]
      .sort((a, b) => (b.latestKPIs.quality! || 0) - (a.latestKPIs.quality! || 0))
      .slice(0, 3)
      .map(a => ({ name: a.name, value: a.latestKPIs.quality! }));

    const bottomQualityPerformers = [...qualityAgents]
      .sort((a, b) => (a.latestKPIs.quality! || 0) - (b.latestKPIs.quality! || 0))
      .slice(0, 3)
      .map(a => ({ name: a.name, value: a.latestKPIs.quality! }));

    // AHT KPI
    const ahtAgents = agents.filter(a => a.latestKPIs?.aht !== null && a.latestKPIs?.aht !== undefined);
    const ahtValues = ahtAgents.map(a => a.latestKPIs.aht!);
    const avgAHT = ahtValues.reduce((sum, v) => sum + v, 0) / ahtValues.length || 0;
    
    const ahtDistribution = [
      { 
        label: "Amazing", 
        count: ahtAgents.filter(a => a.latestKPIs.aht! < 450).length,
        percentage: (ahtAgents.filter(a => a.latestKPIs.aht! < 450).length / ahtAgents.length) * 100,
        color: "#A4E83C"
      },
      { 
        label: "Good", 
        count: ahtAgents.filter(a => a.latestKPIs.aht! >= 450 && a.latestKPIs.aht! < 550).length,
        percentage: (ahtAgents.filter(a => a.latestKPIs.aht! >= 450 && a.latestKPIs.aht! < 550).length / ahtAgents.length) * 100,
        color: "#3B82F6"
      },
      { 
        label: "Moderate", 
        count: ahtAgents.filter(a => a.latestKPIs.aht! >= 550 && a.latestKPIs.aht! < 600).length,
        percentage: (ahtAgents.filter(a => a.latestKPIs.aht! >= 550 && a.latestKPIs.aht! < 600).length / ahtAgents.length) * 100,
        color: "#FF8C42"
      },
      { 
        label: "Critical", 
        count: ahtAgents.filter(a => a.latestKPIs.aht! >= 600).length,
        percentage: (ahtAgents.filter(a => a.latestKPIs.aht! >= 600).length / ahtAgents.length) * 100,
        color: "#EF4444"
      }
    ];

    const topAHTPerformers = [...ahtAgents]
      .sort((a, b) => (a.latestKPIs.aht! || 999) - (b.latestKPIs.aht! || 999))
      .slice(0, 3)
      .map(a => ({ name: a.name, value: a.latestKPIs.aht! }));

    const bottomAHTPerformers = [...ahtAgents]
      .sort((a, b) => (b.latestKPIs.aht! || 0) - (a.latestKPIs.aht! || 0))
      .slice(0, 3)
      .map(a => ({ name: a.name, value: a.latestKPIs.aht! }));

    // SRR KPI
    const srrAgents = agents.filter(a => a.latestKPIs?.srr !== null && a.latestKPIs?.srr !== undefined);
    const srrValues = srrAgents.map(a => a.latestKPIs.srr!);
    const avgSRR = srrValues.reduce((sum, v) => sum + v, 0) / srrValues.length || 0;
    
    const srrDistribution = [
      { 
        label: "Excellent", 
        count: srrAgents.filter(a => a.latestKPIs.srr! >= 90).length,
        percentage: (srrAgents.filter(a => a.latestKPIs.srr! >= 90).length / srrAgents.length) * 100,
        color: "#A4E83C"
      },
      { 
        label: "Good", 
        count: srrAgents.filter(a => a.latestKPIs.srr! >= 80 && a.latestKPIs.srr! < 90).length,
        percentage: (srrAgents.filter(a => a.latestKPIs.srr! >= 80 && a.latestKPIs.srr! < 90).length / srrAgents.length) * 100,
        color: "#3B82F6"
      },
      { 
        label: "Needs Work", 
        count: srrAgents.filter(a => a.latestKPIs.srr! >= 70 && a.latestKPIs.srr! < 80).length,
        percentage: (srrAgents.filter(a => a.latestKPIs.srr! >= 70 && a.latestKPIs.srr! < 80).length / srrAgents.length) * 100,
        color: "#FF8C42"
      },
      { 
        label: "Critical", 
        count: srrAgents.filter(a => a.latestKPIs.srr! < 70).length,
        percentage: (srrAgents.filter(a => a.latestKPIs.srr! < 70).length / srrAgents.length) * 100,
        color: "#EF4444"
      }
    ];

    const topSRRPerformers = [...srrAgents]
      .sort((a, b) => (b.latestKPIs.srr! || 0) - (a.latestKPIs.srr! || 0))
      .slice(0, 3)
      .map(a => ({ name: a.name, value: a.latestKPIs.srr! }));

    const bottomSRRPerformers = [...srrAgents]
      .sort((a, b) => (a.latestKPIs.srr! || 0) - (b.latestKPIs.srr! || 0))
      .slice(0, 3)
      .map(a => ({ name: a.name, value: a.latestKPIs.srr! }));

    // VOC KPI
    const vocAgents = agents.filter(a => a.latestKPIs?.voc !== null && a.latestKPIs?.voc !== undefined);
    const vocValues = vocAgents.map(a => a.latestKPIs.voc!);
    const avgVOC = vocValues.reduce((sum, v) => sum + v, 0) / vocValues.length || 0;
    
    const vocDistribution = [
      { 
        label: "Excellent", 
        count: vocAgents.filter(a => a.latestKPIs.voc! >= 90).length,
        percentage: (vocAgents.filter(a => a.latestKPIs.voc! >= 90).length / vocAgents.length) * 100,
        color: "#A4E83C"
      },
      { 
        label: "Good", 
        count: vocAgents.filter(a => a.latestKPIs.voc! >= 80 && a.latestKPIs.voc! < 90).length,
        percentage: (vocAgents.filter(a => a.latestKPIs.voc! >= 80 && a.latestKPIs.voc! < 90).length / vocAgents.length) * 100,
        color: "#3B82F6"
      },
      { 
        label: "Needs Work", 
        count: vocAgents.filter(a => a.latestKPIs.voc! >= 70 && a.latestKPIs.voc! < 80).length,
        percentage: (vocAgents.filter(a => a.latestKPIs.voc! >= 70 && a.latestKPIs.voc! < 80).length / vocAgents.length) * 100,
        color: "#FF8C42"
      },
      { 
        label: "Critical", 
        count: vocAgents.filter(a => a.latestKPIs.voc! < 70).length,
        percentage: (vocAgents.filter(a => a.latestKPIs.voc! < 70).length / vocAgents.length) * 100,
        color: "#EF4444"
      }
    ];

    const topVOCPerformers = [...vocAgents]
      .sort((a, b) => (b.latestKPIs.voc! || 0) - (a.latestKPIs.voc! || 0))
      .slice(0, 3)
      .map(a => ({ name: a.name, value: a.latestKPIs.voc! }));

    const bottomVOCPerformers = [...vocAgents]
      .sort((a, b) => (a.latestKPIs.voc! || 0) - (b.latestKPIs.voc! || 0))
      .slice(0, 3)
      .map(a => ({ name: a.name, value: a.latestKPIs.voc! }));

    // Team Health
    const overallScore = (avgQuality + avgSRR + avgVOC) / 3;
    const performanceTiers = [
      {
        label: "Top",
        count: agents.filter(a => {
          const q = a.latestKPIs?.quality || 0;
          const s = a.latestKPIs?.srr || 0;
          const v = a.latestKPIs?.voc || 0;
          return (q + s + v) / 3 >= 90;
        }).length,
        percentage: (agents.filter(a => {
          const q = a.latestKPIs?.quality || 0;
          const s = a.latestKPIs?.srr || 0;
          const v = a.latestKPIs?.voc || 0;
          return (q + s + v) / 3 >= 90;
        }).length / agents.length) * 100,
        color: "#A4E83C"
      },
      {
        label: "Good",
        count: agents.filter(a => {
          const q = a.latestKPIs?.quality || 0;
          const s = a.latestKPIs?.srr || 0;
          const v = a.latestKPIs?.voc || 0;
          const avg = (q + s + v) / 3;
          return avg >= 80 && avg < 90;
        }).length,
        percentage: (agents.filter(a => {
          const q = a.latestKPIs?.quality || 0;
          const s = a.latestKPIs?.srr || 0;
          const v = a.latestKPIs?.voc || 0;
          const avg = (q + s + v) / 3;
          return avg >= 80 && avg < 90;
        }).length / agents.length) * 100,
        color: "#3B82F6"
      },
      {
        label: "Developing",
        count: agents.filter(a => {
          const q = a.latestKPIs?.quality || 0;
          const s = a.latestKPIs?.srr || 0;
          const v = a.latestKPIs?.voc || 0;
          const avg = (q + s + v) / 3;
          return avg < 80;
        }).length,
        percentage: (agents.filter(a => {
          const q = a.latestKPIs?.quality || 0;
          const s = a.latestKPIs?.srr || 0;
          const v = a.latestKPIs?.voc || 0;
          const avg = (q + s + v) / 3;
          return avg < 80;
        }).length / agents.length) * 100,
        color: "#FF8C42"
      }
    ];

    // Alerts data
    const performanceAlerts = agents.filter(a => 
      (a.latestKPIs?.quality && a.latestKPIs.quality < 85) ||
      (a.latestKPIs?.aht && a.latestKPIs.aht > 600)
    ).length;
    
    const attendanceAlerts = 0; // Would need to check leave data
    const qualityAlerts = agents.filter(a => a.latestKPIs?.quality && a.latestKPIs.quality < 70).length;
    const totalAlerts = performanceAlerts + attendanceAlerts + qualityAlerts;

    return {
      quality: {
        label: "Quality",
        sublabel: "Team Average",
        icon: CheckCircle,
        iconColor: "text-[#A4E83C]",
        iconBgColor: "bg-[#A4E83C]/20",
        value: Math.round(avgQuality),
        unit: "%",
        target: 90,
        lastWeekValue: Math.round(avgQuality - 2), // Mock previous week
        sparklineData: generateRealisticSparkline(avgQuality, avgQuality - 2, 3),
        sparklineColor: "#A4E83C",
        distribution: qualityDistribution,
        topPerformers: topQualityPerformers,
        bottomPerformers: bottomQualityPerformers
      },
      aht: {
        label: "AHT",
        sublabel: "Average Handle Time",
        icon: Clock,
        iconColor: "text-[#3B82F6]",
        iconBgColor: "bg-[#3B82F6]/20",
        value: Math.round(avgAHT),
        unit: "s",
        target: 525,
        lastWeekValue: Math.round(avgAHT + 15), // Mock previous week
        sparklineData: generateRealisticSparkline(avgAHT, avgAHT + 15, 20),
        sparklineColor: "#3B82F6",
        distribution: ahtDistribution,
        topPerformers: topAHTPerformers,
        bottomPerformers: bottomAHTPerformers
      },
      srr: {
        label: "SRR",
        sublabel: "Sales Retention Rate",
        icon: Target,
        iconColor: "text-[#EC4899]",
        iconBgColor: "bg-[#EC4899]/20",
        value: Math.round(avgSRR),
        unit: "%",
        target: 85,
        lastWeekValue: Math.round(avgSRR - 1), // Mock previous week
        sparklineData: generateRealisticSparkline(avgSRR, avgSRR - 1, 3),
        sparklineColor: "#EC4899",
        distribution: srrDistribution,
        topPerformers: topSRRPerformers,
        bottomPerformers: bottomSRRPerformers
      },
      voc: {
        label: "VOC",
        sublabel: "Voice of Customer",
        icon: MessageSquare,
        iconColor: "text-[#F59E0B]",
        iconBgColor: "bg-[#F59E0B]/20",
        value: Math.round(avgVOC),
        unit: "%",
        target: 88,
        lastWeekValue: Math.round(avgVOC - 2), // Mock previous week
        sparklineData: generateRealisticSparkline(avgVOC, avgVOC - 2, 3),
        sparklineColor: "#F59E0B",
        distribution: vocDistribution,
        topPerformers: topVOCPerformers,
        bottomPerformers: bottomVOCPerformers
      },
      alerts: {
        totalAlerts,
        sparklineData: [5, 4, 3, 4, 2, 3, totalAlerts],
        categories: [
          {
            label: "Performance",
            icon: TrendingDown,
            count: performanceAlerts,
            color: "text-[#EF4444]",
            bgColor: "bg-[#EF4444]/10",
            borderColor: "border-[#EF4444]/20"
          },
          {
            label: "Attendance",
            icon: Calendar,
            count: attendanceAlerts,
            color: "text-[#FF8C42]",
            bgColor: "bg-[#FF8C42]/10",
            borderColor: "border-[#FF8C42]/20"
          },
          {
            label: "Quality",
            icon: MessageSquare,
            count: qualityAlerts,
            color: "text-[#3B82F6]",
            bgColor: "bg-[#3B82F6]/10",
            borderColor: "border-[#3B82F6]/20"
          }
        ]
      },
      teamHealth: {
        overallScore: Math.round(overallScore),
        sparklineData: generateRealisticSparkline(overallScore, overallScore - 1.5, 2),
        performanceTiers,
        topImprovements: [
          { label: "Quality Score", change: "+3.2%" },
          { label: "Customer Satisfaction", change: "+2.8%" },
          { label: "First Call Resolution", change: "+1.9%" }
        ]
      }
    };
  }, [data]);

  // Calculate team average score (MUST be before early returns!)
  const teamAverageScore = useMemo(() => {
    if (!data?.agents.length) return 0;

    const scores = data.agents.map(agent =>
      calculateOverallScore(agent.latestKPIs || {
        quality: 0,
        aht: 0,
        srr: 0,
        voc: 0
      })
    );

    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }, [data]);

  // Calculate red flag agents (MUST be before early returns!)
  const redFlagCount = useMemo(() => {
    if (!data?.agents.length) return 0;
    
    return data.agents.filter(agent => {
      const score = calculateOverallScore(agent.latestKPIs || { quality: 0, aht: 0, srr: 0, voc: 0 });
      return score < 70;
    }).length;
  }, [data]);

  // Prepare quick stats (MUST be before early returns!)
  const quickStats = useMemo(() => [
    {
      icon: Users,
      label: "Total Agents",
      value: data?.agents.length || 0,
      color: "#FFFFFF"
    },
    {
      icon: AlertCircle,
      label: "Red Flags",
      value: redFlagCount,
      color: "#EF4444"
    },
    {
      icon: Calendar,
      label: "Upcoming",
      value: upcomingCoachings.length,
      color: "#A4E83C"
    },
    {
      icon: FileText,
      label: "Uncoached",
      value: uncoachedAudits.length,
      color: "#FF8C42"
    },
    {
      icon: TrendingUp,
      label: "Team Avg",
      value: `${Math.round(teamAverageScore)}%`,
      color: "#3B82F6"
    },
    {
      icon: Activity,
      label: "Active Now",
      value: attendance.activeCount,
      color: "#A4E83C"
    }
  ], [data, redFlagCount, upcomingCoachings, uncoachedAudits, attendance, teamAverageScore]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-[#A4E83C]" />
          <p className="text-gray-400 text-lg font-semibold uppercase tracking-wide">
            {data ? 'Filtering data...' : 'Loading dashboard data...'}
          </p>
          {dateFilter && (
            <p className="text-gray-500 text-sm mt-2" suppressHydrationWarning>
              {format(dateFilter.startDate, 'MMM dd, yyyy')} - {format(dateFilter.endDate, 'MMM dd, yyyy')}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="glass-card p-12 text-center max-w-md mx-auto border-[#EF4444]/30">
          <p className="text-[#EF4444] font-bold text-2xl uppercase mb-3">Error loading dashboard</p>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || !richKPIData) {
    return null;
  }

  // Rank agents by overall performance
  const rankedAgents = getAgentRanking(data.agents.map(agent => ({
    ...agent,
    latestKPIs: agent.latestKPIs || { quality: null, aht: null, srr: null, voc: null }
  })));

  // Prepare agents data for RedFlagAgents component (include avatarUrl)
  const agentsForRedFlag = data.agents.map(agent => ({
    id: agent.id,
    name: agent.name,
    avatarUrl: agent.avatarUrl,
    latestKPIs: agent.latestKPIs || { quality: null, aht: null, srr: null, voc: null }
  }));

  // Filter red flag agents (score < 70) from the prepared data
  const redFlagAgents = agentsForRedFlag.filter(agent => {
    const score = calculateOverallScore(agent.latestKPIs);
    return score < 70;
  });

  return (
    <div className="space-y-8">
      {/* 1. Quick Stats Bar */}
      <QuickStatsBar stats={quickStats} />

      {/* 2. Combined Attendance Section (Always Visible) */}
      <AttendanceHeroSection
        activeCount={attendance.activeCount}
        holidayCount={attendance.holidayCount}
        sickCount={attendance.sickCount}
        totalAgents={attendance.totalAgents}
        lastUpdated={attendance.lastUpdated}
      />

      {/* 3. KPI Cards (Collapsible) */}
      <CollapsibleSection
        title="Team KPI Overview"
        icon={BarChart3}
        badge="6 Metrics"
        defaultExpanded={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <RichKPICard {...richKPIData.quality} />
          <RichKPICard {...richKPIData.aht} />
          <RichKPICard {...richKPIData.srr} />
          <RichKPICard {...richKPIData.voc} />
          <AlertsKPICard {...richKPIData.alerts} />
          <TeamHealthCard {...richKPIData.teamHealth} />
        </div>
      </CollapsibleSection>

      {/* 4. Red Flag Agents (Collapsible - Only if exists) */}
      {redFlagAgents.length > 0 && (
        <CollapsibleSection
          title="Agents Needing Attention"
          icon={AlertCircle}
          badge={`${redFlagAgents.length} Agents`}
          defaultExpanded={true}
        >
          <RedFlagAgents agents={redFlagAgents} threshold={70} />
        </CollapsibleSection>
      )}

      {/* 5. Priority Widgets (Collapsible) */}
      <CollapsibleSection
        title="Priority Actions"
        icon={Star}
        defaultExpanded={true}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UpcomingCoachingsWidget coachings={upcomingCoachings as any} />
          {agentsOnLeave.length > 0 && (
            <AgentsOnLeaveWidget agents={agentsOnLeave as any} />
          )}
        </div>
      </CollapsibleSection>

      {/* 6. Uncoached Audits (Collapsible - Only if exists) */}
      {uncoachedAudits.length > 0 && (
        <CollapsibleSection
          title="Uncoached Audits"
          icon={FileText}
          badge={`${uncoachedAudits.length} Audits`}
          defaultExpanded={false}
        >
          <UncoachedAuditsWidget audits={uncoachedAudits as any} />
        </CollapsibleSection>
      )}

      {/* 7. Team Performance Grid (Collapsible) */}
      <CollapsibleSection
        title="Team Performance"
        icon={Users}
        badge={`${rankedAgents.length} Agents`}
        defaultExpanded={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rankedAgents.map((agent) => (
            <PremiumAgentCard
              key={agent.id}
              agent={{
                id: agent.id,
                name: agent.name,
                avatarUrl: agent.avatarUrl || null,
                tenure: agent.tenure || 0,
                status: agent.status || 'active',
              }}
              kpis={agent.latestKPIs}
              auditCount={5} // Mock - would fetch from API
              coachingCount={3} // Mock - would fetch from API
              rank={agent.rank || 0}
              rankSuffix={agent.rankSuffix || ''}
            />
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
}

