"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, HeartPulse, Calendar as CalendarIcon, User } from "lucide-react";
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";

interface LeaveRecord {
  id: number;
  agentId: number;
  date: string;
  status: "holiday" | "sick";
  notes: string | null;
  agentName: string;
  agentAvatarUrl: string | null;
}

interface PlannedLeaveViewProps {
  className?: string;
}

export function PlannedLeaveView({ className }: PlannedLeaveViewProps) {
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  useEffect(() => {
    fetchPlannedLeave();
  }, []);

  const fetchPlannedLeave = async () => {
    setLoading(true);
    try {
      // Fetch all planned leave (holiday and sick) records
      const response = await fetch("/api/attendance/planned-leave");
      if (response.ok) {
        const data = await response.json();
        setLeaveRecords(data);
      }
    } catch (error) {
      console.error("Failed to fetch planned leave:", error);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  // Filter records
  const onLeaveToday = leaveRecords.filter(record => record.date === todayStr);
  const upcomingThisWeek = leaveRecords.filter(record => {
    const recordDate = parseISO(record.date);
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);
    return recordDate >= weekStart && recordDate <= weekEnd && record.date !== todayStr;
  });

  // Group by week
  const groupedByWeek = leaveRecords.reduce((acc, record) => {
    const recordDate = parseISO(record.date);
    const weekStart = startOfWeek(recordDate);
    const weekKey = format(weekStart, 'yyyy-MM-dd');
    
    if (!acc[weekKey]) {
      acc[weekKey] = [];
    }
    acc[weekKey].push(record);
    return acc;
  }, {} as Record<string, LeaveRecord[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading planned leave...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Who's on Leave Today */}
      <div>
        <h3 className="text-xl font-bold uppercase tracking-wide text-white mb-4 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-[#A4E83C]" />
          On Leave Today
        </h3>
        {onLeaveToday.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {onLeaveToday.map(record => (
              <Card key={record.id} className="glass-card p-4 flex items-center gap-3">
                <img
                  src={record.agentAvatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${record.agentName}`}
                  alt={record.agentName}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate">{record.agentName}</p>
                  <Badge 
                    className={`mt-1 ${
                      record.status === 'holiday' 
                        ? 'bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30' 
                        : 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30'
                    }`}
                  >
                    {record.status === 'holiday' ? (
                      <><Plane className="w-3 h-3 mr-1" /> Holiday</>
                    ) : (
                      <><HeartPulse className="w-3 h-3 mr-1" /> Sick</>
                    )}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass-card p-8 text-center">
            <User className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">All agents are in office today</p>
          </Card>
        )}
      </div>

      {/* This Week's Leave */}
      <div>
        <h3 className="text-xl font-bold uppercase tracking-wide text-white mb-4 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-[#3B82F6]" />
          This Week
        </h3>
        {upcomingThisWeek.length > 0 ? (
          <div className="space-y-3">
            {upcomingThisWeek.map(record => (
              <Card key={record.id} className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={record.agentAvatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${record.agentName}`}
                      alt={record.agentName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-bold text-white">{record.agentName}</p>
                      <p className="text-xs text-gray-400">{format(parseISO(record.date), 'EEEE, MMM dd')}</p>
                    </div>
                  </div>
                  <Badge 
                    className={`${
                      record.status === 'holiday' 
                        ? 'bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30' 
                        : 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30'
                    }`}
                  >
                    {record.status === 'holiday' ? (
                      <><Plane className="w-3 h-3 mr-1" /> Holiday</>
                    ) : (
                      <><HeartPulse className="w-3 h-3 mr-1" /> Sick</>
                    )}
                  </Badge>
                </div>
                {record.notes && (
                  <p className="text-xs text-gray-400 mt-2 ml-13">{record.notes}</p>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass-card p-8 text-center">
            <p className="text-gray-400">No planned leave this week</p>
          </Card>
        )}
      </div>

      {/* All Planned Leave by Week */}
      <div>
        <h3 className="text-xl font-bold uppercase tracking-wide text-white mb-4">
          All Planned Leave
        </h3>
        {Object.keys(groupedByWeek).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedByWeek)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([weekKey, records]) => {
                const weekStart = parseISO(weekKey);
                const weekEnd = endOfWeek(weekStart);
                
                return (
                  <div key={weekKey} className="glass-card p-6">
                    <h4 className="font-bold text-white mb-4">
                      Week of {format(weekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {records.map(record => (
                        <div key={record.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-3">
                            <img
                              src={record.agentAvatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${record.agentName}`}
                              alt={record.agentName}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <p className="text-sm font-semibold text-white">{record.agentName}</p>
                              <p className="text-xs text-gray-400">{format(parseISO(record.date), 'EEE, MMM dd')}</p>
                            </div>
                          </div>
                          <Badge 
                            variant="outline"
                            className={`text-xs ${
                              record.status === 'holiday' 
                                ? 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20' 
                                : 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20'
                            }`}
                          >
                            {record.status === 'holiday' ? 'Holiday' : 'Sick'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <Card className="glass-card p-8 text-center">
            <p className="text-gray-400">No planned leave</p>
          </Card>
        )}
      </div>
    </div>
  );
}

