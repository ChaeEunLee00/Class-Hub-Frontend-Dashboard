import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // 오류가 났을 때 트레이싱(추적 정보)을 100% 보냅니다. (실 서비스에서는 0.1~0.5 등 조정 필요)
  tracesSampleRate: 1,

  // 노이즈(불필요한 에러) 필터링
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "Network Error",
    // 401 권한 없음 에러나 의미 없는 에러 문구를 이곳에 추가할 수 있습니다.
  ],

  // Sentry 디버그 모드 (로컬 설정 중일 때는 true로 볼 수도 있음)
  debug: false,

  // 세션 리플레이 설정
  replaysOnErrorSampleRate: 1.0, // 에러 발생 시 리플레이 100% 녹화
  replaysSessionSampleRate: 0.1, // 일반 세션에서는 10%만 녹화 (비용 관리)

  integrations: [
    Sentry.replayIntegration({
      // 민감한 텍스트 마스킹 (사용자의 개인정보 등은 *** 로 처리됨)
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
