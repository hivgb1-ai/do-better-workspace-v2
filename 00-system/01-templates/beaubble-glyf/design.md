# GLYF 브랜드 디자인 가이드

> 뷰블(Beaubble)이 운영하는 색조 브랜드 **GLYF(글맆)**의 보고·대시보드·발표 자료에 적용되는 비주얼 시스템. GLYF는 전소미가 직접 기획한, "감정의 색을 유쾌하고 대담하게 표현하는" Y2K 인접 K-뷰티 브랜드다. 색상명조차 Chewy Bubble·Tearing·Junk·Ouch처럼 감정·상태 단어를 쓴다("색이 아니라 감정을 판다"). 그래서 GLYF의 자료는 진중한 잡지형 절제 톤이 아니라, **둥글고 글로시하고 통통 튀는 톤**이어야 한다.
>
> 슬로건: *"Decode your beauty with GLYF" · "Just keep on glyfing."*

## Overview

GLYF 자료 표면은 **따뜻한 크림 화이트** (`{colors.canvas}`) 위에 둥근 형태와 글로시한 액센트가 얹힌, 통통 튀는 캔버스다. 제품 자체가 "실제 목공용 풀(glue) 보틀" 모양의 유쾌한 말장난 패키징이고 하이라이터는 빌트인 미러 슬림 케이스다 — 즉 브랜드의 기본 정서는 "진중함"이 아니라 **"가지고 놀고 싶은 즐거움"**이다. 보고서 한 장에도 그 정서가 묻어나야 한다.

브랜드 voltage는 **글맆 핑크** (`{colors.glyf-pink}`) 에서 나온다. 글루 글로스 츄이 버블의 푸시아 핑크 계열을 코어로 삼아, KPI 강조·핵심 숫자·콜아웃에 점적으로 쓴다. 보조로 글로시한 **빔 샴페인** (`{colors.beam}`) 을 하이라이트 톤에 쓸 수 있다(일루에뜨 하이라이터의 빔 글로우). 단, 한 화면에 강조색이 너무 많으면 즐거움이 산만함으로 바뀐다 — **핑크는 주연, 샴페인은 조연.**

타이포 보이스는 **Pretendard 기반의 굵고 둥근 디스플레이 + 깨끗한 본문** 페어링. GLYF 로고는 "글맆"이라는 커스텀 한글 + "GLYF" 영문 병기로, 둥글고 대담한 인상이다. 보고서 헤드라인은 굵은 weight로 통통한 인상을 주고, 본문은 가독성 좋은 중간 weight로 받친다.

**Key Characteristics:**
- 따뜻한 크림 화이트 캔버스 (`{colors.canvas}`) — 순백 #FFF가 아닌, 약간 데운 크림 톤.
- 코어 액센트는 글맆 핑크 (`{colors.glyf-pink}`) — 글루 글로스 시그니처 핑크 계열. 강조·KPI·콜아웃에만.
- 보조 글로시 톤 빔 샴페인 (`{colors.beam}`) — 하이라이트·배지에 한정.
- 디스플레이는 **굵고 둥근** 톤 (Pretendard 800), 본문은 Pretendard 400/500.
- 박스·버튼·카드는 **둥근 모서리** (`{rounded.lg}` 이상) + 알약형 버튼 (`{rounded.full}`) — 글로시·플레이풀 톤의 핵심.
- 색상·배지 칩은 글로스 질감(부드러운 그라데이션 1단계 허용) — 단, 보고서 본문은 평면 유지.
- 감정 기반 색상명 톤(Chewy Bubble·Tearing·Junk) — 라벨·배지 카피에 이 위트를 살릴 수 있음.
- 한 화면에 핑크 강조는 절제 — 즐거움과 산만함은 한 끗 차이.

## Colors

