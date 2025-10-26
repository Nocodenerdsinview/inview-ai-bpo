"use client";

import { useState } from "react";
import { DragDropZone } from "@/components/upload/drag-drop-zone";
import { FilePreview } from "@/components/upload/file-preview";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, FileText, AlertCircle } from "lucide-react";

interface UploadHistory {
  id: number;
  filename: string;
  fileType: string;
  reportType: string | null;
  status: string;
  recordsProcessed: number | null;
  errors: string | null;
  createdAt: string;
}

interface UploadClientProps {
  uploadHistory: UploadHistory[];
}

export function UploadClient({ uploadHistory }: UploadClientProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [processResult, setProcessResult] = useState<any>(null);

  const handleFilesSelected = async (files: File[]) => {
    setSelectedFiles(files);
    
    if (files.length > 0) {
      // Automatically analyze the first file
      await analyzeFile(files[0]);
    }
  };

  const analyzeFile = async (file: File) => {
    setAnalyzing(true);
    setCurrentFile(file);
    setAnalysis(null);
    setProcessResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to analyze file');
      }

      const result = await response.json();
      setAnalysis(result.analysis);
    } catch (error) {
      console.error('Analysis error:', error);
      alert(error instanceof Error ? error.message : 'Failed to analyze file');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConfirmUpload = async (confirmedAnalysis: any) => {
    if (!currentFile) return;

    setProcessing(true);
    setProcessResult(null);

    try {
      const formData = new FormData();
      formData.append('file', currentFile);
      formData.append('reportType', confirmedAnalysis.reportType);
      formData.append('dateStart', confirmedAnalysis.dateRange.start);
      formData.append('dateEnd', confirmedAnalysis.dateRange.end);

      const response = await fetch('/api/upload/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process file');
      }

      const result = await response.json();
      setProcessResult(result);
      
      // Clear selections on success
      setTimeout(() => {
        setSelectedFiles([]);
        setCurrentFile(null);
        setAnalysis(null);
        window.location.reload(); // Reload to show new upload in history
      }, 3000);
    } catch (error) {
      console.error('Processing error:', error);
      alert(error instanceof Error ? error.message : 'Failed to process file');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectFile = () => {
    setCurrentFile(null);
    setAnalysis(null);
    setSelectedFiles([]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "processing":
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case "completed_with_errors":
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      default:
        return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "failed":
        return "bg-red-100 text-red-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "completed_with_errors":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-8">
      {/* Upload Area */}
      {!analysis && (
        <DragDropZone
          onFilesSelected={handleFilesSelected}
          maxFiles={1}
        />
      )}

      {/* Analyzing State */}
      {analyzing && (
        <Card className="p-12 text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Analyzing file...
          </h3>
          <p className="text-sm text-slate-600">
            Using AI to detect file type and validate data
          </p>
        </Card>
      )}

      {/* File Preview & Confirmation */}
      {analysis && currentFile && !processing && !processResult && (
        <FilePreview
          fileName={currentFile.name}
          analysis={analysis}
          onConfirm={handleConfirmUpload}
          onReject={handleRejectFile}
        />
      )}

      {/* Processing State */}
      {processing && (
        <Card className="p-12 text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Processing and importing data...
          </h3>
          <p className="text-sm text-slate-600">
            This may take a few moments
          </p>
        </Card>
      )}

      {/* Process Result */}
      {processResult && (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-start gap-4">
            <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Upload Successful!
              </h3>
              <p className="text-sm text-green-700 mb-3">
                {processResult.message}
              </p>
              {processResult.errors && processResult.errors.length > 0 && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm font-semibold text-amber-900 mb-2">
                    Errors encountered:
                  </p>
                  <ul className="text-xs text-amber-700 space-y-1">
                    {processResult.errors.slice(0, 5).map((error: string, i: number) => (
                      <li key={i}>• {error}</li>
                    ))}
                    {processResult.errors.length > 5 && (
                      <li>... and {processResult.errors.length - 5} more</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Upload History */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Upload History</h2>
        
        {uploadHistory.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No uploads yet</h3>
            <p className="text-slate-600">Upload your first file to get started</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {uploadHistory.map((upload) => (
              <Card key={upload.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-100 rounded-lg">
                    <FileText className="w-6 h-6 text-slate-600" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-slate-900">{upload.filename}</h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {upload.reportType && (
                            <span className="capitalize">{upload.reportType} Report</span>
                          )}
                          {" • "}
                          <span className="capitalize">{upload.fileType}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusIcon(upload.status)}
                        <Badge className={getStatusColor(upload.status)}>
                          {upload.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-slate-600 mt-3">
                      {upload.recordsProcessed !== null && (
                        <span>{upload.recordsProcessed} records processed</span>
                      )}
                      <span>Uploaded {new Date(upload.createdAt).toLocaleDateString()}</span>
                    </div>

                    {upload.errors && (
                      <div className="mt-3 p-3 bg-red-50 rounded-lg text-sm text-red-700">
                        <span className="font-semibold">Errors:</span> {upload.errors}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

