"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Calendar, Plus, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Agent {
  id: number;
  name: string;
  role: string;
}

interface ManualEntryFormProps {
  onSuccess?: () => void;
}

export function ManualEntryForm({ onSuccess }: ManualEntryFormProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    agentId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    quality: "",
    aht: "",
    srr: "",
    voc: "",
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch("/api/agents");
      const data = await response.json();
      setAgents(data);
    } catch (error) {
      console.error("Failed to fetch agents:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agentId) {
      alert("Please select an agent");
      return;
    }

    // Validate at least one KPI is entered
    if (!formData.quality && !formData.aht && !formData.srr && !formData.voc) {
      alert("Please enter at least one KPI value");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/kpis/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: parseInt(formData.agentId),
          date: formData.date,
          quality: formData.quality ? parseFloat(formData.quality) : null,
          aht: formData.aht ? parseFloat(formData.aht) : null,
          srr: formData.srr ? parseFloat(formData.srr) : null,
          voc: formData.voc ? parseFloat(formData.voc) : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save KPI");
      }

      // Reset form
      setFormData({
        agentId: "",
        date: format(new Date(), "yyyy-MM-dd"),
        quality: "",
        aht: "",
        srr: "",
        voc: "",
      });

      alert("KPI saved successfully!");
      onSuccess?.();
    } catch (error) {
      console.error("Error saving KPI:", error);
      alert("Failed to save KPI. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
          <Plus className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Add Individual KPI Record
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Agent Selection */}
        <div>
          <Label htmlFor="agent" className="block text-sm font-medium text-slate-700 mb-2">
            Agent *
          </Label>
          <select
            id="agent"
            value={formData.agentId}
            onChange={(e) => handleInputChange("agentId", e.target.value)}
            className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white hover:border-slate-300"
            required
          >
            <option value="">Select an agent</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name} - {agent.role}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <Label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-2">
            Date *
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white hover:border-slate-300"
              required
            />
          </div>
        </div>

        {/* KPI Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="quality" className="block text-sm font-medium text-slate-700 mb-2">
              Quality Score (%)
            </Label>
            <input
              type="number"
              id="quality"
              value={formData.quality}
              onChange={(e) => handleInputChange("quality", e.target.value)}
              min="0"
              max="100"
              step="0.01"
              placeholder="e.g., 92.5"
              className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 bg-white hover:border-slate-300"
            />
          </div>

          <div>
            <Label htmlFor="aht" className="block text-sm font-medium text-slate-700 mb-2">
              AHT (seconds)
            </Label>
            <input
              type="number"
              id="aht"
              value={formData.aht}
              onChange={(e) => handleInputChange("aht", e.target.value)}
              min="0"
              step="1"
              placeholder="e.g., 540"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <Label htmlFor="srr" className="block text-sm font-medium text-slate-700 mb-2">
              Save/Retention Rate (%)
            </Label>
            <input
              type="number"
              id="srr"
              value={formData.srr}
              onChange={(e) => handleInputChange("srr", e.target.value)}
              min="0"
              max="100"
              step="0.01"
              placeholder="e.g., 75.0"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <Label htmlFor="voc" className="block text-sm font-medium text-slate-700 mb-2">
              Voice of Customer (%)
            </Label>
            <input
              type="number"
              id="voc"
              value={formData.voc}
              onChange={(e) => handleInputChange("voc", e.target.value)}
              min="0"
              max="100"
              step="0.01"
              placeholder="e.g., 88.0"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Help Text */}
        <p className="text-sm text-slate-600">
          * Required fields. You can enter one or more KPI values per record.
        </p>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setFormData({
                agentId: "",
                date: format(new Date(), "yyyy-MM-dd"),
                quality: "",
                aht: "",
                srr: "",
                voc: "",
              })
            }
          >
            Clear
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Save KPI
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}

