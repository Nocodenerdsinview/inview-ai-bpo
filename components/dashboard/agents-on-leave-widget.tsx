"use client";

import { Plane, HeartPulse, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";

interface AgentOnLeave {
  id: number;
  name: string;
  avatarUrl: string | null;
  status: 'holiday' | 'sick';
  date: string;
  notes: string | null;
  leaveEnd?: string | null;
}

interface AgentsOnLeaveWidgetProps {
  agents: AgentOnLeave[];
}

export function AgentsOnLeaveWidget({ agents }: AgentsOnLeaveWidgetProps) {
  const router = useRouter();

  if (agents.length === 0) {
    return null;
  }

  const holidayAgents = agents.filter(a => a.status === 'holiday');
  const sickAgents = agents.filter(a => a.status === 'sick');

  const getStatusIcon = (status: 'holiday' | 'sick') => {
    return status === 'holiday' ? Plane : HeartPulse;
  };

  const getStatusColor = (status: 'holiday' | 'sick') => {
    return status === 'holiday' 
      ? { bg: 'bg-[#3B82F6]/20', text: 'text-[#3B82F6]', border: 'border-[#3B82F6]/30' }
      : { bg: 'bg-[#EF4444]/20', text: 'text-[#EF4444]', border: 'border-[#EF4444]/30' };
  };

  return (
    <div className="glass-card p-6 shadow-premium animate-fade-scale hover-lift">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold uppercase text-white tracking-wide">
              Agents on Leave Today
            </h3>
            <p className="text-xs text-gray-500">
              {holidayAgents.length} on holiday • {sickAgents.length} off sick
            </p>
          </div>
        </div>
        <Button 
          size="sm"
          variant="outline"
          onClick={() => router.push('/attendance')}
        >
          Manage Attendance
        </Button>
      </div>

      <div className="space-y-3">
        {agents.map((agent, index) => {
          const StatusIcon = getStatusIcon(agent.status);
          const colors = getStatusColor(agent.status);
          
          return (
            <div 
              key={`${agent.id}-${agent.date}-${index}`}
              className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-4 flex-1">
                {/* Avatar */}
                <div className="relative">
                  <img 
                    src={agent.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.name}`}
                    alt={agent.name}
                    className="w-10 h-10 rounded-xl ring-2 ring-white/10"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${colors.bg} rounded-full flex items-center justify-center border-2 border-[#1A1A1A]`}>
                    <StatusIcon className={`w-3 h-3 ${colors.text}`} />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-white">{agent.name}</p>
                    <Badge className={`${colors.bg} ${colors.text} ${colors.border}`}>
                      {agent.status === 'holiday' ? 'On Holiday' : 'Off Sick'}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500">
                    {agent.leaveEnd ? (
                      <>
                        Until {format(parseISO(agent.leaveEnd), 'MMM dd, yyyy')}
                        {agent.notes && ` • ${agent.notes}`}
                      </>
                    ) : (
                      <>
                        {format(parseISO(agent.date), 'MMM dd, yyyy')}
                        {agent.notes && ` • ${agent.notes}`}
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <Button 
                size="sm"
                variant="outline"
                onClick={() => router.push(`/agents/${agent.id}`)}
              >
                View Profile
              </Button>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push('/attendance')}
          className="w-full"
        >
          View Full Attendance
        </Button>
      </div>
    </div>
  );
}
