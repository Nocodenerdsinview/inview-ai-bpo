'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Sparkles, Loader2 } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import type { InsightData } from '@/types';

interface InsightDialogProps {
  isOpen: boolean;
  onClose: () => void;
  insightType: string;
  agentId: number;
  onInsightGenerated: (insight: InsightData) => void;
}

export function InsightDialog({ isOpen, onClose, insightType, agentId, onInsightGenerated }: InsightDialogProps) {
  const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 6));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  
  const insightTitles: Record<string, string> = {
    quality: 'Quality Error Analysis',
    aht: 'AHT Performance Analysis',
    voc: 'Voice of Customer Analysis',
    srr: 'Static Retention Rate Analysis',
    leave: 'Leave Impact Analysis',
    coaching: 'Coaching Effectiveness Analysis',
  };
  
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/agents/${agentId}/insights/${insightType}?startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}`
      );
      const result = await response.json();
      onInsightGenerated({
        title: insightTitles[insightType],
        dateRange: `${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`,
        type: insightType,
        ...result,
      });
      onClose();
    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A1A1A] border-white/10 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#A4E83C]" />
            {insightTitles[insightType]}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          <div>
            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 block">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-2">Start Date</p>
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => date && setStartDate(date)}
                  className="rounded-xl border-white/10"
                />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">End Date</p>
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => date && setEndDate(date)}
                  disabled={(date) => date < startDate}
                  className="rounded-xl border-white/10"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} className="border-white/10">
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate} 
              disabled={loading}
              className="bg-[#A4E83C] text-black hover:bg-[#A4E83C]/90 font-bold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Insights
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

