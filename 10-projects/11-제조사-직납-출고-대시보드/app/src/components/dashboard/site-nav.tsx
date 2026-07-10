"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_ITEMS = [
  { href: "/", label: "이번 달 개요" },
  { href: "/history", label: "기간별 히스토리 조회" },
  { href: "/monthly-report", label: "월말 보고" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-base font-semibold">제조사 직납 출고 대시보드</h1>
          <p className="text-xs text-muted-foreground">쿠팡 직납 · 애사비소다</p>
        </div>
        <div className="flex items-center gap-3">
          <nav className="flex gap-1 rounded-lg bg-muted p-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  pathname === item.href
                    ? "bg-background font-medium shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
