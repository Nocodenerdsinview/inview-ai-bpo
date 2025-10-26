"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, differenceInDays } from "date-fns";
import { CalendarIcon, Check, AlertCircle, User, Tag, Clock, FileText } from "lucide-react";

interface Agent {
  id: number;
  name: string;
  avatarUrl: string | null;
  email: string;
}

interface AddLeaveFormProps {
  onSuccess: () => void;
}

export function AddLeaveForm({ onSuccess }: AddLeaveFormProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [leaveType, setLeaveType] = useState<string>("");
  const [leaveStatus, setLeaveStatus] = useState<string>("approved");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const duration = startDate && returnDate ? differenceInDays(returnDate, startDate) + 1 : 0;

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch("/api/agents");
      if (!response.ok) throw new Error("Failed to fetch agents");
      const data = await response.json();
      setAgents(data);
    } catch (err) {
      console.error("Error fetching agents:", err);
      setError("Failed to load agents");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAgentId || !leaveType || !startDate || !returnDate) {
      setError("Please fill in all required fields");
      return;
    }

    if (returnDate < startDate) {
      setError("Return date must be after or equal to start date");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setConflictWarning(null);

    try {
      const response = await fetch("/api/leave/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: parseInt(selectedAgentId),
          startDate: format(startDate, "yyyy-MM-dd"),
          endDate: format(returnDate, "yyyy-MM-dd"),
          type: leaveType,
          reason: reason || null,
          status: leaveStatus, // Use selected status
        }),
      });

      const data = await response.json();

      if (response.status === 409) {
        // Conflict detected
        setConflictWarning(
          data.error + ": " + 
          data.conflicts.map((c: any) => `${c.type} (${c.startDate} to ${c.endDate})`).join(", ")
        );
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to create leave request");
      }

      // Success!
      setSuccess(`Leave successfully added for ${agents.find(a => a.id === parseInt(selectedAgentId))?.name}!`);
      
      // Clear form
      setSelectedAgentId("");
      setLeaveType("");
      setStartDate(undefined);
      setReturnDate(undefined);
      setReason("");
      
      // Notify parent to refresh data
      onSuccess();

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedAgentId("");
    setLeaveType("");
    setLeaveStatus("approved");
    setStartDate(undefined);
    setReturnDate(undefined);
    setReason("");
    setError(null);
    setSuccess(null);
    setConflictWarning(null);
  };

  const selectedAgent = agents.find((a) => a.id === parseInt(selectedAgentId));

  return (
    <div className="w-full animate-fade-scale">
      <div className="mb-6">
        <h2 className="text-3xl font-black uppercase tracking-wide text-white mb-2">
          Request Leave
        </h2>
        <p className="text-gray-400 text-sm">
          Create a leave request for any team member
        </p>
      </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-[#A4E83C]/20 border border-[#A4E83C]/50 rounded-lg p-4 flex items-center gap-3 animate-fade-scale">
            <Check className="w-5 h-5 text-[#A4E83C]" />
            <p className="text-[#A4E83C] font-semibold">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-[#EF4444]/20 border border-[#EF4444]/50 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[#EF4444]" />
            <p className="text-[#EF4444] font-semibold">{error}</p>
          </div>
        )}

        {/* Conflict Warning */}
        {conflictWarning && (
          <div className="mb-6 bg-[#FFB800]/20 border border-[#FFB800]/50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-5 h-5 text-[#FFB800]" />
              <p className="text-[#FFB800] font-bold">Leave Conflict Detected</p>
            </div>
            <p className="text-[#FFB800] text-sm">{conflictWarning}</p>
            <p className="text-gray-400 text-xs mt-2">
              Please choose different dates or remove the conflicting leave first.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Agent Selection */}
          <div className="space-y-2">
            <Label className="text-sm uppercase tracking-wide text-gray-400 flex items-center gap-2 font-bold">
              <User className="w-4 h-4" />
              Select Agent *
            </Label>
            <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
              <SelectTrigger className="bg-[#1A1A1A] border-white/10 text-white h-14 hover:bg-white/5 transition-colors">
                <SelectValue placeholder="Choose an agent..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-white/10 text-white">
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id.toString()}>
                    <div className="flex items-center gap-3 py-1">
                      <img
                        src={agent.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.name}`}
                        alt={agent.name}
                        className="w-8 h-8 rounded-full ring-2 ring-white/10"
                      />
                      <div>
                        <p className="font-bold">{agent.name}</p>
                        <p className="text-xs text-gray-500">{agent.email}</p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Leave Type */}
          <div className="space-y-2">
            <Label className="text-sm uppercase tracking-wide text-gray-400 flex items-center gap-2 font-bold">
              <Tag className="w-4 h-4" />
              Leave Type *
            </Label>
            <Select value={leaveType} onValueChange={setLeaveType}>
              <SelectTrigger className="bg-[#1A1A1A] border-white/10 text-white h-14 hover:bg-white/5 transition-colors">
                <SelectValue placeholder="Select leave type..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-white/10 text-white">
                <SelectItem value="holiday">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                    <span>Holiday</span>
                  </div>
                </SelectItem>
                <SelectItem value="sick">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                    <span>Sick Leave</span>
                  </div>
                </SelectItem>
                <SelectItem value="compassionate">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#A855F7]" />
                    <span>Compassionate Leave</span>
                  </div>
                </SelectItem>
                <SelectItem value="study">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#06B6D4]" />
                    <span>Study Leave</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-sm uppercase tracking-wide text-gray-400 flex items-center gap-2 font-bold">
              <Tag className="w-4 h-4" />
              Status *
            </Label>
            <Select value={leaveStatus} onValueChange={setLeaveStatus}>
              <SelectTrigger className="bg-[#1A1A1A] border-white/10 text-white h-14 hover:bg-white/5 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-white/10 text-white">
                <SelectItem value="pending">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FFB800]" />
                    <span>Pending</span>
                  </div>
                </SelectItem>
                <SelectItem value="approved">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                    <span>Approved</span>
                  </div>
                </SelectItem>
                <SelectItem value="declined">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                    <span>Declined</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm uppercase tracking-wide text-gray-400 flex items-center gap-2 font-bold">
                <CalendarIcon className="w-4 h-4" />
                Start Date *
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left bg-[#1A1A1A] border-white/10 hover:bg-white/5 h-14 font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                    {startDate ? (
                      <span className="text-white">{format(startDate, "MMM dd, yyyy")}</span>
                    ) : (
                      <span className="text-gray-500">Pick start date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#1A1A1A] border-white/10">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    className="text-white"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-sm uppercase tracking-wide text-gray-400 flex items-center gap-2 font-bold">
                <CalendarIcon className="w-4 h-4" />
                Return Date *
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left bg-[#1A1A1A] border-white/10 hover:bg-white/5 h-14 font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                    {returnDate ? (
                      <span className="text-white">{format(returnDate, "MMM dd, yyyy")}</span>
                    ) : (
                      <span className="text-gray-500">Pick return date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#1A1A1A] border-white/10">
                  <Calendar
                    mode="single"
                    selected={returnDate}
                    onSelect={setReturnDate}
                    className="text-white"
                    disabled={(date) => startDate ? date < startDate : false}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Duration Display */}
          {duration > 0 && (
            <div className="bg-[#A4E83C]/10 border border-[#A4E83C]/30 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#A4E83C]" />
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide font-bold">Duration</p>
                  <p className="text-2xl font-black text-[#A4E83C]">
                    {duration} day{duration !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Reason (Optional) */}
          <div className="space-y-2">
            <Label className="text-sm uppercase tracking-wide text-gray-400 flex items-center gap-2 font-bold">
              <FileText className="w-4 h-4" />
              Reason (Optional)
            </Label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-4 bg-[#1A1A1A] border border-white/10 rounded-lg text-white resize-none focus:outline-none focus:border-[#A4E83C]/50 transition-colors"
              rows={4}
              placeholder="Enter reason for leave (optional)..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              onClick={handleClear}
              variant="outline"
              className="flex-1 border-white/10 hover:bg-white/5 font-bold uppercase tracking-wide h-12"
              disabled={loading}
            >
              Clear Form
            </Button>
            <Button
              type="submit"
              disabled={loading || !selectedAgentId || !leaveType || !startDate || !returnDate}
              className="flex-1 bg-[#A4E83C] text-black hover:bg-[#A4E83C]/90 font-bold uppercase tracking-wide h-12 hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Adding..." : "Add Leave Request"}
            </Button>
          </div>
        </form>
    </div>
  );
}

