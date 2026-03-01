"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Menu, X, LogOut, Calendar, MessageSquare, Settings, CreditCard } from "lucide-react";
import { api } from "@/lib/api";
import type { User } from "@/lib/api/types";

import { toast } from "sonner"; // Add import

function DashboardContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const ref = searchParams.get('ref');

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const onboardingProcessed = useRef(false);

    useEffect(() => {
        const checkAuth = async () => {
            const currentUser = await api.auth.getCurrentUser();
            if (!currentUser) {
                router.push("/login");
                return;
            }
            setUser(currentUser);

            // Only check onboarding if ref=landing
            if (ref === 'landing') {
                checkOnboarding(currentUser.id);
            }
        };
        checkAuth();
    }, [router, ref]);

    const checkOnboarding = async (instructorId: string) => {
        if (onboardingProcessed.current) return;

        const dataStr = localStorage.getItem('onboarding_class_data');
        if (!dataStr) return;

        // Lock immediately to prevent double execution
        onboardingProcessed.current = true;

        try {
            const data = JSON.parse(dataStr);

            // Validate Data
            if (!data.name) {
                console.warn("Onboarding data missing class name, skipping creation.");
                localStorage.removeItem('onboarding_class_data');
                return;
            }

            // Create Template using generated API
            // Note: instructorId might be implicit from token or not needed in generated API request body if handled by backend
            const template = await api.onedayClass.createClass({
                onedayClassCreateRequest: {
                    name: data.name,
                    description: data.description,
                    location: data.location,
                    locationDetails: data.locationDetails,
                    preparation: data.preparation,
                    instructions: data.instructions,
                    cancellationPolicy: data.cancellationPolicy,
                    parkingInfo: data.parkingInfo,
                    images: data.images
                }
            });
            // Create Session if date exists
            if (data.date && data.startTime) {
                const startTimeParts = data.startTime.split(':');
                // Assuming endTime is available or calculated.
                // If endTime is not in data, we might need default duration.
                // Legacy code had duration? data.startTime + duration?
                // Let's assume 2 hours default if endTime missing.
                const startHour = parseInt(startTimeParts[0]);
                const startMinute = parseInt(startTimeParts[1]);
                const endHour = startHour + 2; // Default 2 hours duration

                await api.session.createSession({
                    sessionCreateRequest: {
                        templateId: Number(template.id),
                        date: new Date(data.date), // "2024-03-15" string to Date works? Date constructor handles YYYY-MM-DD
                        startTime: `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}:00`,
                        endTime: `${String(endHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}:00`,
                        capacity: Number(data.capacity) || 10, // Default to 10 if not provided
                        price: Number(data.price) || 0 // Default to 0 if not provided
                    }
                });
            }

            toast.success("작성하신 클래스가 자동으로 개설되었습니다.");
            localStorage.removeItem('onboarding_class_data');
            router.refresh(); // Refresh data
            router.replace("/dashboard"); // Clean up URL
        } catch (e) {
            console.error("Onboarding Error:", e);
        }
    };

    const handleLogout = async () => {
        await api.auth.logout();
        router.push("/login");
    };

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F2F4F6]">
                <div className="w-12 h-12 border-4 border-[#E5E8EB] border-t-[#3182F6] rounded-full animate-spin mb-4"></div>
                <p className="text-[#8B95A1] font-medium">로딩 중...</p>
            </div>
        );
    }

    // Helper to check active link
    const isActive = (path: string) => pathname?.startsWith(path);

    return (
        <div className="min-h-screen bg-[#F2F4F6]">
            {/* 모바일 오버레이 배경 */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* 사이드바 */}
            <div
                className={`
        w-72 bg-white border-r border-[#E5E8EB] h-screen fixed left-0 top-0 flex flex-col z-50
        transform transition-transform duration-300 ease-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}
            >
                <div className="p-6 border-b border-[#E5E8EB] flex items-center justify-between">
                    <button onClick={() => router.push('/')} className="text-left hover:opacity-80 transition-opacity">
                        <h2 className="text-xl font-bold text-[#3182F6]">Class Hub</h2>
                        <p className="text-sm text-[#8B95A1] mt-1">{user.name}님</p>
                    </button>
                    {/* 모바일 닫기 버튼 */}
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 rounded-xl hover:bg-[#F2F4F6] transition-colors">
                        <X className="h-5 w-5 text-[#6B7684]" />
                    </button>
                </div>

                <nav className="flex-1 p-4">
                    <div className="space-y-1">
                        <button
                            onClick={() => {
                                router.push("/dashboard/classes");
                                setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 ${isActive("/dashboard/classes")
                                ? "bg-[#E8F3FF] text-[#3182F6]"
                                : "text-[#4E5968] hover:bg-[#F2F4F6]"
                                }`}
                        >
                            <Calendar className="h-5 w-5" />
                            <span className="font-semibold">클래스 관리</span>
                        </button>

                        <button
                            onClick={() => {
                                router.push("/dashboard/messages");
                                setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 ${isActive("/dashboard/messages")
                                ? "bg-[#E8F3FF] text-[#3182F6]"
                                : "text-[#4E5968] hover:bg-[#F2F4F6]"
                                }`}
                        >
                            <MessageSquare className="h-5 w-5" />
                            <span className="font-semibold">메시지 센터</span>
                        </button>

                        <button
                            onClick={() => {
                                router.push("/dashboard/settlement");
                                setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 ${isActive("/dashboard/settlement")
                                ? "bg-[#E8F3FF] text-[#3182F6]"
                                : "text-[#4E5968] hover:bg-[#F2F4F6]"
                                }`}
                        >
                            <CreditCard className="h-5 w-5" />
                            <span className="font-semibold">정산 관리</span>
                        </button>

                        <button
                            onClick={() => {
                                router.push("/dashboard/profile");
                                setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 ${isActive("/dashboard/profile")
                                ? "bg-[#E8F3FF] text-[#3182F6]"
                                : "text-[#4E5968] hover:bg-[#F2F4F6]"
                                }`}
                        >
                            <Settings className="h-5 w-5" />
                            <span className="font-semibold">정보 수정</span>
                        </button>
                    </div>
                </nav>

                <div className="p-4 border-t border-[#E5E8EB]">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[#6B7684] hover:bg-[#F2F4F6] hover:text-[#F04452] transition-all duration-200 group"
                    >
                        <LogOut className="h-5 w-5 group-hover:text-[#F04452] transition-colors" />
                        <span className="font-semibold">로그아웃</span>
                    </button>
                </div>
            </div>

            {/* 모바일 헤더 */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#E5E8EB] z-30 flex items-center px-4 shadow-sm">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2.5 rounded-xl hover:bg-[#F2F4F6] transition-colors active:scale-95"
                >
                    <Menu className="h-6 w-6 text-[#4E5968]" />
                </button>
                <h1 className="ml-3 font-bold text-[#3182F6] text-lg">Class Hub</h1>
            </div>

            {/* 기기별 메인 컨텐츠 영역 */}
            <div className="md:pl-72 pt-16 md:pt-0 min-h-screen relative">
                <main className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 pb-24">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F2F4F6]">
                <div className="w-12 h-12 border-4 border-[#E5E8EB] border-t-[#3182F6] rounded-full animate-spin mb-4"></div>
                <p className="text-[#8B95A1] font-medium">로딩 중...</p>
            </div>
        }>
            <DashboardContent>
                {children}
            </DashboardContent>
        </Suspense>
    );
}
