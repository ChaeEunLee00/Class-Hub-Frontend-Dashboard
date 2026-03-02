"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AutoLoginPage() {
  const router = useRouter();
  const [status, setStatus] = useState("로그인 중...");
  const [error, setError] = useState("");

  useEffect(() => {
    const autoLogin = async () => {
      try {
        await api.auth.login({
          loginRequest: {
            email: "test@classhub.com",
            password: "test1234",
          },
        });

        setStatus("로그인 성공! 대시보드로 이동합니다...");

        const user = await api.auth.getCurrentUser();
        if (user?.role === 'admin') {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } catch (err: any) {
        console.error("Auto login failed:", err);
        setError(err.message || "자동 로그인에 실패했습니다.");
        setStatus("오류 발생");
      }
    };

    autoLogin();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F4F6] p-4">
      <Card className="w-full max-w-[420px] p-4">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-[#3182F6]">
            Class Hub
          </CardTitle>
          <CardDescription className="mt-2 text-[#6B7684]">
            자동 로그인 진행 중
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center pt-4">
          <p className={`text-lg transition-colors ${error ? "text-[#F04452]" : "text-[#333D4B]"}`}>
            {status}
          </p>
          {error && (
            <div className="mt-4 p-4 rounded-xl bg-[#FFEBEE] text-[#F04452] text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
