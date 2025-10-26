"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, AlertCircle, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Pattern {
  id: number;
  type: "red-flag" | "watch-list" | "win" | "correlation";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  agentName?: string;
}

interface PatternAlertsProps {
  patterns: Pattern[];
}

export function PatternAlerts({ patterns }: PatternAlertsProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "red-flag":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "watch-list":
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case "win":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      default:
        return <Lightbulb className="w-4 h-4 text-blue-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "red-flag":
        return "bg-red-100 text-red-700 border-red-200";
      case "watch-list":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "win":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive" className="text-xs">High</Badge>;
      case "medium":
        return <Badge variant="outline" className="text-xs bg-amber-100 text-amber-700">Medium</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Low</Badge>;
    }
  };

  const sortedPatterns = [...patterns].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Pattern Alerts</h3>
            <p className="text-sm text-slate-600">{patterns.length} insights detected</p>
          </div>
        </div>
        <Link href="/insights">
          <Button size="sm" variant="outline">
            View All
          </Button>
        </Link>
      </div>

      {patterns.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No new patterns detected</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedPatterns.slice(0, 5).map((pattern) => (
            <div
              key={pattern.id}
              className={`p-3 border rounded-lg ${getTypeColor(pattern.type)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getTypeIcon(pattern.type)}
                  <span className="font-medium text-sm">{pattern.title}</span>
                </div>
                {getPriorityBadge(pattern.priority)}
              </div>

              <p className="text-xs mb-2">{pattern.description}</p>

              {pattern.agentName && (
                <div className="text-xs font-medium mb-2">Agent: {pattern.agentName}</div>
              )}

              <div className="flex justify-end">
                <Link href="/insights">
                  <Button size="sm" variant="ghost" className="text-xs h-6">
                    View Details <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

