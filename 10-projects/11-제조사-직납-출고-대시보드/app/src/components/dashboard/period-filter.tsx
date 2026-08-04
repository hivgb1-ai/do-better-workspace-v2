"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface PeriodOption {
  value: string;
  label: string;
}

interface PeriodFilterProps {
  options: PeriodOption[];
  defaultValue: string;
}

// "YYYY-MM" 형식을 {year, month} 문자열 쌍으로 분리. 값이 없으면 오늘 기준으로 채운다.
function splitYearMonth(value: string, fallback: Date): { year: string; month: string } {
  const [year, month] = value.split("-");
  return {
    year: year || String(fallback.getFullYear()),
    month: month || String(fallback.getMonth() + 1).padStart(2, "0"),
  };
}

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));

export function PeriodFilter({ options, defaultValue }: PeriodFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current = searchParams.get("p") ?? defaultValue;
  const now = new Date();
  // 데이터가 실제로 존재하는 연도(25년~) 부터 내년까지 선택 가능하게 — 하드코딩된 특정 연도에 고정되지 않도록.
  const yearOptions = Array.from({ length: now.getFullYear() - 2025 + 2 }, (_, i) => String(2025 + i));

  const initialFrom = splitYearMonth(searchParams.get("from") ?? "", now);
  const initialTo = splitYearMonth(searchParams.get("to") ?? "", now);
  const [fromYear, setFromYear] = useState(initialFrom.year);
  const [fromMonth, setFromMonth] = useState(initialFrom.month);
  const [toYear, setToYear] = useState(initialTo.year);
  const [toMonth, setToMonth] = useState(initialTo.month);
  const hasCustomOption = options.some((o) => o.value === "custom");

  function navigate(value: string, range?: { from: string; to: string }) {
    const params = new URLSearchParams();
    params.set("p", value);
    if (value === "custom" && range?.from && range?.to) {
      params.set("from", range.from);
      params.set("to", range.to);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tabs value={current} onValueChange={(value) => navigate(value as string)}>
        <TabsList>
          {options.map((opt) => (
            <TabsTrigger key={opt.value} value={opt.value} className="text-xs">
              {opt.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {hasCustomOption && current === "custom" && (
        <div className="flex items-center gap-1.5 text-xs">
          <select
            value={fromYear}
            onChange={(e) => setFromYear(e.target.value)}
            className="rounded-md border border-input bg-transparent px-1.5 py-0.5 text-xs"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}년
              </option>
            ))}
          </select>
          <select
            value={fromMonth}
            onChange={(e) => setFromMonth(e.target.value)}
            className="rounded-md border border-input bg-transparent px-1.5 py-0.5 text-xs"
          >
            {MONTH_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m}월
              </option>
            ))}
          </select>
          <span className="text-muted-foreground">~</span>
          <select
            value={toYear}
            onChange={(e) => setToYear(e.target.value)}
            className="rounded-md border border-input bg-transparent px-1.5 py-0.5 text-xs"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}년
              </option>
            ))}
          </select>
          <select
            value={toMonth}
            onChange={(e) => setToMonth(e.target.value)}
            className="rounded-md border border-input bg-transparent px-1.5 py-0.5 text-xs"
          >
            {MONTH_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m}월
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => navigate("custom", { from: `${fromYear}-${fromMonth}`, to: `${toYear}-${toMonth}` })}
            className="rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background disabled:opacity-40"
          >
            적용
          </button>
        </div>
      )}
    </div>
  );
}
