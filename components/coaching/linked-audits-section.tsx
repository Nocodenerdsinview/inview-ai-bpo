"use client";

import { FileCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";

interface LinkedAudit {
  id: number;
  date: string;
  score: number;
  notes: string | null;
  tags: string | null;
  weaknesses: string | null;
}

interface LinkedAuditsSectionProps {
  audits: LinkedAudit[];
}

export function LinkedAuditsSection({ audits }: LinkedAuditsSectionProps) {
  const router = useRouter();

  if (audits.length === 0) {
    return (
      <div className="glass-card p-8 text-center shadow-premium">
        <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-4">
          <FileCheck className="w-8 h-8 text-gray-500" />
        </div>
        <p className="text-gray-400 text-sm">No audits linked to this coaching session</p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return { bg: 'bg-[#A4E83C]/20', text: 'text-[#A4E83C]', border: 'border-[#A4E83C]/30' };
    if (score >= 80) return { bg: 'bg-[#3B82F6]/20', text: 'text-[#3B82F6]', border: 'border-[#3B82F6]/30' };
    if (score >= 70) return { bg: 'bg-[#FF8C42]/20', text: 'text-[#FF8C42]', border: 'border-[#FF8C42]/30' };
    return { bg: 'bg-[#EF4444]/20', text: 'text-[#EF4444]', border: 'border-[#EF4444]/30' };
  };

  return (
    <div className="glass-card p-6 shadow-premium">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#3B82F6]/20 rounded-xl flex items-center justify-center">
          <FileCheck className="w-5 h-5 text-[#3B82F6]" />
        </div>
        <div>
          <h4 className="text-lg font-bold uppercase text-white tracking-wide">Linked Audits</h4>
          <p className="text-xs text-gray-500">{audits.length} audit{audits.length !== 1 ? 's' : ''} referenced in this session</p>
        </div>
      </div>

      <div className="space-y-3">
        {audits.map((audit) => {
          const colors = getScoreColor(audit.score);
          const weaknesses = audit.weaknesses ? JSON.parse(audit.weaknesses) : [];
          
          return (
            <div 
              key={audit.id}
              className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-sm font-bold text-white">
                      {format(parseISO(audit.date), 'MMM dd, yyyy')}
                    </p>
                    <Badge className={`${colors.bg} ${colors.text} ${colors.border}`}>
                      {audit.score}%
                    </Badge>
                  </div>
                  {audit.notes && (
                    <p className="text-xs text-gray-400 mb-2">{audit.notes}</p>
                  )}
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => router.push(`/audits#audit-${audit.id}`)}
                  className="gap-2"
                >
                  <ExternalLink className="w-3 h-3" />
                  View
                </Button>
              </div>

              {/* Weaknesses */}
              {weaknesses.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Areas for Improvement
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {weaknesses.slice(0, 3).map((weakness: string, i: number) => (
                      <span 
                        key={i}
                        className="text-xs px-2 py-1 bg-[#EF4444]/10 text-[#EF4444] rounded-lg border border-[#EF4444]/20"
                      >
                        {weakness}
                      </span>
                    ))}
                    {weaknesses.length > 3 && (
                      <span className="text-xs px-2 py-1 bg-white/5 text-gray-400 rounded-lg">
                        +{weaknesses.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
