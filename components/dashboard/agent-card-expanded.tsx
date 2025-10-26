"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { generateActionPlan } from "@/lib/generateActionPlan";
import { 
  AlertCircle, 
  Trophy, 
  Sparkles, 
  MessageSquare, 
  FileText, 
  Calendar,
  Target,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clipboard,
  Zap
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AgentCardExpandedProps {
  agent: {
    id: number;
    name: string;
  };
  kpis: {
    quality: number | null;
    aht: number | null;
    srr: number | null;
    voc: number | null;
  } | null;
  teamAvg: {
    quality: number;
    aht: number;
    srr: number;
    voc: number;
  };
}

export function AgentCardExpanded({ agent, kpis, teamAvg }: AgentCardExpandedProps) {
  const [actionPlan, setActionPlan] = useState<ReturnType<typeof generateActionPlan> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePlan = () => {
    setIsGenerating(true);
    // Simulate AI generation delay
    setTimeout(() => {
      const plan = generateActionPlan(
        kpis || { quality: null, aht: null, srr: null, voc: null },
        teamAvg,
        agent.name
      );
      setActionPlan(plan);
      setIsGenerating(false);
    }, 800);
  };

  // Generate mock issues based on KPIs
  const issues = [];
  if (kpis?.quality && kpis.quality < 80) {
    issues.push({
      severity: "critical",
      title: "Quality score below 80%",
      description: `At ${kpis.quality.toFixed(0)}%, immediate coaching required`,
      days: 3,
    });
  } else if (kpis?.quality && kpis.quality < 90) {
    issues.push({
      severity: "warning",
      title: "Quality below target",
      description: `At ${kpis.quality.toFixed(0)}%, needs improvement to reach 90%`,
      days: 5,
    });
  }

  if (kpis?.aht && kpis.aht > 605) {
    issues.push({
      severity: "critical",
      title: "AHT significantly above target",
      description: `At ${kpis.aht}s, efficiency training needed`,
      days: 4,
    });
  } else if (kpis?.aht && kpis.aht > 550) {
    issues.push({
      severity: "warning",
      title: "AHT slightly elevated",
      description: `At ${kpis.aht}s, minor optimization needed`,
      days: 7,
    });
  }

  if (kpis?.srr && kpis.srr < 70) {
    issues.push({
      severity: "critical",
      title: "SRR critically low",
      description: `At ${kpis.srr.toFixed(0)}%, objection handling needs work`,
      days: 2,
    });
  }

  // Generate mock wins based on KPIs
  const wins = [];
  if (kpis?.quality && kpis.quality >= 90) {
    wins.push({
      title: "Quality target achieved",
      description: `Maintaining ${kpis.quality.toFixed(0)}% quality score`,
      icon: Trophy,
    });
  }
  if (kpis?.voc && kpis.voc >= 94) {
    wins.push({
      title: "Excellent customer satisfaction",
      description: `VOC score of ${kpis.voc.toFixed(0)}% - customers love you!`,
      icon: Sparkles,
    });
  }
  if (kpis?.aht && kpis.aht <= 550) {
    wins.push({
      title: "Efficient call handling",
      description: `AHT at ${kpis.aht}s - great time management`,
      icon: Zap,
    });
  }

  const priorityIcons = {
    high: AlertTriangle,
    medium: AlertCircle,
    low: CheckCircle,
  };

  const priorityColors = {
    high: "text-red-600 bg-red-50 border-red-200",
    medium: "text-amber-600 bg-amber-50 border-amber-200",
    low: "text-blue-600 bg-blue-50 border-blue-200",
  };

  return (
    <div className="border-t border-slate-200 bg-slate-50/50">
      <div className="p-6 space-y-6">
        {/* Performance Deep Dive */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-slate-700" />
            <h4 className="font-semibold text-slate-900">Performance Breakdown</h4>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Quality", value: kpis?.quality, target: 90, unit: "%", icon: Target },
              { label: "AHT", value: kpis?.aht, target: 550, unit: "s", icon: Clock },
              { label: "SRR", value: kpis?.srr, target: 75, unit: "%", icon: TrendingUp },
              { label: "VOC", value: kpis?.voc, target: 94, unit: "%", icon: Trophy },
            ].map((metric) => {
              const Icon = metric.icon;
              const status = metric.value 
                ? metric.label === "AHT"
                  ? metric.value <= metric.target ? "success" : metric.value <= metric.target * 1.1 ? "warning" : "danger"
                  : metric.value >= metric.target ? "success" : metric.value >= metric.target * 0.89 ? "warning" : "danger"
                : "neutral";

              return (
                <div key={metric.label} className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-slate-600" />
                    <span className="text-xs font-medium text-slate-600">{metric.label}</span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className={cn(
                      "text-2xl font-bold",
                      status === "success" && "text-emerald-600",
                      status === "warning" && "text-amber-600",
                      status === "danger" && "text-red-600"
                    )}>
                      {metric.value?.toFixed(0) || "N/A"}
                    </span>
                    <span className="text-sm text-slate-500">{metric.unit}</span>
                  </div>
                  <div className="text-xs text-slate-600">
                    Target: {metric.target}{metric.unit}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Issues */}
        {issues.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h4 className="font-semibold text-slate-900">Current Issues ({issues.length})</h4>
            </div>
            <div className="space-y-2">
              {issues.map((issue, i) => (
                <div
                  key={i}
                  className={cn(
                    "p-3 rounded-lg border-l-4",
                    issue.severity === "critical" && "bg-red-50 border-red-500",
                    issue.severity === "warning" && "bg-amber-50 border-amber-500"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{issue.title}</p>
                      <p className="text-xs text-slate-600 mt-1">{issue.description}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {issue.days} days
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Wins */}
        {wins.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-emerald-600" />
              <h4 className="font-semibold text-slate-900">Recent Wins ({wins.length})</h4>
            </div>
            <div className="space-y-2">
              {wins.map((win, i) => {
                const Icon = win.icon;
                return (
                  <div key={i} className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{win.title}</p>
                        <p className="text-xs text-slate-600 mt-1">{win.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AI Action Plan */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clipboard className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-slate-900">AI-Generated Action Plan</h4>
          </div>
          
          {!actionPlan ? (
            <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-slate-300">
              <Sparkles className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <p className="text-sm text-slate-600 mb-4">
                Generate a personalized coaching action plan based on {agent.name}'s performance
              </p>
              <Button
                onClick={handleGeneratePlan}
                disabled={isGenerating}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isGenerating ? (
                  <>Generating...</>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate AI Action Plan
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Focus Areas */}
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h5 className="font-medium text-slate-900 mb-3">Focus Areas</h5>
                <div className="space-y-2">
                  {actionPlan.focusAreas.map((area, i) => {
                    const Icon = priorityIcons[area.priority];
                    return (
                      <div key={i} className={cn("flex items-start gap-3 p-3 rounded-lg border", priorityColors[area.priority])}>
                        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">{area.area}</p>
                            <Badge className={cn("text-xs", 
                              area.priority === "high" && "bg-red-100 text-red-700",
                              area.priority === "medium" && "bg-amber-100 text-amber-700",
                              area.priority === "low" && "bg-blue-100 text-blue-700"
                            )}>
                              {area.priority}
                            </Badge>
                          </div>
                          <p className="text-xs">{area.reason}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Items */}
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h5 className="font-medium text-slate-900 mb-3">Action Items</h5>
                <div className="space-y-3">
                  {actionPlan.actionItems.map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{item.action}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.timeline}
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            {item.expectedOutcome}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coaching Approach */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-medium text-blue-900 mb-2">Coaching Approach</h5>
                <p className="text-sm text-blue-800">{actionPlan.coachingApproach}</p>
              </div>

              {/* Success Metrics */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h5 className="font-medium text-emerald-900 mb-2">Success Metrics</h5>
                <ul className="space-y-1">
                  {actionPlan.successMetrics.map((metric, i) => (
                    <li key={i} className="text-sm text-emerald-800 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      {metric}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <Link href={`/coaching?agent=${agent.id}`} className="flex-1">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <MessageSquare className="w-4 h-4 mr-2" />
              Schedule Coaching
            </Button>
          </Link>
          <Link href={`/audits?agent=${agent.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              <FileText className="w-4 h-4 mr-2" />
              Create Audit
            </Button>
          </Link>
          <Link href={`/agents/${agent.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              <Calendar className="w-4 h-4 mr-2" />
              View Full Profile
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

