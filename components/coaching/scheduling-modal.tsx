"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, AlertCircle, CheckCircle, X } from "lucide-react";
import { format, addDays, isBefore, startOfDay } from "date-fns";

interface ExistingCoaching {
  id: number;
  scheduledDate: string;
  focusAreas: string[];
  status: string;
}

interface SchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: number;
  agentName: string;
  sessionId: number;
  existingCoachings?: ExistingCoaching[];
  onSchedule: (data: { sessionId: number; scheduledDate: string; linkedCoachingId?: number }) => Promise<void>;
}

export function SchedulingModal({
  isOpen,
  onClose,
  agentId,
  agentName,
  sessionId,
  existingCoachings = [],
  onSchedule
}: SchedulingModalProps) {
  const [mode, setMode] = useState<'attach' | 'new'>('new');
  const [selectedCoachingId, setSelectedCoachingId] = useState<number | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [isScheduling, setIsScheduling] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<'checking' | 'available' | 'on_leave'>('checking');
  const [leaveInfo, setLeaveInfo] = useState<{ returnDate?: string } | null>(null);

  // Check agent availability when date changes
  useEffect(() => {
    if (selectedDate) {
      checkAvailability(selectedDate);
    }
  }, [selectedDate]);

  const checkAvailability = async (date: Date) => {
    setAvailabilityStatus('checking');
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const response = await fetch(`/api/attendance/on-leave?date=${dateStr}`);
      if (response.ok) {
        const agentsOnLeave = await response.json();
        const isOnLeave = agentsOnLeave.some((a: any) => a.id === agentId);
        
        if (isOnLeave) {
          const agent = agentsOnLeave.find((a: any) => a.id === agentId);
          setAvailabilityStatus('on_leave');
          setLeaveInfo({ returnDate: agent.leaveEnd });
        } else {
          setAvailabilityStatus('available');
          setLeaveInfo(null);
        }
      } else {
        setAvailabilityStatus('available');
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      setAvailabilityStatus('available');
    }
  };

  const handleSchedule = async () => {
    setIsScheduling(true);
    try {
      let scheduledDate: string;
      
      if (mode === 'attach' && selectedCoachingId) {
        const coaching = existingCoachings.find(c => c.id === selectedCoachingId);
        scheduledDate = coaching!.scheduledDate;
        await onSchedule({
          sessionId,
          scheduledDate,
          linkedCoachingId: selectedCoachingId
        });
      } else if (mode === 'new' && selectedDate) {
        scheduledDate = `${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}:00`;
        await onSchedule({
          sessionId,
          scheduledDate
        });
      } else {
        return;
      }
      
      onClose();
    } catch (error) {
      console.error('Error scheduling coaching:', error);
    } finally {
      setIsScheduling(false);
    }
  };

  const isValid = mode === 'attach' ? !!selectedCoachingId : !!selectedDate && availabilityStatus === 'available';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl animate-slide-up">
        <DialogHeader className="border-b border-white/10 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold uppercase tracking-wide text-white mb-2">
                Schedule Coaching Session
              </DialogTitle>
              <p className="text-sm text-gray-400">
                For <span className="text-[#A4E83C] font-semibold">{agentName}</span>
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
          {/* Mode Selection */}
          <div className="flex gap-3">
            <Button
              variant={mode === 'new' ? 'default' : 'outline'}
              onClick={() => setMode('new')}
              className="flex-1"
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Schedule New Session
            </Button>
            {existingCoachings.length > 0 && (
              <Button
                variant={mode === 'attach' ? 'default' : 'outline'}
                onClick={() => setMode('attach')}
                className="flex-1"
              >
                <Clock className="w-4 h-4 mr-2" />
                Add to Existing ({existingCoachings.length})
              </Button>
            )}
          </div>

          {/* Attach to Existing Coaching */}
          {mode === 'attach' && (
            <div className="glass-card p-6 animate-fade-in">
              <Label className="text-white font-semibold mb-3 block">
                Select Existing Coaching Session
              </Label>
              <Select value={selectedCoachingId?.toString()} onValueChange={(val) => setSelectedCoachingId(parseInt(val))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a coaching session..." />
                </SelectTrigger>
                <SelectContent>
                  {existingCoachings.map((coaching) => (
                    <SelectItem key={coaching.id} value={coaching.id.toString()}>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">
                          {format(new Date(coaching.scheduledDate), 'EEE, MMM dd, yyyy • h:mm a')}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {coaching.focusAreas.length} focus areas
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-2">
                This will add the current coaching focus areas to the selected session
              </p>
            </div>
          )}

          {/* Schedule New Session */}
          {mode === 'new' && (
            <div className="space-y-6 animate-fade-in">
              {/* Date Selection */}
              <div className="glass-card p-6">
                <Label className="text-white font-semibold mb-3 block">
                  Select Date
                </Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => isBefore(date, startOfDay(new Date()))}
                  className="rounded-xl border border-white/10 bg-[#1A1A1A]"
                />
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div className="glass-card p-6 animate-fade-in">
                  <Label className="text-white font-semibold mb-3 block">
                    Select Time
                  </Label>
                  <div className="grid grid-cols-4 gap-2">
                    {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`px-4 py-3 rounded-lg border transition-all font-medium ${
                          selectedTime === time
                            ? 'bg-[#A4E83C]/20 text-[#A4E83C] border-[#A4E83C]'
                            : 'bg-white/5 text-gray-300 border-white/10 hover:border-[#A4E83C]/50'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability Status */}
              {selectedDate && (
                <div className={`p-4 rounded-xl border animate-fade-in ${
                  availabilityStatus === 'checking' 
                    ? 'bg-[#3B82F6]/10 border-[#3B82F6]/30'
                    : availabilityStatus === 'available'
                    ? 'bg-[#A4E83C]/10 border-[#A4E83C]/30'
                    : 'bg-[#EF4444]/10 border-[#EF4444]/30'
                }`}>
                  <div className="flex items-center gap-3">
                    {availabilityStatus === 'checking' ? (
                      <>
                        <Clock className="w-5 h-5 text-[#3B82F6] animate-pulse" />
                        <p className="text-sm text-[#3B82F6] font-semibold">Checking availability...</p>
                      </>
                    ) : availabilityStatus === 'available' ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-[#A4E83C]" />
                        <p className="text-sm text-[#A4E83C] font-semibold">
                          {agentName} is available on {format(selectedDate, 'MMMM dd, yyyy')}
                        </p>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-[#EF4444]" />
                        <div className="flex-1">
                          <p className="text-sm text-[#EF4444] font-semibold">
                            {agentName} is on leave on this date
                          </p>
                          {leaveInfo?.returnDate && (
                            <p className="text-xs text-gray-400 mt-1">
                              Returns on {format(new Date(leaveInfo.returnDate), 'MMMM dd, yyyy')}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
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
            onClick={handleSchedule}
            disabled={!isValid || isScheduling}
            className="flex-1 bg-[#A4E83C] text-black hover:bg-[#A4E83C]/90"
          >
            {isScheduling ? 'Scheduling...' : 'Confirm Schedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
