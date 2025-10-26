"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Calendar, CheckCircle, Target, MessageSquare, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface CoachingPrepContent {
  focusAreas: string[];
  talkingPoints: string[];
  expectedOutcome: string;
  suggestedActivities: string[];
}

interface CoachingReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: {
    id: number;
    agentId: number;
    agentName: string;
    coachingSummary: string;
    aiPrepContent: CoachingPrepContent;
    linkedAuditIds?: number[];
  };
  onSchedule: (sessionId: number) => void;
  onStartNow: (sessionId: number) => void;
}

export function CoachingReviewModal({ 
  isOpen, 
  onClose, 
  session, 
  onSchedule, 
  onStartNow 
}: CoachingReviewModalProps) {
  const router = useRouter();
  const [isScheduling, setIsScheduling] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const handleScheduleForLater = async () => {
    setIsScheduling(true);
    try {
      await onSchedule(session.id);
    } finally {
      setIsScheduling(false);
    }
  };

  const handleStartNow = async () => {
    setIsStarting(true);
    try {
      await onStartNow(session.id);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <DialogHeader className="border-b border-white/10 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold uppercase tracking-wide text-white mb-2">
                Review AI-Generated Coaching Plan
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                For <span className="text-[#A4E83C] font-semibold">{session.agentName}</span> - Based on recent performance and audits
              </DialogDescription>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Coaching Summary - Hero Section */}
          <div className="glass-card p-6 border-[#A4E83C]/30 bg-[#A4E83C]/5 animate-fade-in">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-[#A4E83C]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-[#A4E83C]" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#A4E83C] mb-2">
                  Coaching Summary
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {session.coachingSummary}
                </p>
              </div>
            </div>
          </div>

          {/* Focus Areas */}
          <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-[#3B82F6]" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Focus Areas
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {session.aiPrepContent.focusAreas.map((area, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                >
                  <CheckCircle className="w-4 h-4 text-[#A4E83C] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-300">{area}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Talking Points */}
          <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#F59E0B]/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-[#F59E0B]" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Talking Points
              </h3>
            </div>
            <div className="space-y-3">
              {session.aiPrepContent.talkingPoints.map((point, index) => (
                <div 
                  key={index}
                  className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-[#F59E0B]/30 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <Badge className="bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30 flex-shrink-0">
                      {index + 1}
                    </Badge>
                    <p className="text-sm text-gray-300 flex-1">{point}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expected Outcomes */}
          <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#A4E83C]/20 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-[#A4E83C]" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Expected Outcomes
              </h3>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              {session.aiPrepContent.expectedOutcome}
            </p>
          </div>

          {/* Suggested Activities */}
          {session.aiPrepContent.suggestedActivities.length > 0 && (
            <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-[#EC4899]/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#EC4899]" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Suggested Activities
                </h3>
              </div>
              <ul className="space-y-2">
                {session.aiPrepContent.suggestedActivities.map((activity, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-gray-300">
                    <span className="text-[#EC4899] font-bold flex-shrink-0">•</span>
                    <span>{activity}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-white/10 pt-4 flex gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            variant="secondary"
            onClick={handleScheduleForLater}
            disabled={isScheduling}
            className="flex-1 gap-2"
          >
            <Calendar className="w-4 h-4" />
            {isScheduling ? 'Scheduling...' : 'Schedule for Later'}
          </Button>
          <Button 
            onClick={handleStartNow}
            disabled={isStarting}
            className="flex-1 bg-[#A4E83C] text-black hover:bg-[#A4E83C]/90 gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {isStarting ? 'Starting...' : 'Start Coaching Now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
