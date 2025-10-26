"use client";

import React from "react";
import { differenceInDays, parseISO, format } from "date-fns";
import { Plane, HeartPulse, Calendar, Home, MoreVertical, Heart, GraduationCap } from "lucide-react";

interface LeaveBarProps {
  leave: {
    id: number;
    startDate: string;
    endDate: string;
    type: string;
    status: string;
    reason: string | null;
    duration: number;
  };
  monthStart: string;
  cellWidth: number;
  onClick: () => void;
}

export function LeaveBar({ leave, monthStart, cellWidth, onClick }: LeaveBarProps) {
  // Calculate position and width
  const monthStartDate = parseISO(monthStart);
  const leaveStartDate = parseISO(leave.startDate);
  const dayOffset = differenceInDays(leaveStartDate, monthStartDate);
  
  const leftPosition = dayOffset * cellWidth;

  // Get icon based on type
  const getLeaveIcon = () => {
    const icons = {
      vacation: Plane,
      holiday: Plane,
      sick: HeartPulse,
      personal: Calendar,
      compassionate: Heart,
      study: GraduationCap,
      "half-day": Calendar,
    };
    return icons[leave.type as keyof typeof icons] || Calendar;
  };

  // Get color based on type
  const getBarColor = () => {
    const colors = {
      vacation: "#10B981", // Green
      holiday: "#10B981", // Green
      sick: "#EF4444", // Red
      personal: "#3B82F6", // Blue
      compassionate: "#A855F7", // Purple
      study: "#06B6D4", // Cyan
      "half-day": "#FFB800", // Yellow/Orange
    };
    return colors[leave.type as keyof typeof colors] || "#6B7280";
  };

  // Get opacity based on status
  const getOpacity = () => {
    if (leave.status === "pending") return 0.6;
    if (leave.status === "declined") return 0.3;
    return 1;
  };

  // Get border for pending status
  const getBorder = () => {
    if (leave.status === "pending") return "2px solid #FFB800";
    return "none";
  };

  const backgroundColor = getBarColor();
  const opacity = getOpacity();
  const border = getBorder();
  const LeaveIcon = getLeaveIcon();

  const startFormatted = format(leaveStartDate, "MMM d");
  const endFormatted = leave.duration > 1 ? ` - ${format(parseISO(leave.endDate), "MMM d")}` : "";
  
  return (
    <div
      className="absolute top-1/2 -translate-y-1/2 z-10"
      style={{
        left: `${leftPosition}px`,
      }}
    >
      {/* Dotted line from employee to card */}
      <div 
        className="absolute top-1/2 right-full h-px border-t-2 border-dotted border-gray-400"
        style={{
          width: `${Math.max(10, leftPosition - 20)}px`,
          marginRight: "8px"
        }}
      />

      {/* Leave Card */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover-lift transition-all shadow-lg relative"
        style={{
          backgroundColor,
          opacity,
          border,
          minWidth: "fit-content",
        }}
        onClick={onClick}
      >
        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <LeaveIcon className="w-5 h-5 text-white" />
        </div>
        
        <div className="text-white">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-bold text-sm capitalize">{leave.type}</p>
            {leave.status === "pending" && (
              <span className="text-[9px] font-bold uppercase bg-white/30 px-2 py-0.5 rounded">
                Pending
              </span>
            )}
            {leave.status === "declined" && (
              <span className="text-[9px] font-bold uppercase bg-white/30 px-2 py-0.5 rounded">
                Declined
              </span>
            )}
          </div>
          <p className="text-xs opacity-90">
            {startFormatted}{endFormatted}
            {leave.duration > 1 && leave.type === "sick" && ", 11:00"}
          </p>
        </div>

        <button className="ml-2 p-1 hover:bg-white/20 rounded transition-colors">
          <MoreVertical className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Strikethrough for declined */}
      {leave.status === "declined" && (
        <div className="absolute inset-0 flex items-center pointer-events-none">
          <div className="w-full h-0.5 bg-white/50" />
        </div>
      )}
    </div>
  );
}
