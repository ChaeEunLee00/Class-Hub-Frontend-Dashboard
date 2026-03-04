import React from 'react';

interface PanelProps {
  children: React.ReactNode;
  width: string; // pixel width
  bg?: string;
  className?: string;
}

export function Panel({ children, width, bg = 'bg-white', className = '' }: PanelProps) {
  return (
    <div
      className={`h-[794px] flex-shrink-0 relative overflow-hidden ${bg} ${className}`}
      style={{ width }}
    >
      {/* Removed default padding to allow child components to control their own layout/padding */}
      <div className="absolute inset-0 h-full flex flex-col box-border">
        {children}
      </div>
    </div>
  );
}
