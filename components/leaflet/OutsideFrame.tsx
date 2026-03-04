import React from 'react';
import { Panel } from './Panel';
import { QrPlaceholder } from './QrPlaceholder';
import { Globe, Mail, ArrowLeft } from 'lucide-react';

// Design: Static Print Version (No interactions)
// Front Cover: Brand Deep Navy (#0a2176) with Swiss Style Layout
// Others: White Background / Brand Navy Text

export function OutsideFrame() {
  const brandBlue = "#0a2176";

  const teamMembers = [
    { name: '방재윤', role: 'Plan', type: 'qr' },
    { name: '이채은', role: 'Dev', type: 'qr' },
    { name: '문창일', role: 'Dev', type: 'qr' }
  ];

  return (
    <div className="flex overflow-hidden bg-white rounded-none w-full">

      {/* 
        LEFT PANEL (Flap) - 97mm - 367px
        Style: White Background / Dark Text
      */}
      <Panel width="367px" bg="bg-white text-slate-900" className="border-r border-slate-200 relative shrink-0">
        <div className="flex flex-col h-full p-8 relative z-10">

          <div className="space-y-8 mt-6">
            {/* Section 1: Business Model */}
            <div className="border-l border-slate-200 pl-5 relative">
              <span className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-[#0a2176]"></span>
              <h3 className="text-xs font-bold mb-3 tracking-wide uppercase text-[#0a2176]">Business Model</h3>
              <p className="text-xs text-slate-600 font-medium mb-3 leading-relaxed">
                결제 발생 시 과금되는 <strong className="text-slate-900">거래 기반 수수료 모델</strong>
              </p>

              {/* Fee Breakdown */}
              <div className="bg-slate-50 border border-slate-200 rounded p-2.5 mb-2.5">
                <p className="text-xs text-slate-500 font-medium mb-2">총 <strong className="text-slate-900">6% 내외 (예시)</strong></p>
                <div className="flex gap-1.5 items-center">
                  <div className="flex-1 text-center bg-white border border-slate-200 rounded px-1.5 py-1">
                    <p className="text-[10px] text-slate-400 font-medium">PG</p>
                    <p className="text-sm font-bold text-slate-900">2.8%</p>
                  </div>
                  <span className="text-slate-300 text-xs font-bold">+</span>
                  <div className="flex-1 text-center bg-[#0a2176] rounded px-1.5 py-1">
                    <p className="text-[10px] text-blue-300 font-medium">ClassHub</p>
                    <p className="text-sm font-bold text-white">3.2%</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 text-center font-medium">알림톡 · 운영 자동화 비용 포함</p>
              </div>
            </div>

            {/* Section 2: Market Expansion + TAM/SAM/SOM */}
            <div className="border-l border-slate-200 pl-5 relative">
              <span className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-[#0a2176]"></span>
              <h3 className="text-xs font-bold mb-3 tracking-wide uppercase text-[#0a2176]">Market Expansion</h3>
              <ul className="space-y-2 mb-3">
                <li className="text-xs text-slate-600 font-medium leading-snug">
                  <strong className="text-slate-900">타겟 확장</strong> 원데이→정기 클래스까지 확장하며, 강사 외 소규모 모임·클래스 개설자도 사용 가능
                </li>
                <li className="text-xs text-slate-600 font-medium leading-snug">
                  <strong className="text-slate-900">기능 확장</strong> 운영 자동화를 기반으로, 노쇼·재방문·인기 클래스 등 운영 데이터 인사이트 제공 가능
                </li>
              </ul>
              <ul className="space-y-2">
                {[
                  { label: "TAM", color: "bg-blue-900", text: "국내 '예약·체험·클래스' 수요 전반" },
                  { label: "SAM", color: "bg-[#0a2176]", text: "온라인으로 모집/예약을 받는 클래스 운영자 전체" },
                  { label: "SOM", color: "bg-blue-400", text: "(초기) 인스타/네이버 기반 원데이 클래스 강사" },
                ].map((item) => (
                  <li key={item.label} className="flex gap-2 items-center">
                    <span className={`${item.color} text-white text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 font-mono`}>{item.label}</span>
                    <p className="text-xs text-slate-600 font-medium leading-snug">{item.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="w-full h-px bg-slate-100 mt-auto mb-6 flex items-center gap-2 pt-5">
            <div className="h-1 w-1 rounded-full bg-[#0a2176]"></div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">Class Hub Business Plan</span>
          </div>
        </div>
      </Panel>

      {/* 
        CENTER PANEL (Back) - 100mm - 378px
        Style: White Background / Dark Text
      */}
      <Panel width="378px" bg="bg-white text-slate-900" className="border-r border-slate-200 relative shrink-0">
        <div className="flex flex-col h-full p-8 relative z-10 justify-between">

          {/* Top: Title */}
          <div className="text-center w-full pt-8">
            <h2 className="text-3xl font-bold tracking-tight mb-2 text-slate-900">Team Class Hub</h2>
            <p className="text-slate-500 text-xs font-bold tracking-[0.2em] uppercase">원데이 클래스 운영 자동화 SaaS</p>
            <div className="w-8 h-1 mx-auto mt-6 bg-[#0a2176]"></div>
          </div>

          {/* Middle: Coming Soon */}
          <div className="px-2 text-center">
            <p className="text-sm text-slate-700 font-medium leading-relaxed mb-5">
              베타 피드백을 반영해, 단순 예약 관리를 넘어<br />
              <strong className="text-[#0a2176]">강사님의 파트너(CRM)</strong>로<br />
              정식 출시를 준비하고 있습니다.
            </p>
            <div className="inline-flex items-center gap-2 bg-[#0a2176] text-white px-3 py-1.5 rounded-full">
              <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-[11px] font-bold tracking-widest uppercase">Official Launch Coming Soon</span>
            </div>
          </div>

          {/* Bottom: Team + Contact */}
          <div>
            <div className="mb-8">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="h-px w-8 bg-slate-200"></div>
                <p className="text-xs text-slate-400 text-center uppercase tracking-widest font-bold">Contact Us</p>
                <div className="h-px w-8 bg-slate-200"></div>
              </div>

              <div className="flex justify-between items-end gap-2 px-1">
                {teamMembers.map((member, i) => (
                  <div key={i} className="flex flex-col items-center w-1/3">
                    <div className="bg-white p-1 rounded mb-3 border border-slate-200 shadow-sm w-full aspect-square flex items-center justify-center max-w-[80px]">
                      <QrPlaceholder label={member.name} size="w-full h-full" className="rounded-sm" />
                    </div>
                    <div className="text-center w-full">
                      <span className="font-bold block text-sm truncate w-full text-slate-900">{member.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono uppercase tracking-tight block mt-0.5 truncate w-full font-medium">{member.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-5 border-t border-slate-100 text-center mt-auto mb-3">
              <div className="flex items-center justify-center gap-6 text-xs text-slate-500 font-mono font-medium">
                <span className="flex items-center gap-2">
                  <Mail size={12} /> classhub.contact@gmail.com
                </span>
              </div>
            </div>
          </div>

        </div>
      </Panel>

      {/* 
        RIGHT PANEL (Front/Cover) - 100mm - 378px
        Style: Brand Deep Navy (#0a2176)
      */}
      <Panel width="378px" bg="bg-[#0a2176] text-white relative overflow-hidden" className="border-none grow shrink-0">
        <div className="absolute inset-0 bg-[#0a2176] z-0"></div>
        {/* Geometric Accents */}
        <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] border border-white/10 rounded-full pointer-events-none z-0"></div>
        <div className="absolute bottom-[20%] left-[-50px] w-[200px] h-[200px] border border-white/5 rounded-full pointer-events-none z-0"></div>

        <div className="flex flex-col h-full justify-between p-10 relative z-10 w-full">

          {/* Logo Section */}
          <div className="mt-8">
            <div className="w-32 h-10 bg-white/20 rounded flex items-center justify-center text-white font-bold tracking-widest text-xl">CLASS HUB</div>
          </div>

          {/* Main Copy Section */}
          <div className="flex-1 flex flex-col pt-10">
            <h1 className="text-[30px] leading-[1.35] font-bold tracking-tight text-white mb-10">
              강사님은<br />
              <span className="text-emerald-300">수업에만</span> 집중하세요.<br />
              운영은<br />
              <span className="text-emerald-300">ClassHub</span>가 맡을게요.
            </h1>

            <div className="space-y-6 border-l-2 border-blue-400/50 pl-6">
              <p className="text-xl font-bold text-white leading-snug tracking-tight">
                신청 · 결제 · 확정 · 공지까지<br />
                <span className="text-blue-200">한 번에 해결</span>하세요.
              </p>
              <p className="text-sm text-blue-100/80 font-medium leading-relaxed max-w-[280px]">
                강사의 운영 부담은 줄고,<br />
                수강생의 클래스 신청은 더 간단해집니다.
              </p>
            </div>

            {/* Spacer pushes CTA down */}
            <div className="flex-1 min-h-[24px]"></div>
          </div>

          {/* CTA Section */}
          <div className="mb-4">
            <div className="bg-white rounded-sm p-5 shadow-xl flex flex-row items-center gap-5 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-900"></div>

              <div className="shrink-0">
                <QrPlaceholder label="부스 신청" size="w-20 h-20" className="bg-slate-50" />
              </div>

              <div className="flex flex-col items-start justify-center flex-1">
                <h4 className="font-bold text-xl mb-1 text-[#0a2176] tracking-tight flex items-center gap-2">
                  <ArrowLeft size={18} className="text-blue-500" />
                  부스 체험 신청
                </h4>
                <p className="text-slate-500 text-sm mb-0 font-medium leading-snug">
                  기획자와 개발자와의<br />커피챗 기회 :)
                </p>
              </div>
            </div>
          </div>

        </div>
      </Panel>
    </div>
  );
}