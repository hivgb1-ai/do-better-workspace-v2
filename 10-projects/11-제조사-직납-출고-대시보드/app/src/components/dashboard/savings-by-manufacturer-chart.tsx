"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface SavingsByManufacturerChartProps {
  manufacturers: string[];
  months: string[];
  savingsByManufacturerMonth: Record<string, number[]>;
  manufacturerColor: Record<string, string>;
}

function formatEok(value: number) {
  return `${(value / 100_000_000).toFixed(1)}억`;
}

export function SavingsByManufacturerChart({
  manufacturers,
  months,
  savingsByManufacturerMonth,
  manufacturerColor,
}: SavingsByManufacturerChartProps) {
  const data = months.map((month, i) => {
    const row: Record<string, string | number> = { month };
    for (const m of manufacturers) row[m] = savingsByManufacturerMonth[m]?.[i] ?? 0;
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barGap={2} barCategoryGap={24}>
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
          formatter={(value) => (typeof value === "number" ? `${value.toLocaleString()}원` : value)}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {/* isAnimationActive=false: react-smooth (recharts' animation dep) never resolves
            under React 19, leaving bars at height 0 permanently */}
        {manufacturers.map((m, i) => (
          <Bar
            key={m}
            dataKey={m}
            name={m}
            stackId="savings"
            fill={manufacturerColor[m]}
            radius={i === manufacturers.length - 1 ? [4, 4, 0, 0] : undefined}
            maxBarSize={24}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
