"use client";

import { 
  CheckCircle, 
  Clock, 
  Target, 
  MessageSquare,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { calculateOverallScore, getScoreColor, getKPIProblems } from "@/lib/calculateAgentScore";

interface AgentKPI {
  quality: number | null;
  aht: number | null;
  srr: number | null;
  voc: number | null;
}

interface CoachingInsight {
  todayCalls: number;
  todayQuality: number;
  needsAttention: Array<{
    type: 'warning' | 'critical';
    message: string;
  }>;
  recentWins: Array<{
    type: 'improvement' | 'achievement';
    message: string;
  }>;
  suggestedActions: string[];
}

interface PremiumAgentCardProps {
  agent: {
    id: number;
    name: string;
    avatarUrl: string | null;
    tenure: number;
    status: string;
  };
  kpis: AgentKPI;
  auditCount: number;
  coachingCount: number;
  rank?: number;
  rankSuffix?: string;
}

export function PremiumAgentCard({ 
  agent, 
  kpis, 
  auditCount, 
  coachingCount,
  rank,
  rankSuffix
}: PremiumAgentCardProps) {
  
  const overallScore = calculateOverallScore(kpis);
  const scoreColor = getScoreColor(overallScore);
  const kpiProblems = getKPIProblems(kpis);

  const getKPIStatus = (value: number | null, metric: string) => {
    if (!value) return 'status-neutral';
    
    if (metric === 'quality' || metric === 'srr' || metric === 'voc') {
      if (value >= 90) return 'status-excellent';
      if (value >= 70) return 'status-warning';
      return 'status-critical';
    }
    
    if (metric === 'aht') {
      if (value < 450) return 'status-excellent';
      if (value < 550) return 'status-neutral';
      if (value < 600) return 'status-warning';
      return 'status-critical';
    }
    
    return 'status-neutral';
  };

  const getKPIColor = (value: number | null, metric: string) => {
    if (!value) return 'text-[#3B82F6]';
    
    if (metric === 'quality' || metric === 'srr' || metric === 'voc') {
      if (value >= 90) return 'text-[#A4E83C]';
      if (value >= 70) return 'text-[#FF8C42]';
      return 'text-[#EF4444]';
    }
    
    if (metric === 'aht') {
      if (value < 450) return 'text-[#A4E83C]';
      if (value < 550) return 'text-[#3B82F6]';
      if (value < 600) return 'text-[#FF8C42]';
      return 'text-[#EF4444]';
    }
    
    return 'text-[#3B82F6]';
  };

  return (
    <div className="glass-card p-6 shadow-premium hover:shadow-premium-xl transition-all duration-300 relative overflow-hidden animate-fade-scale hover-lift">
      {/* Header with Score Badge */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={agent.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.name}`}
              alt={agent.name}
              className="w-12 h-12 rounded-xl ring-2 ring-[#A4E83C]/30"
            />
            {agent.status === 'active' && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#A4E83C] 
                              rounded-full border-2 border-[#1A1A1A] animate-pulse" />
            )}
          </div>
          <div>
            <Link href={`/agents/${agent.id}`}>
              <h3 className="text-base font-bold text-white uppercase tracking-wide hover:text-[#A4E83C] transition-colors">
                {agent.name}
              </h3>
            </Link>
            <p className="text-xs text-gray-500">
              {rankSuffix ? `Rank: ${rankSuffix}` : `${agent.tenure} months tenure`}
            </p>
          </div>
        </div>
        
        {/* Overall Score Badge */}
        <div 
          className="px-4 py-2 rounded-xl font-black text-xl"
          style={{ 
            backgroundColor: `${scoreColor.bg}20`, 
            color: scoreColor.bg,
            border: `1px solid ${scoreColor.bg}40`
          }}
        >
          {overallScore}
        </div>
      </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Quality */}
          <div className={`${getKPIStatus(kpis.quality, 'quality')} rounded-xl p-4 transition-all duration-300`}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400 uppercase tracking-wide">Quality</span>
            </div>
            <p className={`text-3xl font-black ${getKPIColor(kpis.quality, 'quality')} leading-none`}>
              {kpis.quality?.toFixed(0) || "--"}
              <span className="text-lg">%</span>
            </p>
          </div>

          {/* AHT */}
          <div className={`${getKPIStatus(kpis.aht, 'aht')} rounded-xl p-4 transition-all duration-300`}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400 uppercase tracking-wide">AHT</span>
            </div>
            <p className={`text-3xl font-black ${getKPIColor(kpis.aht, 'aht')} leading-none`}>
              {kpis.aht || "--"}
              <span className="text-lg">s</span>
            </p>
          </div>

          {/* SRR */}
          <div className={`${getKPIStatus(kpis.srr, 'srr')} rounded-xl p-4 transition-all duration-300`}>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400 uppercase tracking-wide">SRR</span>
            </div>
            <p className={`text-3xl font-black ${getKPIColor(kpis.srr, 'srr')} leading-none`}>
              {kpis.srr?.toFixed(0) || "--"}
              <span className="text-lg">%</span>
            </p>
          </div>

          {/* VOC */}
          <div className={`${getKPIStatus(kpis.voc, 'voc')} rounded-xl p-4 transition-all duration-300`}>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400 uppercase tracking-wide">VOC</span>
            </div>
            <p className={`text-3xl font-black ${getKPIColor(kpis.voc, 'voc')} leading-none`}>
              {kpis.voc?.toFixed(0) || "--"}
              <span className="text-lg">%</span>
            </p>
          </div>
        </div>

      {/* Show RED KPIs that need attention */}
      {kpiProblems.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-white/10 pt-3">
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">
            Needs Attention
          </p>
          {kpiProblems.map((problem, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <AlertCircle className="w-3 h-3 text-[#EF4444] shrink-0" />
              <span className="text-[#EF4444] font-semibold">{problem.metric}:</span>
              <span className="text-gray-300">{problem.issue}</span>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <div className="flex justify-between text-xs text-gray-400 border-t border-white/10 pt-3 mt-3">
        <span className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          {auditCount} audits
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="w-3 h-3" />
          {coachingCount} sessions
        </span>
        <Link 
          href={`/agents/${agent.id}`}
          className="text-[#A4E83C] hover:text-[#A4E83C]/80 font-semibold transition-colors"
        >
          View →
        </Link>
      </div>
    </div>
  );
}

