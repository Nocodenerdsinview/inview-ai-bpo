"use client";

import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { calculateOverallScore } from "@/lib/calculateAgentScore";

interface Agent {
  id: number;
  name: string;
  avatarUrl: string | null;
  latestKPIs: {
    quality: number | null;
    aht: number | null;
    srr: number | null;
    voc: number | null;
  };
}

interface RedFlagAgentsProps {
  agents: Agent[];
  threshold?: number;
}

export function RedFlagAgents({ agents, threshold = 70 }: RedFlagAgentsProps) {
  const router = useRouter();

  const redFlagAgents = agents.filter(agent => {
    const score = calculateOverallScore(agent.latestKPIs);
    return score < threshold;
  });

  if (redFlagAgents.length === 0) {
    return null;
  }

  return (
    <div className="glass-card p-6 border-[#EF4444]/30 shadow-premium animate-fade-scale hover-lift">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#EF4444]/20 rounded-xl flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-[#EF4444]" />
          </div>
          <div>
            <h3 className="text-xl font-bold uppercase text-[#EF4444] tracking-wide">
              Agents Needing Immediate Attention
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Overall performance score below {threshold}%
            </p>
          </div>
        </div>
        <Badge className="bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30 px-4 py-1.5">
          {redFlagAgents.length} {redFlagAgents.length === 1 ? 'Agent' : 'Agents'}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {redFlagAgents.map(agent => {
          const score = calculateOverallScore(agent.latestKPIs);
          const problemKPIs = [];
          
          if (agent.latestKPIs.quality !== null && agent.latestKPIs.quality < 85) {
            problemKPIs.push(`Quality: ${agent.latestKPIs.quality}%`);
          }
          if (agent.latestKPIs.aht !== null && agent.latestKPIs.aht > 600) {
            problemKPIs.push(`AHT: ${agent.latestKPIs.aht}s`);
          }
          if (agent.latestKPIs.srr !== null && agent.latestKPIs.srr < 85) {
            problemKPIs.push(`SRR: ${agent.latestKPIs.srr}%`);
          }
          if (agent.latestKPIs.voc !== null && agent.latestKPIs.voc < 85) {
            problemKPIs.push(`VOC: ${agent.latestKPIs.voc}%`);
          }
          
          return (
            <div key={agent.id} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-[#EF4444]/30 transition-all">
              <div className="flex items-start gap-3 mb-3">
                <img
                  src={agent.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.name}`}
                  alt={agent.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate">{agent.name}</p>
                  <Badge className="mt-1 bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30 text-xs">
                    Score: {score}
                  </Badge>
                </div>
              </div>
              
              {problemKPIs.length > 0 && (
                <div className="space-y-1 mb-3">
                  {problemKPIs.slice(0, 2).map((kpi, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <AlertCircle className="w-3 h-3 text-[#EF4444] shrink-0" />
                      <span className="text-gray-300">{kpi}</span>
                    </div>
                  ))}
                  {problemKPIs.length > 2 && (
                    <p className="text-xs text-gray-500 ml-5">+{problemKPIs.length - 2} more</p>
                  )}
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={() => router.push(`/coaching/quick-prep/${agent.id}`)}
                >
                  Plan Coaching
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary"
                  className="text-xs"
                  onClick={() => router.push(`/agents/${agent.id}`)}
                >
                  View
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

