import { AppLayout } from "@/components/shared/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { desc, eq, sql } from "drizzle-orm";
import { Calendar, Sparkles, Plus } from "lucide-react";

async function getCoachingData() {
  const sessions = await db
    .select({
      session: schema.coachingSessions,
      agent: schema.agents,
    })
    .from(schema.coachingSessions)
    .leftJoin(schema.agents, eq(schema.coachingSessions.agentId, schema.agents.id))
    .orderBy(desc(schema.coachingSessions.scheduledDate));

  const upcomingSessions = sessions.filter(
    (s) => s.session.status === "scheduled" && 
    new Date(s.session.scheduledDate || "") >= new Date()
  );

  const completedSessions = sessions.filter(
    (s) => s.session.status === "completed"
  );

  const recentSessions = sessions.slice(0, 10);

  return {
    upcomingSessions,
    completedSessions,
    recentSessions,
    totalSessions: sessions.length,
  };
}

export default async function CoachingPage() {
  const { upcomingSessions, completedSessions, recentSessions, totalSessions } = await getCoachingData();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return "info";
      case "completed":
        return "success";
      case "cancelled":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case "urgent":
        return "border-l-[#EF4444]";
      case "follow-up":
        return "border-l-[#A4E83C]";
      default:
        return "border-l-[#3B82F6]";
    }
  };

  return (
    <AppLayout
      title="Coaching Sessions"
      description="Manage and track all coaching activities"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="glass-card p-10 shadow-premium">
          <div className="w-16 h-16 bg-[#3B82F6]/20 rounded-2xl flex items-center justify-center mb-6">
            <Calendar className="w-8 h-8 text-[#3B82F6]" />
          </div>
          <p className="metric-number-xl text-white mb-2">{upcomingSessions.length}</p>
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Upcoming</p>
        </div>

        <div className="glass-card p-10 shadow-premium border-[#A4E83C]/20">
          <div className="w-16 h-16 bg-[#A4E83C]/20 rounded-2xl flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-[#A4E83C]" />
          </div>
          <p className="metric-number-xl text-[#A4E83C] mb-2">{completedSessions.length}</p>
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Completed</p>
        </div>

        <div className="glass-card p-10 shadow-premium">
          <div className="w-16 h-16 bg-[#FF8C42]/20 rounded-2xl flex items-center justify-center mb-6">
            <Plus className="w-8 h-8 text-[#FF8C42]" />
          </div>
          <p className="metric-number-xl text-white mb-2">{totalSessions}</p>
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Total Sessions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold uppercase tracking-wide text-white">All Sessions</h2>
            <Link href="/coaching/generate">
              <Button className="gap-2">
                <Sparkles className="w-4 h-4" />
                Generate Coaching
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {recentSessions.map(({ session, agent }) => (
              <div key={session.id} className={`glass-card p-8 border-l-4 ${getBorderColor(session.type)} shadow-premium animate-fade-scale hover-lift`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      {/* Agent Avatar */}
                      {agent && (
                        <img
                          src={agent.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.name}`}
                          alt={agent.name}
                          className="w-12 h-12 rounded-xl ring-2 ring-[#A4E83C]/30 bg-[#2A2A2A]"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold uppercase tracking-wide text-white">{agent?.name || "Unknown Agent"}</h3>
                          <Badge variant={getStatusBadge(session.status) as any}>
                            {session.status}
                          </Badge>
                          {session.type === "urgent" && (
                            <Badge variant="destructive">⚠️ Urgent</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {session.scheduledDate ? new Date(session.scheduledDate).toLocaleDateString() : "Not scheduled"}
                        </p>
                      </div>
                    </div>

                    {session.focusAreas && (
                      <div className="mb-3">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Focus Areas:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {JSON.parse(session.focusAreas).map((area: string, idx: number) => (
                            <Badge key={idx} className="bg-[#3B82F6]/20 text-[#3B82F6] border-none">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {session.outcome && (
                      <div className="mt-4 p-4 bg-white/5 rounded-xl text-sm text-gray-300 border border-white/10">
                        <span className="font-semibold text-white uppercase tracking-wide">Outcome:</span> {session.outcome}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {agent && (
                      <Link href={`/coaching/quick-prep/${agent.id}`}>
                        <Button size="sm" variant="outline" className="hover-scale">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Quick Prep
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                {session.commitments && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Commitments:</div>
                    <div className="flex flex-wrap gap-2">
                      {JSON.parse(session.commitments).map((commitment: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {commitment}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <h2 className="text-2xl font-bold uppercase tracking-wide text-white mb-6">Upcoming Sessions</h2>
          <div className="space-y-3">
            {upcomingSessions.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-sm text-gray-400">No upcoming sessions scheduled</p>
              </div>
            ) : (
              upcomingSessions.slice(0, 5).map(({ session, agent }) => (
                <div key={session.id} className="glass-card p-4 hover:border-white/20 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-[#A4E83C]/20 rounded-2xl flex items-center justify-center text-base font-bold text-[#A4E83C]">
                      {new Date(session.scheduledDate || "").getDate()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white truncate">{agent?.name}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {session.scheduledDate ? new Date(session.scheduledDate).toLocaleDateString() : ""}
                      </div>
                      {session.focusAreas && (
                        <div className="text-xs text-gray-500 mt-2 truncate">
                          {JSON.parse(session.focusAreas)[0]}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}


