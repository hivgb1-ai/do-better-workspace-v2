"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface MilkrunChannelChartProps {
  months: string[];
  revenue: number[];
  milkrunCost: number[];
  ratio: number[];
}

function formatEok(value: number) {
  return `${(value / 100_000_000).toFixed(1)}억`;
}

export function MilkrunChannelChart({ months, revenue, milkrunCost, ratio }: MilkrunChannelChartProps) {
  const data = months.map((month, i) => ({
    month,
    revenue: revenue[i] ?? 0,
    milkrunCost: milkrunCost[i] ?? 0,
    ratio: ratio[i] ?? 0,
  }));
  const revenueMax = Math.max(...data.map((d) => d.revenue), 0) * 1.15;
  const ratioMax = Math.ceil((Math.max(...ratio, 0) + 0.5) * 10) / 10;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={data} margin={{ top: 16, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
        <YAxis
          yAxisId="amount"
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatEok}
          domain={[0, revenueMax || "auto"]}
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
            return name === "물류비율" ? [`${value.toFixed(2)}%`, name] : [`${value.toLocaleString()}원`, name];
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar yAxisId="amount" dataKey="revenue" name="총매출" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false} />
        <Bar yAxisId="amount" dataKey="milkrunCost" name="밀크런" fill="var(--chart-3)" radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false} />
        <Line
          yAxisId="ratio"
          type="monotone"
          dataKey="ratio"
          name="물류비율"
          stroke="var(--chart-4)"
          strokeWidth={2}
          dot={{ r: 4, fill: "var(--chart-4)", stroke: "var(--card)", strokeWidth: 1.5 }}
          isAnimationActive={false}
        >
          <LabelList
            dataKey="ratio"
            position="top"
            formatter={(v) => (typeof v === "number" ? `${v.toFixed(2)}%` : "")}
            fontSize={11}
            fontWeight={700}
            fill="var(--chart-4)"
            stroke="var(--card)"
            strokeWidth={3}
            paintOrder="stroke"
          />
        </Line>
      </ComposedChart>
    </ResponsiveContainer>
  );
}
