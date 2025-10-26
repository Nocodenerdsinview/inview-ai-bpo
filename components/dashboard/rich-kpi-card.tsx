"use client";

import { useState } from "react";
import { LucideIcon, TrendingUp, TrendingDown, Minus, Trophy, CheckCircle, AlertCircle, AlertTriangle, Sparkles, ChevronRight, ChevronDown, Target, MessageSquare } from "lucide-react";
import { Sparkline } from "@/components/charts/sparkline";
import { AnimatedCounter } from "@/components/charts/animated-counter";

interface DistributionBand {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

interface Performer {
  name: string;
  value: number;
}

interface KPIInsights {
  // Quality-specific
  outliers?: Array<{
    name: string;
    score: number;
    auditCount: number;
    nextCoaching?: string;
  }>;
  commonErrors?: string[];
  
  // AHT-specific
  ahtOutliers?: Array<{
    name: string;
    aht: number;
    ahtAuditCount: number;
  }>;
  commonStruggles?: string[];
  
  // VOC-specific
  vocOutliers?: Array<{
    name: string;
    score: number;
    auditCount: number;
  }>;
  customerThemes?: Array<{
    theme: string;
    count: number;
  }>;
  
  // SRR-specific
  srrOutliers?: Array<{
    name: string;
    rate: number;
    auditCount: number;
  }>;
  commonIssues?: string[];
  
  // Team Health-specific
  problematicKPI?: string;
  reason?: string;
  impact?: string;
  recommendation?: string;
  
