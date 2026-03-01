"use client";

import { useEffect, useState } from "react";
import { Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { api, onedayClassApi, sessionApi, type OnedayClassResponse, type User } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import { ClassList } from "@/components/dashboard/ClassList";
import { CreateClassForm } from "@/components/dashboard/CreateClassForm";
import { PreviewDialog } from "@/components/dialog/PreviewDialog";
import { ClassDetailResponse } from "@/components/preview/ClassPreview";
import { FloatingGuideButton } from "@/components/coachmark";
import { useCoachmark } from "@/components/coachmark/hooks/useCoachmark";

export default function ClassesPage() {
    const [templates, setTemplates] = useState<OnedayClassResponse[]>([]);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
    const [previewData, setPreviewData] = useState<ClassDetailResponse | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [templateSessionCounts, setTemplateSessionCounts] = useState<Record<string, number>>({});
    const [hasFormData, setHasFormData] = useState(false);
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

    const { isDemoMode, currentAction, isActive } = useCoachmark();

    // 코치마크용 데모 미리보기 데이터
    const demoPreviewData: ClassDetailResponse = {
        id: 'demo-preview',
        name: '웹 개발 기초 강의',
        description: '프론트엔드 개발의 기초를 배우는 강의입니다. HTML, CSS, JavaScript의 핵심 개념을 익히고 실습해봅니다.',
        location: '강남역 인근 스터디룸',
        locationDetails: '2층 세미나실',
        preparation: '노트북, 필기구',
        instructions: '강의 시작 10분 전까지 입장해주세요.',
        imageUrls: [],
        parkingInfo: '건물 내 주차 가능 (2시간 무료)',
        cancellationPolicy: '강의 3일 전까지 전액 환불 가능',
    };

    // 코치마크 액션에 따라 다이얼로그 열기/닫기
    useEffect(() => {
        if (!isActive) return;

        if (currentAction === 'open-create-class-dialog') {
            setCreateDialogOpen(true);
            // 미리보기 다이얼로그도 함께 열기 (데모 데이터 설정)
            setPreviewData(demoPreviewData);
            setPreviewDialogOpen(true);
        } else if (currentAction === 'close-create-class-dialog') {
            setCreateDialogOpen(false);
            setPreviewDialogOpen(false);
        }
    }, [currentAction, isActive]);

    // 데모 모드용 가짜 클래스 (가이드 실행 중에만 표시)
    const demoTemplate: OnedayClassResponse = {
        id: 999999, // Use number for ID
        instructorId: 999999,
        classCode: 'DEMO001',
        name: '웹 개발 기초 강의',
        description: '프론트엔드 개발의 기초를 배우는 강의입니다',
        location: '강남역 인근 스터디룸',
        locationDetails: '2층 세미나실',
        preparation: '노트북, 필기구',
    };

    // 실제 데이터와 데모 데이터 결합
    const displayTemplates = isDemoMode && templates.length === 0
        ? [demoTemplate]
        : templates;

    useEffect(() => {
        const checkAuth = async () => {
            const currentUser = await api.auth.getCurrentUser();
            if (currentUser) {
                await api.initializeDemoData(currentUser.id);
                setUser(currentUser);
                loadTemplates();
            }
        };
        checkAuth();
    }, []);

    const loadTemplates = async () => {
        const myTemplates = await onedayClassApi.getMyClasses();
        setTemplates(myTemplates);
    };

    // 템플릿별 세션 수 로드
    useEffect(() => {
        const loadTemplateSessionCounts = async () => {
            if (templates.length > 0) {
                const counts: Record<string, number> = {};
                for (const template of templates) {
                    if (template.id) {
                        try {
                            const templateSessions = await onedayClassApi.getClassSessions1({ classId: Number(template.id) });
                            counts[String(template.id)] = templateSessions.length;
                        } catch (e) {
                            console.error(`Failed to load sessions for template ${template.id}`, e);
                        }
                    }
                }
                setTemplateSessionCounts(counts);
            }
        };

        loadTemplateSessionCounts();
    }, [templates]);

    const handleCreateTemplate = async (data: any) => {
        if (!user) return;

        try {
            await onedayClassApi.createClass({
                onedayClassCreateRequest: {
                    name: data.name,
                    description: data.description,
                    location: data.location,
                    locationDetails: data.locationDetails,
                    preparation: data.preparation,
                    instructions: data.instructions,
                    cancellationPolicy: data.cancellationPolicy,
                    parkingInfo: data.parkingInfo,
                    images: data.images || [],
                }
            });
            setCreateDialogOpen(false);
            setPreviewDialogOpen(false);
            await loadTemplates();
        } catch (error) {
            const message = await getErrorMessage(error, '클래스 생성 중 오류가 발생했습니다.');
            toast.error('클래스 생성 실패', {
                description: message
            });
            console.error('Failed to create template:', error);
        }
    };

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
        // Track if form has any data
        const hasData = !!(
            data.name ||
            data.description ||
            data.location ||
            data.locationDetails ||
            data.preparation ||
            data.instructions ||
            data.imageUrls.length > 0 ||
            data.parkingInfo ||
            data.cancellationPolicy
        );
        setHasFormData(hasData);

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
        // Note: Dialog opening is now handled in CreateClassForm button click
    };

    const handleDeleteTemplate = (
        e: React.MouseEvent,
        templateId: string
    ) => {
        e.stopPropagation();
        setTemplateToDelete(templateId);
        setDeleteConfirmOpen(true);
    };

    const confirmDeleteTemplate = async () => {
        if (!templateToDelete) return;

        try {
            await onedayClassApi.deleteClass({ classId: Number(templateToDelete) });
            await loadTemplates();
            toast.success('클래스가 삭제되었습니다', {
                description: '클래스가 성공적으로 삭제되었습니다.'
            });
        } catch (err: any) {
            const message = await getErrorMessage(err, '클래스 삭제에 실패했습니다.');
            toast.error('삭제 실패', {
                description: message
            });
        } finally {
            setTemplateToDelete(null);
        }
    };

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="space-y-5 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-[#191F28]">클래스 관리</h1>
                    <p className="text-sm md:text-base text-[#8B95A1] mt-1">클래스와 세션을 관리하세요</p>
                </div>

                <Button
                    className="w-full sm:w-auto"
                    onClick={() => setCreateDialogOpen(true)}
                    data-coachmark="create-class-btn"
                >
                    <Plus className="mr-2 h-5 w-5" />
                    클래스 만들기
                </Button>
            </div>

            {displayTemplates.length === 0 ? (
                <Card className="hover:shadow-md">
                    <CardContent className="p-10 md:p-16 text-center">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-[#E8F3FF] rounded-full flex items-center justify-center mx-auto mb-5">
                            <Calendar className="h-8 w-8 md:h-10 md:w-10 text-[#3182F6]" />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-[#191F28] mb-2">
                            아직 클래스가 없습니다
                        </h3>
                        <p className="text-sm md:text-base text-[#8B95A1] mb-6">
                            첫 번째 클래스를 만들어보세요
                        </p>
                        <Button onClick={() => setCreateDialogOpen(true)} className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            클래스 만들기
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <ClassList
                    templates={displayTemplates}
                    onDelete={handleDeleteTemplate}
                    templateSessionCounts={templateSessionCounts}
                />
            )}

            {/* Create Class Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={(open) => {
                if (!open && hasFormData) {
                    // Show confirmation dialog if form has data
                    setShowCloseConfirm(true);
                } else {
                    setCreateDialogOpen(open);
                    if (!open) {
                        setPreviewDialogOpen(false);
                        setHasFormData(false);
                    }
                }
            }}>
                <DialogTrigger asChild>
                    <button className="hidden" />
                </DialogTrigger>
                <DialogContent
                    className="max-w-2xl w-[92vw] md:w-full max-h-[90vh] overflow-hidden rounded-3xl p-0 border-none"
                    style={{
                        left: !isMobile && previewDialogOpen ? 'calc(50% - 260px)' : '50%',
                        transition: 'left 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    onInteractOutside={(e) => {
                        // Prevent closing when clicking on preview dialog
                        e.preventDefault();
                    }}
                >
                    <DialogHeader className="px-6 pt-6 shrink-0 bg-white">
                        <DialogTitle className="text-xl font-bold text-[#191F28]">새 클래스 만들기</DialogTitle>
                    </DialogHeader>
                    <div className="overflow-y-auto max-h-[calc(90vh-80px)] px-6 pb-6">
                        <CreateClassForm
                            onSubmit={handleCreateTemplate}
                            onCancel={() => {
                                setCreateDialogOpen(false);
                                setPreviewDialogOpen(false);
                            }}
                            onPreview={handlePreview}
                            onOpenPreview={() => setPreviewDialogOpen(true)}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Preview Dialog */}
            {previewData && (
                <PreviewDialog
                    isOpen={previewDialogOpen}
                    onClose={() => setPreviewDialogOpen(false)}
                    previewData={previewData}
                />
            )}

            {/* Close Confirmation Dialog */}
            <AlertDialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
                <AlertDialogContent className="!max-w-[360px] z-[9999]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>작성 중인 내용이 있어요</AlertDialogTitle>
                        <AlertDialogDescription>
                            지금 닫으면 입력한 내용이 사라져요. 닫으시겠어요?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>계속 작성하기</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-[#3182F6] hover:bg-[#1B64DA]"
                            onClick={() => {
                                setCreateDialogOpen(false);
                                setPreviewDialogOpen(false);
                                setHasFormData(false);
                                setShowCloseConfirm(false);
                            }}
                        >
                            네, 닫을게요
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* 삭제 확인 다이얼로그 */}
            <ConfirmDialog
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                onConfirm={confirmDeleteTemplate}
                title="클래스를 삭제하시겠습니까?"
                description="삭제하면 관련된 모든 세션도 함께 삭제됩니다. 이 작업은 복구할 수 없습니다."
                confirmText="삭제"
                cancelText="취소"
                variant="destructive"
            />

            <FloatingGuideButton pageId="classes" />
        </div>
    );
}