"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/shared/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Award, Target } from "lucide-react";

interface BenchmarkData {
  metric: string;
  teamValue: number;
  companyAvg: number;
  unit: string;
  isLowerBetter?: boolean;
}

export default function BenchmarkingPage() {
  const [benchmarks, setBenchmarks] = useState<BenchmarkData[]>([
    { metric: "Quality Score", teamValue: 91.2, companyAvg: 89.0, unit: "%" },
    { metric: "Average Handle Time", teamValue: 512, companyAvg: 530, unit: "s", isLowerBetter: true },
    { metric: "Sales Retention Rate", teamValue: 76.5, companyAvg: 78.0, unit: "%" },
    { metric: "Voice of Customer", teamValue: 96.1, companyAvg: 94.0, unit: "%" },
  ]);

  const [teamRanking, setTeamRanking] = useState({
    position: 3,
    totalTeams: 8,
    percentile: 62.5,
  });

  const getPerformanceStatus = (teamValue: number, companyAvg: number, isLowerBetter = false) => {
    const diff = teamValue - companyAvg;
    const isAbove = isLowerBetter ? diff < 0 : diff > 0;

    if (Math.abs(diff) < 1) return { status: "on-par", color: "slate" };
    return isAbove
      ? { status: "above", color: "green" }
      : { status: "below", color: "red" };
  };

  const getIcon = (status: string) => {
    if (status === "above") return <TrendingUp className="w-5 h-5" />;
    if (status === "below") return <TrendingDown className="w-5 h-5" />;
    return <Target className="w-5 h-5" />;
  };

  return (
    <AppLayout
      title="Performance Benchmarking"
      description="Compare your team against company averages"
    >
      {/* Team Ranking Card */}
      <Card className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                #{teamRanking.position} out of {teamRanking.totalTeams} teams
              </h3>
              <p className="text-slate-600">
                {teamRanking.percentile}th percentile company-wide
              </p>
            </div>
          </div>
          <Badge variant="default" className="bg-blue-600 text-lg px-4 py-2">
            Top Performer
          </Badge>
        </div>
      </Card>

      {/* Benchmarks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {benchmarks.map((benchmark) => {
          const performance = getPerformanceStatus(
            benchmark.teamValue,
            benchmark.companyAvg,
            benchmark.isLowerBetter
          );
          const diff = benchmark.teamValue - benchmark.companyAvg;
          const diffAbs = Math.abs(diff);

          return (
            <Card key={benchmark.metric} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">{benchmark.metric}</h4>
                  <div className="text-3xl font-bold text-slate-900">
                    {benchmark.teamValue}
                    {benchmark.unit}
                  </div>
                </div>
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    performance.status === "above"
                      ? "bg-green-100 text-green-600"
                      : performance.status === "below"
                      ? "bg-red-100 text-red-600"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {getIcon(performance.status)}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Your Team</span>
                  <span className="font-semibold text-slate-900">
                    {benchmark.teamValue}
                    {benchmark.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Company Avg</span>
                  <span className="font-semibold text-slate-900">
                    {benchmark.companyAvg}
                    {benchmark.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200">
                  <span className="text-slate-600">Difference</span>
                  <span
                    className={`font-semibold ${
                      performance.status === "above"
                        ? "text-green-600"
                        : performance.status === "below"
                        ? "text-red-600"
                        : "text-slate-600"
                    }`}
                  >
                    {diff > 0 ? "+" : ""}
                    {diff.toFixed(1)}
                    {benchmark.unit}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      performance.status === "above"
                        ? "bg-green-600"
                        : performance.status === "below"
                        ? "bg-red-600"
                        : "bg-slate-600"
                    }`}
                    style={{
                      width: `${Math.min(
                        (benchmark.teamValue / (benchmark.companyAvg * 1.2)) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {performance.status === "above" && (
                <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                  ✅ Exceeding company average by {diffAbs.toFixed(1)}
                  {benchmark.unit}
                </div>
              )}
              {performance.status === "below" && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                  ⚠ Below company average by {diffAbs.toFixed(1)}
                  {benchmark.unit}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Goals Section */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Realistic 30-Day Goals</h3>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-blue-900">Improve SRR to 78.5%</h4>
              <Badge variant="outline" className="bg-white">High Priority</Badge>
            </div>
            <p className="text-sm text-blue-800 mb-2">
              Current: 76.5% → Target: 78.5% (2% improvement)
            </p>
            <div className="text-xs text-blue-700">
              <strong>Strategy:</strong> Top 5 agents mentor bottom 5 on pricing objections. Estimated timeline: 3-4 weeks with intensive coaching.
            </div>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-green-900">Reduce AHT to 500s</h4>
              <Badge variant="outline" className="bg-white">On Track</Badge>
            </div>
            <p className="text-sm text-green-800 mb-2">
              Current: 512s → Target: 500s (12s improvement)
            </p>
            <div className="text-xs text-green-700">
              <strong>Strategy:</strong> Continue hold reduction initiative. Currently trending well. Estimated timeline: 2 weeks.
            </div>
          </div>
        </div>
      </Card>
    </AppLayout>
  );
}

