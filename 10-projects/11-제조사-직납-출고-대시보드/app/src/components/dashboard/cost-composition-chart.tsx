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

interface CostCompositionChartProps {
  months: string[];
  directCosts: number[];
  milkrunCosts: number[];
}

function formatEok(value: number) {
  return `${(value / 100_000_000).toFixed(1)}억`;
}

export function CostCompositionChart({ months, directCosts, milkrunCosts }: CostCompositionChartProps) {
  const data = months.map((month, i) => {
    const direct = directCosts[i] ?? 0;
    const milkrun = milkrunCosts[i] ?? 0;
    const total = direct + milkrun;
    return {
      month,
      direct,
      milkrun,
      directShare: total ? (direct / total) * 100 : 0,
      milkrunShare: total ? (milkrun / total) * 100 : 0,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
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
          formatter={(value, name, item) => {
            if (typeof value !== "number") return [value, name];
            const shareKey = name === "직납" ? "directShare" : "milkrunShare";
            const share = (item.payload as { directShare: number; milkrunShare: number })[shareKey];
            return [`${value.toLocaleString()}원 (${share.toFixed(1)}%)`, name];
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="direct" name="직납" stackId="cost" fill="var(--chart-1)" maxBarSize={24} isAnimationActive={false} />
        <Bar dataKey="milkrun" name="밀크런&쉽먼트" stackId="cost" fill="var(--chart-3)" radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}
