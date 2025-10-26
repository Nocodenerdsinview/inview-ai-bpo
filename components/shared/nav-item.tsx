"use client";

import { useState } from "react";
import Link from "next/link";
import { LucideIcon, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubItem {
  label: string;
  active?: boolean;
  href?: string;
}

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  badge?: string;
  badgeColor?: "default" | "red" | "blue";
  expandable?: boolean;
  defaultExpanded?: boolean;
  subItems?: SubItem[];
  href?: string;
  onClick?: () => void;
}

export function NavItem({ 
  icon: Icon, 
  label, 
  active, 
  badge, 
  badgeColor = "default", 
  expandable, 
  defaultExpanded = false,
  subItems, 
  href = "#",
  onClick
}: NavItemProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleClick = (e: React.MouseEvent) => {
    if (expandable) {
      e.preventDefault();
      setExpanded(!expanded);
    }
    onClick?.();
  };

  return (
    <div>
      <Link
        href={href}
        onClick={handleClick}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative",
          active
            ? "bg-[#A4E83C]/10 text-[#A4E83C]"
            : "text-gray-400 hover:text-white hover:bg-white/5"
        )}
      >
        {/* Active Indicator */}
        {active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#A4E83C] rounded-r-full" />
        )}
        
        {/* Icon */}
        <Icon className={cn(
          "w-5 h-5 flex-shrink-0",
          active ? "text-[#A4E83C]" : "text-gray-500 group-hover:text-white"
        )} />
        
        {/* Label */}
        <span className="flex-1">{label}</span>
        
        {/* Badge */}
        {badge && (
          <span className={cn(
            "px-1.5 py-0.5 text-[10px] font-bold rounded-md",
            badgeColor === "red" 
              ? "bg-[#EF4444]/20 text-[#EF4444]"
              : badgeColor === "blue"
              ? "bg-[#3B82F6]/20 text-[#3B82F6]"
              : "bg-white/10 text-gray-400"
          )}>
            {badge}
          </span>
        )}
        
        {/* Expand Arrow */}
        {expandable && (
          <ChevronRight className={cn(
            "w-4 h-4 text-gray-500 transition-transform",
            expanded && "rotate-90"
          )} />
        )}
      </Link>
      
      {/* Sub Items */}
      {expandable && expanded && subItems && (
        <div className="ml-11 mt-1 space-y-1">
          {subItems.map((item, i) => (
            <Link
              key={i}
              href={item.href || "#"}
              className={cn(
                "block px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                item.active
                  ? "text-white bg-white/5"
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

