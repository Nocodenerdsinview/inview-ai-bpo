"use client";

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  animate?: boolean;
}

export function Sparkline({ 
  data, 
  color = "#A4E83C", 
  height = 48,
  animate = true
}: SparklineProps) {
  
  if (!data || data.length === 0) {
    return null;
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  // Create smooth path with proper line rendering
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 90; // Invert Y and add 10% padding
    return { x, y };
  });

  // Build path string for connected line
  const pathData = points.map((p, i) => 
    i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
  ).join(' ');

  const gradientId = `gradient-${color.replace('#', '')}`;

  return (
    <svg 
      width="100%" 
      height={height} 
      viewBox="0 0 100 100" 
      preserveAspectRatio="none"
      className="overflow-visible"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Fill area under line */}
      <path
        d={`${pathData} L 100 100 L 0 100 Z`}
        fill={`url(#${gradientId})`}
        className={animate ? "animate-fade-in-up" : ""}
      />
      
      {/* Clean connected line - NO DASHES */}
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className={animate ? "animate-fade-in-up" : ""}
      />
    </svg>
  );
}

