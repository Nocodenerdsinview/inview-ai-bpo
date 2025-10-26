"use client";

import { Calendar, Clock, User, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { format, isToday, isTomorrow, parseISO } from "date-fns";

interface CoachingSession {
  id: number;
  agentId: number;
  agentName: string;
  scheduledDate: string;
  type: string;
  focusAreas: string | null;
  status: string;
}

interface UpcomingCoachingsWidgetProps {
  coachings: CoachingSession[];
}

export function UpcomingCoachingsWidget({ coachings }: UpcomingCoachingsWidgetProps) {
  const router = useRouter();

  if (coachings.length === 0) {
    return (
      <div className="glass-card p-8 text-center shadow-premium">
        <div className="w-16 h-16 bg-[#A4E83C]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-[#A4E83C]/50" />
        </div>
        <p className="text-gray-400 mb-4">No coaching sessions scheduled this week</p>
        <Button 
          onClick={() => router.push('/coaching')}
          className="bg-[#A4E83C] text-black hover:bg-[#A4E83C]/90"
        >
          Schedule New Coaching
        </Button>
      </div>
    );
  }

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEE, MMM dd');
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'urgent':
        return 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30';
      case 'follow-up':
        return 'bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30';
      default:
        return 'bg-[#A4E83C]/20 text-[#A4E83C] border-[#A4E83C]/30';
    }
  };

  return (
    <div className="glass-card p-6 shadow-premium animate-fade-scale hover-lift">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#A4E83C]/20 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-[#A4E83C]" />
          </div>
          <div>
            <h3 className="text-xl font-bold uppercase text-white tracking-wide">
              Coaching Sessions This Week
            </h3>
            <p className="text-xs text-gray-500">
              {coachings.length} session{coachings.length !== 1 ? 's' : ''} scheduled
            </p>
          </div>
        </div>
        <Button 
          size="sm"
          variant="outline"
          onClick={() => router.push('/coaching')}
        >
          View Calendar
        </Button>
      </div>

      <div className="space-y-3">
        {coachings.map((coaching) => {
          const focusAreas = coaching.focusAreas ? JSON.parse(coaching.focusAreas) : [];
          
          return (
            <div 
              key={coaching.id}
              className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center gap-4 flex-1">
                {/* Date Badge */}
                <div className="w-14 h-14 bg-[#A4E83C]/20 rounded-xl flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-[#A4E83C]">
                    {format(parseISO(coaching.scheduledDate), 'dd')}
                  </span>
                  <span className="text-[9px] text-gray-400 uppercase font-bold">
                    {format(parseISO(coaching.scheduledDate), 'MMM')}
                  </span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-white">{coaching.agentName}</p>
                    <Badge className={getTypeColor(coaching.type)}>
                      {coaching.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getDateLabel(coaching.scheduledDate)}
                    </span>
                    {focusAreas.length > 0 && (
                      <span>
                        {focusAreas.length} focus area{focusAreas.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <Button 
                size="sm" 
                className="bg-[#A4E83C] text-black hover:bg-[#A4E83C]/90 gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => router.push(`/coaching/quick-prep/${coaching.agentId}`)}
              >
                <PlayCircle className="w-4 h-4" />
                {isToday(parseISO(coaching.scheduledDate)) ? 'Start Now' : 'Prepare'}
              </Button>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push('/coaching')}
          className="w-full"
        >
          View Full Calendar
        </Button>
      </div>
    </div>
  );
}
