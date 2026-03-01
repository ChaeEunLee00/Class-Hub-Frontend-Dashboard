"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// 전화번호 자동 포맷팅 (01012345678 → 010-1234-5678)
const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
};

export default function ProfilePage() {
    const router = useRouter();
    const [userId, setUserId] = useState<string>('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [profileUrl, setProfileUrl] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(formatPhoneNumber(e.target.value));
    };

    useEffect(() => {
        const fetchUser = async () => {
            const user = await api.auth.getCurrentUser();
            if (user) {
                setUserId(user.id);
                setName(user.name ?? '');
                setEmail(user.email);
                setPhone(user.phoneNumber || '');
                setProfileUrl(user.profileUrl || '');
                console.log('정보', user.profileUrl);
            } else {
                router.push('/login');
            }
        };
        fetchUser();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 비밀번호 확인 검증
        if (password && password !== confirmPassword) {
            toast.error('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            setIsLoading(true);

            const updateData: any = {
                name,
                phoneNumber: phone,
                profileUrl: profileUrl,
            };

            // 비밀번호를 입력한 경우에만 포함
            if (password) {
                updateData.password = password;
            }

            await api.instructor.updateInstructor({
                instructorId: Number(userId),
                instructorUpdateRequest: updateData
            });

            // localStorage의 사용자 정보도 업데이트
            const currentUser = await api.auth.getCurrentUser();
            if (currentUser) {
                const updatedUser = {
                    ...currentUser,
                    name,
                    phoneNumber: phone,
                    profileUrl: profileUrl,
                };
                localStorage.setItem('classhub_auth_user', JSON.stringify(updatedUser));
            }

            toast.success('정보가 수정되었습니다.');

            // 비밀번호 필드 초기화
            setPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            const message = await getErrorMessage(error, '정보 수정에 실패했습니다.');
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto space-y-6">
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-[#191F28]">정보 수정</h1>
                <p className="text-sm md:text-base text-[#8B95A1] mt-1">계정 정보를 수정하세요</p>
            </div>

            <Card className="hover:shadow-md">
                <CardContent className="p-5 md:p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="profile-name">이름</Label>
                            <Input
                                id="profile-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="profile-email">이메일</Label>
                            <Input
                                id="profile-email"
                                value={email}
                                disabled
                                className="bg-gray-50 cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="profile-phone">전화번호</Label>
                            <Input
                                id="profile-phone"
                                value={phone}
                                onChange={handlePhoneChange}
                                type="tel"
                                maxLength={13}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="profile-url">프로필 링크 (선택)</Label>
                            <Input
                                id="profile-url"
                                value={profileUrl}
                                onChange={(e) => setProfileUrl(e.target.value)}
                                type="url"
                                placeholder="https://yourlink.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="profile-password">새 비밀번호</Label>
                            <Input
                                id="profile-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                type="password"
                                placeholder="변경하려면 입력하세요"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="profile-confirm-password">비밀번호 확인</Label>
                            <Input
                                id="profile-confirm-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                type="password"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            disabled={isLoading}
                        >
                            {isLoading ? '저장 중...' : '저장'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <button
                    onClick={async () => {
                        if (confirm('정말로 탈퇴하시겠습니까? 탈퇴 시 모든 정보와 클래스가 삭제되며 복구할 수 없습니다.')) {
                            try {
                                setIsLoading(true);
                                await api.instructor.withdraw({ instructorId: Number(userId) });
                                await api.auth.logout();
                                toast.success('탈퇴 처리가 완료되었습니다.');
                                router.push('/');
                            } catch (err: any) {
                                const message = await getErrorMessage(err, '탈퇴 처리에 실패했습니다.');
                                toast.error(message);
                            } finally {
                                setIsLoading(false);
                            }
                        }
                    }}
                    className="text-xs text-[#8B95A1] hover:text-[#F04452] underline underline-offset-4 transition-colors p-1"
                    disabled={isLoading}
                >
                    회원 탈퇴
                </button>
            </div>
        </div>
    );
}