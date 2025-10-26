"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadClient } from "./upload-client";
import { ManualEntryForm } from "@/components/kpi/manual-entry-form";
import { BulkEntryForm } from "@/components/kpi/bulk-entry-form";
import { Upload, Edit, Table2 } from "lucide-react";

interface KPIManagementClientProps {
  uploadHistory: any[];
}

export function KPIManagementClient({ uploadHistory }: KPIManagementClientProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    // Trigger a refresh of the upload history
    setRefreshKey((prev) => prev + 1);
    // In a real app, you might want to refetch the upload history here
  };

  return (
    <Tabs defaultValue="upload" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/5 border border-white/10 p-2">
        <TabsTrigger 
          value="upload" 
          className="flex items-center gap-2 uppercase font-bold tracking-wide data-[state=active]:bg-[#A4E83C] data-[state=active]:text-black"
        >
          <Upload className="w-4 h-4" />
          <span>File Upload</span>
        </TabsTrigger>
        <TabsTrigger 
          value="manual" 
          className="flex items-center gap-2 uppercase font-bold tracking-wide data-[state=active]:bg-[#A4E83C] data-[state=active]:text-black"
        >
          <Edit className="w-4 h-4" />
          <span>Manual Entry</span>
        </TabsTrigger>
        <TabsTrigger 
          value="bulk" 
          className="flex items-center gap-2 uppercase font-bold tracking-wide data-[state=active]:bg-[#A4E83C] data-[state=active]:text-black"
        >
          <Table2 className="w-4 h-4" />
          <span>Bulk Entry</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upload" className="space-y-6">
        <div className="glass-card p-6 border-[#3B82F6]/30 mb-6">
          <h4 className="font-bold text-xl text-white uppercase tracking-wide mb-3">File Upload</h4>
          <p className="text-sm text-gray-300">
            Upload Excel or CSV files containing KPI data. Our AI will automatically detect the
            report type, match agent names, and validate the data before importing.
          </p>
        </div>
        <UploadClient uploadHistory={uploadHistory} />
      </TabsContent>

      <TabsContent value="manual" className="space-y-6">
        <div className="glass-card p-6 border-[#A4E83C]/30 mb-6">
          <h4 className="font-bold text-xl text-white uppercase tracking-wide mb-3">Manual Entry</h4>
          <p className="text-sm text-gray-300">
            Manually enter KPI data for individual agents. Perfect for quick updates or one-off
            entries. Select an agent, date, and enter the KPI values you want to record.
          </p>
        </div>
        <ManualEntryForm onSuccess={handleSuccess} />
      </TabsContent>

      <TabsContent value="bulk" className="space-y-6">
        <div className="glass-card p-6 border-[#EC4899]/30 mb-6">
          <h4 className="font-bold text-xl text-white uppercase tracking-wide mb-3">Bulk Entry</h4>
          <p className="text-sm text-gray-300">
            Enter multiple KPI records at once using a spreadsheet-like interface. Add rows for
            different agents and dates, then save all at once. You can also download a CSV template
            to fill out offline.
          </p>
        </div>
        <BulkEntryForm onSuccess={handleSuccess} />
      </TabsContent>
    </Tabs>
  );
}

