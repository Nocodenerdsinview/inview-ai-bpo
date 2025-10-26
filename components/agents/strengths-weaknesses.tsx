"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

interface StrengthItem {
  category: string;
  evidence: string;
  impact: string;
  confidence: number; // 0-100
}

interface WeaknessItem {
  category: string;
  description: string;
  status: "active" | "improving" | "resolved";
  firstIdentified: string;
  lastObserved?: string;
}

interface StrengthsWeaknessesProps {
  strengths: StrengthItem[];
  weaknesses: WeaknessItem[];
}

export function StrengthsWeaknesses({ strengths, weaknesses }: StrengthsWeaknessesProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-700";
      case "improving":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle2 className="w-4 h-4" />;
      case "improving":
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Strengths */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">AI-Identified Strengths</h3>
            <p className="text-sm text-slate-600">{strengths.length} key strengths</p>
          </div>
        </div>

        {strengths.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p className="text-sm">Building strength profile...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {strengths.map((strength, index) => (
              <div
                key={index}
                className="p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-green-900">{strength.category}</h4>
                  <Badge variant="outline" className="bg-white">
                    {strength.confidence}% confidence
                  </Badge>
                </div>

                <div className="text-sm text-green-800 mb-2">
                  <strong>Evidence:</strong> {strength.evidence}
                </div>

                <div className="text-sm text-green-700">
                  <strong>Impact:</strong> {strength.impact}
                </div>

                {/* Confidence bar */}
                <div className="mt-3">
                  <div className="h-1.5 bg-green-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600"
                      style={{ width: `${strength.confidence}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Development Areas */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Development Areas</h3>
            <p className="text-sm text-slate-600">
              {weaknesses.filter((w) => w.status === "active").length} active
            </p>
          </div>
        </div>

        {weaknesses.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30 text-green-600" />
            <p className="text-sm">No development areas identified ✅</p>
          </div>
        ) : (
          <div className="space-y-4">
            {weaknesses.map((weakness, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg ${
                  weakness.status === "resolved"
                    ? "bg-green-50 border-green-200"
                    : weakness.status === "improving"
                    ? "bg-blue-50 border-blue-200"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4
                    className={`font-semibold ${
                      weakness.status === "resolved"
                        ? "text-green-900"
                        : weakness.status === "improving"
                        ? "text-blue-900"
                        : "text-amber-900"
                    }`}
                  >
                    {weakness.category}
                  </h4>
                  <Badge variant="outline" className={getStatusColor(weakness.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(weakness.status)}
                      {weakness.status}
                    </span>
                  </Badge>
                </div>

                <p
                  className={`text-sm mb-2 ${
                    weakness.status === "resolved"
                      ? "text-green-800"
                      : weakness.status === "improving"
                      ? "text-blue-800"
                      : "text-amber-800"
                  }`}
                >
                  {weakness.description}
                </p>

                <div
                  className={`text-xs ${
                    weakness.status === "resolved"
                      ? "text-green-700"
                      : weakness.status === "improving"
                      ? "text-blue-700"
                      : "text-amber-700"
                  }`}
                >
                  <div>First identified: {weakness.firstIdentified}</div>
                  {weakness.lastObserved && weakness.status !== "resolved" && (
                    <div>Last observed: {weakness.lastObserved}</div>
                  )}
                  {weakness.status === "resolved" && (
                    <div className="mt-1 font-semibold">✅ Successfully resolved</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

