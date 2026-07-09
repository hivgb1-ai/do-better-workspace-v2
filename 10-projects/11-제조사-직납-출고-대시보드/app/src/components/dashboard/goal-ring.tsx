interface GoalRingProps {
  current: number;
  target: number;
  label: string;
}

// 원형 게이지 — 파이/도넛 대신 "목표 대비 단일 비율" 표현에만 사용 (dataviz 가이드 준수)
export function GoalRing({ current, target, label }: GoalRingProps) {
  const r = 54;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(current / target, 1.5) / 1.5; // 150%를 풀 링으로 스케일
  const offset = circumference * (1 - pct);
  const onTarget = current >= target;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 140 140" className="h-36 w-36" role="img" aria-label={`${label} ${current}%`}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--track)" strokeWidth="12" />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke={onTarget ? "var(--good)" : "var(--chart-1)"}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
        />
        <text x="70" y="66" textAnchor="middle" className="fill-foreground text-[22px] font-semibold">
          {current.toFixed(2)}%
        </text>
        <text x="70" y="84" textAnchor="middle" className="fill-muted-foreground text-[10px]">
          목표 {target}%
        </text>
      </svg>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
