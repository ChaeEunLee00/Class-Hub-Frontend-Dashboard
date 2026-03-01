"use client";

import { MessageCircle } from "lucide-react";

interface KakaoTemplatePreviewProps {
  body: string;
}

export function KakaoTemplatePreview({ body }: KakaoTemplatePreviewProps) {
  // Current date for the preview
  const today = new Date();
  const dateStr = `${today.getMonth() + 1}월 ${today.getDate()}일`;

  return (
    <div className="w-full h-full bg-[#ABC1D1] font-sans flex flex-col relative">
      {/* Header */}
      <div className="w-full bg-[#ABC1D1]/90 backdrop-blur-sm px-4 py-3 flex items-center justify-between border-b border-black/5 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#191F28] text-[13px] md:text-sm tracking-tight">Class Hub 알림톡</span>
        </div>
        <MessageCircle className="w-4 h-4 text-[#191F28]" />
      </div>

      {/* Content Area */}
      <div className="w-full flex-1 overflow-y-auto no-scrollbar p-4 space-y-5">
        {/* Date Divider */}
        <div className="flex justify-center">
          <span className="bg-black/10 text-white text-[10px] px-2.5 py-0.5 rounded-full backdrop-blur-[2px]">
            {dateStr}
          </span>
        </div>

        {/* Message Bubble */}
        <div className="flex items-start gap-2">
          {/* Profile Image (Simulator style) */}
          <div className="w-9 h-9 rounded-[14px] bg-white flex-shrink-0 flex items-center justify-center overflow-hidden border border-black/5 shadow-sm">
            <span className="text-xs font-black text-[#3182F6]">Ch</span>
          </div>

          <div className="flex flex-col gap-1.5 max-w-[92%]">
            <div className="text-[11px] text-[#191F28]/60 font-bold ml-1">Class Hub</div>

            <div className="flex flex-col rounded-[15px] rounded-tl-[2px] overflow-hidden shadow-sm border border-black/5">
              {/* Message Body */}
              <div className="bg-white p-3 text-[12px] md:text-[13px] text-[#191F28] leading-relaxed whitespace-pre-wrap break-keep font-medium">
                {body}
              </div>

              {/* Action Button */}
              <div className="bg-white border-t border-black/5 p-2.5 text-center cursor-default hover:bg-gray-50 transition-colors">
                <span className="text-[11px] md:text-xs font-bold text-[#3182F6]">예약 내역 보기</span>
              </div>
            </div>
          </div>
        </div>

        {/* Extra space for scroll */}
        <div className="h-6"></div>
      </div>

      {/* Input Area Mock (From Landing simulator) */}
      <div className="w-full h-[52px] bg-white flex items-center px-3 gap-2 border-t border-[#E5E5E5] shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gray-100/80 text-gray-400 flex items-center justify-center text-lg font-light">+</div>
        <div className="flex-1 h-8 bg-gray-100/80 rounded-full border border-gray-200/50"></div>
        <div className="w-10 h-8 rounded-lg bg-[#FEE500] flex items-center justify-center text-[11px] font-bold text-black/80 shadow-sm">전송</div>
      </div>
    </div>
  );
}
