"use client";

import { Heart, TrendingUp, Sparkles } from "lucide-react";
import { Sparkline } from "@/components/charts/sparkline";
import { AnimatedCounter } from "@/components/charts/animated-counter";

interface PerformanceTier {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

interface Improvement {
  label: string;
  change: string;
}

interface TeamHealthCardProps {
  overallScore: number;
  sparklineData: number[];
  performanceTiers: PerformanceTier[];
  topImprovements: Improvement[];
  animate?: boolean;
}

export function TeamHealthCard({
  overallScore,
  sparklineData,
  performanceTiers,
  topImprovements,
  animate = true
}: TeamHealthCardProps) {
  
  const getHealthColor = () => {
    if (overallScore >= 90) return "#A4E83C";
    if (overallScore >= 80) return "#3B82F6";
    if (overallScore >= 70) return "#FF8C42";
    return "#EF4444";
  };

  const healthColor = getHealthColor();
  
  const getHealthLabel = () => {
    if (overallScore >= 90) return "Excellent";
    if (overallScore >= 80) return "Good";
    if (overallScore >= 70) return "Fair";
    return "Needs Attention";
  };

  const totalAgents = performanceTiers.reduce((sum, tier) => sum + tier.count, 0);

  return (
    <div className={`glass-card p-6 shadow-premium hover:-translate-y-1 transition-all duration-300 border-white/10 ${animate ? 'animate-fade-in-up' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center`} 
               style={{ backgroundColor: `${healthColor}20` }}>
            <Heart className={`w-5 h-5`} style={{ color: healthColor }} />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Team Health</p>
            <p className="text-xs text-gray-500">Overall Performance</p>
          </div>
        </div>
        <TrendingUp className={`w-5 h-5`} style={{ color: healthColor }} />
      </div>

      {/* Main Metric */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black leading-none" style={{ color: healthColor }}>
            <AnimatedCounter 
              value={overallScore} 
              decimals={0}
            />
          </span>
          <span className="text-2xl font-black" style={{ color: healthColor }}>
            %
          </span>
        </div>
        <p className="text-sm font-semibold mt-1" style={{ color: healthColor }}>
          {getHealthLabel()}
        </p>
      </div>

      {/* 7-Day Sparkline */}
      <div className="h-12 mb-4">
        <Sparkline 
          data={sparklineData} 
          color={healthColor} 
          height={48}
          animate={animate}
        />
      </div>

      {/* Performance Tiers Distribution */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Performance Distribution</span>
          <span className="text-gray-500">{totalAgents} agents</span>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden bg-[#2A2A2A]">
          {performanceTiers.map((tier, index) => (
            <div
              key={index}
              style={{ 
                width: `${tier.percentage}%`,
                backgroundColor: tier.color
              }}
              title={`${tier.label}: ${tier.count} agents`}
              className="transition-all duration-500 hover:opacity-80"
            />
          ))}
        </div>
        <div className="flex justify-between text-xs flex-wrap gap-2">
          {performanceTiers.map((tier, index) => (
            <span key={index} style={{ color: tier.color }}>
              {tier.label} ({tier.count})
            </span>
          ))}
        </div>
      </div>

      {/* Top 3 Improvements */}
      <div className="space-y-1 border-t border-white/10 pt-3">
        <p className="text-xs text-gray-400 uppercase font-semibold mb-2 tracking-wide flex items-center gap-2">
          <Sparkles className="w-3 h-3" />
          Top Improvements
        </p>
        {topImprovements.map((improvement, index) => (
          <div key={index} className="flex items-center gap-2 animate-slide-in-right" style={{ animationDelay: `${index * 0.1}s` }}>
            <TrendingUp className="w-3 h-3 text-[#A4E83C]" />
            <span className="text-xs text-gray-300">
              {improvement.label}: <span className="text-[#A4E83C] font-semibold">{improvement.change}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

