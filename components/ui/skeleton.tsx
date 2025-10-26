import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("skeleton animate-shimmer-glow", className)}
      {...props}
    />
  )
}

export { Skeleton }

