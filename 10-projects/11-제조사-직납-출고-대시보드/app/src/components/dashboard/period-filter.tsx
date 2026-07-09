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

export function PeriodFilter({ options, defaultValue }: PeriodFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current = searchParams.get("p") ?? defaultValue;
  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");
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
          <input
            type="month"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-md border border-input bg-transparent px-1.5 py-0.5 text-xs"
          />
          <span className="text-muted-foreground">~</span>
          <input
            type="month"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-md border border-input bg-transparent px-1.5 py-0.5 text-xs"
          />
          <button
            type="button"
            onClick={() => navigate("custom", { from, to })}
            disabled={!from || !to}
            className="rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background disabled:opacity-40"
          >
            적용
          </button>
        </div>
      )}
    </div>
  );
}
