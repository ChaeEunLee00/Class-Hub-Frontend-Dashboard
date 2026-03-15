"use client";

import * as Sentry from "@sentry/nextjs";
import Error from "next/error";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    // 예상치 못한 루트 레벨 에러 발생 시 Sentry로 리포팅합니다.
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <Error statusCode={500} title="앗! 예상치 못한 문제가 발생했습니다." />
      </body>
    </html>
  );
}
