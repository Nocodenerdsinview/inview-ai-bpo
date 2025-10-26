"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Clock, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import Link from "next/link";
import { format, differenceInDays, parseISO } from "date-fns";

interface ActionPlan {
  id: number;
  agentId: number;
  agentName: string;
  title: string;
  goal: string;
  createdDate: string;
  followUpDate: string | null;
  status: string;
  progressIndicator?: number;
}

interface ActionPlansWidgetProps {
  actionPlans: ActionPlan[];
}

export function ActionPlansWidget({ actionPlans }: ActionPlansWidgetProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "in-progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "at-risk":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "overdue":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4" />;
      case "in-progress":
        return <TrendingUp className="w-4 h-4" />;
      case "at-risk":
      case "overdue":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getDaysUntilFollowUp = (followUpDate: string | null) => {
    if (!followUpDate) return null;
    const days = differenceInDays(parseISO(followUpDate), new Date());
    return days;
  };

  const activePlans = actionPlans.filter(
    (plan) => plan.status !== "completed" && plan.status !== "cancelled"
  );

  const overdueAlerts = activePlans.filter((plan) => {
    const days = getDaysUntilFollowUp(plan.followUpDate);
    return days !== null && days < 0;
  });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Active Action Plans</h3>
            <p className="text-sm text-slate-600">{activePlans.length} in progress</p>
          </div>
        </div>
        {overdueAlerts.length > 0 && (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="w-3 h-3" />
            {overdueAlerts.length} overdue
          </Badge>
        )}
      </div>

      {activePlans.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No active action plans</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activePlans.map((plan) => {
            const daysUntil = getDaysUntilFollowUp(plan.followUpDate);
            const isOverdue = daysUntil !== null && daysUntil < 0;
            const isApproaching = daysUntil !== null && daysUntil <= 7 && daysUntil >= 0;

            return (
              <div
                key={plan.id}
                className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-slate-900">{plan.agentName}</h4>
                      <Badge variant="outline" className={getStatusColor(plan.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(plan.status)}
                          {plan.status}
                        </span>
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-700 font-medium mb-1">{plan.title}</p>
                    <p className="text-xs text-slate-600">{plan.goal}</p>
                  </div>
                </div>

                {/* Progress Indicator */}
                {plan.progressIndicator !== undefined && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                      <span>Progress</span>
                      <span>{plan.progressIndicator}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all"
                        style={{ width: `${plan.progressIndicator}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Clock className="w-3 h-3" />
                    <span>Created: {format(parseISO(plan.createdDate), "MMM d")}</span>
                  </div>
                  {plan.followUpDate && (
                    <div
                      className={`flex items-center gap-1 ${
                        isOverdue
                          ? "text-red-600 font-semibold"
                          : isApproaching
                          ? "text-amber-600 font-semibold"
                          : "text-slate-600"
                      }`}
                    >
                      {isOverdue && <AlertCircle className="w-3 h-3" />}
                      <span>
                        Follow-up:{" "}
                        {isOverdue
                          ? `${Math.abs(daysUntil!)} days overdue`
                          : isApproaching
                          ? `in ${daysUntil} days`
                          : format(parseISO(plan.followUpDate), "MMM d")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <Link href={`/coaching/quick-prep/${plan.agentId}`}>
                    <Button size="sm" variant="outline" className="text-xs h-7">
                      Quick Prep
                    </Button>
                  </Link>
                  <Link href={`/agents/${plan.agentId}`}>
                    <Button size="sm" variant="ghost" className="text-xs h-7">
                      View Agent
                    </Button>
                  </Link>
                </div>

                {/* Smart Alert */}
                {isOverdue && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                    📣 Follow-up overdue - Check agent's recent performance
                  </div>
                )}
                {isApproaching && daysUntil! <= 3 && (
                  <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                    ⏰ Follow-up approaching - Prepare for coaching session
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

