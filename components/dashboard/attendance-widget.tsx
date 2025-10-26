"use client";

import { Users, Plane, HeartPulse } from "lucide-react";

interface AttendanceWidgetProps {
  activeCount: number;
  holidayCount: number;
  sickCount: number;
  totalAgents: number;
}

export function AttendanceWidget({
  activeCount,
  holidayCount,
  sickCount,
  totalAgents,
}: AttendanceWidgetProps) {
  return (
    <div className="flex items-center gap-6">
      {/* Active/In Office */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#A4E83C]/10 rounded-xl flex items-center justify-center">
          <Users className="w-5 h-5 text-[#A4E83C]" />
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase tracking-wide">In Office</p>
          <p className="text-sm font-bold text-[#A4E83C]">
            {activeCount}/{totalAgents} agents
          </p>
        </div>
      </div>
      
      {/* On Holiday */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#3B82F6]/10 rounded-xl flex items-center justify-center">
          <Plane className="w-5 h-5 text-[#3B82F6]" />
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase tracking-wide">On Holiday</p>
          <p className="text-sm font-bold text-[#3B82F6]">{holidayCount} agents</p>
        </div>
      </div>
      
      {/* Off Sick */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#EF4444]/10 rounded-xl flex items-center justify-center">
          <HeartPulse className="w-5 h-5 text-[#EF4444]" />
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Off Sick</p>
          <p className="text-sm font-bold text-[#EF4444]">{sickCount} agents</p>
        </div>
      </div>
    </div>
  );
}

