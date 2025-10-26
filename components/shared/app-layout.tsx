"use client";

import { Sidebar } from "./sidebar";
import { AppHeader } from "./app-header";
import { DateFilter } from "./date-filter";
import { format } from "date-fns";

export function AppLayout({
  children,
  title,
  description,
  useNewHeader = false,
  activeAgents,
  totalAgents,
  alertCount,
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
  useNewHeader?: boolean;
  activeAgents?: number;
  totalAgents?: number;
  alertCount?: number;
}) {
  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">
      <Sidebar />
      
      {/* Floating Date Filter - Fixed Top Right */}
      <div className="fixed top-6 right-8 z-50 flex items-center gap-3 animate-fade-scale">
        <span className="text-xs text-gray-500 font-medium">
          Updated: {format(new Date(), 'HH:mm')}
        </span>
        <DateFilter />
      </div>
      
      <div className="flex-1 ml-64">
        {/* Use new premium header or fallback to simple header */}
        {useNewHeader && title ? (
          <AppHeader
            title={title}
            description={description}
            activeAgents={activeAgents}
            totalAgents={totalAgents}
            alertCount={alertCount}
          />
        ) : (
          title && (
            <header className="sticky top-0 z-10 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5">
              <div className="px-8 py-6">
                <h1 className="text-3xl font-bold uppercase tracking-wide text-white mb-2">{title}</h1>
                {description && <p className="text-sm text-gray-500 font-medium">{description}</p>}
              </div>
            </header>
          )
        )}

        {/* Main Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

