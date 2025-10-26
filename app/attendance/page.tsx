"use client";

import { useState, useEffect } from "react";
import { Users, Plane, HeartPulse, Calendar, Save, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlannedLeaveView } from "@/components/attendance/planned-leave-view";
import { UpcomingLeaveView } from "@/components/attendance/upcoming-leave-view";

interface Agent {
  id: number;
  name: string;
  avatarUrl: string | null;
  status: string;
}

interface AttendanceRecord {
  agentId: number;
  status: "active" | "sick" | "holiday";
  notes: string;
}

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [attendance, setAttendance] = useState<Record<number, AttendanceRecord>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch agents and attendance
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch all agents
        const agentsRes = await fetch("/api/agents");
        const agentsData = await agentsRes.json();
        setAgents(agentsData);

        // Fetch attendance for selected date
        const attendanceRes = await fetch(`/api/attendance?date=${selectedDate}`);
        const attendanceData = await attendanceRes.json();

        // Convert attendance array to object for easy lookup
        const attendanceMap: Record<number, AttendanceRecord> = {};
        attendanceData.forEach((record: any) => {
          attendanceMap[record.agentId] = {
            agentId: record.agentId,
            status: record.status,
            notes: record.notes || "",
          };
        });

        // Default to "active" for agents without records
        agentsData.forEach((agent: Agent) => {
          if (!attendanceMap[agent.id]) {
            attendanceMap[agent.id] = {
              agentId: agent.id,
              status: "active",
              notes: "",
            };
          }
        });

        setAttendance(attendanceMap);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedDate]);

  const handleStatusChange = (agentId: number, status: "active" | "sick" | "holiday") => {
    setAttendance((prev) => ({
      ...prev,
      [agentId]: {
        ...prev[agentId],
        status,
      },
    }));
    setSaved(false);
  };

  const handleNotesChange = (agentId: number, notes: string) => {
    setAttendance((prev) => ({
      ...prev,
      [agentId]: {
        ...prev[agentId],
        notes,
      },
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = Object.values(attendance).map((record) => ({
        agentId: record.agentId,
        date: selectedDate,
        status: record.status,
        notes: record.notes,
      }));

      await fetch("/api/attendance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving attendance:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAllActive = () => {
    const newAttendance: Record<number, AttendanceRecord> = {};
    agents.forEach((agent) => {
      newAttendance[agent.id] = {
        agentId: agent.id,
        status: "active",
        notes: attendance[agent.id]?.notes || "",
      };
    });
    setAttendance(newAttendance);
    setSaved(false);
  };

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-[#A4E83C]/10 text-[#A4E83C] border-[#A4E83C]/30";
      case "holiday":
        return "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30";
      case "sick":
        return "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30";
      default:
        return "bg-white/5 text-gray-400 border-white/10";
    }
  };

  const summary = {
    active: Object.values(attendance).filter((r) => r.status === "active").length,
    holiday: Object.values(attendance).filter((r) => r.status === "holiday").length,
    sick: Object.values(attendance).filter((r) => r.status === "sick").length,
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-[#1A1A1A] to-[#2d2d2d] 
                      rounded-2xl border border-white/5 p-8 mb-8 shadow-premium 
                      border-l-4 border-l-[#A4E83C]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold uppercase tracking-wide text-white mb-2">
              Attendance Management
            </h1>
            <p className="text-gray-500">Track daily attendance and planned leave</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase">Today</p>
              <p className="text-sm font-bold text-white">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="daily-update" className="w-full">
        <TabsList className="w-full justify-start mb-8">
          <TabsTrigger value="daily-update">Daily Update</TabsTrigger>
          <TabsTrigger value="planned-leave">Planned Leave</TabsTrigger>
          <TabsTrigger value="upcoming-leave">Upcoming (14 days)</TabsTrigger>
        </TabsList>

        {/* Daily Update Tab */}
        <TabsContent value="daily-update" className="space-y-8">
          <div className="flex items-center justify-end gap-4 mb-6">
            <Button
              onClick={handleMarkAllActive}
              variant="secondary"
              className="gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Mark All Active
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={saving || saved}
              className="gap-2"
            >
              {saving ? (
                <>Saving...</>
              ) : saved ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Agents */}
        <div className="glass-card p-6 shadow-premium text-center">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-white" />
          </div>
          <p className="text-4xl font-black text-white mb-2">{agents.length}</p>
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
            Total Agents
          </p>
        </div>

        {/* In Office */}
        <div className="glass-card p-6 shadow-premium text-center">
          <div className="w-12 h-12 bg-[#A4E83C]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-[#A4E83C]" />
          </div>
          <p className="text-4xl font-black text-[#A4E83C] mb-2">{summary.active}</p>
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
            In Office
          </p>
        </div>

        {/* On Holiday */}
        <div className="glass-card p-6 shadow-premium text-center">
          <div className="w-12 h-12 bg-[#3B82F6]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Plane className="w-6 h-6 text-[#3B82F6]" />
          </div>
          <p className="text-4xl font-black text-[#3B82F6] mb-2">{summary.holiday}</p>
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
            On Holiday
          </p>
        </div>

        {/* Off Sick */}
        <div className="glass-card p-6 shadow-premium text-center">
          <div className="w-12 h-12 bg-[#EF4444]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
            <HeartPulse className="w-6 h-6 text-[#EF4444]" />
          </div>
          <p className="text-4xl font-black text-[#EF4444] mb-2">{summary.sick}</p>
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
            Off Sick
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="glass-card p-6 shadow-premium">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2 text-white 
                       focus:border-[#A4E83C] focus:ring-1 focus:ring-[#A4E83C] transition-all"
            />
          </div>
          
          <input
            type="text"
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2 text-white 
                     placeholder:text-gray-500 focus:border-[#A4E83C] focus:ring-1 focus:ring-[#A4E83C] 
                     transition-all"
          />
        </div>
      </div>

      {/* Agent List */}
      {loading ? (
        <div className="glass-card p-12 text-center shadow-premium">
          <p className="text-gray-400">Loading agents...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => {
            const record = attendance[agent.id];
            if (!record) return null;

            return (
              <div key={agent.id} className="glass-card p-6 shadow-premium hover:shadow-premium-xl transition-all">
                {/* Agent Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A4E83C] to-[#3B82F6] 
                                flex items-center justify-center text-black font-bold text-lg">
                    {agent.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold">{agent.name}</h3>
                    <p className="text-xs text-gray-500">Agent ID: {agent.id}</p>
                  </div>
                </div>

                {/* Status Buttons */}
                <div className="space-y-3 mb-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-2">
                    Status
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleStatusChange(agent.id, "active")}
                      className={`px-3 py-2 rounded-lg border transition-all text-xs font-bold uppercase tracking-wide
                        ${record.status === "active" 
                          ? "bg-[#A4E83C]/20 text-[#A4E83C] border-[#A4E83C]" 
                          : "bg-white/5 text-gray-500 border-white/10 hover:border-[#A4E83C]/50"}`}
                    >
                      <Users className="w-3 h-3 mx-auto mb-1" />
                      Active
                    </button>
                    
                    <button
                      onClick={() => handleStatusChange(agent.id, "holiday")}
                      className={`px-3 py-2 rounded-lg border transition-all text-xs font-bold uppercase tracking-wide
                        ${record.status === "holiday" 
                          ? "bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]" 
                          : "bg-white/5 text-gray-500 border-white/10 hover:border-[#3B82F6]/50"}`}
                    >
                      <Plane className="w-3 h-3 mx-auto mb-1" />
                      Holiday
                    </button>
                    
                    <button
                      onClick={() => handleStatusChange(agent.id, "sick")}
                      className={`px-3 py-2 rounded-lg border transition-all text-xs font-bold uppercase tracking-wide
                        ${record.status === "sick" 
                          ? "bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]" 
                          : "bg-white/5 text-gray-500 border-white/10 hover:border-[#EF4444]/50"}`}
                    >
                      <HeartPulse className="w-3 h-3 mx-auto mb-1" />
                      Sick
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                    Notes
                  </label>
                  <textarea
                    value={record.notes}
                    onChange={(e) => handleNotesChange(agent.id, e.target.value)}
                    placeholder="Optional notes..."
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-white 
                             text-sm placeholder:text-gray-500 focus:border-[#A4E83C] focus:ring-1 
                             focus:ring-[#A4E83C] transition-all min-h-[60px] resize-none"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
        </TabsContent>

        {/* Planned Leave Tab */}
        <TabsContent value="planned-leave">
          <PlannedLeaveView />
        </TabsContent>

        {/* Upcoming Leave Tab */}
        <TabsContent value="upcoming-leave">
          <UpcomingLeaveView daysAhead={14} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

