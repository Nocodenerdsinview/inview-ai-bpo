"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, CheckCircle, Target, Sparkles, X } from "lucide-react";

interface CoachingSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  summary: string;
  focusAreas: string[];
  expectedOutcomes: string[];
  onStart: () => void;
}

export function CoachingSummaryModal({
  isOpen,
  onClose,
  agentName,
  summary,
  focusAreas,
  expectedOutcomes,
  onStart
}: CoachingSummaryModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl animate-slide-up">
        <DialogHeader className="border-b border-white/10 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold uppercase tracking-wide text-white mb-2">
                Ready to Coach {agentName}?
              </DialogTitle>
              <p className="text-sm text-gray-400">
                Review what you'll cover in this session
              </p>
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
          {/* Session Summary - Hero */}
          <div className="relative overflow-hidden p-6 rounded-2xl border border-[#A4E83C]/30 
                          bg-linear-to-br from-[#A4E83C]/10 via-[#A4E83C]/5 to-transparent 
                          animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#A4E83C]/20 rounded-xl flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-[#A4E83C]" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#A4E83C] mb-3">
                  Session Summary
                </h3>
                <p className="text-gray-300 leading-relaxed text-base">
                  {summary}
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
                Focus Areas for This Session
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {focusAreas.map((area, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 bg-white/5 rounded-lg"
                >
                  <Badge className="bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30 shrink-0">
                    {index + 1}
                  </Badge>
                  <span className="text-sm text-gray-300">{area}</span>
                </div>
              ))}
            </div>
          </div>

          {/* What Agent Will Get */}
          <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#A4E83C]/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-[#A4E83C]" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                What {agentName} Will Get
              </h3>
            </div>
            <ul className="space-y-3">
              {expectedOutcomes.map((outcome, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                >
                  <CheckCircle className="w-5 h-5 text-[#A4E83C] mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-300 flex-1">{outcome}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Motivational Section */}
          <div className="p-4 rounded-xl bg-linear-to-r from-[#3B82F6]/10 to-[#EC4899]/10 
                          border border-white/10 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <p className="text-sm text-gray-300 text-center italic">
              "Remember: Every coaching session is an opportunity to help {agentName} grow and succeed. 
              Focus on strengths, address challenges with empathy, and create a clear action plan."
            </p>
          </div>
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
            onClick={onStart}
            className="flex-1 bg-[#A4E83C] text-black hover:bg-[#A4E83C]/90 gap-2 text-base font-bold"
          >
            <PlayCircle className="w-5 h-5" />
            Start Coaching Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
