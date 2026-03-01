"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Clock, CheckCircle2, XCircle, ChevronDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { messageApi, type MessageHistoryResponse, MessageHistoryResponseStatusEnum } from "@/lib/api";


export default function MessageHistoryPage() {
    const router = useRouter();
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [history, setHistory] = useState<MessageHistoryResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await messageApi.getMyMessageHistory();
                setHistory(data);
            } catch (error) {
                console.error("Failed to fetch message history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 pb-10 animate-in fade-in duration-300">
            {/* Header - Aligned with the main Messages Page */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-gray-100 pb-6 mb-6">
                <div className="flex items-start gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl hover:bg-gray-100 text-gray-500 shrink-0 mt-0.5"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-[#191F28] flex items-center gap-2">
                            알림 발송 이력
                        </h1>
                        <p className="text-sm md:text-base text-[#8B95A1] mt-1">
                            최근 30일 동안 발송된 메시지 내역입니다.
                        </p>
                    </div>
                </div>
            </div>

            {/* List Content - Compact & Horizontal */}
            <div className="space-y-3">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100">
                        <Loader2 className="w-8 h-8 text-[#3182F6] animate-spin mb-4" />
                        <p className="text-[#8B95A1] font-medium">발송 이력을 불러오는 중입니다...</p>
                    </div>
                ) : history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100">
                        <p className="text-[#8B95A1] font-medium text-[15px]">발송 이력이 없습니다.</p>
                    </div>
                ) : (
                    history.map((item) => {
                        const isExpanded = expandedId === item.id;

                        // Format date securely
                        const dateObj = item.completedAt || item.requestedAt;
                        const dateStr = dateObj ? new Date(dateObj).toLocaleString('ko-KR', {
                            month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                        }).replace(' ', '') : '날짜 없음';

                        // Format recipient securely
                        const formatPhone = (phone?: string) => {
                            if (!phone) return '번호없음';
                            const cleaned = phone.replace(/\D/g, '');
                            if (cleaned.length === 11) {
                                return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
                            }
                            if (cleaned.length === 10) {
                                return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
                            }
                            return phone;
                        };
                        const receiver = item.receiverName ? `${item.receiverName} (${formatPhone(item.receiverPhone)})` : '수신자 불명';

                        // Preview logic
                        const previewStr = item.content ? (item.content.length > 20 ? item.content.slice(0, 20) + '...' : item.content) : '내용 없음';

                        return (
                            <div
                                key={item.id}
                                onClick={() => toggleExpand(item.id!)}
                                className={`py-4 px-5 rounded-xl border transition-all cursor-pointer group flex flex-col gap-2 ${isExpanded ? 'border-[#3182F6]/40 bg-[#F9FAFB] shadow-sm' : 'border-gray-100 bg-white hover:border-[#3182F6]/30 hover:shadow-sm'
                                    }`}
                            >
                                {/* Collapsed Header Line */}
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 md:gap-4 overflow-hidden flex-1">
                                        {/* Type */}
                                        <span className="shrink-0 px-2.5 py-1 bg-[#F2F4F6] text-[#4E5968] text-[12px] font-semibold rounded-md">
                                            {item.templateTitle || item.templateType || '알림'}
                                        </span>

                                        {/* Recipient */}
                                        <span className="shrink-0 text-[#191F28] text-[14px] font-bold">
                                            {receiver}
                                        </span>

                                        {/* Preview text */}
                                        <span className="truncate text-[#8B95A1] text-[14px] leading-snug">
                                            {previewStr}
                                        </span>
                                    </div>

                                    {/* Right side information */}
                                    <div className="flex items-center gap-4 shrink-0">
                                        {/* Date */}
                                        <span className="text-[#8B95A1] text-[13px] font-medium hidden sm:block">
                                            {dateStr}
                                        </span>

                                        {/* Status */}
                                        <div className="w-[60px] flex justify-end">
                                            {item.status === MessageHistoryResponseStatusEnum.Sent ? (
                                                <span className="text-[#3182F6] font-semibold text-[13px]">발송성공</span>
                                            ) : item.status === MessageHistoryResponseStatusEnum.Failed ? (
                                                <span className="text-[#F04452] font-semibold text-[13px]">발송실패</span>
                                            ) : (
                                                <span className="text-gray-500 font-semibold text-[13px]">발송대기</span>
                                            )}
                                        </div>

                                        {/* Chevron */}
                                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>

                                {/* Expanded Body */}
                                {isExpanded && (
                                    <div className="mt-3 pt-3 border-t border-gray-100/60 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="whitespace-pre-wrap bg-gray-50 p-5 rounded-xl border border-gray-100/50 shadow-inner text-[14px] leading-relaxed text-[#4E5968]">
                                            {item.content || '내용이 없습니다.'}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
