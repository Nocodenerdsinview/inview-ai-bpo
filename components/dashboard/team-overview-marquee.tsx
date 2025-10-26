"use client";

import { AgentOverviewCard } from "@/components/ui/agent-overview-card";
import type { Agent, KPI } from "@/types";

interface TeamOverviewMarqueeProps {
  agentsWithKPIs: Array<{
    agent: Agent;
    latestKPI: KPI | null;
    trend: "up" | "down" | "stable";
  }>;
}

export function TeamOverviewMarquee({ agentsWithKPIs }: TeamOverviewMarqueeProps) {
  if (agentsWithKPIs.length === 0) {
    return null;
  }

  return (
    <section className="bg-gradient-to-r from-slate-50/50 via-blue-50/30 to-slate-50/50 py-12 px-0 mb-8 overflow-hidden">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 text-center">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 px-4">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-700 via-blue-600 to-slate-700 bg-clip-text text-transparent">
            Team Performance Overview
          </h2>
          <p className="text-lg font-medium text-slate-600 max-w-[600px]">
            Real-time snapshot of your team's performance and engagement
          </p>
        </div>

        {/* Marquee Container */}
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
        {/* Scrolling Content */}
        <div className="group flex overflow-hidden p-2 [--gap:1rem] [gap:var(--gap)] flex-row [--duration:150s]">
            <div className="flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row group-hover:[animation-play-state:paused]">
              {/* Repeat agents 4 times for seamless loop */}
              {[...Array(4)].map((_, setIndex) => (
                agentsWithKPIs.map((item, i) => (
                  <AgentOverviewCard
                    key={`${setIndex}-${i}`}
                    agent={{...item.agent, avatarUrl: item.agent.avatarUrl || undefined}}
                    latestKPI={item.latestKPI}
                    trend={item.trend}
                  />
                ))
              ))}
            </div>
          </div>

          {/* Gradient Fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-slate-50/80 via-blue-50/40 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-slate-50/80 via-blue-50/40 to-transparent" />
        </div>

        {/* Helper Text */}
        <p className="text-xs text-slate-500">
          💡 Hover to pause • Click any agent card to view detailed profile
        </p>
      </div>
    </section>
  );
}

