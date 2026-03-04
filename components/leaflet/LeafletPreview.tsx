"use client";
import React, { useState, useRef } from 'react';
import { OutsideFrame } from './OutsideFrame';
import { InsideFrame } from './InsideFrame';
import { Printer, ZoomIn, ZoomOut, Monitor } from 'lucide-react';

import { GuidesOverlay } from './GuidesOverlay';

export function LeafletPreview() {
  const [scale, setScale] = useState(0.8);
  const showGuides = false;
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Toolbar */}
      <div className="sticky top-0 z-50 bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm print:hidden">
        <div className="flex items-center gap-4">
          <h1 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Monitor size={20} className="text-blue-600" />
            Class Hub Leaflet
          </h1>
        </div>

        <div className="flex items-center gap-2">

          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 mr-4">
            <button
              onClick={() => setScale(s => Math.max(0.3, s - 0.1))}
              className="p-2 hover:bg-white rounded text-slate-600"
              title="Zoom Out"
            >
              <ZoomOut size={18} />
            </button>
            <span className="text-xs font-mono w-12 text-center">{Math.round(scale * 100)}%</span>
            <button
              onClick={() => setScale(s => Math.min(1.5, s + 0.1))}
              className="p-2 hover:bg-white rounded text-slate-600"
              title="Zoom In"
            >
              <ZoomIn size={18} />
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            <Printer size={16} />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-8 flex flex-col items-center gap-12 print:p-0 print:block print:overflow-visible"
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            marginBottom: `-${(1 - scale) * 794}px` // Compensate for scale height reduction
          }}
          className="space-y-12 print:transform-none print:space-y-0 print:m-0"
        >
          {/* OUTSIDE FRAME */}
          <div className="relative group shadow-2xl print:shadow-none">
            {showGuides && <GuidesOverlay type="outside" />}
            <div className="print:break-after-page print:page-break-after-always print:w-[297mm] print:h-[210mm] print:overflow-hidden print:block">
              <OutsideFrame />
            </div>
          </div>

          {/* INSIDE FRAME */}
          <div className="relative group shadow-2xl print:shadow-none">
            {showGuides && <GuidesOverlay type="inside" />}
            <div className="print:w-[297mm] print:h-[210mm] print:overflow-hidden print:block">
              <InsideFrame />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page { 
            size: A4 landscape; 
            margin: 0;
          }
          html, body { 
            margin: 0;
            padding: 0;
            width: 297mm;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}