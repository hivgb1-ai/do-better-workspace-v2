import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // xlsx의 Node 전용 buffer 처리가 Turbopack 서버 컴포넌트 번들링과 충돌해
  // "Cannot access file" 오류를 일으켜 네이티브 require로 우회
  serverExternalPackages: ["xlsx"],
  // data/savings-source의 xlsx는 동적으로 디렉터리를 스캔해 읽어서(fs.readdirSync) 정적 분석으로 추적되지 않음 —
  // 명시하지 않으면 Vercel 배포 시 이 파일이 서버리스 함수 번들에서 빠져 프로덕션에서 조회가 안 됨
  outputFileTracingIncludes: {
    "/*": ["./data/savings-source/**/*"],
  },
};

export default nextConfig;
