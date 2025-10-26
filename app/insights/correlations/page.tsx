"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/shared/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Target, Loader2, BarChart3, Sparkles } from "lucide-react";

export default function CorrelationsPage() {
  const [loading, setLoading] = useState(false);
  const [correlations, setCorrelations] = useState<string>("");
  const [stats, setStats] = useState<any>(null);
  const [analysisType, setAnalysisType] = useState<string>("all");

  useEffect(() => {
    fetchCorrelations(analysisType);
  }, [analysisType]);

  const fetchCorrelations = async (type: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/insights/correlations?type=${type}`);
      const data = await response.json();
      setCorrelations(data.correlations);
      setStats(data.statistics);
    } catch (error) {
      console.error("Failed to fetch correlations:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout
      title="Cross-KPI Correlations"
      description="Discover relationships between performance metrics"
    >
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-sm text-slate-600 mb-1">Avg Quality</div>
            <div className="text-2xl font-bold text-slate-900">
              {stats.avgQuality?.toFixed(1)}%
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-slate-600 mb-1">Avg AHT</div>
            <div className="text-2xl font-bold text-slate-900">
              {stats.avgAHT?.toFixed(0)}s
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-slate-600 mb-1">Avg SRR</div>
            <div className="text-2xl font-bold text-slate-900">
              {stats.avgSRR?.toFixed(1)}%
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-slate-600 mb-1">Avg VOC</div>
            <div className="text-2xl font-bold text-slate-900">
              {stats.avgVOC?.toFixed(1)}%
            </div>
          </Card>
        </div>
      )}

      <Tabs defaultValue="all" onValueChange={setAnalysisType}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Correlations</TabsTrigger>
          <TabsTrigger value="aht-srr">AHT vs SRR</TabsTrigger>
          <TabsTrigger value="quality-voc">Quality vs VOC</TabsTrigger>
          <TabsTrigger value="coaching-impact">Coaching Impact</TabsTrigger>
          <TabsTrigger value="leave-impact">Leave Impact</TabsTrigger>
        </TabsList>

        <TabsContent value={analysisType}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Analysis */}
            <Card className="lg:col-span-2 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">AI Correlation Analysis</h3>
                  <p className="text-sm text-slate-600">Based on 90 days of data</p>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700">
                      {correlations || "No analysis available"}
                    </pre>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => fetchCorrelations(analysisType)}
                  disabled={loading}
                  variant="outline"
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Refresh Analysis
                </Button>
              </div>
            </Card>

            {/* Sidebar - Key Insights */}
            <div className="space-y-6">
              <Card className="p-6 bg-blue-50 border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">What to Look For</h3>
                </div>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">1</Badge>
                    <span><strong>Sweet Spots:</strong> Optimal ranges where multiple KPIs excel</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">2</Badge>
                    <span><strong>Trade-offs:</strong> When improving one metric hurts another</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">3</Badge>
                    <span><strong>Leading Indicators:</strong> Metrics that predict future changes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">4</Badge>
                    <span><strong>Intervention Impact:</strong> How coaching affects performance</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 bg-green-50 border-green-200">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">Common Findings</h3>
                </div>
                <div className="space-y-3 text-sm text-green-800">
                  <div className="p-3 bg-white rounded border border-green-200">
                    <div className="font-semibold mb-1">AHT Sweet Spot</div>
                    <p className="text-xs">Agents with 470-500s AHT typically have highest SRR</p>
                  </div>
                  <div className="p-3 bg-white rounded border border-green-200">
                    <div className="font-semibold mb-1">Quality Leads VOC</div>
                    <p className="text-xs">Quality drops precede VOC drops by 2-3 weeks</p>
                  </div>
                  <div className="p-3 bg-white rounded border border-green-200">
                    <div className="font-semibold mb-1">Coaching Frequency</div>
                    <p className="text-xs">2 sessions/month shows 8% better performance</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Analysis Types</h3>
                <div className="space-y-2 text-sm text-slate-700">
                  <div>
                    <strong className="text-slate-900">All:</strong> Comprehensive analysis of all relationships
                  </div>
                  <div>
                    <strong className="text-slate-900">AHT vs SRR:</strong> Is faster always better?
                  </div>
                  <div>
                    <strong className="text-slate-900">Quality vs VOC:</strong> How quality predicts satisfaction
                  </div>
                  <div>
                    <strong className="text-slate-900">Coaching Impact:</strong> ROI of interventions
                  </div>
                  <div>
                    <strong className="text-slate-900">Leave Impact:</strong> Absence effect on performance
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}

