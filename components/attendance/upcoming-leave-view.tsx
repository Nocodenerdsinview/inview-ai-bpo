"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plane, HeartPulse, Calendar as CalendarIcon, Download } from "lucide-react";
import { format, parseISO, addDays, differenceInDays } from "date-fns";

interface LeaveRecord {
  id: number;
  agentId: number;
  date: string;
  status: "holiday" | "sick";
  notes: string | null;
  agentName: string;
  agentAvatarUrl: string | null;
}

interface UpcomingLeaveViewProps {
  daysAhead?: number;
  className?: string;
}

export function UpcomingLeaveView({ daysAhead = 14, className }: UpcomingLeaveViewProps) {
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "holiday" | "sick">("all");

  useEffect(() => {
    fetchUpcomingLeave();
  }, [daysAhead]);

  const fetchUpcomingLeave = async () => {
    setLoading(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const endDate = format(addDays(new Date(), daysAhead), 'yyyy-MM-dd');
      
      const response = await fetch(`/api/attendance/upcoming?start=${today}&end=${endDate}`);
      if (response.ok) {
        const data = await response.json();
        setLeaveRecords(data);
      }
    } catch (error) {
      console.error("Failed to fetch upcoming leave:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = filterType === "all" 
    ? leaveRecords 
    : leaveRecords.filter(record => record.status === filterType);

  // Group by date
  const groupedByDate = filteredRecords.reduce((acc, record) => {
    if (!acc[record.date]) {
      acc[record.date] = [];
    }
    acc[record.date].push(record);
    return acc;
  }, {} as Record<string, LeaveRecord[]>);

  const handleExportCalendar = () => {
    // Create ICS calendar file
    let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Inview AI//Attendance//EN\n';
    
    leaveRecords.forEach(record => {
      const date = parseISO(record.date);
      const dateStr = format(date, 'yyyyMMdd');
      
      icsContent += 'BEGIN:VEVENT\n';
      icsContent += `DTSTART;VALUE=DATE:${dateStr}\n`;
      icsContent += `DTEND;VALUE=DATE:${dateStr}\n`;
      icsContent += `SUMMARY:${record.agentName} - ${record.status === 'holiday' ? 'Holiday' : 'Sick Leave'}\n`;
      if (record.notes) {
        icsContent += `DESCRIPTION:${record.notes}\n`;
      }
      icsContent += 'END:VEVENT\n';
    });
    
    icsContent += 'END:VCALENDAR';
    
    // Download file
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `upcoming-leave-${daysAhead}-days.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading upcoming leave...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Filter:</span>
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Leave" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Leave</SelectItem>
                <SelectItem value="holiday">Holiday Only</SelectItem>
                <SelectItem value="sick">Sick Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-sm text-gray-400">
            Showing next <span className="text-[#A4E83C] font-semibold">{daysAhead} days</span>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCalendar}
          disabled={leaveRecords.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          Export to Calendar
        </Button>
      </div>

      {/* Timeline View */}
      {Object.keys(groupedByDate).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(groupedByDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, records]) => {
              const dateObj = parseISO(date);
              const daysUntil = differenceInDays(dateObj, new Date());
              
              return (
                <Card key={date} className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-white">
                        {format(dateObj, 'EEEE, MMMM dd, yyyy')}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">
                        {daysUntil === 0 
                          ? 'Today' 
                          : daysUntil === 1 
                          ? 'Tomorrow' 
                          : `In ${daysUntil} days`}
                      </p>
                    </div>
                    <Badge className="bg-white/5 text-white border-white/10">
                      {records.length} {records.length === 1 ? 'agent' : 'agents'} off
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {records.map(record => (
                      <div key={record.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-start gap-3">
                          <img
                            src={record.agentAvatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${record.agentName}`}
                            alt={record.agentName}
                            className="w-12 h-12 rounded-full flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white truncate">{record.agentName}</p>
                            <Badge 
                              variant="outline"
                              className={`mt-2 ${
                                record.status === 'holiday' 
                                  ? 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20' 
                                  : 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20'
                              }`}
                            >
                              {record.status === 'holiday' ? (
                                <><Plane className="w-3 h-3 mr-1" /> Holiday</>
                              ) : (
                                <><HeartPulse className="w-3 h-3 mr-1" /> Sick Leave</>
                              )}
                            </Badge>
                            {record.notes && (
                              <p className="text-xs text-gray-400 mt-2">{record.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
        </div>
      ) : (
        <Card className="glass-card p-12 text-center">
          <CalendarIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-xl font-bold text-white mb-2">No Upcoming Leave</p>
          <p className="text-gray-400">
            No leave scheduled for the next {daysAhead} days
            {filterType !== "all" && ` (filtered by ${filterType})`}
          </p>
        </Card>
      )}
    </div>
  );
}

