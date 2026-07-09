import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  delta?: {
    text: string;
    tone: "good" | "critical" | "neutral";
  };
}

export function KpiCard({ label, value, delta }: KpiCardProps) {
  return (
    <Card className="gap-2 py-4">
      <CardHeader className="px-4">
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardHeader>
      <CardContent className="px-4">
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
        {delta && (
          <span
            className={cn(
              "mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs",
              delta.tone === "good" && "bg-good-bg text-good",
              delta.tone === "critical" && "bg-critical-bg text-critical",
              delta.tone === "neutral" && "bg-muted text-muted-foreground"
            )}
          >
            {delta.text}
          </span>
        )}
      </CardContent>
    </Card>
  );
}
