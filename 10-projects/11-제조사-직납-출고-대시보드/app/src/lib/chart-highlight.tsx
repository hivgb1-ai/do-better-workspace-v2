import { Cell } from "recharts";

// 막대그래프는 마지막 달(=조회 기간의 가장 최근 달)만 진하게, 지난 달은 옅게 — "지금 볼 것"만 눈에 띄게 하는 디자인 규칙.
export const DIM_OPACITY = 0.4;

export function highlightLastCells(count: number, fill: string) {
  return Array.from({ length: count }, (_, i) => (
    <Cell key={i} fill={fill} fillOpacity={i === count - 1 ? 1 : DIM_OPACITY} />
  ));
}
