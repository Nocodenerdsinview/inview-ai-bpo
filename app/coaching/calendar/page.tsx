"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/shared/app-layout";
import { CoachingCalendar } from "@/components/coaching/coaching-calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, Users, Calendar as CalendarIcon, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";

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

export default function CoachingCalendarPage() {
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<CalendarSession | null>(null);
  const [stats, setStats] = useState({
    upcoming: 0,
    completed: 0,
    urgent: 0,
    followUp: 0,
  });

  useEffect(() => {
    fetchAgents();
    fetchStats();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch("/api/agents");
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/coaching/sessions");
      if (response.ok) {
        const data = await response.json();
        setStats({
          upcoming: data.filter((s: any) => s.session.status === "scheduled").length,
          completed: data.filter((s: any) => s.session.status === "completed").length,
          urgent: data.filter((s: any) => s.session.type === "urgent").length,
          followUp: data.filter((s: any) => s.session.type === "follow-up").length,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleSessionClick = (session: CalendarSession) => {
    setSelectedSession(session);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Completed</Badge>;
      case 'scheduled':
        return <Badge className="bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30">Scheduled</Badge>;
      case 'in_progress':
        return <Badge className="bg-[#A4E83C]/20 text-[#A4E83C] border-[#A4E83C]/30">In Progress</Badge>;
      default:
        return <Badge className="bg-white/10 text-gray-400 border-white/10">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'urgent':
        return <Badge className="bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30">🚨 Urgent</Badge>;
      case 'follow-up':
        return <Badge className="bg-[#A4E83C]/20 text-[#A4E83C] border-[#A4E83C]/30">Follow-up</Badge>;
      default:
        return <Badge className="bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30">Regular</Badge>;
    }
  };

  return (
    <AppLayout
      title="Coaching Calendar"
      description="Schedule and manage coaching sessions"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-scale">
        <div className="glass-card p-6 shadow-premium hover-lift">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-[#3B82F6]/20 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-[#3B82F6]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Upcoming</p>
              <p className="text-4xl font-black text-[#3B82F6]">{stats.upcoming}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 shadow-premium hover-lift">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-[#A4E83C]/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-[#A4E83C]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Completed</p>
              <p className="text-4xl font-black text-[#A4E83C]">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 shadow-premium hover-lift">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-[#EF4444]/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#EF4444]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Urgent</p>
              <p className="text-4xl font-black text-[#EF4444]">{stats.urgent}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 shadow-premium hover-lift">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-[#FF8C42]/20 rounded-xl flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-[#FF8C42]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Follow-ups</p>
              <p className="text-4xl font-black text-[#FF8C42]">{stats.followUp}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter by Agent */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-gray-400" />
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger className="w-[250px] bg-white/5 border-white/10 rounded-xl">
              <SelectValue placeholder="All Agents" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-white/10">
              <SelectItem value="all" className="text-white hover:bg-white/10">All Agents</SelectItem>
              {agents.map((agent) => (
                <SelectItem
                  key={agent.id}
                  value={agent.id.toString()}
                  className="text-white hover:bg-white/10"
                >
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Link href="/coaching/generate">
          <Button className="gap-2 bg-[#A4E83C] text-black hover:bg-[#8FC72D]">
            <Sparkles className="w-4 h-4" />
            Generate New Coaching
          </Button>
        </Link>
      </div>

      {/* Microsoft Outlook-Style Calendar */}
      <CoachingCalendar
        onSessionClick={handleSessionClick}
        selectedAgentId={selectedAgent && selectedAgent !== "all" ? parseInt(selectedAgent) : undefined}
      />

      {/* Session Details Modal */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="bg-[#1A1A1A] border-white/10 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold uppercase tracking-wide text-white">
              Coaching Session Details
            </DialogTitle>
          </DialogHeader>

          {selectedSession && (
            <div className="space-y-6">
              {/* Agent Info */}
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                {selectedSession.agentAvatar && (
                  <img
                    src={selectedSession.agentAvatar}
                    alt={selectedSession.agentName}
                    className="w-16 h-16 rounded-xl ring-4 ring-[#A4E83C]/30"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">{selectedSession.agentName}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusBadge(selectedSession.status)}
                    {getTypeBadge(selectedSession.type)}
                  </div>
                </div>
              </div>

              {/* Session Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Date</p>
                  <p className="text-lg font-semibold text-white">
                    {format(parseISO(selectedSession.date), 'EEEE, MMM d, yyyy')}
                  </p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Time</p>
                  <p className="text-lg font-semibold text-white">{selectedSession.time}</p>
                </div>
              </div>

              {/* Focus Areas */}
              {selectedSession.focusAreas.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Focus Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSession.focusAreas.map((area, index) => (
                      <Badge key={index} className="bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <Link href={`/coaching/quick-prep/${selectedSession.agentId}`} className="flex-1">
                  <Button className="w-full bg-[#A4E83C] text-black hover:bg-[#8FC72D]">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Quick Prep
                  </Button>
                </Link>
                <Link href={`/agents/${selectedSession.agentId}`}>
                  <Button variant="outline" className="hover-lift">
                    View Agent Profile
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
