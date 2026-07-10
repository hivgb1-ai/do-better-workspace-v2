"use client";

import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

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
    return { month, direct, milkrun, total: 0, totalLabel: direct + milkrun };
  });

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 20, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatEok}
        />
        <Tooltip
          contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
          formatter={(value, name) => {
            if (typeof value !== "number") return [value, name];
            return [`${value.toLocaleString()}원`, name];
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="direct" name="직납 절감액" stackId="total" fill="var(--chart-1)" isAnimationActive={false} />
        <Bar dataKey="milkrun" name="밀크런 절감액" stackId="total" fill="var(--chart-3)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
        {/* height 0으로 쌓아 스택 맨 위(total)에 TTL 라벨만 표시하는 트릭 */}
        <Bar dataKey="total" name="TTL" stackId="total" fill="transparent" isAnimationActive={false} legendType="none">
          <LabelList
            dataKey="totalLabel"
            position="top"
            formatter={(v) => (typeof v === "number" ? v.toLocaleString() : "")}
            fontSize={12}
            fontWeight={600}
            fill="var(--foreground)"
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
