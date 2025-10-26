"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, Award, Users, TrendingUp, Target } from "lucide-react";

interface Recommendation {
  type: "mentor" | "recognition" | "development" | "next-step";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  evidence?: string;
}

interface AIRecommendationsProps {
  agentId: number;
  agentName: string;
  recommendations: Recommendation[];
}

export function AIRecommendations({ agentId, agentName, recommendations }: AIRecommendationsProps) {
  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "mentor":
        return <Users className="w-5 h-5 text-blue-600" />;
      case "recognition":
        return <Award className="w-5 h-5 text-yellow-600" />;
      case "development":
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      default:
        return <Target className="w-5 h-5 text-purple-600" />;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case "mentor":
        return "bg-blue-50 border-blue-200";
      case "recognition":
        return "bg-yellow-50 border-yellow-200";
      case "development":
        return "bg-green-50 border-green-200";
      default:
        return "bg-purple-50 border-purple-200";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="default" className="bg-red-600">High Priority</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-amber-100 text-amber-700">Medium</Badge>;
      default:
        return <Badge variant="outline">Low</Badge>;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">AI Recommendations</h3>
          <p className="text-sm text-slate-600">Personalized insights for {agentName}</p>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No recommendations available yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className={`p-4 border rounded-lg ${getRecommendationColor(rec.type)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getRecommendationIcon(rec.type)}
                  <div>
                    <h4 className="font-semibold text-slate-900">{rec.title}</h4>
                    <p className="text-xs text-slate-600 capitalize">{rec.type}</p>
                  </div>
                </div>
                {getPriorityBadge(rec.priority)}
              </div>

              <p className="text-sm text-slate-700 mb-3">{rec.description}</p>

              {rec.evidence && (
                <div className="p-3 bg-white border border-slate-200 rounded text-xs text-slate-600 mb-3">
                  <strong>Evidence:</strong> {rec.evidence}
                </div>
              )}

              {rec.type === "mentor" && (
                <Button size="sm" variant="outline" className="text-xs h-7">
                  Assign Mentees
                </Button>
              )}
              {rec.type === "recognition" && (
                <Button size="sm" variant="outline" className="text-xs h-7">
                  Nominate for Award
                </Button>
              )}
              {rec.type === "development" && (
                <Button size="sm" variant="outline" className="text-xs h-7">
                  Create Action Plan
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

