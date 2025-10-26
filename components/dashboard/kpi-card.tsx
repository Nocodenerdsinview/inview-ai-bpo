"use client";

import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  trend: "up" | "down" | "stable";
  target?: number;
  isLowerBetter?: boolean;
}

export function KPICard({
  title,
  value,
  change,
  trend,
  target,
  isLowerBetter = false,
}: KPICardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = parseInt(value);

  // Animated counter on mount
  useEffect(() => {
    let start = 0;
    const end = numericValue;
    const duration = 1000;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [numericValue]);

  const isPositive = isLowerBetter
    ? trend === "down"
    : trend === "up";
  
  const isNegative = isLowerBetter
    ? trend === "up"
    : trend === "down";

  // Performance-based gradients with clear color coding
  // GREEN = on target, AMBER = borderline, RED = not on target
  const getGradient = () => {
    if (target) {
      const percentage = (numericValue / target) * 100;
      if (isLowerBetter) {
        // For AHT: lower is better
        if (percentage <= 100) return "from-emerald-400 to-green-500"; // On target - GREEN
        if (percentage <= 110) return "from-amber-400 to-orange-500"; // Borderline - AMBER
        return "from-rose-500 to-red-600"; // Not on target - RED (urgent)
      } else {
        // For Quality, SRR, VOC: higher is better
        if (percentage >= 100) return "from-emerald-400 to-green-500"; // On target - GREEN
        if (percentage >= 89) return "from-amber-400 to-orange-500"; // Borderline - AMBER (80-89%)
        return "from-rose-500 to-red-600"; // Not on target - RED (urgent)
      }
    }
    
    if (isPositive) return "from-emerald-400 to-green-500"; // GREEN
    if (isNegative) return "from-rose-500 to-red-600"; // RED
    return "from-amber-400 to-orange-500"; // AMBER
  };

  const gradient = getGradient();
  const isCritical = isNegative && Math.abs(change) > 10;

  return (
    <Card className={cn(
      "relative p-6 overflow-hidden rounded-2xl transition-all duration-300",
      "hover:scale-105 hover:shadow-2xl",
      isCritical && "animate-pulse-slow"
    )}>
      {/* Gradient Background (subtle) */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-5",
        gradient
      )} />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">{title}</p>
            <div className="mt-3 flex items-baseline gap-2">
              <h3 className={cn(
                "text-4xl font-bold bg-gradient-to-br bg-clip-text text-transparent",
                gradient
              )}>
                {displayValue}
              </h3>
              <span className="text-xl font-semibold text-slate-500">{value.replace(/\d+/, '')}</span>
            </div>
          </div>

          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold shadow-lg",
            isPositive && "bg-gradient-to-r from-emerald-500 to-green-600 text-white", // GREEN - on target
            isNegative && "bg-gradient-to-r from-rose-500 to-red-600 text-white animate-pulse-slow", // RED - urgent, pulse
            !isPositive && !isNegative && "bg-gradient-to-r from-amber-500 to-orange-600 text-white" // AMBER - borderline
          )}>
            {trend === "up" && <TrendingUp className="w-4 h-4" />}
            {trend === "down" && <TrendingDown className="w-4 h-4" />}
            {trend === "stable" && <Minus className="w-4 h-4" />}
            <span>{change > 0 ? "+" : ""}{change.toFixed(1)}%</span>
          </div>
        </div>

        {/* Gradient Sparkline */}
        <div className="mt-6 h-12 flex items-end gap-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 rounded-t-lg transition-all duration-300 hover:opacity-80",
                `bg-gradient-to-t ${gradient}`
              )}
              style={{
                height: `${Math.random() * 70 + 30}%`,
                opacity: 0.3 + (i / 12) * 0.7, // Gradient opacity from left to right
              }}
            />
          ))}
        </div>

        {/* Target indicator with urgency */}
        {target && (
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Target: {target}</span>
            <span className={cn(
              "font-bold px-2 py-0.5 rounded-full",
              isPositive && "text-emerald-700 bg-emerald-50", // GREEN - on target
              isNegative && "text-red-700 bg-red-100 animate-pulse-slow", // RED - urgent, pulse
              !isPositive && !isNegative && "text-amber-700 bg-amber-50" // AMBER - borderline
            )}>
              {isPositive && "✓ "}
              {isNegative && "✕ "}
              {!isPositive && !isNegative && "⚠ "}
              {((numericValue / target) * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}

