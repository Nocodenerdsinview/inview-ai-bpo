"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Target, Users, Star, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface TeamHighlightsProps {
  highlight: {
    metric: string;
    value: number;
    unit: string;
    trend: "up" | "down" | "stable";
    change: number;
    description: string;
  };
  teamSize: number;
}

export function TeamHighlights({ highlight, teamSize }: TeamHighlightsProps) {
  const isPositiveTrend = highlight.trend === "up";
  
  return (
    <Card className="relative overflow-hidden card-gradient-blue border-0 shadow-2xl">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24" />
      </div>

      {/* Content */}
      <div className="relative p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-6 h-6 text-white/90" />
              <h3 className="text-white text-base font-bold uppercase tracking-wider">
                Today's Highlight
              </h3>
            </div>
            <p className="text-white/90 text-sm font-medium">
              {highlight.description}
            </p>
          </div>
          <Link href="/insights">
            <Button
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm shadow-lg border-white/30"
            >
              See All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Main Metric */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-7 h-7 text-white" />
            <h4 className="text-white/90 text-lg font-bold">
              {highlight.metric}
            </h4>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-7xl font-bold text-white leading-none metric-value-xl">
              {highlight.value}
            </span>
            <span className="text-4xl font-bold text-white/90">
              {highlight.unit}
            </span>
          </div>
        </div>

        {/* Trend Indicator */}
        <div className="flex items-center gap-6 mb-8">
          <div className="flex items-center gap-3 px-5 py-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
            {isPositiveTrend ? (
              <TrendingUp className="w-6 h-6 text-white" />
            ) : (
              <TrendingDown className="w-6 h-6 text-white" />
            )}
            <span className="text-white font-bold text-2xl">
              {highlight.change > 0 ? "+" : ""}{highlight.change}%
            </span>
            <span className="text-white/90 text-sm font-semibold">vs last period</span>
          </div>
        </div>

        {/* Team Size */}
        <div className="flex items-center gap-4 pt-6 border-t border-white/20">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white/80 text-sm font-semibold">Active Team Members</p>
            <p className="text-white text-2xl font-bold mt-1">{teamSize} Agents</p>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-6 right-6 w-24 h-24 border-4 border-white/10 rounded-full" />
      <div className="absolute bottom-6 left-6 w-20 h-20 border-4 border-white/10 rounded-full" />
    </Card>
  );
}

