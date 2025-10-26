"use client";

import { AlertTriangle, TrendingDown, Calendar, MessageSquare, Eye } from "lucide-react";
import { Sparkline } from "@/components/charts/sparkline";
import { AnimatedCounter } from "@/components/charts/animated-counter";
import { Button } from "@/components/ui/button";

interface AlertCategory {
  label: string;
  icon: typeof TrendingDown;
  count: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface AlertsKPICardProps {
  totalAlerts: number;
  sparklineData: number[];
  categories: AlertCategory[];
  animate?: boolean;
}

export function AlertsKPICard({
  totalAlerts,
  sparklineData,
  categories,
  animate = true
}: AlertsKPICardProps) {
  
  return (
    <div className={`glass-card p-6 shadow-premium hover:-translate-y-1 transition-all duration-300 border-[#EF4444]/20 ${animate ? 'animate-fade-in-up' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#EF4444]/20 rounded-xl flex items-center justify-center animate-pulse">
            <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Critical Alerts</p>
            <p className="text-xs text-gray-500">Requires Attention</p>
          </div>
        </div>
      </div>

      {/* Total Alerts */}
      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <AnimatedCounter 
            value={totalAlerts} 
            decimals={0}
            className="text-5xl font-black text-[#EF4444] leading-none"
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">Active Issues</p>
      </div>

      {/* 7-Day Alert Trend */}
      <div className="h-12 mb-4">
        <Sparkline 
          data={sparklineData} 
          color="#EF4444" 
          height={48}
          animate={animate}
        />
      </div>

      {/* Issues by Type */}
      <div className="space-y-3 mb-4">
        {categories.map((category, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-3 ${category.bgColor} rounded-xl border ${category.borderColor} 
                       transition-all duration-300 hover:scale-[1.02] cursor-pointer`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center gap-2">
              <category.icon className={`w-4 h-4 ${category.color}`} />
              <span className="text-sm font-semibold text-white">{category.label}</span>
            </div>
            <AnimatedCounter
              value={category.count}
              decimals={0}
              suffix=" agents"
              className={`text-sm font-bold ${category.color}`}
            />
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="pt-4 border-t border-white/10">
        <Button variant="outline" size="sm" className="w-full">
          <Eye className="w-4 h-4 mr-2" />
          View All Alerts
        </Button>
      </div>
    </div>
  );
}

