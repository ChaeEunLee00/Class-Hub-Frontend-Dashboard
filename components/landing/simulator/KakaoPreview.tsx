"use client";

import { MessageCircle } from 'lucide-react';

interface KakaoPreviewProps {
    className: string;
    studentName: string;
    date: string;
    startTime: string;
    location: string;
    materials?: string;
    parking?: string;
}

export const KakaoPreview = ({
    className = "",
    studentName = "홍길동",
    date = "",
    startTime = "",
    location = "",
    materials = "",
    parking = "",
}: KakaoPreviewProps) => {

    const messages = [
        {
            type: "CONFIRMED",
            date: "3월 1일 (신청 당일)",
            content: `[Class Hub] 예약 완료 안내\n\n안녕하세요, ${studentName}님!\n\n${className || "클래스명"} 클래스 예약이 확정되었습니다.\n\n📅 일시: ${date} ${startTime}\n📍 장소: ${location}\n\n클래스 상세 정보는 아래 버튼을 통해 확인해 주세요.\n\n감사합니다.`
        },
        {
            type: "D-3",
            date: "3월 12일 (수업 3일 전)",
            content: `[Class Hub] 수업 3일 전 안내\n\n안녕하세요, ${studentName}님!\n\n${className || "클래스명"} 클래스가 3일 후에 시작됩니다.\n\n📅 일시: ${date} ${startTime}\n📍 장소: ${location}\n🎒 준비물: ${materials || '없음'}\n\n클래스 상세 정보는 아래 버튼을 통해 확인해 주세요.\n\n감사합니다.`
        },
        {
            type: "D-1",
            date: "3월 14일 (수업 1일 전)",
            content: `[Class Hub] 수업 하루 전 안내\n\n안녕하세요, ${studentName}님!\n\n${className || "클래스명"} 클래스가 내일 진행됩니다.\n\n📅 일시: ${date} ${startTime}\n📍 장소: ${location}\n🚗 주차: ${parking || '불가'}\n🎒 준비물: ${materials || '없음'}\n\n클래스 상세 정보는 아래 버튼을 통해 확인해 주세요.\n\n감사합니다.`
        }
    ];

    return (
        <div className="w-full h-full bg-[#ABC1D1] flex flex-col items-center overflow-hidden relative font-sans">
            {/* Fake Status Bar */}
            <div className="w-full h-7 bg-[#ABC1D1] flex justify-between items-center px-6 text-[10px] font-bold text-black z-20">
                <span>9:42</span>
                <div className="flex gap-1.5">
                    <div className="w-3.5 h-2.5 bg-black rounded-[1px]"></div>
                    <div className="w-3.5 h-2.5 bg-black rounded-[1px]"></div>
                </div>
            </div>

            {/* Kakao Header */}
            <div className="w-full bg-[#ABC1D1]/90 backdrop-blur-sm z-10 px-4 py-2 flex items-center justify-between relative shrink-0 border-b border-black/5">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-[#191F28] text-sm">Class Hub 알림톡</span>
                    <span className="text-[10px] text-gray-600 bg-gray-200/50 px-1.5 rounded">3</span>
                </div>
                <MessageCircle className="w-4 h-4 text-gray-700" />
            </div>

            <div className="w-full flex-1 overflow-y-auto px-4 py-4 scrollbar-hide space-y-6">

                {messages.map((msg, idx) => (
                    <div key={idx} className="flex flex-col gap-2">
                        {/* Date Divider */}
                        <div className="flex justify-center">
                            <span className="bg-black/10 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
                                {msg.date}
                            </span>
                        </div>

                        {/* Message Bubble */}
                        <div className="flex items-start gap-2">
                            <div className="w-8 h-8 rounded-[12px] bg-white flex-shrink-0 flex items-center justify-center overflow-hidden border border-black/5 shadow-sm">
                                <span className="text-xs font-black text-[#3182F6]">Ch</span>
                            </div>
                            <div className="flex flex-col gap-1 max-w-[75%]">
                                <div className="text-[10px] text-gray-600 font-medium ml-1">Class Hub</div>
                                <div className="bg-white rounded-[14px] rounded-tl-[2px] p-2.5 shadow-sm text-[11px] text-[#191F28] leading-relaxed whitespace-pre-wrap break-keep">
                                    {msg.content}
                                </div>
                                <div className="bg-white rounded-[8px] p-2 shadow-sm text-center border border-black/5 cursor-pointer active:bg-gray-50 transition-colors">
                                    <span className="text-[10px] font-bold text-[#191F28]">예약 내역 보기</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

            </div>

            {/* Input Area Mock */}
            <div className="w-full h-11 bg-white flex items-center px-3 gap-2 border-t border-[#E5E5E5]">
                <div className="w-6 h-6 rounded-md bg-gray-100 text-gray-400 flex items-center justify-center text-xs">+</div>
                <div className="flex-1 h-7 bg-gray-100 rounded-full border border-gray-200"></div>
                <div className="w-6 h-6 rounded-md bg-[#FEE500] flex items-center justify-center text-[10px] font-bold text-black/80">전송</div>
            </div>
        </div>
    );
};
