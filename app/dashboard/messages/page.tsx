"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronRight, AlertCircle, RefreshCw, Clock, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { messageTemplateApi, messageApi, onedayClassApi, sessionApi, reservationApi, type MessageTemplateMetadata, MessageTemplateResponseTypeEnum, ManualMessageRequestTemplateTypeEnum, type OnedayClassResponse, type SessionResponse, type ReservationResponse } from "@/lib/api";
import { KakaoTemplatePreview } from "@/components/dashboard/KakaoTemplatePreview";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AddressSearchInput } from "@/components/ui/AddressSearchInput";
import { TimeSelector } from "@/components/ui/TimeSelector";
import { toast } from "sonner";

export default function MessagesPage() {
    const [templates, setTemplates] = useState<MessageTemplateMetadata[]>([]);
    const [manualTemplates, setManualTemplates] = useState<MessageTemplateMetadata[]>([]);
    const [recipientOpen, setRecipientOpen] = useState(false);
    const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
    const [detailsCache, setDetailsCache] = useState<Record<string, { type?: MessageTemplateResponseTypeEnum, body?: string }>>({});
    const [loading, setLoading] = useState(true);

    const [classes, setClasses] = useState<OnedayClassResponse[]>([]);
    const [sessions, setSessions] = useState<SessionResponse[]>([]);
    const [reservations, setReservations] = useState<ReservationResponse[]>([]);

    // Emergency Message State
    const [emClass, setEmClass] = useState<string>("");
    const [emSession, setEmSession] = useState<string>("");
    const [emSituation, setEmSituation] = useState<string>("");
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

    const isAllSelected = reservations.length > 0 && selectedStudentIds.length === reservations.length;

    // Dynamic Inputs State
    const [emLocBefore, setEmLocBefore] = useState<string>("");
    const [emLocBeforeDetail, setEmLocBeforeDetail] = useState<string>("");
    const [emLocAfter, setEmLocAfter] = useState<string>("");
    const [emLocDetail, setEmLocDetail] = useState<string>("");
    const [emTimeBefore, setEmTimeBefore] = useState<string>("");
    const [emTimeAfter, setEmTimeAfter] = useState<string>("");
    const [emDelayMin, setEmDelayMin] = useState<string>("");

    const [isSending, setIsSending] = useState(false);
    const [activeTab, setActiveTab] = useState<"automated" | "emergency">("emergency");

    const getClassName = () => {
        const cls = classes.find(c => String(c.id) === emClass);
        return cls ? (cls.name || "{클래스명}") : "{클래스명}";
    };

    const emType = emSituation ? detailsCache[emSituation]?.type : null;

    // Auto-fill existing location or time when the template type changes
    useEffect(() => {
        if (!emType) return;
        if (emType === MessageTemplateResponseTypeEnum.ManualLocChg && emClass) {
            const cls = classes.find(c => String(c.id) === emClass);
            if (cls) {
                setEmLocBefore(cls.location || "");
                setEmLocBeforeDetail(cls.locationDetails || "");
            }
        } else if (emType === MessageTemplateResponseTypeEnum.ManualTimeChg && emSession) {
            const sess = sessions.find(s => String(s.id) === emSession);
            if (sess && sess.startTime) {
                setEmTimeBefore(sess.startTime);
            }
        }
    }, [emType, emClass, emSession, classes, sessions]);

    const emergencyPreviewText = useMemo(() => {
        const className = getClassName();

        if (!emSituation || !emType) return "알림 유형을 선택하면\n미리보기가 표시됩니다.";

        const bodyRaw = detailsCache[emSituation]?.body;
        if (!bodyRaw) return "템플릿을 불러오는 중입니다...";

        let body = bodyRaw.replace(/#\{className\}/g, className);

        switch (emType) {
            case MessageTemplateResponseTypeEnum.ManualLocChg:
                body = body.replace(/#\{locBefore\}/g, emLocBefore || '기존 장소');
                body = body.replace(/#\{locBeforeDetail\}/g, emLocBeforeDetail ? ` (${emLocBeforeDetail})` : '');
                body = body.replace(/#\{locAfter\}/g, emLocAfter || '변경 장소');
                body = body.replace(/#\{locDetail\}/g, emLocDetail ? ` (${emLocDetail})` : '');
                break;
            case MessageTemplateResponseTypeEnum.ManualTimeChg:
                body = body.replace(/#\{timeBefore\}/g, emTimeBefore || '기존 시간');
                body = body.replace(/#\{timeAfter\}/g, emTimeAfter || '변경 시간');
                break;
            case MessageTemplateResponseTypeEnum.ManualDelay:
                body = body.replace(/#\{delayMin\}/g, emDelayMin || '?');
                break;
            case MessageTemplateResponseTypeEnum.ManualCancel:
                // No extra variables
                break;
        }
        return body;
    }, [emSituation, emType, emClass, emLocBefore, emLocBeforeDetail, emLocAfter, emLocDetail, emTimeBefore, emTimeAfter, emDelayMin, detailsCache]);

    const isFormValid = () => {
        if (!emClass || !emSession || !emSituation || !emType) return false;
        if (selectedStudentIds.length === 0) return false;

        if (emType === MessageTemplateResponseTypeEnum.ManualLocChg) {
            return !!emLocAfter;
        }
        if (emType === MessageTemplateResponseTypeEnum.ManualTimeChg) {
            return !!emTimeAfter;
        }
        if (emType === MessageTemplateResponseTypeEnum.ManualDelay) {
            return !!emDelayMin;
        }
        return true;
    };

    // Fetch Classes
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await onedayClassApi.getMyClasses();
                setClasses(res);
            } catch (error) {
                console.error("Failed to fetch classes", error);
            }
        };
        fetchClasses();
    }, []);

    // Fetch Sessions when Class is selected
    useEffect(() => {
        setEmSession(""); // Reset session when class changes
        if (emClass) {
            const fetchSessions = async () => {
                try {
                    const res = await onedayClassApi.getUpcomingSessions({ classId: Number(emClass) });
                    setSessions(res);
                } catch (error) {
                    console.error("Failed to fetch sessions", error);
                }
            };
            fetchSessions();
        } else {
            setSessions([]);
            setEmSession("");
        }
    }, [emClass]);

    // Fetch Reservations when Session is selected
    useEffect(() => {
        if (emSession) {
            const fetchReservations = async () => {
                try {
                    const res = await reservationApi.getReservations({ sessionId: Number(emSession) });
                    setReservations(res);
                    setSelectedStudentIds(res.map(r => String(r.reservationId)));
                } catch (error) {
                    console.error("Failed to fetch reservations", error);
                }
            };
            fetchReservations();
        } else {
            setReservations([]);
            setSelectedStudentIds([]);
        }
    }, [emSession]);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const [autoList, manualList] = await Promise.all([
                    messageTemplateApi.getTemplates({ type: "auto" }),
                    messageTemplateApi.getTemplates({ type: "manual" })
                ]);

                setTemplates(autoList);
                if (autoList.length > 0 && autoList[0].title) {
                    setSelectedTitle(autoList[0].title);
                    handleFetchDetails(autoList[0].title);
                }

                setManualTemplates(manualList);
                manualList.forEach(t => {
                    if (t.title) handleFetchDetails(t.title);
                });
            } catch (error) {
                console.error("Failed to fetch templates", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTemplates();
    }, []);

    const handleFetchDetails = async (title: string) => {
        if (!detailsCache[title]) {
            try {
                const data = await messageTemplateApi.getTemplate({ title });
                setDetailsCache(prev => ({
                    ...prev,
                    [title]: { type: data.type, body: data.body }
                }));
            } catch (error) {
                console.error(`Failed to fetch details for ${title}`, error);
            }
        }
    };

    const handleSelect = (title: string) => {
        setSelectedTitle(title);
        handleFetchDetails(title);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="w-10 h-10 border-4 border-[#3182F6]/20 border-t-[#3182F6] rounded-full animate-spin" />
            <p className="text-[#8B95A1] font-medium">로딩 중...</p>
        </div>
    );

    const activeDetail = selectedTitle ? detailsCache[selectedTitle] : null;

    // Helper to get icons based on title/type
    const getIcon = (title: string) => {
        if (title.includes('즉시') || title.includes('확정')) return '🔔';
        if (title.includes('3일')) return '⏰';
        if (title.includes('1일')) return '🚀';
        return '✉️';
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 pb-10">
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-[#191F28]">메시지 센터</h1>
                    <p className="text-sm md:text-base text-[#8B95A1] mt-1">알림 메시지 발송 시나리오를 한눈에 관리하세요.</p>
                </div>
                <Link href="/dashboard/messages/history">
                    <Button
                        variant="outline"
                        className="rounded-xl border-gray-200 text-[#4E5968] font-semibold h-10 px-4 flex items-center gap-2 hover:bg-gray-50 transition-colors shrink-0"
                    >
                        <Clock className="w-4 h-4" />
                        발송 이력
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Side: Management Section (6 columns) - Aligned Top */}
                <div className="lg:col-span-12 xl:col-span-6 flex flex-col pt-2 min-h-[550px] space-y-4">
                    <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "automated" | "emergency")} className="w-full h-full flex flex-col">
                        <TabsList className="w-full bg-gray-100/50 p-1 rounded-[24px] mb-2 hidden">
                            <TabsTrigger value="emergency" className="flex-1 rounded-[20px] py-3 text-[15px] font-bold data-[state=active]:bg-white data-[state=active]:text-red-500 data-[state=active]:shadow-sm">
                                <AlertCircle className="w-4 h-4 mr-2" /> 긴급 메시지 발송
                            </TabsTrigger>
                            <TabsTrigger value="automated" className="flex-1 rounded-[20px] py-3 text-[15px] font-bold data-[state=active]:bg-white data-[state=active]:text-[#3182F6] data-[state=active]:shadow-sm">
                                <RefreshCw className="w-4 h-4 mr-2" /> 자동 발송 시스템
                            </TabsTrigger>
                        </TabsList>

                        {/* Toss-style Segmented Control (Static) */}
                        <div className="relative flex bg-[#F2F4F6] p-1 rounded-[18px] mb-6 shadow-inner border border-gray-200/50">
                            <TabsList className="absolute inset-0 opacity-0 w-full h-full z-0 pointer-events-none">
                                <TabsTrigger value="emergency" id="trigger-emergency">직접 알림 발송</TabsTrigger>
                                <TabsTrigger value="automated" id="trigger-automated">자동 알림 관리</TabsTrigger>
                            </TabsList>

                            <button
                                onClick={() => {
                                    document.getElementById('trigger-emergency')?.click();
                                    setActiveTab("emergency");
                                }}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] text-[15px] font-bold transition-all z-10 relative
                                    ${activeTab === "emergency"
                                        ? "bg-white text-[#E92C2C] shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                                        : "text-[#8B95A1] hover:text-[#4E5968]"}
                                `}
                            >
                                <AlertCircle className="w-4 h-4" />
                                직접 알림 발송
                            </button>

                            <button
                                onClick={() => {
                                    document.getElementById('trigger-automated')?.click();
                                    setActiveTab("automated");
                                }}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] text-[15px] font-bold transition-all z-10 relative
                                    ${activeTab === "automated"
                                        ? "bg-white text-[#3182F6] shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                                        : "text-[#8B95A1] hover:text-[#4E5968]"}
                                `}
                            >
                                <RefreshCw className="w-4 h-4" />
                                자동 알림 관리
                            </button>
                        </div>


                        <TabsContent value="automated" className="flex-1 flex flex-col pt-0 mt-0 border-none outline-none">

                            {/* 1. Template List */}
                            <section className="space-y-3">
                                <div className="flex items-center justify-between px-2">
                                    <h2 className="text-base font-bold text-[#191F28] flex items-center gap-2">
                                        <span className="text-blue-500">Auto</span> 자동 알림 시나리오
                                    </h2>
                                    <span className="text-[10px] font-medium text-[#8B95A1]">시나리오를 클릭해 미리보기를 확인하세요</span>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    {templates.map((template) => {
                                        const isSelected = selectedTitle === template.title;
                                        return (
                                            <React.Fragment key={template.title}>
                                                <button
                                                    onClick={() => template.title && handleSelect(template.title)}
                                                    className={`
                                                        w-full p-4 rounded-[20px] flex items-center gap-4 transition-all text-left group border
                                                        ${isSelected
                                                            ? 'bg-white border-[#3182F6]/20 shadow-[0_8px_16px_-4px_rgba(49,130,246,0.1)] ring-1 ring-[#3182F6]/5'
                                                            : 'bg-white border-transparent hover:border-gray-200 hover:bg-gray-50/50'
                                                        }
                                                    `}
                                                >
                                                    <div className={`
                                                        w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 transition-all duration-500
                                                        ${isSelected ? 'bg-[#3182F6] text-white rotate-6 scale-110 shadow-lg shadow-blue-100' : 'bg-[#F2F4F6] text-gray-400'}
                                                    `}>
                                                        {getIcon(template.title || '')}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <p className={`text-[16px] font-bold transition-colors ${isSelected ? 'text-[#191F28]' : 'text-[#4E5968]'}`}>
                                                                {template.title || '제목 없음'}
                                                            </p>
                                                            {isSelected && (
                                                                <span className="bg-blue-50 text-[#3182F6] text-[9px] font-black px-1.2 py-0.5 rounded uppercase tracking-tighter">Selected</span>
                                                            )}
                                                        </div>
                                                        <p className={`text-xs font-medium transition-colors ${isSelected ? 'text-[#4E5968]' : 'text-[#8B95A1]'}`}>
                                                            {template.description || ''}
                                                        </p>
                                                    </div>
                                                    <ChevronRight className={`w-5 h-5 transition-all ${isSelected ? 'text-[#3182F6] translate-x-1' : 'text-gray-200 group-hover:text-gray-400'}`} />
                                                </button>

                                                {template.title === "D-1 리마인더" && (
                                                    <div className="bg-blue-50/50 border border-blue-100 rounded-[20px] p-4 my-2 flex items-start gap-3">
                                                        <div className="mt-1 w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)] shrink-0" />
                                                        <div className="space-y-1">
                                                            <h3 className="text-[15px] font-bold text-blue-900">자동 발송 시스템 작동 중</h3>
                                                            <p className="text-xs text-blue-700/80 font-medium leading-relaxed">
                                                                현재 <strong className="text-blue-700">{templates.length}개</strong>의 알림 시나리오가 활성화되어 있습니다.<br />
                                                                수강생의 예약 및 수업 일정에 맞춰 카카오톡 알림톡이 자동으로 발송됩니다.
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            </section>
                        </TabsContent>

                        <TabsContent value="emergency" className="flex-1 flex flex-col pt-0 mt-0 border-none outline-none">
                            <div className="flex items-center justify-between px-2 mb-3">
                                <h2 className="text-base font-bold text-[#191F28] flex items-center gap-2">
                                    <span className="text-red-500">Manual</span> 직접 알림 작성
                                </h2>
                                <span className="text-[10px] font-medium text-[#8B95A1]">작성 후 즉시 발송돼요</span>
                            </div>

                            <div className="bg-white p-6 rounded-[24px] border border-red-100 shadow-[0_8px_30px_-12px_rgba(233,44,44,0.1)] space-y-6">
                                {/* 1. 대상 클래스/세션 선택 */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1.5 h-4 bg-red-500 rounded-full"></div>
                                        <h3 className="text-sm font-bold text-[#191F28]">발송 대상 선택</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-[#8B95A1]">클래스</Label>
                                            <Select value={emClass} onValueChange={setEmClass}>
                                                <SelectTrigger className="rounded-xl border-gray-200 text-[#191F28]">
                                                    <SelectValue placeholder="클래스 선택" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {classes.map(cls => (
                                                        <SelectItem key={cls.id} value={String(cls.id)}>{cls.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-[#8B95A1]">세션</Label>
                                            <Select
                                                value={emSession}
                                                onValueChange={setEmSession}
                                                open={emClass && sessions.length > 0 ? undefined : false}
                                            >
                                                <SelectTrigger className={`rounded-xl border-gray-200 ${(!emClass || sessions.length === 0) ? 'pointer-events-none text-gray-400' : 'text-[#191F28]'}`}>
                                                    <SelectValue placeholder="세션 선택" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sessions.map(s => {
                                                        const dt = s.date ? new Date(s.date) : null;
                                                        const dayOfWeek = dt ? ['일', '월', '화', '수', '목', '금', '토'][dt.getDay()] : '';
                                                        const dateStr = dt ? `${dt.getMonth() + 1}/${dt.getDate()}(${dayOfWeek})` : '';

                                                        const formatTime = (timeStr?: string) => {
                                                            if (!timeStr) return '';
                                                            const parts = timeStr.split(':');
                                                            if (parts.length < 2) return timeStr;
                                                            const h = parseInt(parts[0], 10);
                                                            const m = parts[1];
                                                            const ampm = h < 12 ? '오전' : '오후';
                                                            const hour12 = h % 12 || 12;
                                                            return `${ampm} ${hour12}:${m}`;
                                                        };
                                                        const timeStr = formatTime(s.startTime);

                                                        return (
                                                            <SelectItem key={s.id} value={String(s.id)}>
                                                                {dateStr} {timeStr}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-[#8B95A1]">수신자 대상</Label>
                                            <Popover open={emSession && reservations.length > 0 ? recipientOpen : false} onOpenChange={setRecipientOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className={`w-full justify-between rounded-xl border-gray-200 font-medium px-4 h-10 ${(!emSession || reservations.length === 0) ? 'pointer-events-none text-gray-400' : 'text-[#191F28]'}`}>
                                                        <span className="truncate">
                                                            {isAllSelected
                                                                ? `전체 (${reservations.length}명)`
                                                                : selectedStudentIds.length === 0
                                                                    ? "수신자 선택"
                                                                    : selectedStudentIds.length === 1
                                                                        ? reservations.find(s => String(s.reservationId) === selectedStudentIds[0])?.applicantName
                                                                        : `${reservations.find(s => String(s.reservationId) === selectedStudentIds[0])?.applicantName} 외 ${selectedStudentIds.length - 1}명`
                                                            }
                                                        </span>
                                                        <ChevronDown className="w-4 h-4 opacity-50 ml-2" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-60 p-2" align="start">
                                                    <div className="space-y-1">
                                                        <div
                                                            onClick={() => {
                                                                if (isAllSelected) setSelectedStudentIds([]);
                                                                else setSelectedStudentIds(reservations.map(s => String(s.reservationId)));
                                                            }}
                                                            className="flex items-center w-full px-2 py-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group"
                                                        >
                                                            <Checkbox
                                                                checked={isAllSelected}
                                                                onCheckedChange={() => {
                                                                    if (isAllSelected) setSelectedStudentIds([]);
                                                                    else setSelectedStudentIds(reservations.map(s => String(s.reservationId)));
                                                                }}
                                                                className="mr-3 border-gray-300 pointer-events-none"
                                                            />
                                                            <span className={`text-sm font-bold ${isAllSelected ? 'text-[#191F28]' : 'text-[#8B95A1]'}`}>전체 선택</span>
                                                        </div>
                                                        <div className="h-px bg-gray-100 my-1 mx-2"></div>
                                                        <div className="max-h-48 overflow-y-auto space-y-1 px-1">
                                                            {reservations.map((student) => {
                                                                const studentIdStr = String(student.reservationId);
                                                                const isChecked = selectedStudentIds.includes(studentIdStr);
                                                                return (
                                                                    <div
                                                                        key={student.reservationId}
                                                                        onClick={() => {
                                                                            if (isChecked) {
                                                                                setSelectedStudentIds(prev => prev.filter(id => id !== studentIdStr));
                                                                            } else {
                                                                                setSelectedStudentIds(prev => [...prev, studentIdStr]);
                                                                            }
                                                                        }}
                                                                        className="flex items-center w-full px-2 py-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                                                                    >
                                                                        <Checkbox
                                                                            checked={isChecked}
                                                                            onCheckedChange={() => {
                                                                                if (isChecked) {
                                                                                    setSelectedStudentIds(prev => prev.filter(id => id !== studentIdStr));
                                                                                } else {
                                                                                    setSelectedStudentIds(prev => [...prev, studentIdStr]);
                                                                                }
                                                                            }}
                                                                            className="mr-3 border-gray-300 pointer-events-none"
                                                                        />
                                                                        <span className={`text-sm font-medium ${isChecked ? 'text-[#191F28]' : 'text-[#8B95A1]'}`}>
                                                                            {student.applicantName}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-gray-100 w-full my-4"></div>

                                {/* 2. 상황 선택 및 동적 입력 */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1.5 h-4 bg-red-500 rounded-full"></div>
                                        <h3 className="text-sm font-bold text-[#191F28]">알림 내용 작성</h3>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-xs font-semibold text-[#8B95A1]">알림 유형</Label>
                                        <Select value={emSituation} onValueChange={setEmSituation}>
                                            <SelectTrigger className="rounded-xl border-gray-200 h-12 text-[15px]">
                                                <SelectValue placeholder="어떤 내용을 알릴까요?" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {manualTemplates.map(t => {
                                                    if (!t.title) return null;
                                                    const tType = detailsCache[t.title]?.type;
                                                    let icon = '✉️';
                                                    if (tType === MessageTemplateResponseTypeEnum.ManualLocChg) icon = '📍';
                                                    else if (tType === MessageTemplateResponseTypeEnum.ManualTimeChg) icon = '⏰';
                                                    else if (tType === MessageTemplateResponseTypeEnum.ManualDelay) icon = '⏳';
                                                    else if (tType === MessageTemplateResponseTypeEnum.ManualCancel) icon = '❌';

                                                    return (
                                                        <SelectItem key={t.title} value={t.title}>
                                                            {icon} {t.title}
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Dynamic Inputs based on situation */}
                                    <div className="space-y-3 pt-2">
                                        {emType === MessageTemplateResponseTypeEnum.ManualLocChg && (
                                            <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-semibold text-[#8B95A1]">기존 장소</Label>
                                                    <div className="space-y-1.5">
                                                        <AddressSearchInput
                                                            value={emLocBefore}
                                                            onChange={setEmLocBefore}
                                                            placeholder="예: 서울특별시 강남구..."
                                                            className="rounded-xl"
                                                        />
                                                        <Input
                                                            placeholder="상세 정보를 입력하세요 (동/호수, 건물명 등)"
                                                            className="rounded-xl"
                                                            value={emLocBeforeDetail}
                                                            onChange={(e) => setEmLocBeforeDetail(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-semibold text-[#8B95A1]">변경 장소 (필수)</Label>
                                                    <div className="space-y-1.5">
                                                        <AddressSearchInput
                                                            value={emLocAfter}
                                                            onChange={setEmLocAfter}
                                                            placeholder="변경될 주소를 검색하세요"
                                                            className="rounded-xl border-red-200"
                                                        />
                                                        <Input
                                                            placeholder="상세 정보를 입력하세요 (동/호수, 건물명 등)"
                                                            className="rounded-xl"
                                                            value={emLocDetail}
                                                            onChange={(e) => setEmLocDetail(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {emType === MessageTemplateResponseTypeEnum.ManualTimeChg && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-semibold text-[#8B95A1]">기존 시간</Label>
                                                    <TimeSelector
                                                        value={emTimeBefore}
                                                        onChange={setEmTimeBefore}
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-semibold text-[#8B95A1]">변경 시간 (필수)</Label>
                                                    <TimeSelector
                                                        value={emTimeAfter}
                                                        onChange={setEmTimeAfter}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {emType === MessageTemplateResponseTypeEnum.ManualDelay && (
                                            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <Label className="text-xs font-semibold text-[#8B95A1]">지연 예상 시간 (분) (필수)</Label>
                                                <div className="relative">
                                                    <Input type="number" min="0" placeholder="예: 15" className="rounded-xl border-red-200 focus-visible:ring-red-100 pr-10" value={emDelayMin} onChange={(e) => setEmDelayMin(e.target.value)} />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">분</span>
                                                </div>
                                            </div>
                                        )}

                                        {emType === MessageTemplateResponseTypeEnum.ManualCancel && (
                                            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium flex items-start gap-2 animate-in fade-in zoom-in duration-300">
                                                <AlertCircle className="w-5 h-5 shrink-0" />
                                                <p>수업 취소 안내 메시지는 별도의 추가 입력 없이 자동으로 포맷에 맞게 발송됩니다. 필요한 경우 환불 안내 등은 클래스 링크를 통해 확인하도록 안내됩니다.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    className={`w-full py-6 rounded-2xl text-[16px] font-bold shadow-lg transition-all
                                        ${(!isFormValid())
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none hover:bg-gray-100'
                                            : 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20 active:scale-[0.98]'
                                        }
                                    `}
                                    disabled={!isFormValid() || isSending}
                                    onClick={async () => {
                                        setIsSending(true);
                                        try {
                                            const variables: Record<string, string> = {};
                                            let templateType;

                                            if (emType === MessageTemplateResponseTypeEnum.ManualLocChg) {
                                                templateType = ManualMessageRequestTemplateTypeEnum.ManualLocChg;
                                                variables.locBefore = emLocBefore;
                                                variables.locBeforeDetail = emLocBeforeDetail;
                                                variables.locAfter = emLocAfter;
                                                variables.locDetail = emLocDetail;
                                            } else if (emType === MessageTemplateResponseTypeEnum.ManualTimeChg) {
                                                templateType = ManualMessageRequestTemplateTypeEnum.ManualTimeChg;
                                                variables.timeBefore = emTimeBefore;
                                                variables.timeAfter = emTimeAfter;
                                            } else if (emType === MessageTemplateResponseTypeEnum.ManualDelay) {
                                                templateType = ManualMessageRequestTemplateTypeEnum.ManualDelay;
                                                variables.delayMin = emDelayMin;
                                            } else if (emType === MessageTemplateResponseTypeEnum.ManualCancel) {
                                                templateType = ManualMessageRequestTemplateTypeEnum.ManualCancel;
                                            }

                                            // API 호출 (문자열인 reservationId를 안전하게 숫자로 변환)
                                            await messageApi.sendManualMessage({
                                                manualMessageRequest: {
                                                    templateType: templateType!,
                                                    variables,
                                                    reservationIds: selectedStudentIds.map(id => Number(id))
                                                }
                                            });

                                            toast.success("긴급 메시지가 성공적으로 발송되었습니다.", {
                                                description: `${getClassName()} 수강생들에게 알림이 전송되었습니다.`
                                            });
                                            // Optional reset
                                            setEmSituation("");
                                            setEmLocBefore(""); setEmLocBeforeDetail(""); setEmLocAfter(""); setEmLocDetail("");
                                            setEmTimeBefore(""); setEmTimeAfter("");
                                            setEmDelayMin("");
                                        } catch (e) {
                                            console.error(e);
                                            toast.error("메시지 발송에 실패했습니다.");
                                        } finally {
                                            setIsSending(false);
                                        }
                                    }}
                                >
                                    {isSending ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            발송 중...
                                        </div>
                                    ) : (
                                        "긴급 알림 발송하기"
                                    )}
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Side: Preview Workbench (6 columns) */}
                <div className="lg:col-span-12 xl:col-span-6 h-full">
                    <div className="bg-[#F8F9FA] rounded-[32px] border border-gray-100 p-6 lg:sticky lg:top-8 flex flex-col items-center justify-center min-h-[550px] shadow-inner relative overflow-hidden">
                        {/* Workbench minimal label */}
                        <div className="absolute top-6 left-6 flex items-center gap-4">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-5 h-5 rounded-full border-2 border-[#F8F9FA] bg-gray-200 overflow-hidden">
                                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-300"></div>
                                    </div>
                                ))}
                            </div>
                            <span className="text-[10px] font-bold text-[#8B95A1] uppercase tracking-widest"></span>
                        </div>

                        {/* White Device Frame - Matching landing page style */}
                        <div className="relative w-[310px] h-[580px] bg-white rounded-[48px] shadow-[0_45px_100px_-25px_rgba(0,0,0,0.12)] border-[8px] border-white overflow-hidden">
                            {/* Inner Screen */}
                            <div className="w-full h-full bg-[#ABC1D1] rounded-[36px] overflow-hidden relative border border-black/5 flex flex-col no-scrollbar">
                                {/* Status Bar Mock */}
                                <div className="w-full h-11 flex justify-between items-end px-7 pb-2 text-[11px] font-bold text-black z-40">
                                    <span>9:42</span>
                                    <div className="flex gap-1.5 items-center">
                                        <div className="w-4 h-2.5 bg-black rounded-[2px] relative after:content-[''] after:absolute after:right-[-2px] after:top-0.5 after:w-1 after:h-1.5 after:bg-black after:rounded-r-full"></div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto no-scrollbar relative">
                                    {activeTab === "emergency" ? (
                                        <div key={`preview-em-${emSituation}`} className="w-full animate-in fade-in zoom-in slide-in-from-bottom-4 duration-700 h-full">
                                            <KakaoTemplatePreview body={emergencyPreviewText} />
                                        </div>
                                    ) : activeDetail ? (
                                        <div key={selectedTitle} className="w-full animate-in fade-in zoom-in slide-in-from-bottom-4 duration-700 h-full">
                                            <KakaoTemplatePreview body={activeDetail.body || ''} />
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center space-y-4 px-8 text-center bg-[#ABC1D1]">
                                            <div className="w-10 h-10 border-[4px] border-black/10 border-t-black/40 rounded-full animate-spin" />
                                            <p className="text-xs text-black/50 font-bold">메시지 데이터를<br />구성하는 중입니다</p>
                                        </div>
                                    )}
                                </div>

                                {/* Bottom Home Bar Area */}
                                <div className="w-full h-8 flex items-center justify-center pb-2 bg-white shrink-0">
                                    <div className="w-1/3 h-1.5 bg-black/10 rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-6 right-8 flex flex-col items-end gap-1 opacity-40">
                            <span className="text-[9px] font-black text-blue-300">HUB SIMULATOR</span>
                            <span className="text-[9px] font-bold text-gray-300 tracking-tighter">ENGINE v1.2.4</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