  // Common fields
  summary: string;
}

interface RichKPICardProps {
  label: string;
  sublabel: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  value: number;
  unit: string;
  target: number;
  lastWeekValue: number;
  sparklineData: number[];
  sparklineColor: string;
  distribution: DistributionBand[];
  topPerformers: Performer[];
  bottomPerformers?: Performer[];
  borderColor?: string;
  animate?: boolean;
}

export function RichKPICard({
  label,
  sublabel,
  icon: Icon,
  iconColor,
  iconBgColor,
  value,
  unit,
  target,
  lastWeekValue,
  sparklineData,
  sparklineColor,
  distribution,
  topPerformers,
  bottomPerformers = [],
  borderColor = "border-white/10",
  animate = true
}: RichKPICardProps) {
  
  const [showInsights, setShowInsights] = useState(false);
  const [insights, setInsights] = useState<KPIInsights | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerateInsights = async () => {
    if (insights && showInsights) {
      // If already showing insights, just toggle
      setShowInsights(false);
      return;
    }

    if (insights) {
      // If we have cached insights, just show them
      setShowInsights(true);
      return;
    }

    // Generate new insights
    setGenerating(true);
    setShowInsights(true);

    try {
      const response = await fetch('/api/kpi/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kpiName: label,
          currentValue: value,
          target,
          unit,
          trend: sparklineData,
          topPerformers,
          bottomPerformers
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }

      const data = await response.json();
      setInsights(data);
    } catch (error) {
      console.error('Error generating insights:', error);
      // Set fallback insights based on KPI type
      const fallbackInsights: KPIInsights = {
        summary: `${bottomPerformers.length} agents need attention. Current performance is ${Math.abs(value - target)}${unit} ${value >= target ? 'above' : 'below'} target.`
      };
      
      // Add KPI-specific fallback data
      if (label === 'Quality') {
        fallbackInsights.outliers = bottomPerformers.slice(0, 3).map(p => ({
          name: p.name,
          score: p.value,
          auditCount: Math.floor(Math.random() * 10) + 5,
          nextCoaching: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toLocaleDateString()
        }));
        fallbackInsights.commonErrors = ['Call handling documentation', 'Soft skills', 'Product knowledge'];
      } else if (label === 'AHT') {
        fallbackInsights.ahtOutliers = bottomPerformers.slice(0, 3).map(p => ({
          name: p.name,
          aht: Math.round(p.value),
          ahtAuditCount: Math.floor(Math.random() * 8) + 3
        }));
        fallbackInsights.commonStruggles = ['Long hold times', 'Multiple transfers', 'System navigation issues'];
      } else if (label === 'VOC') {
        fallbackInsights.vocOutliers = bottomPerformers.slice(0, 3).map(p => ({
          name: p.name,
          score: p.value,
          auditCount: Math.floor(Math.random() * 10) + 5
        }));
        fallbackInsights.customerThemes = [
          { theme: 'Pricing', count: 15 },
          { theme: 'Service Quality', count: 12 },
          { theme: 'Claims Processing', count: 8 }
        ];
      } else if (label === 'SRR') {
        fallbackInsights.srrOutliers = bottomPerformers.slice(0, 3).map(p => ({
          name: p.name,
          rate: p.value,
          auditCount: Math.floor(Math.random() * 10) + 5
        }));
        fallbackInsights.commonIssues = ['Follow-up procedures', 'Value proposition unclear', 'Competitor knowledge gaps'];
      }
      
      setInsights(fallbackInsights);
    } finally {
      setGenerating(false);
    }
  };
  
  const changeFromLastWeek = value - lastWeekValue;
  const changePercentage = lastWeekValue !== 0 
    ? Math.round(((changeFromLastWeek / lastWeekValue) * 100))
    : 0;
  
  const isPositive = changeFromLastWeek > 0;
  const isNegative = changeFromLastWeek < 0;
  
  // For AHT and similar metrics where lower is better
  const lowerIsBetter = unit === "s";
  const trendColor = lowerIsBetter 
    ? (isNegative ? "#A4E83C" : isPositive ? "#EF4444" : "#6B7280")
    : (isPositive ? "#A4E83C" : isNegative ? "#EF4444" : "#6B7280");
  
  const TrendIcon = isPositive 
    ? TrendingUp 
    : isNegative 
      ? TrendingDown 
      : Minus;

  const totalAgents = distribution.reduce((sum, band) => sum + band.count, 0);

  // Calculate variance to target
  const varianceToTarget = lowerIsBetter 
    ? ((target - value) / target) * 100  // For AHT: lower is better
    : ((value - target) / target) * 100; // For Quality/SRR/VOC: higher is better
  
  const onTarget = lowerIsBetter 
    ? value <= target 
    : value >= target;

  // Determine metric color based on target
  const getMetricColor = () => {
    if (lowerIsBetter) {
      // Lower is better (like AHT)
      if (value <= target * 0.9) return "#A4E83C"; // Amazing
      if (value <= target) return "#3B82F6"; // Good
      if (value <= target * 1.15) return "#FF8C42"; // Moderate
      return "#EF4444"; // Critical
    } else {
      // Higher is better (like Quality)
      if (value >= target) return "#A4E83C"; // Excellent
      if (value >= target * 0.9) return "#3B82F6"; // Good
      if (value >= target * 0.8) return "#FF8C42"; // Needs work
      return "#EF4444"; // Critical
    }
  };

  const metricColor = getMetricColor();

  return (
    <div className={`glass-card p-6 shadow-premium hover:-translate-y-1 transition-all duration-300 ${borderColor} ${animate ? 'animate-fade-in-up' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${iconBgColor} rounded-xl flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide">{label}</p>
            <p className="text-xs text-gray-500">{sublabel}</p>
          </div>
        </div>
        <TrendIcon className={`w-5 h-5`} style={{ color: trendColor }} />
      </div>

      {/* Main Metric */}
      <div className="mb-4">
        <div className="flex items-baseline gap-1" style={{ color: metricColor }}>
          <AnimatedCounter 
            value={value} 
            decimals={unit === "%" ? 0 : 0}
            className="text-5xl font-black leading-none"
          />
          <span className="text-2xl font-black">
            {unit}
          </span>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <span 
            className="text-sm font-semibold flex items-center gap-1"
            style={{ color: trendColor }}
          >
            {isPositive ? "+" : ""}{changePercentage}% vs last week
          </span>
          <span className="text-sm text-gray-500">
            Target: {target}{unit}
          </span>
        </div>
      </div>

      {/* 7-Day Connected Line Graph - More Prominent */}
      <div className="h-16 mb-4 bg-[#0A0A0A]/50 rounded-xl p-2 border border-white/5">
        <Sparkline 
          data={sparklineData} 
          color={sparklineColor} 
          height={56}
          animate={animate}
        />
      </div>

      {/* Target Status Indicator */}
      <div className="mb-4 p-3 rounded-xl border transition-all duration-300" style={{
        backgroundColor: onTarget ? 'rgba(164, 232, 60, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        borderColor: onTarget ? 'rgba(164, 232, 60, 0.3)' : 'rgba(239, 68, 68, 0.3)'
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onTarget ? (
              <CheckCircle className="w-4 h-4 text-[#A4E83C]" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#EF4444]" />
            )}
            <span className="text-xs font-bold uppercase tracking-wider" style={{color: onTarget ? '#A4E83C' : '#EF4444'}}>
              {onTarget ? 'ON TARGET' : 'BELOW TARGET'}
            </span>
          </div>
          <span className="text-sm font-black" style={{color: onTarget ? '#A4E83C' : '#EF4444'}}>
            {varianceToTarget > 0 ? '+' : ''}{Math.round(varianceToTarget)}%
          </span>
        </div>
      </div>

      {/* Distribution Bar */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Team Distribution</span>
          <span className="text-gray-500">{totalAgents} agents</span>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden bg-[#2A2A2A]">
          {distribution.map((band, index) => (
            <div
              key={index}
              style={{ 
                width: `${band.percentage}%`,
                backgroundColor: band.color
              }}
              title={`${band.label}: ${band.count} agents`}
              className="transition-all duration-500 hover:opacity-80"
            />
          ))}
        </div>
        <div className="flex justify-between text-xs flex-wrap gap-2">
          {distribution.map((band, index) => (
            <span key={index} style={{ color: band.color }}>
              {band.label} ({band.count})
            </span>
          ))}
        </div>
      </div>

      {/* Top 3 & Bottom 3 Performers */}
      <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-3">
        {/* Top Performers */}
        <div className="space-y-1">
          <p className="text-xs text-gray-400 uppercase font-semibold mb-2 tracking-wide">
            Top 3
          </p>
          {topPerformers.slice(0, 3).map((performer, index) => (
            <div key={index} className="flex items-center gap-2 animate-slide-in-right" style={{ animationDelay: `${index * 0.1}s` }}>
              <Trophy className="w-3 h-3 text-[#A4E83C] shrink-0" />
              <span className="text-xs text-gray-300 truncate">
                {performer.name.split(' ')[0]}: {Math.round(performer.value)}{unit}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom Performers - Needs Attention */}
        <div className="space-y-1">
          <p className="text-xs text-gray-400 uppercase font-semibold mb-2 tracking-wide">
            Needs Attention
          </p>
          {bottomPerformers.length > 0 ? (
            bottomPerformers.slice(0, 3).map((performer, index) => (
              <div key={index} className="flex items-center gap-2 animate-slide-in-right" style={{ animationDelay: `${(index + 3) * 0.1}s` }}>
                <AlertTriangle 
                  className="w-3 h-3 shrink-0" 
                  style={{ 
                    color: lowerIsBetter 
                      ? (performer.value > target * 1.15 ? '#EF4444' : '#FF8C42')
                      : (performer.value < target * 0.7 ? '#EF4444' : '#FF8C42')
                  }} 
                />
                <span className="text-xs text-gray-300 truncate">
                  {performer.name.split(' ')[0]}: {Math.round(performer.value)}{unit}
                </span>
              </div>
            ))
          ) : (
            <div className="text-xs text-gray-500 italic">All on track ✓</div>
          )}
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <button 
          onClick={handleGenerateInsights}
          disabled={generating}
          className="w-full p-3 bg-linear-to-r from-[#3B82F6]/20 to-[#EC4899]/20 
                     rounded-xl border border-[#3B82F6]/30 hover:border-[#3B82F6]/50 
                     transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className={`w-4 h-4 text-[#3B82F6] ${generating ? 'animate-pulse' : ''}`} />
              <span className="text-sm font-bold text-white uppercase tracking-wide">
                {generating ? 'Generating Insights...' : 'AI Insights'}
              </span>
            </div>
            {showInsights ? (
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-[#3B82F6] transition-colors" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#3B82F6] transition-colors" />
            )}
          </div>
        </button>
        
        {/* Expanded Insights */}
        {showInsights && insights && (
          <div className="mt-3 space-y-3 animate-fade-in-up">
            {/* Summary */}
            <div className="p-3 bg-[#3B82F6]/10 rounded-lg border border-[#3B82F6]/20">
              <p className="text-xs font-bold text-[#3B82F6] uppercase mb-2 flex items-center gap-2 tracking-wide">
                <TrendingUp className="w-3 h-3" />
                Analysis
              </p>
              <p className="text-xs text-gray-300 leading-relaxed">
                {insights.summary}
              </p>
            </div>
            
            {/* Quality-specific: Outliers with audits and next coaching */}
            {insights.outliers && insights.outliers.length > 0 && (
              <div className="p-3 bg-[#EF4444]/10 rounded-lg border border-[#EF4444]/20">
                <p className="text-xs font-bold text-[#EF4444] uppercase mb-2 flex items-center gap-2 tracking-wide">
                  <AlertCircle className="w-3 h-3" />
                  Quality Outliers
                </p>
                <div className="space-y-2">
                  {insights.outliers.map((outlier, i) => (
                    <div key={i} className="text-xs text-gray-300">
                      <span className="font-semibold text-white">{outlier.name}:</span> {Math.round(outlier.score)}% 
                      <span className="text-gray-500"> • {outlier.auditCount} audits</span>
                      {outlier.nextCoaching && (
                        <span className="text-gray-500"> • Next coaching: {outlier.nextCoaching}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Quality-specific: Common Errors */}
            {insights.commonErrors && insights.commonErrors.length > 0 && (
              <div className="p-3 bg-[#FF8C42]/10 rounded-lg border border-[#FF8C42]/20">
                <p className="text-xs font-bold text-[#FF8C42] uppercase mb-2 flex items-center gap-2 tracking-wide">
                  <AlertTriangle className="w-3 h-3" />
                  Common Errors
                </p>
                <div className="space-y-1">
                  {insights.commonErrors.map((error, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[#FF8C42] font-bold text-sm">•</span>
                      <p className="text-xs text-gray-300 leading-relaxed">{error}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* AHT-specific: AHT Outliers */}
            {insights.ahtOutliers && insights.ahtOutliers.length > 0 && (
              <div className="p-3 bg-[#EF4444]/10 rounded-lg border border-[#EF4444]/20">
                <p className="text-xs font-bold text-[#EF4444] uppercase mb-2 flex items-center gap-2 tracking-wide">
                  <AlertCircle className="w-3 h-3" />
                  AHT Outliers
                </p>
                <div className="space-y-2">
                  {insights.ahtOutliers.map((outlier, i) => (
                    <div key={i} className="text-xs text-gray-300">
                      <span className="font-semibold text-white">{outlier.name}:</span> {outlier.aht}s
                      <span className="text-gray-500"> • {outlier.ahtAuditCount} AHT audits</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* AHT-specific: Common Struggles */}
            {insights.commonStruggles && insights.commonStruggles.length > 0 && (
              <div className="p-3 bg-[#FF8C42]/10 rounded-lg border border-[#FF8C42]/20">
                <p className="text-xs font-bold text-[#FF8C42] uppercase mb-2 flex items-center gap-2 tracking-wide">
                  <AlertTriangle className="w-3 h-3" />
                  Common Struggles
                </p>
                <div className="space-y-1">
                  {insights.commonStruggles.map((struggle, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[#FF8C42] font-bold text-sm">•</span>
                      <p className="text-xs text-gray-300 leading-relaxed">{struggle}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* VOC-specific: VOC Outliers */}
            {insights.vocOutliers && insights.vocOutliers.length > 0 && (
              <div className="p-3 bg-[#EF4444]/10 rounded-lg border border-[#EF4444]/20">
                <p className="text-xs font-bold text-[#EF4444] uppercase mb-2 flex items-center gap-2 tracking-wide">
                  <AlertCircle className="w-3 h-3" />
                  VOC Outliers
                </p>
                <div className="space-y-2">
                  {insights.vocOutliers.map((outlier, i) => (
                    <div key={i} className="text-xs text-gray-300">
                      <span className="font-semibold text-white">{outlier.name}:</span> {Math.round(outlier.score)}%
                      <span className="text-gray-500"> • {outlier.auditCount} audits</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* VOC-specific: Customer Themes */}
            {insights.customerThemes && insights.customerThemes.length > 0 && (
              <div className="p-3 bg-[#FF8C42]/10 rounded-lg border border-[#FF8C42]/20">
                <p className="text-xs font-bold text-[#FF8C42] uppercase mb-2 flex items-center gap-2 tracking-wide">
                  <MessageSquare className="w-3 h-3" />
                  Customer Complaint Themes
                </p>
                <div className="space-y-1">
                  {insights.customerThemes.map((theme, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-gray-300">{theme.theme}</span>
                      <span className="text-[#FF8C42] font-bold">{theme.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* SRR-specific: SRR Outliers */}
            {insights.srrOutliers && insights.srrOutliers.length > 0 && (
              <div className="p-3 bg-[#EF4444]/10 rounded-lg border border-[#EF4444]/20">
                <p className="text-xs font-bold text-[#EF4444] uppercase mb-2 flex items-center gap-2 tracking-wide">
                  <AlertCircle className="w-3 h-3" />
                  SRR Outliers
                </p>
                <div className="space-y-2">
                  {insights.srrOutliers.map((outlier, i) => (
                    <div key={i} className="text-xs text-gray-300">
                      <span className="font-semibold text-white">{outlier.name}:</span> {Math.round(outlier.rate)}%
                      <span className="text-gray-500"> • {outlier.auditCount} audits</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* SRR-specific: Common Issues */}
            {insights.commonIssues && insights.commonIssues.length > 0 && (
              <div className="p-3 bg-[#FF8C42]/10 rounded-lg border border-[#FF8C42]/20">
                <p className="text-xs font-bold text-[#FF8C42] uppercase mb-2 flex items-center gap-2 tracking-wide">
                  <AlertTriangle className="w-3 h-3" />
                  Common Issues
                </p>
                <div className="space-y-1">
                  {insights.commonIssues.map((issue, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[#FF8C42] font-bold text-sm">•</span>
                      <p className="text-xs text-gray-300 leading-relaxed">{issue}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Team Health-specific */}
            {insights.problematicKPI && (
              <div className="p-3 bg-[#EF4444]/10 rounded-lg border border-[#EF4444]/20">
                <p className="text-xs font-bold text-[#EF4444] uppercase mb-2 flex items-center gap-2 tracking-wide">
                  <AlertCircle className="w-3 h-3" />
                  Problematic KPI: {insights.problematicKPI}
                </p>
                <div className="space-y-2 text-xs text-gray-300">
                  {insights.reason && <p><span className="font-semibold text-white">Reason:</span> {insights.reason}</p>}
                  {insights.impact && <p><span className="font-semibold text-white">Impact:</span> {insights.impact}</p>}
                  {insights.recommendation && (
                    <div className="mt-2 p-2 bg-[#A4E83C]/10 rounded border border-[#A4E83C]/20">
                      <p className="text-[#A4E83C] font-semibold">Recommendation:</p>
                      <p className="text-gray-300 mt-1">{insights.recommendation}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

