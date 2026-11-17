interface GoalRingProps {
  current: number;
  target: number;
  label: string;
}

// 반원 계기판 — "목표 대비 단일 비율"만 표현. 오른쪽 끝 = 목표의 1.5배, 목표 위치에 눈금.
export function GoalRing({ current, target, label }: GoalRingProps) {
  const r = 72;
  const cx = 95;
  const cy = 100;
  const max = target * 1.5;
  const arc = Math.PI * r;
  const filled = arc * Math.max(0, Math.min(current / max, 1));
  const targetAngle = Math.PI * (1 - target / max);
  const at = (rad: number) => [cx + Math.cos(targetAngle) * rad, cy - Math.sin(targetAngle) * rad];
  const [t1x, t1y] = at(r - 13);
  const [t2x, t2y] = at(r + 13);
  const [lx, ly] = at(r + 24);
  const onTarget = current >= target;
  const gap = current - target;
  const path = `M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 190 132" className="w-full max-w-60" role="img" aria-label={`${label} ${current.toFixed(2)}% (목표 ${target}%)`}>
        <path d={path} fill="none" stroke="var(--track)" strokeWidth="14" strokeLinecap="round" />
        <path
          d={path}
          fill="none"
          stroke="var(--chart-1)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${arc}`}
        />
        <line x1={t1x} y1={t1y} x2={t2x} y2={t2y} stroke="var(--foreground)" strokeWidth="2" />
        <text x={lx} y={ly + 3} textAnchor="middle" className="fill-muted-foreground text-[10px]">
          목표
        </text>
        <text x={cx} y={cy - 10} textAnchor="middle" className="fill-foreground font-mono text-[28px] font-semibold">
          {current.toFixed(2)}%
        </text>
        <text x={cx - r} y={cy + 20} textAnchor="middle" className="fill-muted-foreground font-mono text-[10px]">
          0
        </text>
        <text x={cx + r} y={cy + 20} textAnchor="middle" className="fill-muted-foreground font-mono text-[10px]">
          {max.toFixed(2)}
        </text>
        <text
          x={cx}
          y={cy + 20}
          textAnchor="middle"
          className={`text-[12px] font-semibold ${onTarget ? "fill-good" : "fill-critical"}`}
        >
          목표 {target}% {onTarget ? "달성" : "미달"}
        </text>
      </svg>
      <p className="text-xs text-muted-foreground">
        {label} · 목표 대비 {gap >= 0 ? "+" : ""}
        {gap.toFixed(2)}%p
      </p>
    </div>
  );
}
