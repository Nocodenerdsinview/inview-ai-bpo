"use client";

import { FileCheck, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface Audit {
  id: number;
  agentId: number;
  agentName: string;
  date: string;
  score: number;
  notes: string | null;
}

interface UncoachedAuditsWidgetProps {
  audits: Audit[];
}

export function UncoachedAuditsWidget({ audits }: UncoachedAuditsWidgetProps) {
  const router = useRouter();

  if (audits.length === 0) {
    return null;
  }

  return (
    <div className="glass-card p-6 border-[#FF8C42]/30 shadow-premium animate-fade-scale hover-lift">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FF8C42]/20 rounded-xl flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-[#FF8C42]" />
          </div>
          <div>
            <h3 className="text-xl font-bold uppercase text-white tracking-wide">
              Audits Need Coaching
            </h3>
            <p className="text-xs text-gray-500">
              {audits.length} audit{audits.length !== 1 ? 's' : ''} without coaching plan
            </p>
          </div>
        </div>
        <Button 
          size="sm"
          variant="outline"
          onClick={() => router.push('/audits')}
        >
          View All Audits
        </Button>
      </div>

      <div className="space-y-3">
        {audits.slice(0, 5).map((audit) => (
          <div 
            key={audit.id}
            className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="w-10 h-10 bg-[#EF4444]/20 rounded-xl flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-[#EF4444]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-white">{audit.agentName}</p>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                    audit.score >= 80 ? 'bg-[#3B82F6]/20 text-[#3B82F6]' : 'bg-[#EF4444]/20 text-[#EF4444]'
                  }`}>
                    {audit.score}%
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {format(new Date(audit.date), 'MMM dd, yyyy')}
                  {audit.notes && ` • ${audit.notes.substring(0, 60)}${audit.notes.length > 60 ? '...' : ''}`}
                </p>
              </div>
            </div>
            <Button 
              size="sm"
              className="bg-[#A4E83C] text-black hover:bg-[#A4E83C]/90 gap-2"
              onClick={() => router.push(`/coaching/quick-prep/${audit.agentId}?auditId=${audit.id}`)}
            >
              <Sparkles className="w-4 h-4" />
              Plan Coaching
            </Button>
          </div>
        ))}
      </div>

      {audits.length > 5 && (
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/audits')}
          >
            View {audits.length - 5} More Audits
          </Button>
        </div>
      )}
    </div>
  );
}
