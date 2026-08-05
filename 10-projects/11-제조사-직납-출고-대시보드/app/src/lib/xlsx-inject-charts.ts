import JSZip from "jszip";
import { buildDrawingXml, buildRelsXml, type DrawingAnchor } from "./xlsx-native-chart";

export interface SheetChartSpec {
  sheetIndex: number; // 1-based — xl/worksheets/sheet{N}.xml 의 N과 같은 순서(워크시트를 추가한 순서)
  charts: {
    xml: string;
    name: string;
    anchor: { fromCol: number; fromRow: number; toCol: number; toRow: number };
  }[];
}

const CHART_REL_TYPE = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart";
const DRAWING_REL_TYPE = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing";

// ExcelJS가 만든 워크북 zip에 네이티브 차트(진짜 편집 가능한 엑셀 차트 객체)를 끼워 넣는다.
// ExcelJS 자체에는 차트 생성 API가 없어서, 완성된 워크북의 zip을 열어 차트/드로잉 XML 파트를
// 직접 추가하고, 워크시트가 그 드로잉을 참조하도록 관계(rels)와 <drawing> 엘리먼트를 붙인다.
export async function injectNativeCharts(buffer: Buffer, specs: SheetChartSpec[]): Promise<Buffer> {
  const zip = await JSZip.loadAsync(buffer);

  const contentTypesFile = zip.file("[Content_Types].xml");
  if (!contentTypesFile) throw new Error("[Content_Types].xml을 찾을 수 없습니다 — ExcelJS 출력 형식이 예상과 다릅니다");
  let contentTypesXml = await contentTypesFile.async("string");
  let overrides = "";

  let chartCounter = 0;
  let drawingCounter = 0;

  for (const spec of specs) {
    if (spec.charts.length === 0) continue;

    drawingCounter += 1;
    const drawingIndex = drawingCounter;
    const drawingRels: { relId: string; target: string; type: string }[] = [];
    const anchors: DrawingAnchor[] = [];

    spec.charts.forEach((chart, i) => {
      chartCounter += 1;
      const chartIndex = chartCounter;
      zip.file(`xl/charts/chart${chartIndex}.xml`, chart.xml);
      overrides += `<Override PartName="/xl/charts/chart${chartIndex}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>`;

      const relId = `rId${i + 1}`;
      drawingRels.push({ relId, target: `../charts/chart${chartIndex}.xml`, type: CHART_REL_TYPE });
      anchors.push({
        relId,
        fromCol: chart.anchor.fromCol,
        fromRow: chart.anchor.fromRow,
        toCol: chart.anchor.toCol,
        toRow: chart.anchor.toRow,
        name: chart.name,
      });
    });

    zip.file(`xl/drawings/drawing${drawingIndex}.xml`, buildDrawingXml(anchors));
    zip.file(`xl/drawings/_rels/drawing${drawingIndex}.xml.rels`, buildRelsXml(drawingRels));
    overrides += `<Override PartName="/xl/drawings/drawing${drawingIndex}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>`;

    // 이 워크시트는 데이터 전용이라 원래 관계 파일이 없다 — 드로잉 관계 하나만 담은 새 rels 파일을 만든다.
    zip.file(
      `xl/worksheets/_rels/sheet${spec.sheetIndex}.xml.rels`,
      buildRelsXml([{ relId: "rId1", target: `../drawings/drawing${drawingIndex}.xml`, type: DRAWING_REL_TYPE }])
    );

    const sheetPath = `xl/worksheets/sheet${spec.sheetIndex}.xml`;
    const sheetFile = zip.file(sheetPath);
    if (!sheetFile) throw new Error(`${sheetPath}을 찾을 수 없습니다`);
    const sheetXml = await sheetFile.async("string");
    // <drawing>은 스키마상 <extLst> 앞, </worksheet> 바로 앞쪽에 온다.
    const patched = sheetXml.includes("<extLst")
      ? sheetXml.replace("<extLst", `<drawing r:id="rId1"/><extLst`)
      : sheetXml.replace("</worksheet>", `<drawing r:id="rId1"/></worksheet>`);
    zip.file(sheetPath, patched);
  }

  contentTypesXml = contentTypesXml.replace("</Types>", `${overrides}</Types>`);
  zip.file("[Content_Types].xml", contentTypesXml);

  const out = await zip.generateAsync({ type: "nodebuffer" });
  return out;
}
