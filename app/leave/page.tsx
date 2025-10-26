"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/shared/app-layout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeaveTimelineCalendar } from "@/components/leave/leave-timeline-calendar";
import { LeaveRequestsList } from "@/components/leave/leave-requests-list";
import { AddLeaveForm } from "@/components/leave/add-leave-form";
import { CalendarDays, List, Plus, Plane, HeartPulse, User2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface LeaveStats {
  totalLeave: number;
  sickDays: number;
  vacationDays: number;
  personalDays: number;
}

export default function LeavePage() {
  const [stats, setStats] = useState<LeaveStats>({
    totalLeave: 0,
    sickDays: 0,
    vacationDays: 0,
    personalDays: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRequestLeaveOpen, setIsRequestLeaveOpen] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/leave/timeline");
      const data = await response.json();

      let totalLeave = 0;
      let sickDays = 0;
      let vacationDays = 0;
      let personalDays = 0;

      data.agents.forEach((agent: any) => {
        agent.leaveRecords.forEach((leave: any) => {
          if (leave.status === "approved") {
            totalLeave += leave.duration;
            
            if (leave.type === "sick") {
              sickDays += leave.duration;
            } else if (leave.type === "vacation") {
              vacationDays += leave.duration;
            } else if (leave.type === "personal") {
              personalDays += leave.duration;
            }
          }
        });
      });

      setStats({
        totalLeave,
        sickDays,
        vacationDays,
        personalDays,
      });
    } catch (error) {
      console.error("Error fetching leave stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveAdded = () => {
    // Refresh stats and timeline data
    setRefreshTrigger(prev => prev + 1);
    // Close the dialog
    setIsRequestLeaveOpen(false);
  };

  return (
    <AppLayout
      title="Leave Management"
      description="Track team leave and plan availability with an intuitive timeline view"
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-scale">
        <div className="glass-card p-8 text-center shadow-premium hover-lift">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="metric-number-xl text-white mb-2">
            {loading ? "..." : stats.totalLeave}
          </p>
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Total Leave Days</p>
        </div>

        <div className="glass-card p-8 text-center border-[#EF4444]/20 shadow-premium hover-lift">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-[#EF4444]/20 flex items-center justify-center">
              <HeartPulse className="w-6 h-6 text-[#EF4444]" />
            </div>
          </div>
          <p className="metric-number-xl text-[#EF4444] mb-2">
            {loading ? "..." : stats.sickDays}
          </p>
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Sick Days</p>
        </div>

        <div className="glass-card p-8 text-center border-[#10B981]/20 shadow-premium hover-lift">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
              <Plane className="w-6 h-6 text-[#10B981]" />
            </div>
          </div>
          <p className="metric-number-xl text-[#10B981] mb-2">
            {loading ? "..." : stats.vacationDays}
          </p>
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Vacation Days</p>
        </div>

        <div className="glass-card p-8 text-center border-[#3B82F6]/20 shadow-premium hover-lift">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
              <User2 className="w-6 h-6 text-[#3B82F6]" />
            </div>
          </div>
          <p className="metric-number-xl text-[#3B82F6] mb-2">
            {loading ? "..." : stats.personalDays}
          </p>
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Personal Days</p>
        </div>
      </div>

      {/* Tabs for Timeline and List Views */}
      <div className="flex items-center justify-between mb-6">
        <Tabs defaultValue="timeline" className="flex-1" key={refreshTrigger}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="glass-card p-1 border-white/10">
              <TabsTrigger
                value="timeline"
                className="data-[state=active]:bg-[#A4E83C] data-[state=active]:text-black font-bold uppercase text-sm px-6 py-2 rounded-lg transition-all text-white"
              >
                <CalendarDays className="w-4 h-4 mr-2" />
                Timeline View
              </TabsTrigger>
              <TabsTrigger
                value="list"
                className="data-[state=active]:bg-[#A4E83C] data-[state=active]:text-black font-bold uppercase text-sm px-6 py-2 rounded-lg transition-all text-white"
              >
                <List className="w-4 h-4 mr-2" />
                All Requests
              </TabsTrigger>
            </TabsList>

            <Button
              onClick={() => setIsRequestLeaveOpen(true)}
              className="bg-[#A4E83C] text-black hover:bg-[#A4E83C]/90 font-bold uppercase tracking-wide hover-lift h-11 px-6"
            >
              <Plus className="w-4 h-4 mr-2" />
              Request Leave
            </Button>
          </div>

          <TabsContent value="timeline" className="mt-0">
            <LeaveTimelineCalendar />
          </TabsContent>

          <TabsContent value="list" className="mt-0">
            <LeaveRequestsList />
          </TabsContent>
        </Tabs>
      </div>

      {/* Request Leave Dialog */}
      <Dialog open={isRequestLeaveOpen} onOpenChange={setIsRequestLeaveOpen}>
        <DialogContent className="glass-card border-white/10 max-w-3xl max-h-[90vh] overflow-y-auto">
          <AddLeaveForm onSuccess={handleLeaveAdded} />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
