"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, differenceInDays } from "date-fns";
import { CalendarIcon, Check, X, User, Tag, Clock } from "lucide-react";

interface Agent {
  id: number;
  name: string;
  avatarUrl: string | null;
  email: string;
}

interface LeaveRecord {
  id: number;
  agentId: number;
  startDate: string;
  endDate: string;
  type: string;
  status: string;
  reason: string | null;
  duration: number;
  requestedDate: string | null;
  approvedBy: string | null;
  approvedDate: string | null;
  declinedReason: string | null;
}

interface LeaveRequestModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  leave?: LeaveRecord;
  agent?: Agent;
  agents: Agent[];
  onSuccess: () => void;
  mode?: "view" | "create";
}

export function LeaveRequestModal({
  isOpen,
  onOpenChange,
  leave,
  agent,
  agents,
  onSuccess,
  mode = "create",
}: LeaveRequestModalProps) {
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(leave?.agentId || agent?.id || null);
  const [leaveType, setLeaveType] = useState(leave?.type || "vacation");
  const [startDate, setStartDate] = useState<Date | undefined>(
    leave?.startDate ? new Date(leave.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    leave?.endDate ? new Date(leave.endDate) : undefined
  );
  const [reason, setReason] = useState(leave?.reason || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const isViewMode = mode === "view" || (leave && leave.status !== "pending");
  const isPending = leave?.status === "pending";
  const selectedAgent = agents.find((a) => a.id === selectedAgentId);

  const duration =
    startDate && endDate ? differenceInDays(endDate, startDate) + 1 : 0;

  const handleCreate = async () => {
    if (!selectedAgentId || !startDate || !endDate) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);
    setConflictWarning(null);

    try {
      const response = await fetch("/api/leave/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: selectedAgentId,
          startDate: format(startDate, "yyyy-MM-dd"),
          endDate: format(endDate, "yyyy-MM-dd"),
          type: leaveType,
          reason,
          status: "approved", // Manager creates pre-approved leave
        }),
      });

      const data = await response.json();

      if (response.status === 409) {
        // Conflict detected
        setConflictWarning(data.error + ": " + data.conflicts.map((c: any) => `${c.type} (${c.startDate} to ${c.endDate})`).join(", "));
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to create leave request");
      }

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!leave) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/leave/${leave.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "approved",
          approvedBy: "Manager",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to approve leave");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!leave) return;

    const declineReason = prompt("Reason for declining? (Optional)");

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/leave/${leave.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "declined",
          declinedReason: declineReason || "Declined by manager",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to decline leave");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!leave) return;
    if (!confirm("Are you sure you want to delete this leave request?")) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/leave/${leave.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete leave");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedAgentId(null);
    setLeaveType("vacation");
    setStartDate(undefined);
    setEndDate(undefined);
    setReason("");
    setError(null);
    setConflictWarning(null);
  };

  const getStatusBadgeColor = (status: string) => {
    if (status === "pending") return "bg-[#FFB800] text-black";
    if (status === "approved") return "bg-[#10B981] text-white";
    if (status === "declined") return "bg-[#EF4444] text-white";
    return "bg-gray-500 text-white";
  };

  const getLeaveTypeColor = (type: string) => {
    const colors = {
      vacation: "#10B981",
      holiday: "#10B981",
      sick: "#EF4444",
      personal: "#3B82F6",
      compassionate: "#A855F7",
      study: "#06B6D4",
      "half-day": "#FF8C42",
    };
    return colors[type as keyof typeof colors] || "#6B7280";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-white/10 max-w-2xl animate-genie-expand">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-3xl font-black uppercase tracking-wide text-white">
              {isViewMode ? "Leave Request" : "Request Leave"}
            </DialogTitle>
            {leave && (
              <Badge className={`${getStatusBadgeColor(leave.status)} px-3 py-1 text-sm font-bold uppercase`}>
                {leave.status}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {error && (
            <div className="bg-[#EF4444]/20 border border-[#EF4444]/50 rounded-lg p-4 text-[#EF4444] text-sm">
              {error}
            </div>
          )}

          {conflictWarning && (
            <div className="bg-[#FFB800]/20 border border-[#FFB800]/50 rounded-lg p-4 text-[#FFB800] text-sm">
              <p className="font-bold mb-1">Warning: Leave Conflict</p>
              <p>{conflictWarning}</p>
              <p className="mt-2 text-xs">Please choose different dates or remove the conflicting leave first.</p>
            </div>
          )}

          {/* Agent Selection */}
          <div className="space-y-2">
            <Label className="text-sm uppercase tracking-wide text-gray-400 flex items-center gap-2">
              <User className="w-4 h-4" />
              Requested by
            </Label>
            {isViewMode ? (
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
                <img
                  src={selectedAgent?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedAgent?.name}`}
                  alt={selectedAgent?.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-bold text-white">{selectedAgent?.name}</p>
                  <p className="text-sm text-gray-400">{selectedAgent?.email}</p>
                </div>
              </div>
            ) : (
              <Select
                value={selectedAgentId?.toString()}
                onValueChange={(value) => setSelectedAgentId(parseInt(value))}
              >
                <SelectTrigger className="bg-[#1A1A1A] border-white/10 text-white">
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-white/10 text-white">
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id.toString()}>
                      <div className="flex items-center gap-2">
                        <img
                          src={agent.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.name}`}
                          alt={agent.name}
                          className="w-6 h-6 rounded-full"
                        />
                        {agent.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Leave Type */}
          <div className="space-y-2">
            <Label className="text-sm uppercase tracking-wide text-gray-400 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Type
            </Label>
            {isViewMode ? (
              <div
                className="px-4 py-2 rounded-lg text-white font-bold uppercase inline-block"
                style={{ backgroundColor: getLeaveTypeColor(leaveType) }}
              >
                {leaveType}
              </div>
            ) : (
              <Select value={leaveType} onValueChange={setLeaveType}>
                <SelectTrigger className="bg-[#1A1A1A] border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-white/10 text-white">
                  <SelectItem value="holiday">Holiday</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="compassionate">Compassionate Leave</SelectItem>
                  <SelectItem value="study">Study Leave</SelectItem>
                  <SelectItem value="vacation">Vacation</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="half-day">Half Day</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm uppercase tracking-wide text-gray-400 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                From
              </Label>
              {isViewMode ? (
                <div className="p-4 bg-white/5 rounded-lg text-white">
                  {leave?.startDate && format(new Date(leave.startDate), "MMM dd, yyyy")}
                </div>
              ) : (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left bg-[#1A1A1A] border-white/10 hover:bg-white/5">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "MMM dd, yyyy") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#1A1A1A] border-white/10">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
                  </PopoverContent>
                </Popover>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm uppercase tracking-wide text-gray-400 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                To
              </Label>
              {isViewMode ? (
                <div className="p-4 bg-white/5 rounded-lg text-white">
                  {leave?.endDate && format(new Date(leave.endDate), "MMM dd, yyyy")}
                </div>
              ) : (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left bg-[#1A1A1A] border-white/10 hover:bg-white/5">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "MMM dd, yyyy") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#1A1A1A] border-white/10">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label className="text-sm uppercase tracking-wide text-gray-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Duration
            </Label>
            <div className="p-4 bg-white/5 rounded-lg text-white font-bold text-2xl">
              {duration} day{duration !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label className="text-sm uppercase tracking-wide text-gray-400">Reason</Label>
            {isViewMode ? (
              <div className="p-4 bg-white/5 rounded-lg text-white">
                {leave?.reason || "No reason provided"}
              </div>
            ) : (
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-4 bg-[#1A1A1A] border border-white/10 rounded-lg text-white resize-none focus:outline-none focus:border-[#A4E83C]/50"
                rows={3}
                placeholder="Optional reason for leave..."
              />
            )}
          </div>

          {/* Requested Date (view mode only) */}
          {isViewMode && leave?.requestedDate && (
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Requested on {format(new Date(leave.requestedDate), "MMM dd, yyyy")}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {isViewMode && isPending ? (
              <>
                <Button
                  onClick={handleApprove}
                  disabled={loading}
                  className="flex-1 bg-[#A4E83C] text-black hover:bg-[#A4E83C]/90 font-bold uppercase tracking-wide hover-lift"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={handleDecline}
                  disabled={loading}
                  variant="outline"
                  className="flex-1 border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444]/10 font-bold uppercase tracking-wide"
                >
                  <X className="w-4 h-4 mr-2" />
                  Decline
                </Button>
              </>
            ) : isViewMode ? (
              <>
                <Button
                  onClick={handleDelete}
                  disabled={loading}
                  variant="outline"
                  className="flex-1 border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444]/10 font-bold uppercase tracking-wide"
                >
                  Delete
                </Button>
                <Button
                  onClick={() => onOpenChange(false)}
                  variant="outline"
                  className="flex-1 border-white/10 hover:bg-white/5 font-bold uppercase tracking-wide"
                >
                  Close
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => onOpenChange(false)}
                  variant="outline"
                  className="flex-1 border-white/10 hover:bg-white/5 font-bold uppercase tracking-wide"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={loading || !selectedAgentId || !startDate || !endDate}
                  className="flex-1 bg-[#A4E83C] text-black hover:bg-[#A4E83C]/90 font-bold uppercase tracking-wide hover-lift"
                >
                  Create Leave
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

