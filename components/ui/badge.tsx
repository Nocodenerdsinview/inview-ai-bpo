import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide transition-all duration-200 focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#A4E83C]/20 text-[#A4E83C] border border-[#A4E83C]/30 hover:bg-[#A4E83C]/30",
        secondary:
          "bg-white/10 text-white border border-white/20 hover:bg-white/20",
        destructive:
          "bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30 hover:bg-[#EF4444]/30",
        success:
          "bg-[#A4E83C]/20 text-[#A4E83C] border border-[#A4E83C]/30 hover:bg-[#A4E83C]/30",
        warning:
          "bg-[#FF8C42]/20 text-[#FF8C42] border border-[#FF8C42]/30 hover:bg-[#FF8C42]/30",
        info:
          "bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30 hover:bg-[#3B82F6]/30",
        outline: "border-2 border-white/20 text-white hover:border-white/30 hover:bg-white/10 bg-transparent",
        outlineSuccess: "border-2 border-[#A4E83C]/30 text-[#A4E83C] hover:bg-[#A4E83C]/10 bg-transparent",
        outlineWarning: "border-2 border-[#FF8C42]/30 text-[#FF8C42] hover:bg-[#FF8C42]/10 bg-transparent",
        outlineDanger: "border-2 border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444]/10 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
