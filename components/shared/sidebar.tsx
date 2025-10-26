"use client";

import { usePathname } from "next/navigation";
import { ChevronDown, Sparkles } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileCheck,
  FileText,
  Plane,
  Upload,
  Lightbulb,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavItem } from "./nav-item";

export function Sidebar() {
  const pathname = usePathname();

  // Count insights for badge (mock - would fetch from API)
  const insightsCount = 12;
  const coachingCount = 5;
  const attendanceAlerts = 2;

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-[#0A0A0A] border-r border-white/5 flex flex-col z-40">
      {/* User Profile Section - TOP */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-all group">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-[#A4E83C] to-[#3B82F6] rounded-xl flex items-center justify-center text-sm font-bold text-black">
              TW
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#A4E83C] rounded-full border-2 border-[#0A0A0A]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              Treasure Wayne
            </p>
            <p className="text-xs text-gray-500 truncate">Team Leader</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
        </div>
      </div>

      {/* Main Navigation - SCROLLABLE */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 sidebar-scrollbar">
        {/* MAIN Section */}
        <div className="mb-6">
          <p className="px-3 mb-2 text-[10px] font-bold text-gray-600 uppercase tracking-wider">
            Main
          </p>
          
          <NavItem
            icon={LayoutDashboard}
            label="Dashboard"
            active={pathname === "/dashboard" || pathname === "/"}
            href="/dashboard"
          />
          
          <NavItem 
            icon={Users} 
            label="Agents" 
            active={pathname?.startsWith("/agents")}
            href="/agents"
          />
          
          <NavItem 
            icon={UserCheck} 
            label="Attendance" 
            badge={attendanceAlerts > 0 ? attendanceAlerts.toString() : undefined}
            badgeColor="blue"
            active={pathname?.startsWith("/attendance")}
            href="/attendance"
          />
        </div>

        {/* MANAGEMENT Section */}
        <div className="mb-6">
          <p className="px-3 mb-2 text-[10px] font-bold text-gray-600 uppercase tracking-wider">
            Management
          </p>
          
          <NavItem 
            icon={Calendar} 
            label="Coaching" 
            badge={coachingCount > 0 ? coachingCount.toString() : undefined}
            active={pathname?.startsWith("/coaching")}
            href="/coaching"
          />
          
          <NavItem 
            icon={FileCheck} 
            label="Audits" 
            active={pathname?.startsWith("/audits")}
            href="/audits"
          />
          
          <NavItem 
            icon={Lightbulb} 
            label="Insights" 
            badge={insightsCount > 0 ? insightsCount.toString() : undefined}
            badgeColor="red"
            active={pathname?.startsWith("/insights")}
            href="/insights"
          />
          
          <NavItem 
            icon={FileText} 
            label="Reports" 
            active={pathname?.startsWith("/reports")}
            href="/reports"
          />
          
          <NavItem 
            icon={Plane} 
            label="Leave" 
            active={pathname?.startsWith("/leave")}
            href="/leave"
          />
        </div>

        {/* DATA Section */}
        <div className="mb-6">
          <p className="px-3 mb-2 text-[10px] font-bold text-gray-600 uppercase tracking-wider">
            Data
          </p>
          
          <NavItem 
            icon={Upload} 
            label="Uploads" 
            active={pathname?.startsWith("/uploads")}
            href="/uploads"
          />
        </div>
      </nav>

      {/* Bottom CTA Card */}
      <div className="p-4 border-t border-white/5">
        <div className="p-4 rounded-xl bg-gradient-to-br from-[#A4E83C]/10 to-[#3B82F6]/10 border border-[#A4E83C]/20">
          <Sparkles className="w-8 h-8 text-[#A4E83C] mb-3" />
          <p className="text-sm font-bold text-white mb-1">
            Need Help?
          </p>
          <p className="text-xs text-gray-400 mb-3">
            AI assistant ready to help
          </p>
          <Button
            size="sm"
            className="w-full h-8 bg-[#A4E83C] text-black hover:bg-[#A4E83C]/90 rounded-lg font-semibold"
          >
            Ask AI
          </Button>
        </div>
      </div>
    </aside>
  );
}

