"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileCheck, Sparkles, Calendar, CheckCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AuditCardProps {
  audit: {
    id: number;
    agentId: number;
    date: string;
    score: number | null;
    notes: string | null;
    tags: string | null;
    weaknesses: string | null;
    coachingStatus: string | null;
    linkedCoachingId: number | null;
  };
  agent: {
    id: number;
    name: string;
    avatarUrl: string | null;
  } | null;
}

export function AuditCard({ audit, agent }: AuditCardProps) {
  const router = useRouter();
  const [isPlanningCoaching, setIsPlanningCoaching] = useState(false);

  const getBadgeVariant = (score: number | null) => {
    if (!score) return "secondary";
    if (score >= 90) return "success";
    if (score >= 80) return "info";
    return "warning";
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-white';
    if (score >= 90) return 'text-[#A4E83C]';
    if (score >= 80) return 'text-[#3B82F6]';
    if (score >= 70) return 'text-[#FF8C42]';
    return 'text-[#EF4444]';
  };

  const handlePlanCoaching = async () => {
    if (!agent) return;
    
    setIsPlanningCoaching(true);
    try {
      // Navigate to quick prep page with audit ID as query param
      router.push(`/coaching/quick-prep/${agent.id}?auditId=${audit.id}`);
    } catch (error) {
      console.error("Error planning coaching:", error);
    } finally {
      setIsPlanningCoaching(false);
    }
  };

  const weaknessesList = audit.weaknesses ? JSON.parse(audit.weaknesses) : [];
  const tagsList = audit.tags ? JSON.parse(audit.tags) : [];

  return (
    <div className="glass-card p-6 hover:border-white/20 transition-all shadow-premium">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-12 h-12 bg-[#A4E83C]/20 rounded-2xl flex items-center justify-center shrink-0">
            <FileCheck className="w-6 h-6 text-[#A4E83C]" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Link 
                href={`/agents/${agent?.id}`} 
                className="text-xl font-bold text-white hover:text-[#A4E83C] transition-colors"
              >
                {agent?.name}
              </Link>
              
              {/* Coaching Status Badge */}
              {audit.coachingStatus === 'scheduled' && (
                <Badge className="bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30">
                  <Calendar className="w-3 h-3 mr-1" />
                  Coaching Scheduled
                </Badge>
              )}
              {audit.coachingStatus === 'completed' && (
                <Badge className="bg-[#A4E83C]/20 text-[#A4E83C] border-[#A4E83C]/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Coached
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-400">
              {new Date(audit.date).toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <p className={`metric-number mb-2 ${getScoreColor(audit.score)}`}>
            {audit.score?.toFixed(0)}
            <span className="text-3xl">%</span>
          </p>
          <Badge className={
            (audit.score || 0) >= 90 ? 'bg-[#A4E83C]/20 text-[#A4E83C] border-[#A4E83C]/30' :
            (audit.score || 0) >= 80 ? 'bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30' :
            (audit.score || 0) >= 70 ? 'bg-[#FF8C42]/20 text-[#FF8C42] border-[#FF8C42]/30' :
            'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30'
          }>
            {audit.score && audit.score >= 90 ? "Excellent" : 
             audit.score && audit.score >= 80 ? "Good" : 
             audit.score && audit.score >= 70 ? "Fair" : "Needs Improvement"}
          </Badge>
        </div>
      </div>

      {audit.notes && (
        <p className="text-sm text-gray-300 mb-4 pl-16">{audit.notes}</p>
      )}

      {/* Weaknesses */}
      {weaknessesList.length > 0 && (
        <div className="mb-4 pl-16">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Areas for Improvement</p>
          <div className="flex flex-wrap gap-2">
            {weaknessesList.map((weakness: string, i: number) => (
              <span 
                key={i}
                className="text-xs px-2.5 py-1 bg-[#EF4444]/10 text-[#EF4444] rounded-lg border border-[#EF4444]/20"
              >
                {weakness}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {tagsList.length > 0 && (
        <div className="mb-4 pl-16">
          <div className="flex flex-wrap gap-2">
            {tagsList.map((tag: string, i: number) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pl-16 pt-3 border-t border-white/10">
        <Button 
          size="sm"
          onClick={handlePlanCoaching}
          disabled={isPlanningCoaching || audit.coachingStatus === 'scheduled'}
          className={audit.coachingStatus !== 'scheduled' ? 'bg-[#A4E83C] text-black hover:bg-[#A4E83C]/90' : ''}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {audit.coachingStatus === 'scheduled' ? 'Coaching Planned' : 
           audit.coachingStatus === 'completed' ? 'Plan Follow-up' :
           'Plan Coaching'}
        </Button>
        
        {audit.linkedCoachingId && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => router.push(`/coaching/session/${audit.linkedCoachingId}`)}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Coaching
          </Button>
        )}
        
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => router.push(`/agents/${agent?.id}`)}
        >
          View Agent Profile
        </Button>
      </div>
    </div>
  );
}

