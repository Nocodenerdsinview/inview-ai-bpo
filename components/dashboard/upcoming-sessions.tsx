"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Sparkles } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";

interface Session {
  id: number;
  agentId: number;
  agentName: string;
  scheduledDate: string;
  type: string;
  focusAreas?: string;
}

interface UpcomingSessionsProps {
  sessions: Session[];
}

export function UpcomingSessions({ sessions }: UpcomingSessionsProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "urgent":
        return "bg-red-100 text-red-700";
      case "follow-up":
        return "bg-green-100 text-green-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "urgent":
        return "🔴";
      case "follow-up":
        return "🟢";
      default:
        return "🟦";
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Upcoming Sessions</h3>
            <p className="text-sm text-slate-600">{sessions.length} scheduled</p>
          </div>
        </div>
        <Link href="/coaching/calendar">
          <Button size="sm" variant="outline">
            View All
          </Button>
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No upcoming sessions</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.slice(0, 5).map((session) => (
            <div
              key={session.id}
              className="p-3 border border-slate-200 rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getTypeIcon(session.type)}</span>
                  <div>
                    <div className="font-medium text-slate-900 text-sm">
                      {session.agentName}
                    </div>
                    <div className="text-xs text-slate-600">
                      {format(parseISO(session.scheduledDate), "MMM d, h:mm a")}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className={`text-xs ${getTypeColor(session.type)}`}>
                  {session.type}
                </Badge>
              </div>

              {session.focusAreas && (
                <div className="text-xs text-slate-600 mb-2 truncate">
                  Focus: {JSON.parse(session.focusAreas)[0]}
                </div>
              )}

              <Link href={`/coaching/quick-prep/${session.agentId}`}>
                <Button size="sm" variant="ghost" className="w-full text-xs h-7">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Quick Prep
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

