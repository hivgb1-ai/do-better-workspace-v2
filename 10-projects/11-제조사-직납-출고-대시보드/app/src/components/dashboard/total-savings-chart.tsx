"use client";

import { Bar, CartesianGrid, ComposedChart, LabelList, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TABLE_LABEL_COL_WIDTH } from "@/lib/chart-layout";

interface TotalSavingsChartProps {
  months: string[];
  directSavings: number[];
  milkrunSavings: number[];
}

function formatEok(value: number) {
  return `${(value / 100_000_000).toFixed(1)}억`;
}

export function TotalSavingsChart({ months, directSavings, milkrunSavings }: TotalSavingsChartProps) {
  const data = months.map((month, i) => {
    const direct = directSavings[i] ?? 0;
    const milkrun = milkrunSavings[i] ?? 0;
    return { month, direct, milkrun, totalLabel: direct + milkrun };
  });

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={data} margin={{ top: 20, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
        <YAxis
          width={TABLE_LABEL_COL_WIDTH}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatEok}
        />
        <Tooltip
          contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
          formatter={(value, name) => {
            if (typeof value !== "number") return [value, name];
            return [`${Math.round(value / 1000).toLocaleString()}천원`, name];
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="direct" name="직납 절감액" stackId="total" fill="var(--chart-1)" maxBarSize={24} isAnimationActive={false} />
        <Bar dataKey="milkrun" name="밀크런 절감액" stackId="total" fill="var(--chart-3)" radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false} />
        {/* 합계(TTL) 라벨 전용 — 밀크런 절감액이 0인 달은 그 막대 구간 자체가 그려지지 않아 거기 얹은
            LabelList도 함께 사라진다(recharts 특성). 값이 0이 될 일이 없는 totalLabel을 보이지 않는
            선에 실어서, 스택 맨 위 위치에 항상 라벨이 뜨도록 함. */}
        <Line dataKey="totalLabel" stroke="none" dot={false} legendType="none" isAnimationActive={false}>
          <LabelList
            dataKey="totalLabel"
            position="top"
            formatter={(v) => (typeof v === "number" ? Math.round(v / 1000).toLocaleString() : "")}
            fontSize={12}
            fontWeight={600}
            fill="var(--foreground)"
          />
        </Line>
      </ComposedChart>
    </ResponsiveContainer>
  );
}
