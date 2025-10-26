"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface QuickStat {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
  trend?: { value: number; direction: "up" | "down" };
}

interface QuickStatsBarProps {
  stats: QuickStat[];
}

export function QuickStatsBar({ stats }: QuickStatsBarProps) {
  return (
    <div className="relative overflow-hidden mb-8 animate-fade-scale">
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="flex-shrink-0 glass-card p-4 rounded-xl min-w-[180px] hover-lift"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p
                    className="text-2xl font-black"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

