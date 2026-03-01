"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  api,
  SettlementResponse,
  SettlementSummaryResponse,
  SettlementResponseStatusEnum,
  InstructorAdminResponse,
  OnedayClassDetailResponse,
  SessionResponse,
  ReservationResponse
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, CreditCard, Calendar, Clock, CheckCircle2, AlertCircle, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SessionWithSettlement {
  classTitle: string;
  session: SessionResponse;
  settlements: SettlementResponse[];
  reservations: Record<number, ReservationResponse>;
  totalAmount: number;
  readyCount: number;
}

export default function InstructorSettlementPage() {
  const params = useParams();
  const router = useRouter();
  const instructorId = Number(params.instructorId);

  const [instructor, setInstructor] = useState<InstructorAdminResponse | null>(null);
  const [overallSummary, setOverallSummary] = useState<SettlementSummaryResponse | null>(null);
  const [sessionsWithSettlement, setSessionsWithSettlement] = useState<SessionWithSettlement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [expandedSessions, setExpandedSessions] = useState<Record<number, boolean>>({});

  const toggleSession = (sessionId: number) => {
    setExpandedSessions(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }));
  };

  const fetchAllData = async () => {
    try {
      if (!api.settlement) return;

      // 1. Fetch instructor info
      const instructors = await api.admin.getAllInstructors();
      const currentInstructor = instructors.find(i => i.instructorId === instructorId);
      setInstructor(currentInstructor || null);

      // 2. Fetch overall settlement summary
      const summary = await api.settlement.getSettlementsByInstructor({ instructorId });
      setOverallSummary(summary);

      // 3. Fetch classes and sessions
      const classes = await api.instructor.getMyClasses1({ instructorId });

      // 4. For each session, fetch its settlements and reservations
      const sessionData: SessionWithSettlement[] = [];

      for (const cls of classes) {
        if (!cls.sessions) continue;
        for (const sess of cls.sessions) {
          if (!sess.id) continue;

          try {
            const [settlementRes, reservationRes] = await Promise.all([
              api.settlement.getSettlementsBySession({ sessionId: sess.id }),
              api.reservation.getReservations({ sessionId: sess.id })
            ]);

            const settlements = settlementRes.settlements || [];
            if (settlements.length === 0) continue; // Skip sessions with no settlements

            const reservations: Record<number, ReservationResponse> = {};
            reservationRes.forEach(r => {
              if (r.reservationId) reservations[r.reservationId] = r;
            });

            const totalAmount = settlements.reduce((acc, s) => acc + (s.amount || 0), 0);
            const readyCount = settlements.filter(s => s.status === SettlementResponseStatusEnum.Ready).length;

            sessionData.push({
              classTitle: cls.title || '알 수 없는 클래스',
              session: sess,
              settlements,
              reservations,
              totalAmount,
              readyCount
            });
          } catch (e) {
            console.error(`Failed to fetch data for session ${sess.id}`, e);
          }
        }
      }

      // Sort sessions by date descending
      sessionData.sort((a, b) => {
        const dateA = a.session.date ? new Date(a.session.date).getTime() : 0;
        const dateB = b.session.date ? new Date(b.session.date).getTime() : 0;
        return dateB - dateA;
      });

      setSessionsWithSettlement(sessionData);
    } catch (error) {
      console.error("Failed to fetch all data", error);
      toast.error("데이터를 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const user = await api.auth.getCurrentUser();
      if (!user || user.role !== 'admin') {
        router.push("/login");
        return;
      }
      fetchAllData();
    };
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instructorId, router]);

  const handlePaySettlement = async (id: number) => {
    if (!api.settlement) return;

    setIsProcessing(id);
    try {
      await api.settlement.paySettlement({ id });
      toast.success("정산 처리가 완료되었습니다.");
      await fetchAllData();
    } catch (error) {
      console.error("Failed to pay settlement", error);
      toast.error("정산 처리에 실패했습니다.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handlePayAllInSession = async (sessData: SessionWithSettlement) => {
    if (!api.settlement) return;

    const readyItems = sessData.settlements.filter(s => s.status === SettlementResponseStatusEnum.Ready && s.id != null);
    if (readyItems.length === 0) return;

    const dateStr = sessData.session.date ? new Date(sessData.session.date).toLocaleDateString() : '';
    if (!confirm(`${sessData.classTitle} (${dateStr}) 의 모든 대기 항목을 정산 처리하시겠습니까?`)) return;

    setIsLoading(true);
    try {
      await Promise.all(readyItems.map(item => api.settlement!.paySettlement({ id: item.id! })));
      toast.success("해당 세션의 모든 정산이 완료되었습니다.");
      await fetchAllData();
    } catch (error) {
      console.error("Failed to pay all settlements in session", error);
      toast.error("일부 정산 처리에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayAllForInstructor = async () => {
    if (!api.settlement) return;

    const allReadyItems: SettlementResponse[] = [];
    sessionsWithSettlement.forEach(sess => {
      sess.settlements.forEach(s => {
        if (s.status === SettlementResponseStatusEnum.Ready && s.id != null) {
          allReadyItems.push(s);
        }
      });
    });

    if (allReadyItems.length === 0) {
      toast.info("정산 대기 중인 항목이 없습니다.");
      return;
    }

    if (!confirm(`${instructor?.name || '강사'}님의 모든 대기 항목(${allReadyItems.length}건)을 정산 처리하시겠습니까?`)) return;

    setIsLoading(true);
    try {
      await Promise.all(allReadyItems.map(item => api.settlement!.paySettlement({ id: item.id! })));
      toast.success("강사의 모든 정산 처리가 완료되었습니다.");
      await fetchAllData();
    } catch (error) {
      console.error("Failed to pay all settlements for instructor", error);
      toast.error("일부 정산 처리에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !sessionsWithSettlement.length) {
    return (
      <div className="min-h-screen bg-[#F2F4F6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#3182F6] animate-spin" />
          <p className="text-[#6B7684] font-medium">정산 내역을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F4F6] pb-12">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-[#4E5968] hover:bg-gray-100 rounded-full">
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#191F28]">{instructor?.name || '강사'}님 정산 관리</h1>
                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 font-semibold px-2">ADMIN</Badge>
              </div>
            </div>
          </div>
          <Button
            className="bg-[#3182F6] hover:bg-[#1b64da] font-bold shadow-sm h-10 px-5"
            onClick={handlePayAllForInstructor}
            disabled={isLoading || sessionsWithSettlement.every(s => s.readyCount === 0)}
          >
            전체 정산 및 지급
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Summary Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow">
            <CardHeader className="p-8 pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-pink-50 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-pink-600" />
                </div>
                <CardTitle className="text-sm font-semibold text-[#6B7684] uppercase tracking-wider">정산 대기 중</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="text-4xl font-black text-[#F04452]">
                {overallSummary?.totalReadyAmount?.toLocaleString()}
                <span className="text-xl font-bold ml-1">원</span>
              </div>
              <p className="text-sm text-[#8B95A1] mt-2 font-medium">강사에게 지급해야 할 미정산 금액입니다.</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow">
            <CardHeader className="p-8 pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 rounded-xl">
                  <CheckCircle2 className="w-6 h-6 text-[#3182F6]" />
                </div>
                <CardTitle className="text-sm font-semibold text-[#6B7684] uppercase tracking-wider">누적 정산 완료</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="text-4xl font-black text-[#191F28]">
                {overallSummary?.totalPaidAmount?.toLocaleString()}
                <span className="text-xl font-bold ml-1">원</span>
              </div>
              <p className="text-sm text-[#8B95A1] mt-2 font-medium">현재까지 정산 처리가 완료된 총 누적 금액입니다.</p>
            </CardContent>
          </Card>
        </div>

        {/* Sessions List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#191F28] flex items-center gap-2">
              <Calendar className="w-6 h-6 text-[#3182F6]" />
              세션별 상세 내역
            </h2>
            <div className="text-sm text-[#6B7684] font-medium">
              총 <span className="text-[#3182F6]">{sessionsWithSettlement.length}</span>개의 세션 탐색됨
            </div>
          </div>

          {sessionsWithSettlement.length === 0 ? (
            <Card className="border-none shadow-sm bg-white p-20 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-[#8B95A1] font-medium text-lg">아직 발생한 정산 내역이 없습니다.</p>
            </Card>
          ) : (
            sessionsWithSettlement.map((sessData, idx) => (
              <Card key={idx} className="border-none shadow-sm bg-white overflow-hidden hover:ring-1 hover:ring-blue-100 transition-all">
                <div className="bg-[#FAFBFD] px-8 py-5 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-lg font-bold text-[#191F28] leading-tight">{sessData.classTitle}</span>
                    <div className="flex items-center gap-4 text-sm text-[#6B7684] font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#8B95A1]" />
                        {sessData.session.date ? new Date(sessData.session.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#8B95A1]" />
                        {sessData.session.startTime} ~ {sessData.session.endTime}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xs font-bold text-[#8B95A1] mb-0.5">합계</div>
                      <div className="text-xl font-black text-[#3182F6]">{sessData.totalAmount.toLocaleString()}원</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {sessData.readyCount > 0 && (
                        <Button
                          size="sm"
                          className="bg-[#3182F6] hover:bg-[#1b64da] h-10 px-5 font-bold shadow-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePayAllInSession(sessData);
                          }}
                        >
                          세션 전체 정산
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 px-3 text-[#4E5968] font-bold"
                        onClick={() => sessData.session.id && toggleSession(sessData.session.id)}
                      >
                        {expandedSessions[sessData.session.id || 0] ? (
                          <>상세 접기 <ChevronUp className="w-4 h-4 ml-1.5" /></>
                        ) : (
                          <>상세 내역 <ChevronDown className="w-4 h-4 ml-1.5" /></>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                {expandedSessions[sessData.session.id || 0] && (
                  <CardContent className="p-0 border-t border-gray-100 animate-in fade-in slide-in-from-top-1 duration-200">
                    <Table>
                      <TableHeader className="bg-gray-50/30">
                        <TableRow className="hover:bg-transparent border-none">
                          <TableHead className="py-4 pl-10 text-[#4E5968] font-bold text-xs uppercase">예약 정보</TableHead>
                          <TableHead className="text-[#4E5968] font-bold text-xs uppercase">발생 금액</TableHead>
                          <TableHead className="text-[#4E5968] font-bold text-xs uppercase">상태</TableHead>
                          <TableHead className="text-[#4E5968] font-bold text-xs uppercase">최근 업데이트</TableHead>
                          <TableHead className="w-[140px] pr-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sessData.settlements.map((item) => {
                          const reservation = sessData.reservations[item.reservationId || 0];
                          return (
                            <TableRow key={item.id} className="hover:bg-gray-50/40 border-gray-50">
                              <TableCell className="py-5 pl-10">
                                <div className="font-bold text-[#191F28] text-base">{reservation?.applicantName || '정보 없음'}</div>
                                <div className="text-xs text-[#8B95A1] font-medium mt-0.5">Reservation ID: {item.reservationId}</div>
                              </TableCell>
                              <TableCell className="font-black text-[#191F28] text-base">
                                {item.amount?.toLocaleString()}원
                              </TableCell>
                              <TableCell>
                                {item.status === SettlementResponseStatusEnum.Paid ? (
                                  <div className="flex items-center gap-1.5 text-blue-600 font-bold text-sm bg-blue-50 w-fit px-2.5 py-1 rounded-md">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    정산완료
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 text-orange-600 font-bold text-sm bg-orange-50 w-fit px-2.5 py-1 rounded-md">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    정산대기
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="text-[#6B7684] text-sm font-medium">
                                {item.paidAt ?
                                  new Date(item.paidAt).toLocaleString('ko-KR') :
                                  item.createdAt ? new Date(item.createdAt).toLocaleString('ko-KR') : '-'
                                }
                              </TableCell>
                              <TableCell className="pr-10 text-right">
                                {item.status === SettlementResponseStatusEnum.Ready && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isProcessing === item.id}
                                    className="h-9 px-4 text-xs font-bold border-gray-200 text-[#3182F6] hover:bg-blue-50 border-blue-100"
                                    onClick={() => item.id && handlePaySettlement(item.id)}
                                  >
                                    {isProcessing === item.id ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                    ) : (
                                      <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                                    )}
                                    정산 완료 처리
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
