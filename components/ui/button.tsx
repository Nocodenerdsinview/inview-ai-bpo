import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold uppercase tracking-wide ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A4E83C] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95 btn-ripple",
  {
    variants: {
      variant: {
        default: "bg-[#A4E83C] text-black hover:bg-[#94D82C] shadow-lg hover:shadow-xl hover:-translate-y-0.5",
        destructive:
          "bg-[#EF4444] text-white hover:bg-[#DC2626] shadow-lg hover:shadow-xl hover:-translate-y-0.5",
        outline:
          "border-2 border-white/20 bg-transparent text-white hover:border-[#A4E83C] hover:text-[#A4E83C] hover:bg-[#A4E83C]/10",
        secondary:
          "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm hover:-translate-y-0.5",
        ghost: "text-white hover:bg-white/10",
        link: "text-[#A4E83C] underline-offset-4 hover:underline hover:text-[#94D82C]",
        success: "bg-[#A4E83C] text-black hover:bg-[#94D82C] shadow-lg hover:shadow-xl hover:-translate-y-0.5",
        warning: "bg-[#FF8C42] text-white hover:bg-[#F57C32] shadow-lg hover:shadow-xl hover:-translate-y-0.5",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-14 rounded-xl px-10 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
