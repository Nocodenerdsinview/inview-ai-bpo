"use client";

import React from "react";
import { AlertTriangle, Users, Plane, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface AttendanceHeroSectionProps {
  activeCount: number;
  holidayCount: number;
  sickCount: number;
  totalAgents: number;
  lastUpdated: string | null;
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  subtitle: string;
}

function StatCard({ icon: Icon, label, value, color, subtitle }: StatCardProps) {
  return (
    <div className="glass-card p-6 rounded-xl animate-fade-scale hover-lift">
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-8 h-8" style={{ color }} />
        </div>
        <div>
          <p className="text-sm text-gray-400 uppercase tracking-wide">
            {label}
          </p>
          <p className="text-4xl font-black" style={{ color }}>
            {value}
          </p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

export function AttendanceHeroSection({
  activeCount,
  holidayCount,
  sickCount,
  totalAgents,
  lastUpdated,
}: AttendanceHeroSectionProps) {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const needsUpdate = !lastUpdated || lastUpdated !== today;

  return (
    <div className="space-y-4 mb-8 animate-fade-scale">
      {/* Warning Banner (if needed) */}
      {needsUpdate && (
        <div className="bg-[#FF8C42]/10 border border-[#FF8C42]/30 rounded-xl p-4 animate-slide-down">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-[#FF8C42]" />
            <div className="flex-1">
              <p className="font-bold text-[#FF8C42] uppercase tracking-wide text-sm">
                Headcount Not Updated
              </p>
              <p className="text-xs text-gray-400">
                Please update attendance for {totalAgents} agents for today
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => router.push("/attendance")}
              className="bg-[#FF8C42] text-white hover:bg-[#F57C32]"
            >
              Update Now
            </Button>
          </div>
        </div>
      )}

      {/* Headcount Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={Users}
          label="Active Now"
          value={activeCount}
          color="#A4E83C"
          subtitle="In Office"
        />
        <StatCard
          icon={Plane}
          label="On Holiday"
          value={holidayCount}
          color="#3B82F6"
          subtitle="Planned Leave"
        />
        <StatCard
          icon={Heart}
          label="Sick Leave"
          value={sickCount}
          color="#EF4444"
          subtitle="Out Today"
        />
      </div>
    </div>
  );
}

