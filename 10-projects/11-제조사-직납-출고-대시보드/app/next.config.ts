import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // xlsx의 Node 전용 buffer 처리가 Turbopack 서버 컴포넌트 번들링과 충돌해
  // "Cannot access file" 오류를 일으켜 네이티브 require로 우회.
  // puppeteer-core/@sparticuz/chromium도 동일한 이유(네이티브 바이너리 번들링)로 외부 패키지 처리 필요.
  serverExternalPackages: ["xlsx", "puppeteer-core", "@sparticuz/chromium"],
  // data/ 하위 xlsx들은 동적으로 디렉터리를 스캔해 읽어서(fs.readdirSync) 정적 분석으로 추적되지 않음 —
  // 명시하지 않으면 Vercel 배포 시 이 파일들이 서버리스 함수 번들에서 빠져 프로덕션에서 조회가 안 됨.
  // @sparticuz/chromium의 압축 바이너리(bin/*.br)도 chromium.executablePath()가 동적으로 경로를
  // 조립해 읽어서 같은 이유로 명시 필요 — export 라우트에만 필요하니 해당 경로로 스코프 한정.
  outputFileTracingIncludes: {
    "/*": ["./data/**/*"],
    "/api/monthly-report/export": ["./node_modules/@sparticuz/chromium/**/*"],
  },
};

export default nextConfig;
