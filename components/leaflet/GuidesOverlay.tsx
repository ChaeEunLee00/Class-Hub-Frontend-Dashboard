import React from 'react';

interface GuidesOverlayProps {
  type: 'outside' | 'inside';
}

export function GuidesOverlay({ type }: GuidesOverlayProps) {
  // Outside: 97mm | 100mm | 100mm -> Folds at 97, 197
  // Inside: 100mm | 100mm | 97mm -> Folds at 100, 200

  const fold1 = type === 'outside' ? 367 : 378; // 97mm or 100mm
  const fold2 = type === 'outside' ? 745 : 756; // 197mm or 200mm

  return (
    <div className="absolute inset-0 pointer-events-none z-50 print:hidden overflow-hidden">
      {/* Fold Line 1 */}
      <div 
        className="absolute top-0 bottom-0 border-l border-dashed border-cyan-400 w-px"
        style={{ left: `${fold1}px` }}
      >
        <span className="bg-cyan-100/80 text-cyan-600 text-[10px] px-1 absolute top-2 left-1 whitespace-nowrap rounded">
          Fold 1 ({type === 'outside' ? '97mm' : '100mm'})
        </span>
      </div>
      
      {/* Fold Line 2 */}
      <div 
        className="absolute top-0 bottom-0 border-l border-dashed border-cyan-400 w-px"
        style={{ left: `${fold2}px` }}
      >
        <span className="bg-cyan-100/80 text-cyan-600 text-[10px] px-1 absolute top-2 left-1 whitespace-nowrap rounded">
          Fold 2 ({type === 'outside' ? '197mm' : '200mm'})
        </span>
      </div>

      {/* Bleed Guide (3mm = ~11px) */}
      <div className="absolute inset-0 border-[11px] border-pink-500/20 pointer-events-none">
        <span className="bg-pink-100/80 text-pink-600 text-[10px] px-1 absolute bottom-2 right-2 rounded">Bleed (3mm)</span>
      </div>
      
      {/* Safe Area (5mm = ~19px from edge of each panel) */}
      {/* Simplified safe area visualization - just a global box with padding? No, per panel. */}
    </div>
  );
}
