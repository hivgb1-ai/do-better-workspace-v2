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

interface MonthlyShipmentChartProps {
  manufacturers: string[];
  months: string[];
  shipmentByMonth: Record<string, number[]>;
  manufacturerColor: Record<string, string>;
}

export function MonthlyShipmentChart({
  manufacturers,
  months,
  shipmentByMonth,
  manufacturerColor,
}: MonthlyShipmentChartProps) {
  const data = months.map((month, i) => {
    const row: Record<string, string | number> = { month };
    for (const m of manufacturers) row[m] = shipmentByMonth[m]?.[i] ?? 0;
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
          tickFormatter={(v: number) => `${Math.round(v / 1000)}K`}
        />
        <Tooltip
          contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
          formatter={(value) => (typeof value === "number" ? value.toLocaleString() : value)}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {/* isAnimationActive=false: react-smooth (recharts' animation dep) never resolves
            under React 19, leaving bars at height 0 permanently */}
        {manufacturers.map((m) => (
          <Bar
            key={m}
            dataKey={m}
            fill={manufacturerColor[m]}
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
