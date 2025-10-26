import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="relative bg-gradient-to-r from-[#1A1A1A] to-[#2d2d2d] 
                    rounded-2xl border border-white/5 p-8 mb-8 shadow-premium 
                    border-l-4 border-l-[#A4E83C] overflow-hidden">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }}
        ></div>
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold uppercase tracking-wide text-white mb-2">
            {title}
          </h1>
          {description && (
            <p className="text-gray-500">{description}</p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

