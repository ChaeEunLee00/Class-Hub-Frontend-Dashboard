import React from 'react';
import { Panel } from './Panel';
import { QrPlaceholder } from './QrPlaceholder';
import { AlertCircle, CheckCircle2, XCircle, ArrowRight, Layers, Check, ChevronRight, Bell, Calendar, MapPin, MousePointerClick, MessageSquareQuote, TrendingUp, Users, ArrowDown, LayoutDashboard } from 'lucide-react';

// Design: Static Print Version (No interactions)
// Inside Pages: All White Backgrounds with Permanent Color Accents

export function InsideFrame() {
  return (
    <div className="flex overflow-hidden bg-white rounded-none">

      {/* 
        LEFT PANEL (Problem) - 100mm - 378px
        Style: White Background / Dark Text / Red Accents
      */}
      <Panel width="378px" bg="bg-white border-r border-slate-200" className="relative p-0 text-slate-900">
        <div className="h-full flex flex-col pt-10 px-10 pb-14 relative">
          {/* Static Red Accent Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>

          <div className="mb-10">
            <span className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase mb-4 block">Problem</span>
            <h2 className="text-3xl font-bold text-slate-900 leading-tight tracking-tight mb-4">
              원데이 클래스 운영,<br />
              <span className="text-red-600 decoration-red-200 underline decoration-4 underline-offset-4">왜 힘들까요?</span>
            </h2>
            <div className="flex items-start gap-2">
              <span className="text-[9px] font-bold tracking-widest uppercase bg-[#0a2176] text-white px-1.5 py-0.5 rounded-sm shrink-0 mt-0.5">핵심 타겟</span>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                인스타/네이버로 예약을 받는<br />
                소규모 원데이 클래스 운영자 (공방·PT 등)
              </p>
            </div>
          </div>

          <div className="space-y-6 flex-1 border-l border-slate-200 pl-6 ml-2 relative">
            {/* Static Accent Line */}
            <div className="absolute top-0 bottom-0 -left-px w-px bg-red-200"></div>

            {[
              {
                icon: <Bell size={16} />,
                boldText: "DM이 여기저기 흩어져서",
                text: " 신청이 누락되거나 중복될 때가 있어요. 결국 엑셀로 재관리해요.",
                break: false,
              },
              {
                icon: <XCircle size={16} />,
                boldText: "마감·대기·취소 안내를",
                text: " 매번 직접 하다 보니, 안내만으로도 시간이 많이 들어요.",
                break: false,
              },
              {
                icon: <MapPin size={16} />,
                boldText: "수업이 끝나도 회원 이력이 남지 않아,",
                text: "단골·재방문을 만들기 어려워요.",
                break: true,
              }
            ].map((item, i) => (
              <div key={i} className="relative pb-2">
                <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 bg-white border-2 border-red-500 rounded-full z-10"></div>
                <p className="text-slate-800 leading-relaxed text-[15px] pl-2 mb-1 tracking-tight">
                  <strong className="font-bold">{item.boldText}</strong>
                  {item.break ? <><br /><span className="font-medium text-slate-700">{item.text}</span></> : <span className="font-medium text-slate-700">{item.text}</span>}
                </p>
              </div>
            ))}

            <div className="pl-2 pt-4">
              <p className="text-lg font-bold leading-snug tracking-tight">
                결국 <span className="text-red-600">'수업'</span>보다 <span className="text-red-600">'운영'</span>이<br />더 힘들어져요
              </p>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-100">
            <div className="min-h-[96px] flex flex-col justify-center">
              <p className="text-lg font-bold text-slate-800 leading-snug">
                <span className="decoration-red-400 underline decoration-2 underline-offset-4">
                  "운영이 복잡할수록,<br />강사는 수업에 집중하기<br />힘들어집니다."
                </span>
              </p>
            </div>
          </div>
        </div>
      </Panel>

      {/* 
        CENTER PANEL (Solution) - 100mm - 378px
        Style: White Background / Brand Color Accents (#0a2176)
      */}
      <Panel width="378px" bg="bg-white border-r border-slate-200" className="relative p-0 text-slate-900">
        <div className="h-full flex flex-col pt-10 px-10 pb-14 relative">
          {/* Static Brand Blue Accent Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-[#0a2176]"></div>

          <div className="mb-6">
            <span className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase mb-4 block">Solution</span>
            <h2 className="text-3xl font-bold text-slate-900 leading-tight tracking-tight mb-3">
              ClassHub가<br />
              <span className={`text-[#0a2176] decoration-blue-100 underline decoration-4 underline-offset-4`}>하는 일</span>
            </h2>
            <p className="text-center text-sm font-bold text-slate-800 bg-slate-50 py-2 rounded border border-slate-100">
              "복잡한 설정 없이, 바로 쓰는 운영 자동화"
            </p>
          </div>

          {/* Process Flow Cards */}
          <div className="space-y-3 flex-1 relative">
            {/* Connecting Line for Flow */}
            <div className="absolute left-[19px] top-4 bottom-12 w-0.5 bg-slate-100 -z-10"></div>

            {[
              {
                title: "클래스 생성 시, 신청 링크 자동 생성",
                desc: "신청·정원 마감·공지까지 통합 관리",
                sub: "인스타/네이버 프로필에 링크 하나만 붙이면 끝",
                icon: Layers
              },
              {
                title: "자동 안내 시나리오",
                desc: "신청 확정 · D-3/D-1 리마인드 자동 발송",
                sub: "안내 메시지를 따로 보내지 않아도 돼요",
                icon: Bell
              },
              {
                title: "변경 공지 즉시 발송",
                desc: "장소/시간 변경 · 취소 공지까지 한 곳에서",
                sub: "변경 사항이 생기면 전체 참여자에게 바로 알려요",
                icon: MousePointerClick
              },
              {
                title: "대시보드 실시간 관리",
                desc: "신청자 현황 · 마감 여부를 한눈에 확인",
                sub: "이동 중에도 모바일로 바로 관리해요",
                icon: LayoutDashboard
              }
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-start p-3 border border-slate-200 bg-white rounded shadow-sm relative group">
                <div className={`w-10 h-10 rounded-full bg-slate-50 text-[#0a2176] flex items-center justify-center shrink-0 border border-slate-200 shadow-sm z-10`}>
                  <item.icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-[13px] tracking-tight mb-0.5">{item.title}</h4>
                  <p className="text-[#0a2176] text-xs leading-relaxed font-bold mb-1">
                    {item.desc}
                  </p>
                  <p className="text-slate-400 text-[10px] leading-snug font-medium">
                    {item.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Demo Section - Brand Color Box - Static */}
          <div className="mt-auto pt-4 border-t border-slate-100">
            <div className="flex items-center gap-4 bg-[#0a2176] text-white p-4 border border-blue-900 rounded-sm shadow-none">
              <QrPlaceholder
                label="운영 화면 체험"
                size="w-16 h-16"
                className="bg-white border-2 border-white shrink-0 text-[#0a2176]"
              />
              <div>
                <strong className="block text-base text-white mb-1">운영 화면 바로 보기</strong>
                <p className="text-xs text-blue-100 leading-snug mb-0">
                  클래스 생성부터 알림 발송까지,<br />
                  강사님 모드를 직접 체험해보세요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      {/* 
        RIGHT PANEL (Proof/Beta Story) - 97mm - 367px
        Style: White Background / Dark Text / Green Accents
      */}
      <Panel width="378px" bg="bg-white border-l border-slate-200" className="relative p-0 text-slate-900">
        <div className="h-full flex flex-col pt-10 px-8 pb-14 relative">
          {/* Static Green Accent Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-green-600"></div>

          {/* Header */}
          <div className="mb-8">
            <span className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase mb-4 block">Beta Validation</span>
            <h2 className="text-3xl font-bold text-slate-900 leading-tight tracking-tight mb-4">
              <span className="text-green-600">강사님들의 목소리</span>로<br />증명했습니다.
            </h2>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              MVP 베타 테스트 완료 · 02.19~03.05 (2주)<br />
              소규모 원데이 클래스 강사 <strong className="text-slate-600">5명</strong> 대상
            </p>
          </div>

          {/* 이런 점이 좋아요 */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-3.5 bg-green-500 rounded-full"></div>
              <h4 className="text-xs font-bold text-green-700 uppercase tracking-widest">이런 점이 좋아요</h4>
            </div>
            <ul className="space-y-2">
              {[
                "링크 하나로 신청받으니 편리해요. 응대 시간이 줄어서 수업 준비에 더 집중할 수 있어요.",
                "실시간 신청 현황이 한눈에 보여 마감/정원 관리가 쉬워요.",
                "신청 후 안내가 자동으로 나가서 중복·누락 같은 운영 실수가 줄었어요.",
              ].map((text, i) => (
                <li key={i} className="flex gap-2.5 items-center border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                  <span className="text-[11px] font-bold text-green-500 shrink-0">→</span>
                  <p className="text-[13px] text-slate-700 leading-snug">{text}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* 이런 기능이 필요해요 */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-3.5 bg-[#0a2176] rounded-full"></div>
              <h4 className="text-xs font-bold text-[#0a2176] uppercase tracking-widest">
                이런 기능이 필요해요
              </h4>
              <span className="text-[10px] text-slate-400 font-medium ml-1">확장 개발 완료</span>
            </div>
            <ul className="space-y-2">
              {[
                "결제까지 한 번에 되면 좋겠어요.",
                "자동 알림뿐 아니라, 변경 공지도 바로 보낼 수 있으면 좋겠어요.",
                "수업 전에 통증 여부와 같은 수강생 정보를 미리 알 수 있으면 좋겠어요.",
              ].map((q, i) => (
                <li key={i} className="flex gap-2.5 items-center border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                  <span className="text-[11px] font-bold text-emerald-500 shrink-0">→</span>
                  <p className="text-[13px] text-slate-500 leading-snug">{q}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* ROI Proof */}
          <div className="mt-auto pt-4 border-t border-slate-100">
            <div className="min-h-[96px] flex flex-col justify-between">
              <div className="mb-2">
                <div className="flex items-center justify-between mb-0.5">
                  <h4 className="text-xs font-bold tracking-widest uppercase text-slate-500">Time Proof</h4>
                  <span className="text-[10px] text-slate-400">(가정) 월 15회 x 회당 6명 = 월 90명</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  ClassHub를 사용하면 이만큼 운영 시간을 아낄 수 있어요.
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <div className="flex-1 text-center bg-slate-50 rounded px-2 py-1.5">
                  <p className="text-[10px] text-slate-400 mb-0.5">운영 시간</p>
                  <p className="text-sm font-bold text-slate-900">14h <span className="text-green-600">→ 4h</span></p>
                </div>
                <div className="flex-1 text-center bg-slate-50 rounded px-2 py-1.5">
                  <p className="text-[10px] text-slate-400 mb-0.5">월 절약</p>
                  <p className="text-sm font-bold text-green-600">8~12h</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </Panel>
    </div>
  );
}