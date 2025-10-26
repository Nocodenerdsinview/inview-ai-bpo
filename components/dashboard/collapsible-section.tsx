"use client";

import React, { useState } from "react";
import { ChevronDown, LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CollapsibleSectionProps {
  title: string;
  icon?: LucideIcon;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  badge?: string;
}

export function CollapsibleSection({
  title,
  icon: Icon,
  defaultExpanded = true,
  children,
  badge,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="glass-card rounded-xl overflow-hidden animate-fade-scale">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-6 h-6 text-[#A4E83C]" />}
          <h2 className="text-2xl font-bold uppercase tracking-wide text-white">
            {title}
          </h2>
          {badge && (
            <Badge className="bg-[#A4E83C]/20 text-[#A4E83C] border-none">
              {badge}
            </Badge>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Content with smooth expand/collapse */}
      <div
        className={`transition-all duration-500 ease-in-out ${
          isExpanded ? "max-h-[10000px] opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>
  );
}

