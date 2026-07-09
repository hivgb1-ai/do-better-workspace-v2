import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { MoverItem } from "@/lib/shipment-data";

export function TopMoversTable({ movers }: { movers: MoverItem[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>품목</TableHead>
          <TableHead className="text-right">전월 비중</TableHead>
          <TableHead className="text-right">당월 비중</TableHead>
          <TableHead className="text-right">변화</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {movers.map((m) => {
          const delta = m.currShare - m.prevShare;
          const up = delta >= 0;
          return (
            <TableRow key={m.name}>
              <TableCell>
                <div>{m.name}</div>
                <div className="text-xs text-muted-foreground">{m.manufacturer}</div>
              </TableCell>
              <TableCell className="text-right tabular-nums">{m.prevShare.toFixed(1)}%</TableCell>
              <TableCell className="text-right tabular-nums">{m.currShare.toFixed(1)}%</TableCell>
              <TableCell className="text-right">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs tabular-nums",
                    up ? "bg-good-bg text-good" : "bg-critical-bg text-critical"
                  )}
                >
                  {up ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%p
                </span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
