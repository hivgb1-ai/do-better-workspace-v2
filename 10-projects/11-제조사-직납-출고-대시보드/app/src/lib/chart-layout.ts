// 차트의 왼쪽(값) Y축 폭과 그 아래 MonthlyDataTable "구분" 컬럼 폭을 똑같이 고정한다.
// 둘 다 이 값으로 맞춰야 차트 막대의 x좌표와 표 데이터 컬럼의 x좌표가 같은 지점에서 시작해서
// 어긋나지 않는다(하나는 auto 폭, 하나는 content 기반 폭이면 둘이 따로 움직여서 안 맞음).
export const TABLE_LABEL_COL_WIDTH = 156;

// 오른쪽에 보조 축(물류비율 등 %)이 있는 차트(SavingsRatioChart, MilkrunChannelChart)는 그 축 폭(48) +
// 차트 margin.right(12)만큼 플롯 영역이 왼쪽 축 전용 차트보다 더 좁다. 표에는 그 축이 없어서 그대로 두면
// 표의 월 컬럼들이 차트보다 더 넓은 폭에 나뉘어, 오른쪽으로 갈수록 막대와 어긋난다(누적 오차).
// 오른쪽 보조 축이 있는 차트의 MonthlyDataTable에는 이 폭만큼 빈 여백 컬럼을 똑같이 붙여서 폭을 맞춘다.
export const RIGHT_AXIS_WIDTH = 48;
export const RIGHT_AXIS_MARGIN = 12;
export const TABLE_RIGHT_GUTTER = RIGHT_AXIS_WIDTH + RIGHT_AXIS_MARGIN;

// 왼쪽 축만 있는 차트(TotalSavingsChart, CostCompositionChart, SavingsByManufacturerChart)도
// margin.right(12)만큼은 플롯이 좁다 — 위 TABLE_RIGHT_GUTTER보다 작지만 이것도 표에 반영해야
// 완전히 맞는다. 그 세 표에는 이 값을 rightGutter로 넘긴다.
export const TABLE_RIGHT_GUTTER_SINGLE = RIGHT_AXIS_MARGIN;
