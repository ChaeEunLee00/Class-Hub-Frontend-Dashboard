"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  api,
  SettlementResponse,
  SettlementSummaryResponse,
  SettlementResponseStatusEnum,
  OnedayClassDetailResponse,
  SessionResponse,
} from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";

interface SessionRevenue {
  classTitle: string;
  session: SessionResponse;
  totalRevenue: number;
  settlements: SettlementResponse[];
}

export default function InstructorSettlementDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [overallSummary, setOverallSummary] = useState<SettlementSummaryResponse | null>(null);
  const [sessionRevenues, setSessionRevenues] = useState<SessionRevenue[]>([]);
  const [expandedSessions, setExpandedSessions] = useState<Record<number, boolean>>({});

  const toggleSession = (sessionId: number) => {
    setExpandedSessions(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }));
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const user = await api.auth.getCurrentUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const instructorId = Number(user.id);

      // 1. Fetch settlement summary
      if (api.settlement) {
        const summary = await api.settlement.getSettlementsByInstructor({ instructorId });
        setOverallSummary(summary);
      }

      // 2. Fetch classes to get sessions and revenue
      const classes = await api.instructor.getMyClasses1({ instructorId });
      const revenues: SessionRevenue[] = [];

      for (const cls of classes) {
        if (!cls.sessions) continue;
        for (const sess of cls.sessions) {
          if (!sess.id) continue;

          try {
            let settlements: SettlementResponse[] = [];
            if (api.settlement) {
              const res = await api.settlement.getSettlementsBySession({ sessionId: sess.id });
              settlements = res.settlements || [];
            }

            const totalRevenue = settlements.reduce((acc, s) => acc + (s.amount || 0), 0);

            revenues.push({
              classTitle: cls.title || '알 수 없는 클래스',
              session: sess,
              totalRevenue,
              settlements
            });
          } catch (e) {
            console.error(`Failed to fetch session ${sess.id} data`, e);
          }
        }
      }

      // Sort by date descending
      revenues.sort((a, b) => {
        const dateA = a.session.date ? new Date(a.session.date).getTime() : 0;
        const dateB = b.session.date ? new Date(b.session.date).getTime() : 0;
        return dateB - dateA;
      });

      setSessionRevenues(revenues);
    } catch (error) {
      console.error("Failed to fetch settlement data", error);
      toast.error("데이터를 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-[#3182F6] animate-spin mb-4" />
        <p className="text-[#8B95A1] font-medium">정산 내역을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#191F28]">정산 및 매출 관리</h1>
        <p className="text-[#6B7684] mt-1">클래스 운영을 통한 수익과 정산 현황을 한눈에 확인하세요.</p>
      </div>

      <Tabs defaultValue="settlement" className="space-y-6">
        <TabsList className="bg-white p-1 h-auto border border-gray-200 rounded-xl">
          <TabsTrigger value="settlement" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-[#3182F6] data-[state=active]:text-white font-bold">
            정산 현황
          </TabsTrigger>
          <TabsTrigger value="sales" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-[#3182F6] data-[state=active]:text-white font-bold">
            매출 현황
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settlement" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-[#3182F6]" />
                  </div>
                  <CardTitle className="text-sm font-semibold text-[#6B7684]">정산 완료 금액</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-[#191F28]">
                  {overallSummary?.totalPaidAmount?.toLocaleString() || 0}
                  <span className="text-lg font-bold ml-1">원</span>
                </div>
                <p className="text-xs text-[#8B95A1] mt-2">지급이 완료된 총 누적 정산액입니다.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <CardTitle className="text-sm font-semibold text-[#6B7684]">정산 예정 금액</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-orange-600">
                  {overallSummary?.totalReadyAmount?.toLocaleString() || 0}
                  <span className="text-lg font-bold ml-1">원</span>
                </div>
                <p className="text-xs text-[#8B95A1] mt-2">정산 처리 대기 중인 금액입니다.</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Lists per Session */}
          <div className="space-y-4">
            <h3 className="font-bold text-[#191F28]">최근 정산 내역</h3>
            {sessionRevenues.length === 0 ? (
              <Card className="p-12 text-center bg-white border-none shadow-sm">
                <CreditCard className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-[#8B95A1]">표시할 정산 내역이 없습니다.</p>
              </Card>
            ) : (
              sessionRevenues.filter(r => r.settlements.length > 0).map((rev, idx) => (
                <Card key={idx} className="border-none shadow-sm bg-white overflow-hidden">
                  <div
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleSession(rev.session.id!)}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-[#191F28]">{rev.classTitle}</span>
                      <div className="flex items-center gap-3 text-xs text-[#8B95A1]">
                        <span>{rev.session.date ? new Date(rev.session.date).toLocaleDateString() : '-'}</span>
                        <span>{rev.session.startTime} ~ {rev.session.endTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs text-[#8B95A1]">정산 합계</div>
                        <div className="font-black text-[#3182F6]">{rev.totalRevenue.toLocaleString()}원</div>
                      </div>
                      {expandedSessions[rev.session.id!] ? <ChevronUp className="w-5 h-5 text-[#8B95A1]" /> : <ChevronDown className="w-5 h-5 text-[#8B95A1]" />}
                    </div>
                  </div>
                  {expandedSessions[rev.session.id!] && (
                    <CardContent className="p-0 border-t border-gray-100">
                      <Table>
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead className="pl-6 text-xs">예약번호</TableHead>
                            <TableHead className="text-xs">상태</TableHead>
                            <TableHead className="text-right pr-6 text-xs">정산액</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rev.settlements.map((s) => (
                            <TableRow key={s.id}>
                              <TableCell className="pl-6 text-sm font-medium">#{s.reservationId}</TableCell>
                              <TableCell>
                                {s.status === SettlementResponseStatusEnum.Paid ? (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 font-bold">정산완료</Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-100 font-bold">정산대기</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right pr-6 font-bold">{s.amount?.toLocaleString()}원</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <CardTitle className="text-lg">세션별 매출 현황</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="pl-6">클래스 / 일시</TableHead>
                    <TableHead className="text-center">상태</TableHead>
                    <TableHead className="text-right pr-6">총 매출액</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessionRevenues.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-40 text-center text-[#8B95A1]">
                        매출 데이터가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sessionRevenues.map((rev, idx) => (
                      <TableRow key={idx} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="pl-6 py-4">
                          <div className="font-bold text-[#191F28]">{rev.classTitle}</div>
                          <div className="text-xs text-[#8B95A1] mt-1">
                            {rev.session.date ? new Date(rev.session.date).toLocaleDateString() : '-'} | {rev.session.startTime}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-bold",
                              rev.session.status === "COMPLETED" ? "bg-gray-50 text-gray-500 border-gray-200" : "bg-green-50 text-green-600 border-green-100"
                            )}
                          >
                            {rev.session.status === "COMPLETED" ? "종료됨" : "모집중"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="text-lg font-black text-[#191F28]">{rev.totalRevenue.toLocaleString()}원</div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
