"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, TrendingDown, TrendingUp, Loader2, RefreshCw } from "lucide-react";

interface PredictiveAlertsProps {
  agentId?: number;
  scope?: "agent" | "team";
}

export function PredictiveAlerts({ agentId, scope = "team" }: PredictiveAlertsProps) {
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState<string>("");
  const [target, setTarget] = useState<string>("");

  useEffect(() => {
    fetchPredictions();
  }, [agentId]);

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      const url = agentId
        ? `/api/insights/predictive?agentId=${agentId}`
        : "/api/insights/predictive";
      const response = await fetch(url);
      const data = await response.json();
      setPredictions(data.predictions);
      setTarget(data.target);
    } catch (error) {
      console.error("Failed to fetch predictions:", error);
    } finally {
      setLoading(false);
    }
  };

  const parseRiskLevel = (content: string): "high" | "medium" | "low" => {
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes("high risk") || lowerContent.includes("🔴")) return "high";
    if (lowerContent.includes("medium risk") || lowerContent.includes("🟡")) return "medium";
    return "low";
  };

  const riskLevel = parseRiskLevel(predictions);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-green-100 text-green-700 border-green-200";
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "high":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "medium":
        return <TrendingDown className="w-5 h-5 text-amber-600" />;
      default:
        return <TrendingUp className="w-5 h-5 text-green-600" />;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getRiskColor(riskLevel)}`}>
            {getRiskIcon(riskLevel)}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">7-Day Forecast</h3>
            <p className="text-sm text-slate-600">{target || "Loading..."}</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={fetchPredictions}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          <Badge variant="outline" className={`mb-4 ${getRiskColor(riskLevel)}`}>
            {riskLevel.toUpperCase()} RISK
          </Badge>

          <div className="prose prose-sm max-w-none">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <pre className="whitespace-pre-wrap font-sans text-xs text-slate-700">
                {predictions || "No predictions available"}
              </pre>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
            <strong>📅 Forecast Period:</strong> Next 7 days | Generated using 21 days of trend data
          </div>
        </>
      )}
    </Card>
  );
}

