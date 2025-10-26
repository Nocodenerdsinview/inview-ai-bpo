"use client";

import { useState } from "react";
import { AppLayout } from "@/components/shared/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Download, FileText } from "lucide-react";
import { format, subDays } from "date-fns";

export default function WeeklyReportPage() {
  const [loading, setLoading] = useState(false);
  const [reportContent, setReportContent] = useState("");
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const handleGenerate = async () => {
    setLoading(true);
    setReportContent("");

    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate }),
      });

      const data = await response.json();

      if (response.ok) {
        setReportContent(data.content);
      } else {
        alert(data.error || "Failed to generate report");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([reportContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `weekly-report-${startDate}-to-${endDate}.md`;
    a.click();
  };

  return (
    <AppLayout
      title="Weekly Report Generator"
      description="AI-powered leadership reports in 5 minutes"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Report Configuration</h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-2 w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date</Label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-2 w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Report
                </>
              )}
            </Button>

            {reportContent && (
              <Button
                onClick={handleDownload}
                variant="outline"
                className="w-full gap-2"
              >
                <Download className="w-4 h-4" />
                Download Report
              </Button>
            )}
          </div>

          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">What's Included</h4>
            <ul className="space-y-1 text-sm text-green-800">
              <li>✅ Actions Taken & Planned</li>
              <li>✅ Agent Spotlight</li>
              <li>✅ Coaching Activity</li>
              <li>✅ Forecast & Risks</li>
              <li>✅ Key Insights & Recommendations</li>
            </ul>
          </div>
        </Card>

        {/* Report Preview */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900">Report Preview</h3>
            {reportContent && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => window.print()}>
                  Print
                </Button>
                <Button size="sm" variant="outline" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            )}
          </div>

          {!reportContent && !loading && (
            <div className="flex items-center justify-center h-[600px] text-center text-slate-400">
              <div>
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-sm">Configure dates and click generate</p>
                <p className="text-xs mt-2">AI will create a comprehensive weekly report</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center h-[600px]">
              <div className="text-center">
                <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-600" />
                <p className="text-sm text-slate-600">Analyzing team data...</p>
                <p className="text-xs text-slate-500 mt-2">Generating comprehensive report</p>
              </div>
            </div>
          )}

          {reportContent && (
            <div className="prose prose-sm max-w-none">
              <div className="bg-white border border-slate-200 rounded-lg p-8 min-h-[600px] max-h-[800px] overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700">
                  {reportContent}
                </pre>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Tips */}
      <Card className="mt-6 p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">Report Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
          <div>
            <strong className="block mb-1">✨ AI-Powered</strong>
            <p className="text-xs">Report analyzes all your team data automatically</p>
          </div>
          <div>
            <strong className="block mb-1">📧 Email-Ready</strong>
            <p className="text-xs">Professional format ready to send to leadership</p>
          </div>
          <div>
            <strong className="block mb-1">⏱ 5 Minutes</strong>
            <p className="text-xs">What used to take hours now takes minutes</p>
          </div>
        </div>
      </Card>
    </AppLayout>
  );
}

