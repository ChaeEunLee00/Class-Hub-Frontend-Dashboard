'use client';

import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react';

// ClassDetailResponse type matching share/lib/api/types.ts
export interface ClassDetailResponse {
    id: number | string;
    classCode?: string;
    name?: string;
    imageUrls?: string[];
    description?: string;
    location?: string;
    locationDescription?: string;
    preparation?: string;
    parkingInfo?: string;
    guidelines?: string;
    policy?: string;
    instructorId?: number | string;
    linkShareStatus?: string;
    cancellationPolicy?: string;
    locationDetails?: string;
    instructions?: string;
    profileUrl?: string;
    instructorName?: string;
}

interface ClassPreviewProps {
    classDetail: ClassDetailResponse;
    showHeader?: boolean;
    className?: string;
}

export const ClassPreview: React.FC<ClassPreviewProps> = ({
    classDetail,
    showHeader = true,
    className = ''
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = classDetail.imageUrls || [];
    const hasMultipleImages = images.length > 1;
    const hasImages = images.length > 0;

    const hasAnyInfo =
        classDetail.preparation ||
        classDetail.parkingInfo ||
        classDetail.instructions ||
        classDetail.guidelines;

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? images.length - 1 : prev - 1
        );
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) =>
            prev === images.length - 1 ? 0 : prev + 1
        );
    };

    return (
        <div className={`space-y-0 ${className}`}>
            {/* ================= 이미지 영역 ================= */}
            {hasImages ? (
                <div className="w-full h-80 relative bg-gray-100 overflow-hidden">
                    {/* ❗ 이미지 자체는 pointer-events 막아서 휠 통과 */}
                    <img
                        src={images[currentImageIndex]}
                        alt={classDetail.name || '클래스 이미지'}
                        className="w-full h-full object-cover pointer-events-none"
                        draggable={false}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                    {hasMultipleImages && (
                        <>
                            {/* 이전 버튼 */}
                            <button
                                onClick={handlePrevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10"
                                aria-label="이전 이미지"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            {/* 다음 버튼 */}
                            <button
                                onClick={handleNextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10"
                                aria-label="다음 이미지"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            {/* 인디케이터 */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                {images.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex
                                            ? 'bg-white w-6'
                                            : 'bg-white/60'
                                            }`}
                                        aria-label={`이미지 ${index + 1}`}
                                    />
                                ))}
                            </div>

                            {/* 이미지 카운터 */}
                            <div className="absolute top-4 right-4 bg-black/60 text-white text-sm px-3 py-1.5 rounded-full z-10">
                                {currentImageIndex + 1} / {images.length}
                            </div>
                        </>
                    )}
                </div>
            ) : (
                /* 이미지 없을 때 */
                <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-50 flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-400">대표 이미지를 추가해보세요</p>
                </div>
            )}

            {/* ================= 텍스트 영역 ================= */}
            <div className="px-5 pt-8 pb-4">
                {showHeader && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between gap-2">
                            <span className="inline-block px-2.5 py-1 bg-[#E8F3FF] text-[#3182F6] text-[11px] font-bold rounded-md">
                                원데이 클래스
                            </span>
                            {classDetail.profileUrl && (
                                <a
                                    href={classDetail.profileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-[#8B95A1] hover:text-[#4E5968] text-xs font-medium transition-colors"
                                >
                                    강사 프로필
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </a>
                            )}
                        </div>

                        {classDetail.name ? (
                            <h1 className="text-2xl font-bold text-[#191F28] leading-snug">
                                {classDetail.name}
                            </h1>
                        ) : (
                            <p className="text-lg text-gray-400">클래스명을 입력해주세요</p>
                        )}

                        <div className="space-y-1.5 pt-1">
                            {classDetail.location ? (
                                <>
                                    <p className="text-[#4E5968] text-[15px] flex items-center gap-1.5 font-medium">
                                        <span className="text-lg">📍</span> {classDetail.location}
                                    </p>
                                    {(classDetail.locationDetails || classDetail.locationDescription) && (
                                        <p className="text-[#8B95A1] text-xs ml-7 leading-relaxed whitespace-pre-wrap">
                                            {classDetail.locationDetails || classDetail.locationDescription}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <p className="text-gray-400 text-[15px] flex items-center gap-1.5">
                                    <span className="text-lg">📍</span> 장소를 입력해주세요
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* 상세 설명 */}
                <div className="mt-8 space-y-4">
                    <h3 className="font-bold text-[#191F28] text-lg">💡 클래스 소개</h3>
                    {classDetail.description ? (
                        <div className="text-[15px] text-[#4E5968] leading-relaxed whitespace-pre-wrap">
                            {classDetail.description}
                        </div>
                    ) : (
                        <div className="text-[15px] text-gray-400 leading-relaxed bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-200">
                            클래스 소개글을 작성하면 여기에 표시됩니다.
                            <br />
                            <span className="text-xs">자세히 작성할수록 수강생의 이해도가 높아져요!</span>
                        </div>
                    )}
                </div>

                {/* 핵심 정보 카드 - 내용이 있을 때만 표시 */}
                {hasAnyInfo ? (
                    <div className="mt-8 grid grid-cols-1 gap-4">
                        <div className="bg-[#F9FAFB] rounded-2xl p-5 space-y-4 shadow-sm border border-gray-50">
                            <h4 className="font-bold text-[#333D4B] text-sm flex items-center gap-2">
                                📋 확인해 주세요
                            </h4>

                            <div className="space-y-3.5 pt-1">
                                {classDetail.preparation && (
                                    <div className="flex gap-4">
                                        <span className="font-semibold text-[#8B95A1] text-xs shrink-0 w-14">준비물</span>
                                        <span className="text-[#4E5968] text-xs leading-relaxed whitespace-pre-wrap">{classDetail.preparation}</span>
                                    </div>
                                )}

                                {classDetail.parkingInfo && (
                                    <div className="flex gap-4">
                                        <span className="font-semibold text-[#8B95A1] text-xs shrink-0 w-14">주차 정보</span>
                                        <span className="text-[#4E5968] text-xs leading-relaxed whitespace-pre-wrap">{classDetail.parkingInfo}</span>
                                    </div>
                                )}

                                {classDetail.instructions && (
                                    <div className="flex gap-4">
                                        <span className="font-semibold text-[#8B95A1] text-xs shrink-0 w-14">안내사항</span>
                                        <span className="text-[#4E5968] text-xs leading-relaxed whitespace-pre-wrap">{classDetail.instructions}</span>
                                    </div>
                                )}

                                {classDetail.guidelines && (
                                    <div className="flex gap-4">
                                        <span className="font-semibold text-[#8B95A1] text-xs shrink-0 w-14">유의 사항</span>
                                        <span className="text-[#4E5968] text-xs leading-relaxed whitespace-pre-wrap">{classDetail.guidelines}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mt-8">
                        <div className="bg-gray-50 rounded-2xl p-5 border-2 border-dashed border-gray-200 text-center">
                            <p className="text-gray-400 text-sm">
                                📋 준비물, 주차 정보, 안내사항을 입력하면<br />
                                여기에 표시됩니다.
                            </p>
                        </div>
                    </div>
                )}

                {/* 취소 및 환불 정책 */}
                <div className="mt-10 pt-8 border-t border-gray-100">
                    <h3 className="font-bold text-[#191F28] text-base mb-4 flex items-center gap-2">
                        <span className="text-lg">🛡️</span> 취소 및 환불 정책
                    </h3>
                    {(classDetail.cancellationPolicy || classDetail.policy) ? (
                        <div className="bg-[#FFF8F8] rounded-xl p-4 border border-[#FFEAEA]">
                            <p className="text-[#F04452] text-xs leading-relaxed whitespace-pre-wrap font-medium">
                                {classDetail.cancellationPolicy || classDetail.policy}
                            </p>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-200 text-center">
                            <p className="text-gray-400 text-xs">
                                취소/환불 규정을 입력하면 여기에 표시됩니다.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};