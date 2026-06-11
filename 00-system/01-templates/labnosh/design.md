# 랩노쉬(LABNOSH) 디자인 가이드

> 브랜드 비주얼 아이덴티티 단일 출처. PDF 보고서·HTML 대시보드·랜딩·슬라이드 어떤 산출물이든 이 파일을 참조하면 랩노쉬 톤이 적용된다.
> 토큰 syntax: 인라인 hex 금지, 모든 참조는 토큰 키로 (`{colors.deep-teal}`, `{typography.display-xl}` 등).
> 색 체계는 실제 자사몰(labnosh.com) 렌더링 화면에서 추출했다 (2026-06 확인).

## Overview

랩노쉬(LABNOSH)는 LAB(연구실) + NOSH(가볍게 먹다)의 합성어 — "연구로 만든 단백질 간편식" 브랜드다. 모회사 이그니스가 10년 R&D를 누적했다고 내세우는 만큼, 비주얼의 뼈대는 **깨끗한 흰 배경**(`{colors.surface}` — #ffffff) 위에 **딥 틸/네이비 타입과 면**(`{colors.deep-teal}` — #103a3a)을 얹은, 연구실처럼 단정하고 신뢰감 있는 미니멀이다. 따뜻한 종이 질감이 아니라, 군더더기 없는 화이트 스페이스 위에 제품 사진과 성분 숫자(단백질 27g·52g·당 0g)가 또렷하게 호흡한다. 브랜드의 에너지는 장식이 아니라 **제품 자체의 풀블리드 사진** — 한 손에 잡히는 프로틴 드링크, 9종 맛이 한 줄로 늘어선 슬림쉐이크 컷, 운동 후 마시는 라이프스타일 컷 — 과 **성분 숫자의 대비**에서 나온다.

색의 voltage는 두 축이다. 신뢰의 바탕은 **딥 틸**(`{colors.deep-teal}`)이 잡고, 에너지의 점화는 **라임 그린**(`{colors.lime}` — #c8f04a)이 담당한다. 자사몰의 프로모 배지("🔥썸머블프 ~92%🔥")·할인율·핵심 CTA가 이 선명한 라임으로 친다. 흰 바탕과 딥 틸이 "연구실의 단정함"을 잡고, 라임 한 점이 "Live Better — 더 나은 삶"의 활력을 담당한다. 라임은 절제할수록 강하다 — 한 화면에 한두 군데, 진짜 행동을 유도하거나 핵심 숫자를 띄울 자리에만.

Type voice는 한 패밀리(Pretendard/Inter 계열)를 두 무게로 운용한다 — 헤드라인과 성분 숫자는 700(Bold)으로 또렷하게, 본문은 400(Regular)으로 편안하게. 성분·할인율 같은 **숫자는 크고 굵게** 띄우는 것이 랩노쉬의 시그니처다 (단백질 27g, 92% 할인을 키워서). 라벨류만 UPPERCASE + 트래킹으로 "큐레이션된" 느낌을 준다.

**Key Characteristics:**
- 흰 배경(`{colors.surface}` — #ffffff) 위 딥 틸 타입(`{colors.deep-teal}` — #103a3a). 라이트 모드가 기본 — 다크 반전은 푸터·히어로 오버레이에만.
- 포인트 컬러 두 축: 신뢰의 딥 틸(`{colors.deep-teal}`) + 활력의 라임 그린(`{colors.lime}` — #c8f04a). 라임은 프로모·할인율·CTA·핵심 숫자에만 절제해서.
- 워드마크/로고는 딥 틸(`{colors.deep-teal}`). 라임은 행동 유도(CTA·할인 배지·강조 숫자) 전용 — 로고를 라임으로 칠하지 않는다.
- 성분·할인율 숫자를 키워 띄운다 — 단백질 함량·당 0g·할인율이 제품의 voltage.
- 헤드라인은 sentence-case가 기본, 라벨류만 UPPERCASE.
- 제품 사진이 밴드를 채운다. 드링크/셰이크가 늘 주인공, UI 크롬은 물러나 작은 딥 틸 라벨로.
- 버튼은 부드러운 모서리 `{rounded.md}`(10px) — 음료 캔/병의 둥근 마감을 닮은 라운드.
- 여백은 넉넉하고 그리드 정렬: `{spacing.section}`(80px) 주요 밴드 사이, `{spacing.xl}`(40px) 카드 내부.
- 옅은 중성 그림자(`{component.card}`)로 흰 바탕 위 카드의 깊이감. 하드 섀도우 금지.

## Colors

### Brand & Accent
- **Deep Teal** (`{colors.deep-teal}` — #103a3a): 브랜드 메인. 워드마크, 헤드라인, 핵심 면·네비, 차트 1순위 시리즈. 자사몰 로고/네비에서 추출한 신뢰의 딥 컬러.
- **Teal Soft** (`{colors.teal-soft}` — #2f5f5a): 딥 틸의 옅은 단계. 보조 텍스트·서브 헤드·차트 보조 시리즈.
- **Lime** (`{colors.lime}` — #c8f04a): 시그니처 활력 포인트. 프로모 배지·할인율·주요 CTA 버튼·핵심 숫자 강조·차트 하이라이트. 자사몰 프로모 그래픽에서 추출한 유채색 voltage.
- **Lime Soft** (`{colors.lime-soft}` — #e6f7b3): Lime의 옅은 단계. hover·active 보조, 강조 존 배경.
- **Lime Tint** (`{colors.lime-tint}` — #f3fbdc): 강조 존·인용 블록 배경에 쓰는 아주 옅은 라임 틴트. 면적으로 깔 때만.

### Surface
- **Surface** (`{colors.surface}` — #ffffff): 기본 페이지 바닥 + 카드·테이블 표면. 크리스프 화이트.
- **Surface Soft** (`{colors.surface-soft}` — #f5f7f6): 표 헤더·존 구분·푸터 인접 스트립. 차가운 그린-그레이.
- **Surface Muted** (`{colors.surface-muted}` — #e8ecea): 비활성 영역·구분 존.
- **Teal Panel** (`{colors.teal-panel}` — #0c2e2e): 다크 반전 패널(푸터·히어로 오버레이)에만.

### Hairlines & Borders
- **Hairline** (`{colors.hairline}` — #e3e8e6): 흰 바탕 위 1px 구분선. 섹션·표 행·카드 외곽.
- **Hairline Strong** (`{colors.hairline-strong}` — #d2dad7): 강조 구분선, 표 헤더 하단.

### Text
- **Ink** (`{colors.ink}` — #103a3a): 모든 헤드라인·기본 텍스트·워드마크 (딥 틸과 동일 톤).
- **Body** (`{colors.body}` — #3f4a47): 본문 러닝 텍스트.
- **Muted** (`{colors.muted}` — #6f7b78): 캡션·메타·푸터 링크.
- **On Dark** (`{colors.on-dark}` — #f4f8f6): 다크 패널 위 텍스트.

### Semantic
- **Success** (`{colors.success}` — #2f8a55): 기여이익 흑자·목표 달성·ROAS 양호·"남는 장사".
- **Warning** (`{colors.warning}` — #c98a2b): 재고 임박·마진 누수·ROAS 주의(2.0~2.5).
- **Danger** (`{colors.danger}` — #c0463a): 결품 임박·환불 급증·적자·ROAS 미달(<2.0)·유통기한 임박.
> 시맨틱 컬러는 데이터의 상태 표시 전용. 브랜드 강조(Lime/Deep Teal)와 혼동하지 않는다. 특히 라임(브랜드 활력)과 성공 그린(데이터 흑자)을 같은 자리에 섞지 않는다.

## Typography

### Font Family
**Pretendard**(또는 Inter) variable. 한 패밀리를 두 무게로 — Bold(700) 디스플레이·숫자 + Regular(400) 본문. 폴백 스택: `"Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.

무게 페어:
- Display/Number(700 Bold): 헤드라인·섹션 헤드·KPI 숫자·성분 숫자·할인율·버튼
- Body(400 Regular): 본문·설명·메타. 굵게 하지 않는다.

700/400의 또렷한 대비가 랩노쉬 시그니처 — 특히 숫자를 크고 굵게. 한글은 Pretendard로 매핑 동일.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-xl}` | 56px | 700 | 1.1 | -0.5px | 보고서 표지 타이틀 |
| `{typography.display-lg}` | 40px | 700 | 1.15 | -0.3px | 섹션 헤드 |
| `{typography.display-md}` | 32px | 700 | 1.2 | -0.2px | KPI 카드 수치, 성분 숫자, 서브섹션 |
| `{typography.display-sm}` | 24px | 700 | 1.3 | 0 | 카드 타이틀, 표 제목 |
| `{typography.title-md}` | 20px | 700 | 1.4 | 0 | 소제목, 리드 문단 |
| `{typography.title-sm}` | 18px | 400 | 1.45 | 0 | 인트로 문단 |
| `{typography.label-uppercase}` | 13px | 700 | 1.3 | 1.2px | 카테고리 라벨, 채널 태그 (UPPERCASE) |
| `{typography.body-md}` | 15px | 400 | 1.55 | 0 | 기본 본문 |
| `{typography.body-sm}` | 13px | 400 | 1.5 | 0 | 표 셀, 보조 메타 |
| `{typography.caption}` | 11px | 400 | 1.4 | 0.3px | 캡션, 출처 |
| `{typography.button}` | 14px | 700 | 1.0 | 0.5px | 버튼 라벨 (sentence-case) |

### Principles
Bold(700) 헤드라인·숫자와 Regular(400) 본문의 또렷한 대비를 항상 유지. 성분·KPI·할인율 같은 숫자는 한 단계 크게 띄운다. 라벨류(`{typography.label-uppercase}`)만 UPPERCASE + 1.2px 트래킹. 헤드라인은 sentence-case가 기본. 큰 디스플레이는 음수 트래킹(-0.5~-0.2px)으로 단정하게 조인다.

### Note on Font Substitutes
Pretendard/Inter가 없으면 시스템 산세리프 스택으로 폴백. 한글 비중이 높은 보고서는 Pretendard 우선. 디스플레이 트래킹만 -0.3px로 맞추면 톤 유지.

## Layout

### Spacing System
- **Base unit:** 4px.
- **Tokens:** `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 40px · `{spacing.xxl}` 56px · `{spacing.section}` 80px.
- **Section padding(수직):** `{spacing.section}`(80px) 주요 밴드 사이.
- **Card 내부:** `{spacing.xl}`(40px) 콘텐츠 카드, `{spacing.lg}`(24px) KPI 카드.
- **Gutter:** `{spacing.lg}`(24px) 3-up 그리드 카드 사이.

### Grid & Container
- **Max content width:** ~1080px 중앙 정렬 (A4 PDF 친화 폭).
- **본문:** 12-column 그리드. 히어로 사진 밴드만 풀블리드.
- **카드 그리드:** 데스크탑 3-up, 태블릿 2-up, 모바일 1-up.
- **KPI 카드:** 4-up 행 (데스크탑) → 2-up (태블릿).

### Whitespace Philosophy
랩노쉬는 사진·성분 숫자·여백이 일하게 둔다. 제품 사진 주변 여백은 넉넉하게, 성분 숫자는 그 옆에 크고 또렷하게. 여백은 `{spacing.section}`(80px)으로 균일하게. 그라데이션·장식 배경 없이 크리스프 화이트가 깊이를 만든다.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat | 그림자 없음 | 본문 섹션, 푸터, 사진 밴드 |
| Hairline | 1px `{colors.hairline}` border | 섹션 구분, 표 행, 카드 외곽 |
| Card | `{colors.surface}` + soft shadow (0 1px 3px rgba(16,58,58,0.06)) | KPI 카드, 콘텐츠 카드 |
| Card Raised | soft shadow (0 4px 16px rgba(16,58,58,0.08)) | 강조 카드, 표지 |
| Photo | 풀블리드 사진, 모서리 `{rounded.lg}` | 히어로, 제품 컷 |

하드 무채색 섀도우 금지. 딥 틸이 살짝 섞인 옅은 soft shadow로 흰 바탕 위 카드의 깊이를 낸다.

### Decorative Depth
- **Lime Accent Bar** (`{component.accent-bar}`): KPI 카드 좌측 또는 섹션 헤드 아래 3px `{colors.lime}` 바. 랩노쉬의 유일한 장식 요소 — 핵심 지점에만 절제해서.
- **Discount Badge** (`{component.discount-badge}`): 라임 배경 원형/펜던트 배지에 할인율 숫자를 크게. 자사몰 프로모 시그니처 ("~92%").

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.none}` | 0px | 표 셀, 풀블리드 사진 일부 |
| `{rounded.sm}` | 4px | 태그, 칩, 작은 배지 |
| `{rounded.md}` | 10px | 버튼, 인풋 — 기본 라운드 |
| `{rounded.lg}` | 14px | 카드, 콘텐츠 컨테이너, 제품 사진 |
| `{rounded.xl}` | 22px | 히어로 사진 밴드, 표지 카드 |
| `{rounded.full}` | 9999px | 할인 배지, 원형 아이콘 버튼, 맛 칩 |

라운드 위계는 "기본 10~14px의 부드러운 마감". 둥근 모서리가 음료 병의 손맛과 가벼운("nosh") 브랜드 톤을 읽히게 한다.

### Photography Geometry
히어로 사진은 풀블리드 + `{rounded.xl}`(22px). 그리드 안 제품 컷은 `{rounded.lg}`(14px), 4:5 또는 1:1 크롭. 맛 라인업 컷은 와이드 16:9. 사진은 깨끗한 스튜디오 컷 + 운동/식사 라이프스타일 컷 — 채도는 선명하되 배경은 화이트로 비운다.

## Components

### Top Navigation
**`top-nav`** — 흰 바, 상단 고정. 64px, `{colors.surface}` 배경, 하단 1px `{colors.hairline}`. 좌측 LABNOSH 워드마크(`{colors.deep-teal}`), 중앙 메뉴(프로틴 드링크, 슬림쉐이크, 건강기능식품, 브랜드), 우측 검색·계정·장바구니 아이콘. 메뉴는 `{typography.body-md}` sentence-case. 프로모 고지 바가 필요하면 nav 위에 `{colors.lime}` 풀폭 스트립 한 줄(딥 틸 텍스트로).

### Buttons
**`button-primary`** — 시그니처 CTA. 배경 `{colors.lime}`, 텍스트 `{colors.deep-teal}`(딥 틸), `{rounded.md}`(10px), 패딩 12px×24px, 높이 44px. 타입 `{typography.button}` sentence-case. 라임 배경 + 딥 틸 텍스트가 랩노쉬 버튼 (라임 위 흰 글씨 금지 — 대비 부족).

**`button-secondary`** — 배경 투명, 1px `{colors.deep-teal}` 외곽선, 텍스트 `{colors.deep-teal}`. 보조 액션.

**`button-on-tint`** — Lime Tint 존 위 버튼. 배경 `{colors.surface}`, 텍스트 `{colors.deep-teal}`, hairline 외곽.

**`button-icon`** — 원형 아이콘 버튼. 40×40px, 배경 `{colors.surface}`, `{rounded.full}`, 아이콘 `{colors.deep-teal}`.

**`text-link`** — 인라인 링크. `{colors.deep-teal}`, 밑줄 없음, sentence-case. → glyph 동반.

### Cards & Containers
**`hero-band`** — 풀블리드 제품 사진 밴드, `{rounded.xl}`. h1은 `{typography.display-xl}` 좌측 정렬, 하단 `{typography.title-sm}` 서브카피. 수직 패딩 `{spacing.xxl}`(56px).

**`kpi-card`** — 보고서 핵심 지표 카드. 배경 `{colors.surface}`, `{rounded.lg}`, soft shadow, 패딩 `{spacing.lg}`(24px), 좌측 `{component.accent-bar}`(라임). 상단 `{typography.label-uppercase}` 라벨, 중앙 `{typography.display-md}`(32px) 수치, 하단 `{typography.body-sm}` "그래서 무슨 의미" 한 줄(필수). 수치만 있는 카드 금지.

**`data-table`** — 분석 표. 헤더 행 배경 `{colors.surface-soft}`, `{typography.label-uppercase}`. 본문 행 `{typography.body-sm}`, 1px `{colors.hairline}` 구분. 양수/음수 마진은 `{colors.success}`/`{colors.danger}`. `{rounded.lg}` 외곽 클립.

**`insight-card`** — 원인·해석 카드. 배경 `{colors.lime-tint}`, `{rounded.lg}`, 패딩 `{spacing.xl}`. 좌측 `{component.accent-bar}`(라임). 표 옆 "왜 움직였나" 3~4줄 해석을 담는다.

**`product-card`** — 3-up 그리드 제품 카드. 상단 4:5 제품 사진(`{rounded.lg}`), 하단 `{typography.label-uppercase}` 라인 태그, `{typography.display-sm}` 제품명, `{typography.display-md}` 성분 숫자(단백질 Ng) + `{typography.body-sm}` 가격·맛 칩.

**`spec-stat`** — 성분 숫자 스탯. 큰 `{typography.display-md}`(32px) 숫자(`{colors.deep-teal}`) + 작은 단위 라벨. 단백질 27g·당 0g·125kcal처럼 핵심 숫자를 띄운다. 라임 언더라인 옵션.

**`alert-row`** — 재고/마진/광고 경보 행. 배경 `{colors.surface}`, 좌측 4px 시맨틱 컬러 바(`{colors.danger}` 결품·유통기한 / `{colors.warning}` 임박). `{typography.body-md}` 제품명 + 소진일수/ROAS + 권장 액션.

### Inputs & Forms
**`text-input`** — 배경 `{colors.surface}`, 텍스트 `{colors.deep-teal}`, `{rounded.md}`, 패딩 12px×16px, 높이 44px, 1px `{colors.hairline}`. focus 시 외곽 `{colors.deep-teal}`.

### Signature Components
**`accent-bar`** — 3px `{colors.lime}` 세로 또는 가로 바. KPI/insight 카드 좌측, 섹션 헤드 아래. 랩노쉬의 시그니처 비-타이포 요소.

**`discount-badge`** — 라임 원형/펜던트 배지. 배경 `{colors.lime}`, 텍스트 `{colors.deep-teal}`, `{rounded.full}`, 할인율 숫자를 `{typography.display-sm}`로 크게. 자사몰 프로모 시그니처.

**`flavor-chip-row`** — 슬림쉐이크 9종 맛 칩을 작은 펜던트로 나열(`{rounded.full}`). 제품 소개·범례에서 맛 카테고리 표시.

**`cta-band-tint`** — 푸터 직전 CTA 밴드. 배경 `{colors.lime-tint}`, 중앙 `{typography.display-lg}` 헤드 + `{component.button-primary}`. 수직 패딩 `{spacing.section}`.

### Footer
**`footer`** — 다크 반전 푸터. 배경 `{colors.teal-panel}`, 텍스트 `{colors.on-dark}`. 4-column(Shop / 브랜드 / 고객센터 / 회사). 수직 패딩 `{spacing.xxl}`. 하단 사업자 정보(이그니스) `{typography.caption}`. 본문이 라이트여도 푸터는 틸 패널로 닫는다.

## Do's and Don'ts

### Do
- 페이지를 제품 사진 + 성분 숫자로 앵커. 드링크/셰이크와 단백질 함량이 브랜드 voltage.
- 헤드라인은 sentence-case `{typography.display-*}` Bold(700). 라벨류만 UPPERCASE.
- Bold(700) 디스플레이·숫자 + Regular(400) 본문의 또렷한 대비 유지. 숫자는 키운다.
- Lime(`{colors.lime}`)은 CTA·할인율·핵심 숫자 강조에만. Deep Teal은 워드마크·헤드라인·면.
- 라임 버튼 위 텍스트는 딥 틸. 워드마크/로고는 딥 틸 — 라임으로 칠하지 않는다.
- 기본 `{rounded.md}`(10px)~`{rounded.lg}`(14px). 배지·칩만 `{rounded.full}`.
- KPI/표 수치 옆에 "그래서 무슨 의미" 한 줄 필수.
- `{spacing.section}`(80px)로 밴드 사이 수직 리듬.

### Don't
- Deep Teal·Lime·시맨틱 3종 밖의 브랜드 컬러 도입 금지.
- 라임을 넓은 면적에 칠하지 말 것 — 포인트는 점으로 찍을 때 강하다.
- 라임 위에 흰 글씨 금지 (대비 부족) — 라임 위는 딥 틸 텍스트.
- 로고/워드마크를 라임으로 칠하지 말 것 (워드마크는 딥 틸).
- 본문을 굵게(700) 만들지 말 것. 본문은 400 유지 — 굵게는 숫자·헤드라인에만.
- 직각 버튼 금지. 둥근 모서리가 랩노쉬 손맛.
- 히어로 뒤 그라데이션 금지. 크리스프 화이트가 깊이를 만든다.
- 브랜드 라임과 데이터 성공 그린을 같은 자리에 섞지 말 것 (의미 혼동).
- 전면 대문자 헤드라인 금지 — 라벨만 UPPERCASE.
- 수치만 있는 KPI 카드 금지 — 해석 줄 없으면 미완성.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Mobile | < 768px | 햄버거 nav; hero h1 56→36px; KPI 카드 1-up; 표 가로 스크롤; 푸터 4→1 col |
| Tablet | 768–1024px | 가로 nav 유지; 카드 2-up; KPI 2-up |
| Desktop | 1024–1440px | 풀 nav; 카드 3-up; KPI 4-up |
| Wide | > 1440px | 데스크탑 동일, max 1080px 중앙 |

### Touch Targets
- `{component.button-primary}` 최소 44×44px.
- `{component.button-icon}` 40×40 (주변 여백으로 44px 확보).
- `{component.text-input}` 높이 44px.

### Collapsing Strategy
- nav는 < 768px에서 햄버거 시트(화이트 풀스크린 오버레이, 상단 `{component.accent-bar}` 라임).
- 제품 사진은 모든 브레이크포인트에서 풀블리드 유지.
- 카드 그리드는 카드 축소가 아니라 컬럼 수를 줄인다.
- 데이터 표는 데스크탑 전체 → 모바일 가로 스크롤.

### Image Behavior
- 히어로 사진 반응형 크롭 — 데스크탑 와이드, 모바일 세로.
- 제품 컷은 native 비율 유지(4:5, 1:1), 레터박스 금지.
- 워드마크는 뷰포트 폭에 비례 스케일.

## Iteration Guide

1. 한 번에 컴포넌트 하나. YAML 키 참조(`{component.kpi-card}`, `{component.spec-stat}`).
2. 새 컴포넌트는 `{rounded.md}`(10px) 기본. 원형은 배지/칩/아이콘만 `{rounded.full}`.
3. 변형(`-active`, `-disabled`)은 `components:` 별도 엔트리.
4. `{token.refs}` 사용 — 인라인 hex 금지.
5. hover 상태 문서화 금지. Default + Active만.
6. 디스플레이/숫자 Bold(700) / 본문 400 — 대비 흐리지 않기. 숫자는 키운다.
7. Lime는 포인트·액션·핵심 숫자 전용. 넓은 면으로 확장하지 않기.
8. 강조가 필요하면 색을 넓히기 전에 숫자(성분·KPI)를 먼저 키운다.

## Known Gaps

- 포인트 컬러 Deep Teal(#103a3a)·Lime(#c8f04a)은 자사몰 렌더링 화면에서 근사 추출한 값(워드마크는 딥 틸, 프로모 배지는 라임 계열로 확인). 정확한 브랜드 CMYK·Pantone는 미스코프 — 정밀 매칭 시 자사몰 스크린샷 픽셀 샘플링 또는 브랜드 가이드 확보 필요.
- 정확한 랩노쉬 웹폰트(자사몰 실제 사용 서체)는 미확인 — Pretendard/Inter로 근사. 확정 시 `{typography.*}` 매핑만 교체.
- 라임의 정확한 채도/명도는 프로모 그래픽마다 편차 가능(할인 배지·시즌 배너) — 본 가이드는 대표 톤 1개로 고정.
- 자사몰 모션·트랜지션 타이밍, 폼 검증 상태, 제품 상세 레이아웃은 미스코프.
- 다크 반전(푸터·히어로 오버레이) 외 다크 모드 전체 표면은 미정의.
