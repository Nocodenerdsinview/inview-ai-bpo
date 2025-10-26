"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/shared/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileCheck, 
  AlertCircle, 
  TrendingUp, 
  Target, 
  Calendar,
  Loader2 
} from "lucide-react";
import Link from "next/link";

interface AuditStats {
  dailyGoal: number;
  monthlyGoal: number;
  todayCompleted: number;
  weekCompleted: number;
  monthCompleted: number;
  overdue: any[];
  distribution: any[];
  suggested: any[];
}

export default function AuditTrackingPage() {
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditStats();
  }, []);

  const fetchAuditStats = async () => {
    try {
      const response = await fetch("/api/audits/tracking");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch audit stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Audit Tracking" description="Monitor audit coverage and distribution">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AppLayout>
    );
  }

  const dailyProgress = stats ? (stats.todayCompleted / stats.dailyGoal) * 100 : 0;
  const weeklyProgress = stats ? (stats.weekCompleted / (stats.dailyGoal * 5)) * 100 : 0;
  const monthlyProgress = stats ? (stats.monthCompleted / stats.monthlyGoal) * 100 : 0;

  return (
    <AppLayout
      title="Audit Tracking Dashboard"
      description="Monitor audit coverage and distribution"
    >
      {/* Goal Tracking Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-slate-600 mb-1">Today's Goal</div>
              <div className="text-3xl font-bold text-slate-900">
                {stats?.todayCompleted || 0}/{stats?.dailyGoal || 4}
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileCheck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${Math.min(dailyProgress, 100)}%` }}
            />
          </div>
          <div className="text-xs text-slate-600 mt-2">
            {dailyProgress.toFixed(0)}% complete
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-slate-600 mb-1">This Week</div>
              <div className="text-3xl font-bold text-slate-900">
                {stats?.weekCompleted || 0}/{(stats?.dailyGoal || 4) * 5}
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600 transition-all"
              style={{ width: `${Math.min(weeklyProgress, 100)}%` }}
            />
          </div>
          <div className="text-xs text-slate-600 mt-2">
            {weeklyProgress.toFixed(0)}% complete
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-slate-600 mb-1">This Month</div>
              <div className="text-3xl font-bold text-slate-900">
                {stats?.monthCompleted || 0}/{stats?.monthlyGoal || 80}
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 transition-all"
              style={{ width: `${Math.min(monthlyProgress, 100)}%` }}
            />
          </div>
          <div className="text-xs text-slate-600 mt-2">
            {monthlyProgress.toFixed(0)}% complete
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overdue Audits */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-slate-900">
              Overdue for Audit ({stats?.overdue.length || 0} agents)
            </h3>
          </div>

          {stats?.overdue && stats.overdue.length > 0 ? (
            <div className="space-y-3">
              {stats.overdue.map((item: any) => (
                <div
                  key={item.agentId}
                  className="p-4 border-l-4 border-red-500 bg-red-50 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-slate-900">{item.agentName}</div>
                      <div className="text-sm text-slate-600">
                        Last audit: {item.lastAuditDate || "Never"} ({item.daysOverdue} days ago)
                      </div>
                      {item.kpiStatus && (
                        <Badge variant="outline" className="mt-2 bg-amber-100 text-amber-700">
                          {item.kpiStatus}
                        </Badge>
                      )}
                    </div>
                    <Link href={`/agents/${item.agentId}`}>
                      <Button size="sm" variant="outline">
                        View Agent
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <FileCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">All agents have recent audits ✅</p>
            </div>
          )}
        </Card>

        {/* AI-Suggested Audits */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Suggested Next Audits</h3>
          </div>

          {stats?.suggested && stats.suggested.length > 0 ? (
            <div className="space-y-3">
              {stats.suggested.map((item: any, index: number) => (
                <div
                  key={item.agentId}
                  className="p-3 border border-slate-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <Badge variant="outline" className="text-xs mb-1">
                        Priority #{index + 1}
                      </Badge>
                      <div className="font-medium text-sm text-slate-900">
                        {item.agentName}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 mb-2">{item.reason}</div>
                  <Link href={`/agents/${item.agentId}`}>
                    <Button size="sm" variant="ghost" className="w-full text-xs h-7">
                      Schedule Audit
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No specific recommendations</p>
            </div>
          )}
        </Card>
      </div>

      {/* Distribution Chart */}
      {stats?.distribution && stats.distribution.length > 0 && (
        <Card className="mt-6 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">
            Audit Distribution (This Month)
          </h3>
          <div className="space-y-2">
            {stats.distribution.map((item: any) => (
              <div key={item.agentId} className="flex items-center gap-4">
                <div className="w-32 text-sm text-slate-700 truncate">
                  {item.agentName}
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 flex items-center justify-end pr-2"
                      style={{ width: `${(item.count / 4) * 100}%` }}
                    >
                      {item.count > 0 && (
                        <span className="text-xs text-white font-medium">
                          {item.count}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-slate-600 w-16">
                    {item.count} / 4 audits
                  </span>
                </div>
                {item.count < 2 && (
                  <Badge variant="outline" className="bg-amber-100 text-amber-700 text-xs">
                    Below target
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </AppLayout>
  );
}

