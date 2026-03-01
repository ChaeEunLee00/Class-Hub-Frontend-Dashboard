'use client';

import { useEffect, useState } from 'react';
import { HelpCircle, MessageCircle, X } from 'lucide-react';
import { useCoachmark } from './hooks/useCoachmark';
import { useCoachmarkStorage } from './hooks/useCoachmarkStorage';
import type { PageId } from './data/steps';

interface FloatingGuideButtonProps {
    pageId: PageId;
}

export function FloatingGuideButton({ pageId }: FloatingGuideButtonProps) {
    const { startForPage, isActive } = useCoachmark();
    const { hasCompletedGuide } = useCoachmarkStorage();
    const [hasAutoStarted, setHasAutoStarted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // 첫 방문 시 자동으로 가이드 시작
    useEffect(() => {
        // 이미 자동 시작했거나, 가이드가 실행 중이면 건너뛰기
        if (hasAutoStarted || isActive) return;

        // 짧은 딜레이 후 체크 (페이지 렌더링 완료 대기)
        const timer = setTimeout(() => {
            if (!hasCompletedGuide(pageId)) {
                startForPage(pageId);
                setHasAutoStarted(true);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [pageId, hasCompletedGuide, startForPage, isActive, hasAutoStarted]);

    // 가이드 실행 중에는 숨기기
    if (isActive) return null;

    return (
        <div className="fixed bottom-8 right-8 z-50 w-12 h-12 group">
            {/* 팝업 메뉴들 (기본 숨김, parent(w-14 h-14) hover 시 보임) */}
            <div className="absolute bottom-full right-0 w-full pb-3 flex flex-col items-center gap-3 translate-y-4 opacity-0 scale-95 origin-bottom pointer-events-none group-hover:translate-y-0 group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-300 ease-out">
                {/* 카카오톡 문의 버튼 (서브액션) */}
                <div className="relative flex items-center justify-center">
                    <span className="absolute right-full mr-3 px-3.5 py-2 bg-[#191F28] text-white text-[13px] font-medium rounded-xl shadow-sm hidden sm:block whitespace-nowrap pointer-events-none">
                        강사 지원 카카오톡 1:1 문의
                    </span>
                    <a
                        href="https://open.kakao.com/o/smZhnnhi"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-10 h-10 bg-white text-[#4E5968] rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100/80 hover:text-[#191F28] hover:bg-gray-50 transition-colors pointer-events-auto"
                        aria-label="강사 지원 카카오톡 문의"
                    >
                        <MessageCircle className="w-4 h-4" />
                    </a>
                </div>

                {/* 가이드 보기 버튼 (서브액션) */}
                <div className="relative flex items-center justify-center">
                    <span className="absolute right-full mr-3 px-3.5 py-2 bg-[#191F28] text-white text-[13px] font-medium rounded-xl shadow-sm hidden sm:block whitespace-nowrap pointer-events-none">
                        현 화면 가이드 보기
                    </span>
                    <button
                        onClick={() => startForPage(pageId)}
                        className="flex items-center justify-center w-10 h-10 bg-white text-[#4E5968] rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100/80 hover:text-[#191F28] hover:bg-gray-50 transition-colors pointer-events-auto"
                        aria-label="화면 가이드 보기"
                    >
                        <HelpCircle className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* 메인 다이얼 버튼 */}
            <button
                className="absolute inset-0 flex items-center justify-center w-full h-full bg-[#3182F6] text-white rounded-full shadow-[0_4px_20px_rgba(49,130,246,0.3)] hover:bg-[#1B64DA] transition-all duration-300 hover:-translate-y-1 active:scale-95"
                aria-label="고객지원 메뉴"
            >
                {/* 호버 시 아이콘 크로스페이드 트랜지션 */}
                <div className="relative w-5 h-5">
                    <HelpCircle className="absolute inset-0 w-5 h-5 transition-all duration-300 group-hover:opacity-0 group-hover:-rotate-90 group-hover:scale-50" />
                    <X className="absolute inset-0 w-5 h-5 opacity-0 rotate-90 scale-50 transition-all duration-300 group-hover:opacity-100 group-hover:rotate-0 group-hover:scale-100" />
                </div>
            </button>
        </div>
    );
}
