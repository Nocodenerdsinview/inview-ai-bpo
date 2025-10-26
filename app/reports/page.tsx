import { AppLayout } from "@/components/shared/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Plus } from "lucide-react";

export default function ReportsPage() {
  return (
    <AppLayout
      title="Reports"
      description="Generate and view leadership reports"
    >
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#1A1A1A] to-[#2d2d2d] rounded-3xl border border-white/5 p-16 text-center mb-8 shadow-premium-xl border-l-4 border-l-[#A4E83C] overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }}></div>
        </div>
        
        <div className="relative z-10">
          <div className="w-24 h-24 bg-[#A4E83C]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-12 h-12 text-[#A4E83C]" />
          </div>
          <h2 className="text-5xl font-bold uppercase tracking-wide mb-4 text-white">Weekly Reports</h2>
          <p className="text-gray-500 mb-8 text-lg">AI-powered reports ready for download</p>
          <Button className="gap-2 px-8 py-6 text-lg">
            <Plus className="w-5 h-5" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold uppercase tracking-wide text-white mb-2">This Week</h3>
          <p className="text-sm text-gray-400 mb-6">Report ready for download</p>
          <Button variant="secondary" className="w-full gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>

        <div className="glass-card p-6 opacity-50">
          <h3 className="text-xl font-bold uppercase tracking-wide text-white mb-2">Last Week</h3>
          <p className="text-sm text-gray-400 mb-6">Oct 14-20, 2025</p>
          <Button variant="secondary" className="w-full gap-2" disabled>
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>

        <div className="glass-card p-6 opacity-50">
          <h3 className="text-xl font-bold uppercase tracking-wide text-white mb-2">2 Weeks Ago</h3>
          <p className="text-sm text-gray-400 mb-6">Oct 7-13, 2025</p>
          <Button variant="secondary" className="w-full gap-2" disabled>
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}

