// ExcelJS는 네이티브 엑셀 차트(진짜 편집 가능한 차트 객체)를 만드는 기능이 없다 — 알려진 제약이라
// 여기서 차트 XML(OOXML DrawingML/Chart 스펙)을 직접 만들어서 워크북 zip에 끼워 넣는다.
// 스크린샷 이미지가 아니라 실제 셀을 참조하는 차트라 셀 값을 고치면 차트도 같이 바뀐다.

export function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export function colLetter(n: number): string {
  // 1 -> A, 26 -> Z, 27 -> AA ...
  let s = "";
  let x = n;
  while (x > 0) {
    const rem = (x - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    x = Math.floor((x - 1) / 26);
  }
  return s;
}

function strCache(values: string[]): string {
  const pts = values.map((v, i) => `<c:pt idx="${i}"><c:v>${escapeXml(v)}</c:v></c:pt>`).join("");
  return `<c:strCache><c:ptCount val="${values.length}"/>${pts}</c:strCache>`;
}

function numCache(values: number[], formatCode: string): string {
  const pts = values.map((v, i) => `<c:pt idx="${i}"><c:v>${Number.isFinite(v) ? v : 0}</c:v></c:pt>`).join("");
  return `<c:numCache><c:formatCode>${formatCode}</c:formatCode><c:ptCount val="${values.length}"/>${pts}</c:numCache>`;
}

export interface ChartSeries {
  name: string;
  nameRef: string; // 예: 'Sheet1'!$A$3 — 라벨이 들어있는 셀
  values: number[];
  valRef: string; // 예: 'Sheet1'!$B$3:$M$3
  colorHex: string; // "2A78D6" (RRGGBB, # 없이)
  formatCode: string; // "#,##0" 또는 "0.00%"
}

interface AxisIds {
  cat: number;
  val: number;
}

const AXIS_IDS: AxisIds = { cat: 111111111, val: 222222222 };

function seriesTx(s: ChartSeries): string {
  return `<c:tx><c:strRef><c:f>${escapeXml(s.nameRef)}</c:f><c:strCache><c:ptCount val="1"/><c:pt idx="0"><c:v>${escapeXml(
    s.name
  )}</c:v></c:pt></c:strCache></c:strRef></c:tx>`;
}

function catElement(catRef: string, categories: string[]): string {
  return `<c:cat><c:strRef><c:f>${escapeXml(catRef)}</c:f>${strCache(categories)}</c:strRef></c:cat>`;
}

function valElement(s: ChartSeries): string {
  return `<c:val><c:numRef><c:f>${escapeXml(s.valRef)}</c:f>${numCache(s.values, s.formatCode)}</c:numRef></c:val>`;
}

function axesXml(valueFormatCode: string): string {
  return `
    <c:catAx>
      <c:axId val="${AXIS_IDS.cat}"/>
      <c:scaling><c:orientation val="minMax"/></c:scaling>
      <c:delete val="0"/>
      <c:axPos val="b"/>
      <c:majorTickMark val="out"/>
      <c:minorTickMark val="none"/>
      <c:tickLblPos val="nextTo"/>
      <c:crossAx val="${AXIS_IDS.val}"/>
      <c:crosses val="autoZero"/>
    </c:catAx>
    <c:valAx>
      <c:axId val="${AXIS_IDS.val}"/>
      <c:scaling><c:orientation val="minMax"/></c:scaling>
      <c:delete val="0"/>
      <c:axPos val="l"/>
      <c:numFmt formatCode="${valueFormatCode}" sourceLinked="0"/>
      <c:majorTickMark val="out"/>
      <c:minorTickMark val="none"/>
      <c:tickLblPos val="nextTo"/>
      <c:crossAx val="${AXIS_IDS.cat}"/>
      <c:crosses val="autoZero"/>
    </c:valAx>`;
}

function chartSpaceWrap(title: string, plotAreaInner: string, valueFormatCode: string): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <c:chart>
    <c:title>
      <c:tx><c:rich><a:bodyPr/><a:lstStyle/><a:p><a:r><a:t>${escapeXml(title)}</a:t></a:r></a:p></c:rich></c:tx>
      <c:overlay val="0"/>
    </c:title>
    <c:autoTitleDeleted val="0"/>
    <c:plotArea>
      <c:layout/>
      ${plotAreaInner}
      ${axesXml(valueFormatCode)}
    </c:plotArea>
    <c:legend>
      <c:legendPos val="b"/>
      <c:overlay val="0"/>
    </c:legend>
    <c:plotVisOnly val="1"/>
    <c:dispBlanksAs val="gap"/>
  </c:chart>
</c:chartSpace>`;
}

export function buildBarChartXml(opts: {
  title: string;
  catRef: string;
  categories: string[];
  series: ChartSeries[];
  stacked: boolean;
}): string {
  const { title, catRef, categories, series, stacked } = opts;
  const sers = series
    .map(
      (s, i) => `
    <c:ser>
      <c:idx val="${i}"/>
      <c:order val="${i}"/>
      ${seriesTx(s)}
      <c:spPr><a:solidFill><a:srgbClr val="${s.colorHex}"/></a:solidFill></c:spPr>
      ${catElement(catRef, categories)}
      ${valElement(s)}
    </c:ser>`
    )
    .join("");
  const barChart = `<c:barChart>
      <c:barDir val="col"/>
      <c:grouping val="${stacked ? "stacked" : "clustered"}"/>
      <c:varyColors val="0"/>
      ${sers}
      <c:overlap val="${stacked ? 100 : -10}"/>
      <c:axId val="${AXIS_IDS.cat}"/>
      <c:axId val="${AXIS_IDS.val}"/>
    </c:barChart>`;
  return chartSpaceWrap(title, barChart, series[0]?.formatCode ?? "#,##0");
}

export function buildLineChartXml(opts: { title: string; catRef: string; categories: string[]; series: ChartSeries[] }): string {
  const { title, catRef, categories, series } = opts;
  const sers = series
    .map(
      (s, i) => `
    <c:ser>
      <c:idx val="${i}"/>
      <c:order val="${i}"/>
      ${seriesTx(s)}
      <c:spPr><a:ln w="19050"><a:solidFill><a:srgbClr val="${s.colorHex}"/></a:solidFill></a:ln></c:spPr>
      <c:marker><c:symbol val="circle"/><c:size val="5"/><c:spPr><a:solidFill><a:srgbClr val="${s.colorHex}"/></a:solidFill></c:spPr></c:marker>
      ${catElement(catRef, categories)}
      ${valElement(s)}
      <c:smooth val="0"/>
    </c:ser>`
    )
    .join("");
  const lineChart = `<c:lineChart>
      <c:grouping val="standard"/>
      <c:varyColors val="0"/>
      ${sers}
      <c:marker val="1"/>
      <c:axId val="${AXIS_IDS.cat}"/>
      <c:axId val="${AXIS_IDS.val}"/>
    </c:lineChart>`;
  return chartSpaceWrap(title, lineChart, series[0]?.formatCode ?? "0.00%");
}

export interface DrawingAnchor {
  relId: string; // "rId1"
  fromCol: number; // 0-based
  fromRow: number; // 0-based
  toCol: number;
  toRow: number;
  name: string;
}

export function buildDrawingXml(anchors: DrawingAnchor[]): string {
  const frames = anchors
    .map(
      (a, i) => `
  <xdr:twoCellAnchor>
    <xdr:from><xdr:col>${a.fromCol}</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${a.fromRow}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from>
    <xdr:to><xdr:col>${a.toCol}</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${a.toRow}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to>
    <xdr:graphicFrame macro="">
      <xdr:nvGraphicFramePr>
        <xdr:cNvPr id="${i + 2}" name="${escapeXml(a.name)}"/>
        <xdr:cNvGraphicFramePr/>
      </xdr:nvGraphicFramePr>
      <xdr:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></xdr:xfrm>
      <a:graphic>
        <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart">
          <c:chart xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="${a.relId}"/>
        </a:graphicData>
      </a:graphic>
    </xdr:graphicFrame>
    <xdr:clientData/>
  </xdr:twoCellAnchor>`
    )
    .join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">${frames}
</xdr:wsDr>`;
}

export function buildRelsXml(relIdToTarget: { relId: string; target: string; type: string }[]): string {
  const rels = relIdToTarget
    .map((r) => `<Relationship Id="${r.relId}" Type="${r.type}" Target="${escapeXml(r.target)}"/>`)
    .join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rels}</Relationships>`;
}
