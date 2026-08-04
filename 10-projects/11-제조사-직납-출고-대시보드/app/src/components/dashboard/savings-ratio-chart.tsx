"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface SavingsRatioChartProps {
  months: string[];
  ratios: number[];
  savingsTotals: number[];
  // 월별 목표치 — 기간 중 목표가 바뀌면(예: 2026-07부터 1.6%→1.3%) 값이 달라질 수 있어 배열로 받는다
  targets: number[];
}

function formatEok(value: number) {
  return `${(value / 100_000_000).toFixed(1)}억`;
}

export function SavingsRatioChart({ months, ratios, savingsTotals, targets }: SavingsRatioChartProps) {
  const data = months.map((month, i) => ({
    month,
    ratio: ratios[i],
    savings: savingsTotals[i] ?? 0,
    target: targets[i],
  }));
  const ratioMax = Math.ceil((Math.max(...ratios, ...targets, 0) + 0.2) * 10) / 10;
  const savingsMax = Math.max(...data.map((d) => d.savings), 0) * 1.2;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
        <YAxis
          yAxisId="savings"
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatEok}
          domain={[0, savingsMax || "auto"]}
        />
        <YAxis
          yAxisId="ratio"
          orientation="right"
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${v}%`}
          domain={[0, ratioMax]}
        />
        <Tooltip
          contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
          formatter={(value, name) => {
            if (typeof value !== "number") return [value, name];
            return name === "절감액" ? [`${value.toLocaleString()}원`, name] : [`${value.toFixed(2)}%`, name];
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar yAxisId="savings" dataKey="savings" name="절감액" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false} />
        {/* isAnimationActive=false: react-smooth never resolves under React 19,
            leaving the path stuck at its hidden (stroke-dashoffset) starting state */}
        <Line
          yAxisId="ratio"
          type="monotone"
          dataKey="ratio"
          name="절감비율"
          stroke="var(--chart-4)"
          strokeWidth={2}
          dot={{ r: 4, fill: "var(--chart-4)", stroke: "var(--card)", strokeWidth: 1.5 }}
          isAnimationActive={false}
        />
        <Line
          yAxisId="ratio"
          type="linear"
          dataKey="target"
          name="목표"
          stroke="var(--critical)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          dot={false}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
