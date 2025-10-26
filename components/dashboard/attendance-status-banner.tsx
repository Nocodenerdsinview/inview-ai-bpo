"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface AttendanceStatusBannerProps {
  lastUpdated: string | null; // ISO date string or null
  totalAgents: number;
}

export function AttendanceStatusBanner({ lastUpdated, totalAgents }: AttendanceStatusBannerProps) {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const isUpdatedToday = lastUpdated === today;
  
  // Don't show banner if attendance is updated today
  if (isUpdatedToday) return null;
  
  return (
    <div className="bg-[#FF8C42]/10 border border-[#FF8C42]/30 rounded-xl p-4 mb-6 shadow-premium">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-[#FF8C42]/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-[#FF8C42]" />
          </div>
          <div>
            <p className="font-bold text-[#FF8C42] uppercase tracking-wide text-sm">
              Headcount Not Updated
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Please update attendance for {totalAgents} agents for today ({new Date().toLocaleDateString()})
            </p>
          </div>
        </div>
        <Button 
          size="sm" 
          className="bg-[#FF8C42] text-white hover:bg-[#FF8C42]/90 px-6 flex-shrink-0"
          onClick={() => router.push('/attendance')}
        >
          Update Now
        </Button>
      </div>
    </div>
  );
}