### Brand & Accent
- **Canvas** (`{colors.canvas}` — #FBF7F1, *추정*): 모든 자료 기본 배경. 크림 화이트. 순백 #FFF 지양.
- **Ink** (`{colors.ink}` — #2A2422, *추정*): 본문·헤드 기본. 순흑 대신 따뜻한 다크 브라운-블랙.
- **GLYF Pink** (`{colors.glyf-pink}` — #FF5A7A, *추정*): 코어 액센트. KPI 변동·핵심 숫자·콜아웃·배지. 글루 글로스 핑크 계열에서 가져온 데모 값.
- **GLYF Pink Soft** (`{colors.glyf-pink-soft}` — #FFE3EA, *추정*): 옅은 핑크 — 표 행 강조 배경·칩 배경. 본문 색으로 쓰지 않음.
- **Beam Champagne** (`{colors.beam}` — #F2D9A8, *추정*): 보조 글로시 톤 — 하이라이트 배지·"NEW" 라벨. 일루에뜨 빔 글로우에서.

### Surface
- **Surface Soft** (`{colors.surface-soft}` — #F4EDE3, *추정*): 캔버스보다 한 단계 진한 크림 — 카드 배경·푸터.
- **Surface Card** (`{colors.surface-card}` — #FFFFFF): 캔버스 위 카드 — 순백을 카드에서만 허용.
- **Surface Pop** (`{colors.surface-pop}` — #2A2422, *추정*): 표지 풀블리드 컬러 밴드 영역 — 잉크 또는 글맆 핑크 풀블리드. 보고서 표지·챕터 헤더 한정.

### Hairlines & Borders
- **Hairline** (`{colors.hairline}` — #E7DECF, *추정*): 기본 1px 구분선. 표 행간·카드 외곽.
- **Hairline Strong** (`{colors.hairline-strong}` — #C8BBA4, *추정*): 강조 구분선 — 표 헤더 아래·섹션 디바이더.

### Text
- **Text Primary** (`{colors.text-primary}` — #2A2422): 본문·헤드.
- **Text Body** (`{colors.text-body}` — #514A45, *추정*): 긴 본문 단락.
- **Text Muted** (`{colors.text-muted}` — #938A7E, *추정*): 라벨·캡션·메타.
- **Text Faint** (`{colors.text-faint}` — #BCB2A4, *추정*): 곁가지 데이터 라벨.

### Semantic
- **Positive** (`{colors.positive}` — #2E8B6F, *추정*): 증가·긍정. 차분한 그린. (뷰티 톤이라 과한 형광 그린 지양)
- **Negative** (`{colors.negative}` — #FF5A7A): 감소·주의 — 글맆 핑크와 공유. 한 화면 1~2회 이내.
- **Neutral** (`{colors.neutral}` — #938A7E): 변동 없음·보류.

## Typography

### Font Family
한글·UI·디스플레이는 **Pretendard** (variable, 400~800). GLYF 로고("글맆")는 커스텀 서체라 본문에 재현하지 않고, 헤드라인은 Pretendard 800의 굵고 둥근 인상으로 대체한다. 영문 라벨도 Pretendard로 통일.

### Hierarchy

| 토큰 | 크기 | 굵기 | 행간 | 자간 | 용도 |
|---|---|---|---|---|---|
| `{typography.display-xl}` | 52px | Pretendard 800 | 1.05 | -1.0px | 보고서 표지 헤드라인 |
| `{typography.display-lg}` | 34px | Pretendard 800 | 1.15 | -0.5px | 섹션 헤드 |
| `{typography.display-md}` | 24px | Pretendard 700 | 1.3 | -0.3px | 카드 헤드 |
| `{typography.kpi-xl}` | 48px | Pretendard 800 | 1.0 | -1.0px | KPI 숫자 (주간 매출 등) |
| `{typography.kpi-md}` | 28px | Pretendard 700 | 1.1 | -0.5px | 보조 KPI 숫자 |
| `{typography.body-lg}` | 17px | Pretendard 400 | 1.7 | 0 | 인사이트 본문 |
| `{typography.body-md}` | 15px | Pretendard 400 | 1.6 | 0 | 기본 본문·표 셀 |
| `{typography.body-sm}` | 13px | Pretendard 400 | 1.5 | 0 | 표 캡션·footer |
| `{typography.label-uppercase}` | 11px | Pretendard 700 | 1.3 | 1.0px | 카테고리 라벨·배지 (GLYF / NEW / 시딩) |
| `{typography.caption}` | 12px | Pretendard 400 | 1.4 | 0 | 출처·기간 표기 |

### Principles
- 디스플레이는 Pretendard 800 — 굵고 둥근 인상으로 GLYF의 통통 튀는 톤을 만든다.
- KPI 숫자는 가장 굵은 weight로 한 화면 한두 군데만.
- 배지·라벨에 감정 단어 위트 허용("NEW", "급등", "시딩효과") — 단 과용 금지.
- 인쇄 호환 — A4 PDF 출력 시 12pt 미만 본문 자제.

### Note on Font Substitutes
Pretendard 미설치 시 fallback: `system-ui, -apple-system, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`. 두 산세리프 동시 사용 금지.

## Layout

### Spacing System
- **Base unit:** 4px.
- **Tokens:** `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 40px · `{spacing.xxl}` 64px · `{spacing.section}` 88px.
- **Section padding (vertical):** `{spacing.section}` (88px).
- **Card internal padding:** `{spacing.lg}` (24px) 본문 카드, `{spacing.xl}` (40px) KPI 메인 카드.
- **표 행 높이:** `{spacing.md}` (16px) 상하 패딩.
- **Gutters:** `{spacing.lg}` (24px) 카드 사이.

### Grid & Container
- **A4 출력용:** 너비 794px (210mm @ 96dpi), 좌우 마진 56px.
- **웹 대시보드:** 최대 1200px 중앙 정렬.
- **컬럼:** 12 컬럼 그리드. 본문 8 컬럼, 사이드 메타 4 컬럼.
- **KPI 카드 그리드:** 데스크탑 4-up, 태블릿 2-up, 모바일 1-up.

### Whitespace Philosophy
GLYF 자료는 답답하지 않게 호흡을 둔다. 다만 광활한 잡지형 여백보다는, **카드들이 둥글게 모여 있는 친근한 밀도**가 GLYF 톤에 맞다. 데이터가 많으면 페이지를 늘리되, 카드 간 간격은 유지.

## Elevation & Depth

| Level | Treatment | 용도 |
|---|---|---|
| Flat | 배경색 차이만 | 본문 섹션·푸터 |
| Hairline | 1px `{colors.hairline}` 외곽선 | 표 외곽 |
| Soft Card | `{colors.surface-card}` + 아주 옅은 그림자(`{elevation.soft}`) + 둥근 모서리 | KPI 카드·콘텐츠 카드 |
| Pop Band | `{colors.surface-pop}` 풀블리드 + 흰 텍스트 | 표지·챕터 헤더 — 한 보고서 1번 |

GLYF는 **아주 옅은 소프트 그림자를 카드에 허용**한다(`{elevation.soft}` — 0 2px 8px rgba(42,36,34,0.06)). 글로시·플레이풀 톤에서 살짝 떠 보이는 카드가 자연스럽다. 단, 강한 드롭섀도우·글래스모피즘은 금지.

### Decorative Depth
- **Cover Band** (`{component.cover-band}`): 표지 풀블리드 영역. 잉크 또는 글맆 핑크 배경 + 흰 텍스트 + 큰 헤드라인.
- **Callout Chip** (`{component.callout-chip}`): 글맆 핑크 Soft 배경 + 둥근 알약형 칩 — "급등"·"NEW"·"시딩효과" 등 짧은 콜아웃.

## Shapes

### Border Radius Scale

| 토큰 | 값 | 용도 |
|---|---|---|
| `{rounded.sm}` | 6px | 작은 라벨 칩 |
| `{rounded.md}` | 12px | 입력·토글 |
| `{rounded.lg}` | 18px | 카드·이미지 기본값 — GLYF 톤의 핵심 |
| `{rounded.xl}` | 28px | KPI 메인 카드·표지 패널 |
| `{rounded.full}` | 999px | 알약형 버튼·배지·KPI 변동 인디케이터 |

GLYF는 **둥근 모서리가 시그니처**다. 직각이 아니라, 모든 카드·버튼이 둥글어야 글로시·플레이풀 톤이 산다.

### Photography Geometry
제품 사진은 둥근 모서리(`{rounded.lg}`) 크롭 허용. GLYF의 글루 보틀 패키징·빔 하이라이터가 주인공이므로, 제품 클로즈업을 글로시하게. 정사각·세로 비율 모두 가능(인스타·틱톡 친화).

## Components

### Top Navigation
- 배경: `{colors.canvas}` + 하단 `{colors.hairline-strong}` 1px.
- 로고(글맆/GLYF) 좌측, 메뉴 중앙, 메타(날짜·작성자) 우측.
- 메뉴 라벨: `{typography.label-uppercase}`.

### KPI Card
- 배경: `{colors.surface-card}` + `{elevation.soft}` + `{rounded.xl}`.
- 패딩: `{spacing.xl}` (40px).
- 구조: ① 라벨(`{typography.label-uppercase}`, `{colors.text-muted}`) ② 큰 숫자(`{typography.kpi-xl}`, `{colors.ink}`) ③ 변동(▲/▼ + %, `{colors.glyf-pink}` 또는 `{colors.positive}`) ④ **해석 1줄**(`{typography.body-sm}`, `{colors.text-body}`).
- 해석 줄이 KPI 카드의 핵심 — 숫자만 있는 카드는 미완성.

### Callout Chip
- `{colors.glyf-pink-soft}` 배경 + `{colors.glyf-pink}` 텍스트 + `{rounded.full}`.
- "급등"·"NEW"·"시딩효과"·"마진주의" 등 한 단어 콜아웃.

### Data Table
- 헤더: `{colors.text-muted}` + `{typography.label-uppercase}` + 하단 `{colors.hairline-strong}` 2px.
- 본문 행: 1px `{colors.hairline}` 행간선.
- 강조 행: `{colors.glyf-pink-soft}` 배경 — 한 표에 1~2행만.
- 숫자 우측 정렬, 텍스트 좌측 정렬.

### Buttons
- Primary: `{colors.glyf-pink}` 배경 + 흰 텍스트 + `{rounded.full}` (알약형).
- Secondary: `{colors.canvas}` + `{colors.ink}` 외곽선 + `{rounded.full}`.

### Footer
- 배경: `{colors.surface-soft}`.
- `{typography.body-sm}` + `{colors.text-muted}`. 출처·생성 시각 한 줄.

## Do's and Don'ts

### Do's
- 크림 캔버스 `{colors.canvas}` 위에 잉크 `{colors.ink}` 본문.
- 강조는 글맆 핑크 한 색을 주연으로, 빔 샴페인은 조연.
- 카드·버튼은 둥글게(`{rounded.lg}`+, 버튼은 `{rounded.full}`).
- KPI 카드마다 "해석 1줄" 동반.
- 콜아웃 칩에 감정·위트 한 단어 허용("급등", "시딩효과").
- 제품 클로즈업을 글로시하게 — GLYF 패키징이 주인공.

### Don'ts
- 순백 #FFF 캔버스(카드 제외) — 크림 톤이 시그니처.
- 직각 모서리 카드 — GLYF는 둥근 톤.
- 강조색 3색 이상 한 화면 — 즐거움이 산만함이 됨.
- 강한 드롭섀도우·글래스모피즘·무지개 차트.
- 형광·네온 과채도 — 글로시하되 과하지 않게.
- 숫자만 있고 해석 없는 KPI 카드.

## Responsive Behavior

### Breakpoints

| Breakpoint | 너비 | 동작 |
|---|---|---|
| Desktop | ≥1200px | 12 컬럼, KPI 4-up |
| Tablet  | 768~1199px | 8 컬럼, KPI 2-up |
| Mobile  | <768px | 단일 컬럼, KPI 1-up, 표 가로 스크롤 |
| Print A4 | 794px 고정 | 출력 최적화 — 페이지 분할, 헤더 반복 |

### Touch Targets
모바일 최소 터치 영역 44x44px. 알약형 버튼 높이 44px 이상.

### Collapsing Strategy
모바일에서 사이드 메타는 본문 하단으로 이동. 콜아웃 칩은 줄바꿈 허용.

### Image Behavior
제품 사진은 모바일에서도 둥근 크롭 유지.

## Iteration Guide

1. **새 보고서 페이지**: 표지(Cover Band) → KPI 4-up(해석 줄 포함) → 채널/SKU 섹션 → 콘텐츠 영향 → 회의 코멘트 → 액션 표 순.
2. **카테고리 추가 시**: 라벨을 `{typography.label-uppercase}`로 추가, 색 구분은 하지 않음(강조는 핑크 1색 유지).
3. **데이터 추가 시**: 표 행 늘리기보다 카드/차트로 분리.
4. **강조 표시**: 글맆 핑크 1군데 우선. 두 군데 이상이면 우선순위 정해 하나만 강조.
5. **차트 컬러**: 무채색 베이스 + 강조 1개만 글맆 핑크. 무지개 금지.
6. **PDF 출력 검증**: 폰트 깨짐·페이지 break·12pt 이상 가독성 확인.
7. **자가검증**: "이 화면이 GLYF 인스타 피드 옆에 놓여도 같은 브랜드로 보이는가?" — Yes면 OK.

## Known Gaps

- **hex 값은 공식 미확정**: GLYF는 공개 브랜드 가이드(hex 코드)를 제공하지 않는다. 이 파일의 모든 색상 hex는 제품 사진·쉐이드 설명(푸시아 핑크·빔 샴페인 등)에 기반한 **데모 추정값**이다. 실제 적용 전 자사몰(beaubble.com) 화면에서 스포이트로 코어 색을 추출해 토큰 값을 교체할 것.
- **로고 커스텀 서체("글맆") 미확보**: 헤드라인은 Pretendard 800으로 대체. 실제 로고 폰트는 별도 확인 필요.
- **공식 타이포 폰트명 미확인**: Pretendard를 기본 가정. 브랜드 실제 서체 확인되면 교체.
- **다크모드 미정**: 표지 Pop Band가 부분 다크 영역 역할. 전체 다크모드는 별도 시스템.
- **모션·글로스 질감**: 정적 PDF/대시보드 기준. 인터랙션·글로스 애니메이션 가이드는 미작성.
