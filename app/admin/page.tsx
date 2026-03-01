"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, InstructorAdminResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LogOut, Users, BookOpen, Calendar, CheckCircle, Search, Settings, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AdminPage() {
  const router = useRouter();
  const [instructors, setInstructors] = useState<InstructorAdminResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const user = await api.auth.getCurrentUser();
      if (!user || user.role !== 'admin') {
        router.push("/login");
        return;
      }
      fetchInstructors();
    };
    checkAuth();
  }, [router]);

  const fetchInstructors = async () => {
    try {
      const data = await api.admin.getAllInstructors();
      setInstructors(data);
    } catch (error) {
      console.error("Failed to fetch instructors", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await api.auth.logout();
    router.push("/");
  };

  const handleResetPassword = async (instructorId: number) => {
    if (!confirm("해당 강사의 비밀번호를 재설정하시겠습니까?")) return;

    try {
      await api.admin.resetInstructorPassword({ instructorId });
      toast.success("재설정 되었습니다.");
    } catch (error) {
      console.error("Failed to reset password", error);
      toast.error("비밀번호 재설정에 실패했습니다.");
    }
  };

  const filteredInstructors = instructors.filter(i =>
    (i.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalClasses = instructors.reduce((acc, curr) => acc + (curr.onedayClassCount || 0), 0);
  const totalSessions = instructors.reduce((acc, curr) => acc + (curr.sessionCount || 0), 0);
  const totalReservations = instructors.reduce((acc, curr) => acc + (curr.reservationCount || 0), 0);

  return (
    <div className="min-h-screen bg-[#F2F4F6] pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#3182F6] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <h1 className="text-xl font-bold text-[#191F28]">Class Hub Admin</h1>
            <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-600 border-blue-100">관리자</Badge>
          </div>
          <Button variant="ghost" className="text-[#4E5968] hover:text-[#191F28]" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            로그아웃
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-none shadow-sm overflow-hidden bg-white">
            <CardHeader className="p-6 pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <CardTitle className="text-sm font-medium text-[#4E5968]">총 강사 수</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="text-3xl font-bold text-[#191F28]">{instructors.length}명</div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden bg-white">
            <CardHeader className="p-6 pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                <CardTitle className="text-sm font-medium text-[#4E5968]">총 클래스</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="text-3xl font-bold text-[#191F28]">{totalClasses}개</div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden bg-white">
            <CardHeader className="p-6 pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <CardTitle className="text-sm font-medium text-[#4E5968]">전체 세션</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="text-3xl font-bold text-[#191F28]">{totalSessions}회</div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden bg-white">
            <CardHeader className="p-6 pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <CardTitle className="text-sm font-medium text-[#4E5968]">누적 예약 수</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="text-3xl font-bold text-[#191F28]">{totalReservations}건</div>
            </CardContent>
          </Card>
        </div>

        {/* Table Section */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="p-8 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-bold text-[#191F28]">강사 정보 관리</CardTitle>
                <CardDescription className="text-[#6B7684] mt-1">시스템에 등록된 모든 강사의 활동 내역을 확인합니다.</CardDescription>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B95A1]" />
                <Input
                  placeholder="강사 이름 또는 이메일 검색"
                  className="pl-10 h-11 bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[200px] text-[#4E5968] font-semibold py-4 pl-8">강사명</TableHead>
                  <TableHead className="text-[#4E5968] font-semibold">이메일</TableHead>
                  <TableHead className="text-[#4E5968] font-semibold">가입일시</TableHead>
                  <TableHead className="text-center text-[#4E5968] font-semibold">클래스 수</TableHead>
                  <TableHead className="text-center text-[#4E5968] font-semibold">세션 수</TableHead>
                  <TableHead className="text-center text-[#4E5968] font-semibold">예약 수</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7} className="h-16 text-center animate-pulse bg-gray-50/20"></TableCell>
                    </TableRow>
                  ))
                ) : filteredInstructors.length > 0 ? (
                  filteredInstructors.map((instructor, index) => (
                    <TableRow key={index} className="hover:bg-gray-50/30 transition-colors">
                      <TableCell className="font-medium text-[#191F28] py-5 pl-8">
                        <button
                          className="hover:text-blue-600 hover:underline transition-colors"
                          onClick={() => instructor.instructorId != null && router.push(`/admin/settlement/${instructor.instructorId}`)}
                        >
                          {instructor.name || '-'}
                        </button>
                      </TableCell>
                      <TableCell className="text-[#4E5968]">{instructor.email || '-'}</TableCell>
                      <TableCell className="text-[#4E5968]">
                        {instructor.createdAt ? new Date(instructor.createdAt).toLocaleString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-50 font-medium">
                          {instructor.onedayClassCount || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-[#4E5968] font-medium">{instructor.sessionCount || 0}</TableCell>
                      <TableCell className="text-center text-[#4E5968] font-medium">{instructor.reservationCount || 0}</TableCell>
                      <TableCell className="pr-8 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs border-gray-200 text-[#4E5968] hover:text-[#3182F6] hover:border-[#3182F6]"
                            onClick={() => instructor.instructorId != null && handleResetPassword(instructor.instructorId)}
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            재설정
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-[#8B95A1] hover:text-[#3182F6]">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-40 text-center text-[#6B7684]">
                      검색 결과가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
