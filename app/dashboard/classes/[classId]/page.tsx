"use client";

import { useState, useEffect, use } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, MoreVertical, Plus, Share2, Pencil, Trash2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { api, onedayClassApi, sessionApi, type SessionResponse, type OnedayClassResponse, type ReservationResponse } from "@/lib/api";
import { CLASS_LINK_URL } from "@/lib/api/config/api-config";
import { EditClassForm } from "@/components/dashboard/EditClassForm";
import { AddSessionForm } from "@/components/dashboard/AddSessionForm";
import { SessionList } from "@/components/dashboard/SessionList";
import { EditSessionForm as EditSessionFormDialog } from "@/components/dashboard/EditSessionForm";
import { PreviewDialog } from "@/components/dialog/PreviewDialog";
import { ClassDetailResponse } from "@/components/preview/ClassPreview";
import { FloatingGuideButton } from "@/components/coachmark";
import { useCoachmark } from "@/components/coachmark/hooks/useCoachmark";

export default function ClassDetailPage({ params }: { params: Promise<{ classId: string }> }) {
    const router = useRouter();
    const { classId } = use(params);
    const [template, setTemplate] = useState<OnedayClassResponse | null>(null);
    const [sessions, setSessions] = useState<SessionResponse[]>([]);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [addSessionDialogOpen, setAddSessionDialogOpen] = useState(false);
    const [editingSession, setEditingSession] = useState<SessionResponse | null>(null);
    const [sessionApplicationCounts, setSessionApplicationCounts] = useState<Record<string, number>>({});
    const [user, setUser] = useState<any>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

    const [isMobile, setIsMobile] = useState(false);
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);

    const { isDemoMode } = useCoachmark();

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // 데모 모드용 가짜 세션 (가이드 실행 중에만 표시)
    const demoSessions: SessionResponse[] = [
        {
            id: 101, // Mock generated numeric ID
            date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            startTime: "10:00:00",
            endTime: "12:00:00",
            capacity: 10,
            currentNum: 3,
            status: 'RECRUITING',
            price: 50000,
        },
        {
            id: 102,
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            startTime: "14:00:00",
            endTime: "16:00:00",
            capacity: 8,
            currentNum: 1,
            status: 'RECRUITING',
            price: 50000,
        },
    ];

    // 실제 데이터와 데모 데이터 결합
    const displaySessions = isDemoMode && sessions.length === 0 ? demoSessions : sessions;
    const displaySessionCounts = isDemoMode && sessions.length === 0
        ? { '101': 3, '102': 1 }
        : sessionApplicationCounts;

    const loadSessions = async (classIdStr: string) => {
        try {
            // Use onedayClassApi.getClassSessions1 instead of sessionApi.getClassSessions1
            const data = await onedayClassApi.getClassSessions1({ classId: Number(classIdStr) });
            setSessions(data);

            // 신청자 수 집계 (API가 없어서 각 세션별로 조회)
            const counts: Record<string, number> = {};
            for (const session of data) {
                if (session.id) {
                    const applications = await api.reservation.getReservations({ sessionId: session.id });
                    counts[String(session.id)] = applications.filter((app: ReservationResponse) => app.reservationStatus === 'CONFIRMED').length;
                }
            }
            setSessionApplicationCounts(counts);
        } catch (e) {
            console.error("Failed to load sessions", e);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const currentUser = await api.auth.getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
                try {
                    const templateData = await onedayClassApi.getClass({ classId: Number(classId) });
                    if (templateData) {
                        setTemplate(templateData);
                        if (templateData.id) {
                            loadSessions(String(templateData.id));
                        }
                    } else {
                        router.push('/dashboard/classes');
                    }
                } catch (e) {
                    console.error("Failed to fetch class", e);
                    router.push('/dashboard/classes');
                }
            }
        };
        fetchData();
    }, [classId, router]);

    const handlePreview = (data: {
        name: string;
        description: string;
        location: string;
        locationDetails: string;
        preparation: string;
        instructions: string;
        imageUrls: string[];
        parkingInfo: string;
        cancellationPolicy: string;
    }) => {
        setPreviewData({
            id: 'preview',
            name: data.name,
            description: data.description,
            location: data.location,
            locationDetails: data.locationDetails,
            preparation: data.preparation,
            instructions: data.instructions,
            imageUrls: data.imageUrls,
            parkingInfo: data.parkingInfo,
            cancellationPolicy: data.cancellationPolicy,
            profileUrl: user?.profileUrl,
        });
    };

    const handleEditTemplate = async (data: any) => {
        if (!template || !user || !template.id) return;

        try {
            const updatedTemplate = await onedayClassApi.updateClass({
                classId: template.id,
                onedayClassCreateRequest: {
                    name: data.name,
                    description: data.description,
                    location: data.location,
                    locationDetails: data.locationDetails,
                    preparation: data.preparation,
                    instructions: data.instructions,
                    cancellationPolicy: data.cancellationPolicy,
                    parkingInfo: data.parkingInfo,
                    images: data.images,
                }
            });
            setTemplate(updatedTemplate);
            setEditDialogOpen(false);
            setPreviewDialogOpen(false);
        } catch (e) {
            console.error("Failed to update template", e);
            toast.error("클래스 수정 실패");
        }
    };

    const handleAddSession = async (data: any) => {
        if (!template || !template.id) return;
        try {
            await sessionApi.createSession({
                sessionCreateRequest: {
                    templateId: Number(template.id),
                    date: new Date(data.date),
                    startTime: `${data.startTime}:00`,
                    endTime: `${data.endTime}:00`,
                    capacity: data.capacity,
                    price: data.price,
                }
            });
            await loadSessions(String(template.id));
            setAddSessionDialogOpen(false);
            toast.success("세션이 생성되었습니다");
        } catch (e) {
            console.error("Failed to create session", e);
            toast.error("세션 생성 실패");
        }
    };

    const handleEditSession = async (data: any) => {
        if (!editingSession || !editingSession.id) return;
        try {
            await sessionApi.updateSession({
                sessionId: editingSession.id,
                sessionUpdateRequest: {
                    date: new Date(data.date),
                    startTime: `${data.startTime}:00`,
                    endTime: `${data.endTime}:00`,
                    capacity: data.capacity,
                    price: data.price,
                }
            });

            if (template && template.id) {
                await loadSessions(String(template.id));
            }
            setEditingSession(null);
            toast.success("세션이 수정되었습니다");
        } catch (e) {
            console.error("Failed to update session", e);
            toast.error("세션 수정 실패");
        }
    };

    const handleStatusChange = async (sessionId: number, newStatus: 'RECRUITING' | 'FULL' | 'CLOSED') => {
        if (!template || !template.id) return;
        await sessionApi.updateSessionStatus({ sessionId, status: newStatus });
        await loadSessions(String(template.id));
    };

    const handleDeleteSession = (sessionId: number) => {
        setSessionToDelete(String(sessionId));
        setDeleteConfirmOpen(true);
    };

    const confirmDeleteSession = async () => {
        if (!sessionToDelete) return;

        try {
            await sessionApi.deleteSession({ sessionId: Number(sessionToDelete) });

            if (template && template.id) {
                await loadSessions(String(template.id));
            }

            toast.success('세션이 삭제되었습니다', {
                description: '세션이 성공적으로 삭제되었습니다.'
            });
        } catch (error) {
            if (error instanceof Error) {
                toast.error('삭제 실패', {
                    description: error.message
                });
            } else {
                toast.error('삭제 실패', {
                    description: '세션 삭제 중 알 수 없는 오류가 발생했습니다.'
                });
            }
        } finally {
            setSessionToDelete(null);
        }
    };

    const handleLinkShareStatusChange = async (newStatus: 'ENABLED' | 'DISABLED') => {
        if (!template || !template.id) return;

        try {
            const updatedTemplate = await onedayClassApi.updateLinkShareStatus({
                classId: template.id,
                linkShareStatusUpdateRequest: {
                    linkShareStatus: newStatus
                }
            });
            setTemplate(updatedTemplate);

            toast.success(
                newStatus === 'ENABLED' ? "판매중으로 변경되었습니다" : "판매종료로 변경되었습니다",
                {
                    description: newStatus === 'ENABLED'
                        ? "이제 수강생들이 링크를 통해 신청할 수 있습니다."
                        : "링크를 통한 신청이 차단되었습니다."
                }
            );
        } catch (error) {
            if (error instanceof Error) {
                toast.error("상태 변경 실패", {
                    description: error.message
                });
            }
        }
    };

    const copyLink = () => {
        const url = `${CLASS_LINK_URL}/class/${template?.classCode}`;
        navigator.clipboard.writeText(url);
        toast.success("링크가 복사되었습니다", {
            description: "수강생들에게 이 링크를 공유하여 신청을 받을 수 있어요."
        });
    };

    if (!template) {
        return <div className="p-8 text-center text-[#8B95A1]">로딩 중...</div>;
    }

    const isLinkEnabled = template.linkShareStatus === 'ENABLED';

    return (
        <div className="space-y-6" >
            <Button variant="ghost" onClick={() => router.push('/dashboard/classes')} className="px-3 text-[#6B7684] hover:text-[#191F28] -ml-2 mb-4 w-fit">
                <ArrowLeft className="mr-2 h-4 w-4" />
                클래스 목록으로
            </Button>

            {/* 클래스 정보 카드 */}
            <Card>
                <CardHeader className="p-5 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="space-y-1 flex-1">
                            <CardTitle className="text-lg md:text-xl">{template.name}</CardTitle>

                            <CardDescription className="text-sm mt-2">
                                {template.description}
                            </CardDescription>

                            <div className="mt-4 space-y-2 text-sm text-[#4E5968]">
                                <p><span className="font-semibold text-[#191F28]">장소:</span> {template.location}</p>
                                {template.preparation && (
                                    <p><span className="font-semibold text-[#191F28]">준비물:</span> {template.preparation}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 min-w-fit">
                            {/* 공개/비공개 토글 */}
                            <div
                                data-coachmark="visibility-toggle"
                                onClick={() => handleLinkShareStatusChange(isLinkEnabled ? 'DISABLED' : 'ENABLED')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${isLinkEnabled ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}
                            >
                                <span className="text-sm text-gray-600">
                                    {isLinkEnabled ? '공개중' : '비공개'}
                                </span>
                                <div
                                    className={`toggle-switch relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isLinkEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isLinkEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                </div>
                            </div>

                            {/* 링크 복사 버튼 */}
                            <Button
                                variant="outline"
                                onClick={copyLink}
                                disabled={!isLinkEnabled}
                                data-coachmark="copy-link-btn"
                                className={!isLinkEnabled ? 'opacity-60' : ''}
                            >
                                <Link2 className="h-4 w-4 mr-2" />
                                링크 복사
                            </Button>

                            <Dialog open={editDialogOpen} onOpenChange={(open) => {
                                setEditDialogOpen(open);
                                if (!open) setPreviewDialogOpen(false);
                            }}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full sm:w-auto">
                                        수정
                                    </Button>
                                </DialogTrigger>
                                <DialogContent
                                    className="max-w-2xl w-[92vw] md:w-full max-h-[90vh] overflow-hidden rounded-3xl p-0 border-none"
                                    style={{
                                        left: !isMobile && previewDialogOpen ? 'calc(50% - 260px)' : '50%',
                                        transition: 'left 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    }}
                                    onInteractOutside={(e) => {
                                        e.preventDefault();
                                    }}
                                >
                                    <DialogHeader className="px-6 pt-6 shrink-0 bg-white">
                                        <DialogTitle className="text-xl font-bold text-[#191F28]">클래스 수정</DialogTitle>
                                    </DialogHeader>
                                    <div className="overflow-y-auto max-h-[calc(90vh-80px)] px-6 pb-6">
                                        <EditClassForm
                                            template={template}
                                            onSubmit={handleEditTemplate}
                                            onCancel={() => {
                                                setEditDialogOpen(false);
                                                setPreviewDialogOpen(false);
                                            }}
                                            onPreview={handlePreview}
                                            onOpenPreview={() => setPreviewDialogOpen(true)}
                                        />
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardHeader>
            </Card >

            {/* 세션 목록 섹션 */}
            < div className="space-y-4" >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <h2 className="text-lg md:text-xl font-bold text-[#191F28]">세션 목록</h2>
                    <Dialog open={addSessionDialogOpen} onOpenChange={setAddSessionDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                className="w-full sm:w-auto"
                                data-coachmark="add-session-btn"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                세션 추가
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="mx-4 md:mx-auto rounded-3xl">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-[#191F28]">세션 추가</DialogTitle>
                            </DialogHeader>
                            <AddSessionForm onSubmit={handleAddSession} />
                        </DialogContent>
                    </Dialog>
                </div>

                <SessionList
                    sessions={displaySessions}
                    sessionApplicationCounts={displaySessionCounts}
                    onDeleteSession={handleDeleteSession}
                    onEditSession={(session) => setEditingSession(session as any)}
                    onStatusChange={handleStatusChange}
                    onAddSession={() => setAddSessionDialogOpen(true)}
                    classId={classId}
                />

                {/* 세션 수정 다이얼로그 */}
                <Dialog open={!!editingSession} onOpenChange={(open) => !open && setEditingSession(null)}>
                    <DialogContent className="mx-4 md:mx-auto rounded-3xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-[#191F28]">세션 수정</DialogTitle>
                        </DialogHeader>
                        {editingSession && (
                            <EditSessionFormDialog
                                session={editingSession}
                                onSubmit={handleEditSession}
                                onCancel={() => setEditingSession(null)}
                            />
                        )}
                    </DialogContent>
                </Dialog>

                {/* 삭제 확인 다이얼로그 */}
                <ConfirmDialog
                    open={deleteConfirmOpen}
                    onOpenChange={setDeleteConfirmOpen}
                    onConfirm={confirmDeleteSession}
                    title="세션을 삭제하시겠습니까?"
                    description="삭제된 세션은 복구할 수 없습니다."
                    confirmText="삭제"
                    cancelText="취소"
                    variant="destructive"
                />

                <FloatingGuideButton pageId="class-detail" />
            </div >

            {/* Preview Dialog */}
            {
                previewData && (
                    <PreviewDialog
                        isOpen={previewDialogOpen}
                        onClose={() => setPreviewDialogOpen(false)}
                        previewData={previewData}
                    />
                )
            }
        </div >
    );
}