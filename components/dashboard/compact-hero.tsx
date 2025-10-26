"use client";

import { Activity } from "lucide-react";
import { AttendanceWidget } from "./attendance-widget";

interface CompactHeroProps {
  activeAgents: number;
  holidayAgents: number;
  sickAgents: number;
  totalAgents: number;
  lastUpdated?: string;
}

export function CompactHero({ 
  activeAgents, 
  holidayAgents,
  sickAgents,
  totalAgents, 
  lastUpdated = "2 min ago" 
}: CompactHeroProps) {
  return (
    <div className="relative h-24 bg-gradient-to-r from-[#1A1A1A] to-[#2d2d2d] 
                    rounded-2xl border border-white/5 border-l-4 border-l-[#A4E83C] 
                    px-8 py-4 mb-8 shadow-premium overflow-hidden">
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}></div>
      </div>

      <div className="relative z-10 flex items-center justify-between h-full">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wide text-white mb-1">
            Performance Dashboard
          </h1>
          <p className="text-sm text-gray-500">Real-time team analytics</p>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Last Updated</p>
              <p className="text-sm font-bold text-white">{lastUpdated}</p>
            </div>
          </div>
          
          <AttendanceWidget
            activeCount={activeAgents}
            holidayCount={holidayAgents}
            sickCount={sickAgents}
            totalAgents={totalAgents}
          />
        </div>
      </div>
    </div>
  );
}

