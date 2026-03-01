"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { api } from "@/lib/api";
import { getErrorMessage, validateEmail } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const isLoggedIn = await api.auth.isLoggedIn();
      if (isLoggedIn) {
        const user = await api.auth.getCurrentUser();
        if (user?.role === 'admin') {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setValidationErrors({});
    setIsLoading(true);

    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!validateEmail(email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다.";
    }
    if (!password) newErrors.password = "비밀번호를 입력해주세요.";

    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      await api.auth.login({ loginRequest: { email, password } });
      const user = await api.auth.getCurrentUser();
      if (user?.role === 'admin') {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      const message = await getErrorMessage(err, "로그인에 실패했습니다.");
      setError(message);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F4F6] p-4 sm:p-6">
      <Card className="w-full max-w-[420px] p-2 sm:p-4">
        <CardHeader className="text-center pb-2">
          <Link href="/" className="inline-block">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-[#3182F6] cursor-pointer hover:opacity-80 transition-opacity">
              Class Hub
            </CardTitle>
          </Link>
          <CardDescription className="text-sm sm:text-base mt-2 text-[#6B7684]">
            강사 대시보드에 로그인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (validationErrors.email) setValidationErrors({ ...validationErrors, email: undefined });
                }}
              />
              {validationErrors.email && (
                <p className="text-xs text-[#F04452] font-medium mt-1">{validationErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (validationErrors.password) setValidationErrors({ ...validationErrors, password: undefined });
                }}
              />
              {validationErrors.password && (
                <p className="text-xs text-[#F04452] font-medium mt-1">{validationErrors.password}</p>
              )}
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-[#FFEBEE] text-[#F04452] text-sm font-medium">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <p className="text-sm text-[#6B7684]">
              계정이 없으신가요?{" "}
              <Link href="/signup" className="text-[#3182F6] hover:underline font-semibold">
                회원가입
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 외부 지원 채팅방 플로팅 버튼 */}
      <div className="fixed bottom-8 right-8 z-50">
        <a
          href="https://open.kakao.com/o/smZhnnhi"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-center w-12 h-12 bg-white text-[#4E5968] rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100/80 hover:text-[#191F28] hover:bg-gray-50 transition-all duration-300 hover:-translate-y-1 active:scale-95 relative"
          aria-label="강사 지원 카카오톡 문의"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="absolute right-full mr-4 px-3.5 py-2 bg-[#191F28] text-white text-[13px] font-medium rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm">
            강사 지원 카카오톡 1:1 문의
          </span>
        </a>
      </div>
    </div>
  );
}
