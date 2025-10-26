import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DataCardProps {
  children: ReactNode;
  className?: string;
}

export function DataCard({ children, className }: DataCardProps) {
  return (
    <div className={cn(
      "glass-card p-6 shadow-premium hover:shadow-premium-xl transition-all duration-300",
      className
    )}>
      {children}
    </div>
  );
}

