"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isWeekend, addMonths, subMonths } from "date-fns";

interface CalendarSession {
  id: number;
  agentId: number;
  agentName: string;
  agentAvatar: string | null;
  date: string;
  time: string;
  duration: number;
  type: string;
  status: string;
  focusAreas: string[];
  aiGenerated: boolean;
}

interface CoachingCalendarProps {
  onSessionClick?: (session: CalendarSession) => void;
  selectedAgentId?: number;
}

export function CoachingCalendar({ onSessionClick, selectedAgentId }: CoachingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [sessions, setSessions] = useState<CalendarSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchSessions();
  }, [currentMonth, selectedAgentId]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const monthStr = format(currentMonth, 'yyyy-MM');
      const url = selectedAgentId 
        ? `/api/coaching/calendar?month=${monthStr}&agentId=${selectedAgentId}`
        : `/api/coaching/calendar?month=${monthStr}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching calendar sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  // Get all days to display in the calendar
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculate padding days for the start of the month
  const startDayOfWeek = monthStart.getDay(); // 0 = Sunday, 6 = Saturday
  const paddingDays = Array.from({ length: startDayOfWeek }, (_, i) => {
    const date = new Date(monthStart);
    date.setDate(date.getDate() - (startDayOfWeek - i));
    return date;
  });

  // Calculate padding days for the end of the month
  const endDayOfWeek = monthEnd.getDay();
  const endPaddingCount = endDayOfWeek === 6 ? 0 : 6 - endDayOfWeek;
  const endPaddingDays = Array.from({ length: endPaddingCount }, (_, i) => {
    const date = new Date(monthEnd);
    date.setDate(date.getDate() + i + 1);
    return date;
  });

  const allDays = [...paddingDays, ...daysInMonth, ...endPaddingDays];

  const getSessionsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return sessions.filter(session => session.date === dateStr);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'scheduled':
        return 'bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30';
      case 'in_progress':
        return 'bg-[#A4E83C]/20 text-[#A4E83C] border-[#A4E83C]/30';
      case 'urgent':
        return 'bg-[#FF8C42]/20 text-[#FF8C42] border-[#FF8C42]/30';
      default:
        return 'bg-white/10 text-gray-400 border-white/10';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent':
        return '#EF4444';
      case 'follow-up':
        return '#A4E83C';
      default:
        return '#3B82F6';
    }
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="glass-card p-6 shadow-premium animate-fade-scale">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-black uppercase tracking-wide text-white">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <Button
            onClick={goToToday}
            variant="outline"
            size="sm"
            className="hover-lift"
          >
            Today
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={goToPreviousMonth}
            variant="outline"
            size="icon"
            className="hover-lift"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            onClick={goToNextMonth}
            variant="outline"
            size="icon"
            className="hover-lift"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border border-white/10 rounded-xl overflow-hidden">
        {/* Week Day Headers */}
        <div className="grid grid-cols-7 bg-white/5">
          {weekDays.map(day => (
            <div
              key={day}
              className="p-3 text-center text-xs font-bold uppercase tracking-wider text-gray-400 border-r border-white/10 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {allDays.map((date, index) => {
            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
            const isTodayDate = isToday(date);
            const isWeekendDay = isWeekend(date);
            const daySessions = getSessionsForDate(date);
            const isHovered = hoveredDate && isSameDay(date, hoveredDate);

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-r border-b border-white/10 last:border-r-0 ${
                  isWeekendDay ? 'bg-white/[0.02]' : ''
                } ${
                  !isCurrentMonth ? 'opacity-40' : ''
                } ${
                  isTodayDate ? 'bg-[#A4E83C]/5 ring-2 ring-[#A4E83C]/30 ring-inset' : ''
                } ${
                  isHovered ? 'bg-white/5' : ''
                } transition-all cursor-pointer hover:bg-white/5`}
                onMouseEnter={() => setHoveredDate(date)}
                onMouseLeave={() => setHoveredDate(null)}
              >
                {/* Date Number */}
                <div className={`text-sm font-semibold mb-1 ${
                  isTodayDate 
                    ? 'w-7 h-7 rounded-full bg-[#A4E83C] text-black flex items-center justify-center' 
                    : isCurrentMonth 
                      ? 'text-white' 
                      : 'text-gray-600'
                }`}>
                  {format(date, 'd')}
                </div>

                {/* Sessions */}
                <div className="space-y-1">
                  {daySessions.slice(0, 3).map(session => (
                    <button
                      key={session.id}
                      onClick={() => onSessionClick?.(session)}
                      className="w-full text-left p-1.5 rounded-lg border transition-all hover:scale-105 hover:shadow-lg"
                      style={{ 
                        backgroundColor: `${getTypeColor(session.type)}20`,
                        borderColor: `${getTypeColor(session.type)}40`
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        {session.agentAvatar && (
                          <img
                            src={session.agentAvatar}
                            alt={session.agentName}
                            className="w-4 h-4 rounded-full"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white truncate">
                            {session.time}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate">
                            {session.agentName}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                  
                  {daySessions.length > 3 && (
                    <div className="text-[10px] text-gray-500 text-center py-1">
                      +{daySessions.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#3B82F6]"></div>
          <span className="text-xs text-gray-400">Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#A4E83C]"></div>
          <span className="text-xs text-gray-400">Follow-up</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
          <span className="text-xs text-gray-400">Urgent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-500"></div>
          <span className="text-xs text-gray-400">Completed</span>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
          <div className="text-white text-sm font-semibold uppercase tracking-wide">
            Loading sessions...
          </div>
        </div>
      )}
    </div>
  );
}

