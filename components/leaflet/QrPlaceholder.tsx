import React from 'react';
import { QrCode } from 'lucide-react';

interface QrPlaceholderProps {
  label: string;
  caption?: string;
  size?: string; // Tailwind class for size, e.g., 'w-32 h-32'
  className?: string;
}

export function QrPlaceholder({ label, caption, size = 'w-32 h-32', className = '' }: QrPlaceholderProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`${size} bg-gray-100 border-2 border-dashed border-gray-400 flex flex-col items-center justify-center p-2 text-center`}>
        <QrCode className="w-1/3 h-1/3 text-gray-400 mb-2" />
        <span className="text-[10px] text-gray-500 font-mono break-all leading-tight">{label}</span>
      </div>
      {caption && (
        <p className="mt-2 text-sm text-gray-600 font-medium text-center">{caption}</p>
      )}
    </div>
  );
}
