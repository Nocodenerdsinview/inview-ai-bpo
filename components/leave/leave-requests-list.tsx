"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar, User, Clock } from "lucide-react";
import { LeaveRequestModal } from "./leave-request-modal";

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

interface LeaveWithAgent {
  leave: LeaveRecord;
  agent: Agent;
}

export function LeaveRequestsList() {
  const [requests, setRequests] = useState<LeaveWithAgent[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<LeaveWithAgent[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<LeaveWithAgent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Apply filter
    if (statusFilter === "all") {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter((r) => r.leave.status === statusFilter));
    }
  }, [statusFilter, requests]);

  const fetchData = async () => {
    setLoading(true);

    try {
      // Fetch agents
      const agentsResponse = await fetch("/api/agents");
      const agentsData = await agentsResponse.json();
      setAgents(agentsData);

      // Fetch timeline data for current month (to get leave records)
      const timelineResponse = await fetch("/api/leave/timeline");
      const timelineData = await timelineResponse.json();

      // Flatten all leave records with agent info
      const allRequests: LeaveWithAgent[] = [];
      timelineData.agents.forEach((agentWithLeave: any) => {
        agentWithLeave.leaveRecords.forEach((leave: LeaveRecord) => {
          allRequests.push({
            leave,
            agent: {
              id: agentWithLeave.id,
              name: agentWithLeave.name,
              avatarUrl: agentWithLeave.avatarUrl,
              email: agentWithLeave.email,
            },
          });
        });
      });

      // Sort by requested date (newest first)
      allRequests.sort((a, b) => {
        const dateA = a.leave.requestedDate || a.leave.startDate;
        const dateB = b.leave.requestedDate || b.leave.startDate;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });

      setRequests(allRequests);
      setFilteredRequests(allRequests);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (request: LeaveWithAgent) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const handleSuccess = () => {
    fetchData(); // Refresh data
  };

  const getStatusBadgeColor = (status: string) => {
    if (status === "pending") return "bg-[#FFB800] text-black";
    if (status === "approved") return "bg-[#10B981] text-white";
    if (status === "declined") return "bg-[#EF4444] text-white";
    return "bg-gray-500 text-white";
  };

  const getLeaveTypeColor = (type: string) => {
    const colors = {
      vacation: "text-[#10B981]",
      sick: "text-[#EF4444]",
      personal: "text-[#3B82F6]",
      "half-day": "text-[#FF8C42]",
    };
    return colors[type as keyof typeof colors] || "text-gray-400";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#A4E83C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-lg font-semibold uppercase tracking-wide">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-scale">
      {/* Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm uppercase tracking-wide text-gray-400 font-bold">Filter by Status:</p>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-[#1A1A1A] border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-white/10 text-white">
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-gray-500 uppercase tracking-wide">
          {filteredRequests.length} Request{filteredRequests.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 text-lg font-bold uppercase">No leave requests found</p>
          <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map(({ leave, agent }) => (
            <div
              key={leave.id}
              onClick={() => handleRowClick({ leave, agent })}
              className="glass-card p-6 hover:border-white/20 transition-all cursor-pointer hover-lift"
            >
              <div className="flex items-center justify-between">
                {/* Agent Info */}
                <div className="flex items-center gap-4">
                  <img
                    src={agent.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.name}`}
                    alt={agent.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-bold text-white text-lg">{agent.name}</p>
                      <Badge className={`${getStatusBadgeColor(leave.status)} px-2 py-0.5 text-xs font-bold uppercase`}>
                        {leave.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className={`flex items-center gap-1 font-bold ${getLeaveTypeColor(leave.type)}`}>
                        <User className="w-4 h-4" />
                        {leave.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(leave.startDate), "MMM dd")} - {format(new Date(leave.endDate), "MMM dd, yyyy")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {leave.duration} day{leave.duration !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reason */}
                {leave.reason && (
                  <div className="max-w-md">
                    <p className="text-sm text-gray-400 italic">&quot;{leave.reason}&quot;</p>
                  </div>
                )}

                {/* Requested Date */}
                {leave.requestedDate && (
                  <div className="text-xs text-gray-600 uppercase tracking-wide">
                    Requested {format(new Date(leave.requestedDate), "MMM dd, yyyy")}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedRequest && isModalOpen && (
        <LeaveRequestModal
          isOpen={isModalOpen}
          onOpenChange={handleModalClose}
          leave={selectedRequest.leave}
          agent={selectedRequest.agent}
          agents={agents}
          onSuccess={handleSuccess}
          mode="view"
        />
      )}
    </div>
  );
}

