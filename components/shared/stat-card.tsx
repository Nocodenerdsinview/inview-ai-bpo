import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  color?: string;
  className?: string;
}

export function StatCard({ 
  icon: Icon, 
  value, 
  label, 
  color = "#A4E83C",
  className 
}: StatCardProps) {
  return (
    <div className={cn("glass-card p-8 shadow-premium text-center", className)}>
      <div 
        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="w-7 h-7" style={{ color }} />
      </div>
      <p className="metric-number-xl text-white mb-2">{value}</p>
      <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
        {label}
      </p>
    </div>
  );
}

