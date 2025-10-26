"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertCircle, Edit2 } from "lucide-react";
import { useState } from "react";

interface FileAnalysisResult {
  reportType: 'quality' | 'aht' | 'srr' | 'voc' | 'hold' | 'audit' | 'unknown';
  confidence: number;
  dateRange: { start: string; end: string };
  agentsFound: string[];
  columnsDetected: Array<{
    name: string;
    type: string;
    format: string;
  }>;
  issues: string[];
  preview: any[][];
}

interface FilePreviewProps {
  fileName: string;
  analysis: FileAnalysisResult;
  onConfirm: (analysis: FileAnalysisResult) => void;
  onReject: () => void;
}

export function FilePreview({ fileName, analysis, onConfirm, onReject }: FilePreviewProps) {
  const [editedAnalysis, setEditedAnalysis] = useState(analysis);
  const [isEditing, setIsEditing] = useState(false);

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'quality':
        return 'bg-blue-100 text-blue-700';
      case 'aht':
        return 'bg-purple-100 text-purple-700';
      case 'srr':
        return 'bg-green-100 text-green-700';
      case 'voc':
        return 'bg-amber-100 text-amber-700';
      case 'audit':
        return 'bg-pink-100 text-pink-700';
      case 'unknown':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (confidence >= 50) {
      return <AlertCircle className="w-5 h-5 text-amber-600" />;
    } else {
      return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-semibold text-slate-900 mb-1">{fileName}</h3>
          <div className="flex items-center gap-3 mt-2">
            <Badge className={getReportTypeColor(editedAnalysis.reportType)}>
              {editedAnalysis.reportType.toUpperCase()} Report
            </Badge>
            <div className="flex items-center gap-1 text-sm text-slate-600">
              {getConfidenceIcon(editedAnalysis.confidence)}
              <span>{editedAnalysis.confidence}% confidence</span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Edit2 className="w-4 h-4 mr-2" />
          {isEditing ? 'Done Editing' : 'Edit'}
        </Button>
      </div>

      {/* Date Range */}
      <div className="mb-4">
        <div className="text-sm font-semibold text-slate-700 mb-1">Date Range</div>
        <div className="text-sm text-slate-600">
          {editedAnalysis.dateRange.start} to {editedAnalysis.dateRange.end}
        </div>
      </div>

      {/* Agents Found */}
      <div className="mb-4">
        <div className="text-sm font-semibold text-slate-700 mb-2">
          Agents Found ({editedAnalysis.agentsFound.length})
        </div>
        <div className="flex flex-wrap gap-2">
          {editedAnalysis.agentsFound.map((agent, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {agent}
            </Badge>
          ))}
        </div>
      </div>

      {/* Data Preview */}
      <div className="mb-4">
        <div className="text-sm font-semibold text-slate-700 mb-2">
          Data Preview (First 5 Rows)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border border-slate-200">
            <tbody>
              {editedAnalysis.preview.slice(0, 5).map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={rowIndex === 0 ? 'bg-slate-100 font-semibold' : ''}
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="border border-slate-200 px-2 py-1 text-slate-700"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Columns Detected */}
      <div className="mb-4">
        <div className="text-sm font-semibold text-slate-700 mb-2">
          Columns Detected
        </div>
        <div className="space-y-1">
          {editedAnalysis.columnsDetected.map((col, index) => (
            <div key={index} className="text-xs text-slate-600 flex items-center gap-2">
              <span className="font-medium">{col.name}:</span>
              <span className="text-slate-500">{col.type}</span>
              <span className="text-slate-400">({col.format})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Issues */}
      {editedAnalysis.issues.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-semibold text-red-700 mb-2">Issues Found</div>
          <div className="space-y-1">
            {editedAnalysis.issues.map((issue, index) => (
              <div key={index} className="flex items-start gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{issue}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t">
        <Button
          onClick={() => onConfirm(editedAnalysis)}
          className="flex-1"
          disabled={editedAnalysis.issues.length > 0}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Confirm & Import
        </Button>
        <Button
          onClick={onReject}
          variant="outline"
          className="flex-1"
        >
          <XCircle className="w-4 h-4 mr-2" />
          Reject
        </Button>
      </div>
    </Card>
  );
}

