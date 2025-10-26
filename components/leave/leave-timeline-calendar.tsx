"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, CalendarDays, List } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, eachDayOfInterval, endOfMonth, startOfWeek, endOfWeek, addDays } from "date-fns";
import { LeaveBar } from "./leave-bar";
import { LeaveRequestModal } from "./leave-request-modal";
import { useRouter } from "next/navigation";

interface Agent {
  id: number;
  name: string;
  avatarUrl: string | null;
  email: string;
  leaveRecords: LeaveRecord[];
}

interface LeaveRecord {
  id: number;
  agentId: number;
  startDate: string;
  endDate: string;
  type: string;
  status: string;
  reason: string | null;
  duration: number;
  requestedDate: string | null;
  approvedBy: string | null;
  approvedDate: string | null;
  declinedReason: string | null;
}

interface TimelineData {
  agents: Agent[];
  month: string;
  daysInMonth: number;
  monthStart: string;
  monthEnd: string;
}

export function LeaveTimelineCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLeave, setSelectedLeave] = useState<{ leave: LeaveRecord; agent: Agent } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "create">("create");
  const router = useRouter();

  const CELL_WIDTH = 150; // pixels per day (increased for cleaner look)
  const ROW_HEIGHT = 80; // pixels per employee (increased for spacing)

  useEffect(() => {
    fetchTimelineData();
  }, [currentMonth]);

  const fetchTimelineData = async () => {
    setLoading(true);
    setError(null);

    try {
      const monthStr = format(currentMonth, "yyyy-MM");
      const response = await fetch(`/api/leave/timeline?month=${monthStr}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch timeline data");
      }

      const data = await response.json();
      setTimelineData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleLeaveClick = (leave: LeaveRecord, agent: Agent) => {
    setSelectedLeave({ leave, agent });
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleRequestLeave = () => {
    setSelectedLeave(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedLeave(null);
  };

  const handleSuccess = () => {
    fetchTimelineData(); // Refresh data
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white rounded-3xl shadow-lg">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-semibold">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (error || !timelineData) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
        <p className="text-red-500 font-bold text-2xl mb-3">Error loading timeline</p>
        <p className="text-gray-600">{error || "No data available"}</p>
        <Button onClick={fetchTimelineData} className="mt-6 bg-[#10B981] text-white hover:bg-[#10B981]/90">
          Retry
        </Button>
      </div>
    );
  }

  const monthStartDate = startOfMonth(currentMonth);
  const monthEndDate = endOfMonth(currentMonth);
  
  // Get current week for display
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Use full month for data
  const daysInMonth = eachDayOfInterval({ start: monthStartDate, end: monthEndDate });

  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden animate-fade-scale">
      {/* Header */}
      <div className="flex items-center justify-between p-8 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-gray-100 rounded-xl">
            <CalendarDays className="w-5 h-5 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Calendar
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/leave?tab=list")}
            className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
          >
            <List className="w-4 h-4 mr-2" />
            See all requests
          </Button>

          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl text-gray-700 font-medium">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePreviousMonth}
              className="hover:bg-gray-200 h-8 w-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="min-w-[180px] text-center">
              {format(weekStart, "MMMM d")} - {format(weekEnd, "d, yyyy")}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              className="hover:bg-gray-200 h-8 w-8"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="flex bg-gray-50">
        {/* Employee List (Fixed Left Column) */}
        <div className="w-[280px] shrink-0 bg-white border-r border-gray-200">
          {/* Header */}
          <div className="h-16 px-6 flex items-center bg-gray-50 border-b border-gray-200">
            <p className="text-sm font-bold uppercase tracking-wide text-gray-500">Employees</p>
          </div>

          {/* Employee Rows */}
          <div className="overflow-y-auto" style={{ maxHeight: "600px" }}>
            {timelineData.agents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center gap-3 px-6 border-b border-gray-100"
                style={{ height: `${ROW_HEIGHT}px` }}
              >
                <img
                  src={agent.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.name}`}
                  alt={agent.name}
                  className="w-10 h-10 rounded-full ring-2 ring-gray-200"
                />
                <p className="font-medium text-gray-900 text-sm">{agent.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline (Scrollable Right Section) */}
        <div className="flex-1 overflow-x-auto">
          {/* Date Headers */}
          <div className="flex bg-gray-50 border-b border-gray-200" style={{ height: "64px" }}>
            {weekDays.map((day, index) => (
              <div
                key={index}
                className="shrink-0 flex flex-col items-center justify-center"
                style={{ width: `${CELL_WIDTH}px` }}
              >
                <span className="text-xs text-gray-500 uppercase font-medium">{format(day, "EEE")}</span>
                <span className="text-lg font-bold text-gray-900 mt-1">{format(day, "d")}</span>
                <span className="text-xs text-gray-500 uppercase">{format(day, "MMM").toUpperCase()}</span>
              </div>
            ))}
          </div>

          {/* Leave Bars */}
          <div className="relative bg-white" style={{ maxHeight: "600px", overflowY: "auto" }}>
            {timelineData.agents.map((agent, agentIndex) => (
              <div
                key={agent.id}
                className="relative border-b border-gray-100 hover:bg-gray-50 transition-colors"
                style={{ height: `${ROW_HEIGHT}px` }}
              >
                {/* Weekend shading pattern (diagonal stripes) - only show if in view */}
                {weekDays.map((day, dayIndex) => {
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  if (!isWeekend) return null;
                  
                  return (
                    <div
                      key={dayIndex}
                      className="absolute inset-y-0 bg-gray-100 opacity-30"
                      style={{
                        left: `${dayIndex * CELL_WIDTH}px`,
                        width: `${CELL_WIDTH}px`,
                        backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,.03) 10px, rgba(0,0,0,.03) 20px)"
                      }}
                    />
                  );
                })}

                {/* Leave Bars for this agent */}
                {agent.leaveRecords.map((leave) => (
                  <LeaveBar
                    key={leave.id}
                    leave={leave}
                    monthStart={timelineData.monthStart}
                    cellWidth={CELL_WIDTH}
                    onClick={() => handleLeaveClick(leave, agent)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <LeaveRequestModal
          isOpen={isModalOpen}
          onOpenChange={handleModalClose}
          leave={selectedLeave?.leave}
          agent={selectedLeave?.agent}
          agents={timelineData.agents}
          onSuccess={handleSuccess}
          mode={modalMode}
        />
      )}
    </div>
  );
}
