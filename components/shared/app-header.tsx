"use client";

import { useState } from "react";
import { Search, Bell, Sparkles, Plus, Upload, Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateFilter } from "./date-filter";

interface AppHeaderProps {
  title: string;
  description?: string;
  activeAgents?: number;
  totalAgents?: number;
  alertCount?: number;
}

export function AppHeader({ 
  title, 
  description, 
  activeAgents = 16, 
  totalAgents = 20,
  alertCount = 3 
}: AppHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0A0A0A]/80 border-b border-white/5">
      <div className="flex items-center justify-between px-6 h-16">
        {/* Left: Title + Quick Context */}
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="text-xs text-gray-500">{description}</p>
            )}
          </div>
          
          {/* Quick Stats Pills */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="px-3 py-1.5 bg-[#A4E83C]/10 rounded-full border border-[#A4E83C]/20">
              <span className="text-xs font-semibold text-[#A4E83C]">
                {activeAgents}/{totalAgents} Active
              </span>
            </div>
            {alertCount > 0 && (
              <div className="px-3 py-1.5 bg-[#EF4444]/10 rounded-full border border-[#EF4444]/20">
                <span className="text-xs font-semibold text-[#EF4444]">
                  {alertCount} Alerts
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="hidden md:block relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search agents, reports..."
              className="w-64 h-9 pl-10 pr-16 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:border-[#A4E83C] focus:ring-1 focus:ring-[#A4E83C] transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-white/10 rounded text-[10px] text-gray-400 font-sans">
              ⌘K
            </kbd>
          </div>

          {/* Date Filter - Sleeker */}
          <DateFilter />
          
          {/* Primary Actions - Pill Buttons */}
          <Button 
            size="sm"
            className="h-9 px-4 rounded-full bg-[#A4E83C] text-black hover:bg-[#A4E83C]/90 font-semibold shadow-lg shadow-[#A4E83C]/20 transition-all"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Prep
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            className="hidden xl:flex h-9 px-4 rounded-full border-white/10 hover:bg-white/5"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Audit
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            className="hidden xl:flex h-9 px-4 rounded-full border-white/10 hover:bg-white/5"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>

          {/* Notifications */}
          <button className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <Bell className="w-4 h-4 text-gray-400" />
            {alertCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-[#0A0A0A]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

