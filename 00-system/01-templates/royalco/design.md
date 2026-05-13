## Overview

로얄앤컴퍼니의 브랜드 표면은 백자 도기 톤의 따뜻한 화이트(`{colors.canvas}` — #F7F4EE) 위에, 본문은 도자기 유약 같은 잉크 검정(`{colors.body}` — #1B1B1A), 시그니처는 로얄 사파이어 블루(`{colors.royal-blue}` — #1E3A8A)와 도자기 글레이즈 골드(`{colors.glaze-gold}` — #B8902E)가 sparingly 액센트로 들어가는 구조다. 시스템 자체는 voltage가 낮고 — 50년 위생도기 헤리티지의 신뢰감이 voltage — 브랜드 에너지는 **백자 톤의 욕실 풀블리드 사진** (변기·세면기·수전 단독 컷, 욕실 공간 전경, 도기 표면 매크로)에서 나온다. UI 크롬은 도자기 표면처럼 매끈하게: 산세리프 본문, 가는 1px 헤어라인(`{colors.hairline}`), 채우지 않은 검정 텍스트 버튼.

**로얄 블루 액센트**는 본문 색이나 배경 채우기로 쓰이지 않는다. 로고·헤더 1px 라인·중요 알림·CTA 버튼·핵심 수치 강조에만 사용. 글레이즈 골드는 헤리티지 표시(설립 1970·인증·수상 마크)와 프리미엄 라인(블로이·MOD) 강조에만 등장. 두 색은 같은 페이지에 동시 등장하지 않는다 — 한 페이지는 블루 톤 또는 골드 톤 중 하나만.

타이포 보이스는 **굵은 산세리프 헤드라인**(Pretendard Bold)에 **숫자 강조 tabular**(Pretendard Display 700)가 분기·주간 보고에서 끼어드는 페어 구조다. 본문은 Pretendard Regular(400). 굵음(700) 헤드라인과 일반(400) 본문의 대비가 시스템의 편집 시그니처. 일본·중동 수출 카탈로그에 영문 병기가 들어가도 Pretendard로 자연스럽게 받는다.

**Key Characteristics:**
- 백자 화이트 캔버스(`{colors.canvas}` — #F7F4EE)에 잉크 검정 본문(`{colors.body}` — #1B1B1A). 다크 모드는 시스템에 없음.
- 로얄 사파이어 블루(`{colors.royal-blue}` — #1E3A8A)는 시그니처. 로고·1px 헤더 라인·중요 알림·CTA·핵심 수치에만. 배경 채우기 금지.
- 글레이즈 골드(`{colors.glaze-gold}` — #B8902E)는 헤리티지·프리미엄 라인 한정. 블루와 같은 페이지 동시 사용 금지.
- 풀블리드 욕실 사진이 브랜드 voltage. 크롬은 도자기 표면처럼 물러난다.
- 헤드라인은 Pretendard Bold (700) 굵게, 본문은 Pretendard Regular(400). 대비가 편집 시그니처.
- 라운드는 0~4px. 도기 모서리처럼 단단하게. 카드는 `{rounded.sm}` 4px 또는 `{rounded.none}` 0px. 원형 아이콘만 `{rounded.full}`.
- 스페이싱은 8px 베이스. 섹션 간 `{spacing.section}` 88px, 카드 내부 `{spacing.lg}` 24px.
- 50년 헤리티지·국내 제조·B2B 신뢰가 voice의 기반. 가벼운 마케팅 톤 금지.

## Colors

### Brand & Accent
- **Royal Blue** (`{colors.royal-blue}` — #1E3A8A): 로얄 사파이어 블루. 로고·헤더 라인·중요 알림·CTA 텍스트·강조 수치에만. 배경 채우기·버튼 fill 금지.
- **Glaze Gold** (`{colors.glaze-gold}` — #B8902E): 도자기 유약 골드. 헤리티지 마크·인증 표시·프리미엄 라인(블로이·MOD) 한정. 블루와 같은 페이지에 함께 쓰지 않는다.
- **Royal Black** (`{colors.body}` — #1B1B1A): 본문·헤드라인·표 헤더 텍스트. 순검정 대신 살짝 따뜻한 잉크 검정.

### Surface
- **Canvas** (`{colors.canvas}` — #F7F4EE): 페이지 기본 표면. 백자 도기 톤 따뜻한 화이트.
- **Pure White** (`{colors.pure-white}` — #FFFFFF): 표 본문 셀·인풋·카드 내부. 캔버스에서 한 단계 밝게.
- **Surface Soft** (`{colors.surface-soft}` — #EFEAE0): 푸터·사이드바·이벤트 배너에 사용.
- **Surface Card** (`{colors.surface-card}` — #FCFAF5): 카드 배경. 캔버스에서 한 톤 밝게.

### Hairlines & Borders
- **Hairline** (`{colors.hairline}` — #D9D2C2): 1px 기본 구분선. 표 행간·카드 외곽·섹션 사이.
- **Hairline Strong** (`{colors.hairline-strong}` — #B8AE96): 강조 구분선. 표 헤더 아래·중요 분리.

### Text
- **Body** (`{colors.body}` — #1B1B1A): 본문·헤드라인 기본 검정.
- **Body Soft** (`{colors.body-soft}` — #4A4842): 보조 본문·메타데이터.
- **Muted** (`{colors.muted}` — #88847B): 푸터·캡션·약한 메타.

### Semantic (보고서 알림용)
- **Alert Red** (`{colors.alert-red}` — #C62828): 매출 급락·ROI 미달·매출채권 악성·긴급 클레임·치명 신호.
- **Alert Yellow** (`{colors.alert-yellow}` — #B58E00): 매출 급변·이행 미달·연체 30~60일·주의 신호. 너무 노란 톤(#FFC000) 대신 살짝 어둡게.
- **Alert Green** (`{colors.alert-green}` — #2E7D32): 약정 초과·회수율 우수·이행 우수·긍정 신호.

## Typography

### Font Family
**Pretendard**가 시스템 기본 산세리프. 영문 fallback `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`. 영문·일문·중문 수출 카탈로그에서 폰트 fallback이 매끄러워야 한다. 손글씨·세리프 액센트는 시스템에 없음 — 위생도기 브랜드는 매끈한 산세리프가 도자기 표면 톤과 정합.

세 가지 컷:
- Display (Pretendard 700) — 헤드라인·중요 숫자·표 헤더
- Body (Pretendard 400) — 본문·표 본문·메타데이터
- Tabular (Pretendard 400, tabular-nums) — 숫자 정렬용 표

굵음(700)과 일반(400)의 대비, 숫자 tabular 정렬이 편집 시그니처. 손글씨·세리프·italic 사용 금지.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-xl}` | 48px | 700 | 1.1 | -0.4px | 보고서 표지·랜딩 hero h1 |
| `{typography.display-lg}` | 36px | 700 | 1.15 | -0.2px | 섹션 헤드 |
| `{typography.display-md}` | 26px | 700 | 1.2 | 0 | 보고서 H1·서브 섹션 헤드 |
| `{typography.display-sm}` | 20px | 700 | 1.25 | 0 | H2·중요 수치 강조 |
| `{typography.title-lg}` | 17px | 700 | 1.3 | 0 | 카드 타이틀·H3 |
| `{typography.title-md}` | 15px | 600 | 1.4 | 0 | 표 헤더·소제목 |
| `{typography.label-uppercase}` | 11px | 700 | 1.3 | 1.4px | 카테고리 라벨·채널 태그 |
| `{typography.body-md}` | 14px | 400 | 1.65 | 0 | 본문 기본 |
| `{typography.body-sm}` | 12px | 400 | 1.55 | 0 | 표 본문·메타데이터·푸터 |
| `{typography.caption}` | 10px | 400 | 1.4 | 0.3px | 캡션·법적 고지 |
| `{typography.tabular}` | 14px | 400 | 1.5 | 0 | 숫자 정렬용. `font-variant-numeric: tabular-nums` |

### Principles
산세리프 굵음(700) 헤드라인과 일반(400) 본문의 대비가 기본. 손글씨·세리프·italic 금지 — 도기 브랜드는 매끈한 산세리프 한 가족. 숫자가 표에 들어갈 때는 항상 `{typography.tabular}` (tabular-nums)로 자릿수 정렬 — B2B 보고서의 신뢰감 핵심. 라벨은 `{typography.label-uppercase}` 11px 1.4px tracking — "stamped on porcelain" 느낌.

### Note on Font Substitutes
Pretendard가 없으면 **Inter** (variable, 700/400)가 가장 가까운 오픈소스 대체. 영문 본문은 **Source Sans 3**도 가능. 한자(수출)는 Noto Sans CJK fallback.

## Layout

### Spacing System
- **Base unit:** 8px.
- **Tokens:** `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 40px · `{spacing.xxl}` 56px · `{spacing.section}` 88px.
- **Section padding (vertical):** `{spacing.section}` (88px) 사이 주요 편집 밴드.
- **Hero photo bands:** `{spacing.xxl}` (56px) 내부 vertical 패딩.
- **Card internal padding:** `{spacing.lg}` (24px) 콘텐츠·제품 카드; `{spacing.xl}` (40px) 보고서 셀.
- **Gutters:** `{spacing.lg}` (24px) 3-up 카드 사이; `{spacing.md}` (16px) 푸터 컬럼 안.

### Grid & Container
- **Max content width:** ~1240px 중앙. B2B 보고서·임원진 출력용 A4 가로 출력도 고려한 폭.
- **Editorial body:** 12-column 그리드. 사진 밴드는 풀블리드.
- **Card grids:** 데스크탑 3-up, 태블릿 2-up, 모바일 1-up.
- **Report tables:** 데스크탑 4컬럼·6컬럼, 모바일 2컬럼 + scroll-x.

### Whitespace Philosophy
로얄앤코는 도자기 표면 같은 정돈된 빈 공간이 voltage를 만든다. 카드 사이는 `{spacing.lg}` 24px, 섹션 사이는 `{spacing.section}` 88px가 균일하게 — 도기 매장의 진열대처럼 일정 간격. 너무 빽빽하면 신뢰감이 떨어진다.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat | 그림자·테두리 없음 | 본문 섹션·헤더·푸터·풀블리드 사진 밴드 |
| Soft hairline | 1px `{colors.hairline}` 테두리 | 섹션 구분·카드 외곽·표 행 |
| Card surface | `{colors.surface-card}` 배경 (캔버스 위) | 콘텐츠 카드·제품 카드 |
| Photographic depth | 풀블리드 사진 edge-to-edge 크롭 | Hero 밴드·제품 피처 |

드롭 섀도우는 사용하지 않는다. 깊이는 도기 매크로 사진(피사체+조명)과 캔버스/카드 surface 톤 차이로만.

### Decorative Depth
- **Royal Blue Underline** (`{component.blue-underline}`): 헤드라인 아래 3px 두께 로얄 블루 라인. 보고서 H1·중요 섹션 표시. 시스템에서 가장 시그니처한 비-타이포 요소.
- **Glaze Gold Mark** (`{component.gold-mark}`): 헤리티지 마크·인증 표시. "Since 1970" "KS 인증" 같은 한 줄 옆에 작은 골드 도트 또는 골드 underline 1px.
- **Porcelain Macro**: 변기·세면기·도기 표면 매크로 사진이 풀블리드로 깊이를 만든다. 자연광 또는 매장 조명이 드롭 섀도우 역할.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.none}` | 0px | 표 셀·풀블리드 사진 컨테이너·헤더 라인·도면 |
| `{rounded.xs}` | 2px | 미사용에 가까움 |
| `{rounded.sm}` | 4px | 카드·버튼·spec 셀·인풋 — 시스템 기본 |
| `{rounded.md}` | 8px | 큰 카드·이벤트 배너 (드물게) |
| `{rounded.full}` | 9999px / 50% | 원형 아이콘 버튼·카테고리 칩·태그 |

라디우스 hierarchy는 "0 또는 4 (그리고 가끔 full)". 도기 모서리처럼 단단하게 — 너무 둥글면 도기 브랜드 톤과 어긋난다.

### Photography Geometry
Hero 사진은 풀블리드, 라운드 0px. 카드 안 사진은 카드 라운드(`{rounded.sm}` 4px)를 따라가되, 사진 자체는 16:9 또는 4:5 시네마/포트레이트 비율. 매크로 도기 컷은 정사각(1:1) 빈도가 높다 — 카탈로그·자사몰 일관성. 욕실 공간 전경은 16:9 또는 21:9 와이드.

## Components

### Top Navigation

**`top-nav`** — 백자 캔버스 위 64px 네비. `{colors.canvas}` 배경, `{colors.body}` 검정 텍스트. 좌측 ROYAL & CO 로고(로얄 블루 + 검정), 중앙 메뉴(Products · Series · Pro · Stores · Heritage), 우측 검색·고객센터·언어전환(KO/EN). 메뉴 항목은 `{typography.body-md}` 검정. 호버 시 `{colors.royal-blue}` 3px 언더라인.

### Buttons

**`button-primary`** — 시그니처 CTA. 배경 `{colors.body}` 잉크 검정, 텍스트 `{colors.canvas}` 백자 화이트, 라운드 `{rounded.sm}` 4px, 패딩 12px × 24px, 높이 44px. 타입 `{typography.title-md}`. 호버 시 배경 `{colors.royal-blue}`.

**`button-primary-outline`** — 같은 모양에 배경 transparent, `{colors.body}` 1.5px outline, 검정 텍스트. 사진 위에 얹을 때.

**`button-icon`** — 원형 아이콘 버튼. 44 × 44px, `{colors.surface-card}` 배경, `{rounded.full}`. 검색·즐겨찾기·공유.

**`text-link`** — 인라인 텍스트 링크. `{typography.body-md}` 검정, 호버 시 `{colors.royal-blue}` 1px 언더라인.

### Cards & Containers

**`hero-photo-band`** — 풀블리드 욕실/도기/제품 사진 밴드. h1은 `{typography.display-xl}` 48px / 700, 사진 위에 흰색 또는 검정 텍스트(사진 밝기에 따라). 수직 패딩 `{spacing.xxl}` 56px.

**`product-card`** — 제품 카드. `{colors.surface-card}` 배경, `{rounded.sm}` 4px, 패딩 `{spacing.lg}` 24px. 상단 1:1 도기 매크로 컷, 아래 제품명 `{typography.title-lg}`, 시리즈 라벨 `{typography.label-uppercase}`, 가격 `{typography.body-md}` 굵게.

**`series-card`** — 시리즈 (MOD·BLOEI·CITY·CANYON·DIVE·NeoTemp) 카드. `{colors.canvas}` 배경에 `{colors.hairline}` 1px 테두리, `{rounded.sm}` 4px. 16:9 시리즈 이미지 + 시리즈 라벨(`{typography.label-uppercase}` `{colors.royal-blue}`) + 헤드라인 `{typography.title-lg}`.

**`spec-cell`** — 보고서 데이터 셀. `{colors.pure-white}` 배경, `{rounded.sm}` 4px, 패딩 `{spacing.lg}` 24px. 값 `{typography.display-sm}` 20px / 700 상단, 라벨 `{typography.label-uppercase}` 하단.

**`alert-callout`** — 알림 박스. `{colors.pure-white}` 배경에 좌측 3px 컬러 라인(`{colors.alert-red}` / `{colors.alert-yellow}` / `{colors.alert-green}`), 라운드 `{rounded.sm}` 4px. 헤더 `{typography.title-md}` + 본문 `{typography.body-sm}`.

**`report-table`** — B2B 보고서 표. 헤더 행 `{colors.body}` 배경 + `{colors.canvas}` 텍스트 + `{typography.title-md}`. 본문 행 `{colors.pure-white}` + `{colors.body}` + `{typography.tabular}` (숫자열). 행 사이 `{colors.hairline}` 1px. 행 호버 `{colors.surface-card}`.

### Inputs & Forms

**`text-input`** — 표준 인풋. `{colors.pure-white}` 배경, 1px `{colors.hairline}` 테두리, 라운드 `{rounded.sm}` 4px, 패딩 10px × 14px, 높이 44px. 포커스 시 테두리 `{colors.royal-blue}` 1.5px.

### Signature Components

**`blue-underline`** — 헤드라인 아래 3px `{colors.royal-blue}` 라인. 보고서 H1·랜딩 hero 헤드라인 직후. 시스템에서 가장 시그니처한 비-타이포 요소.

**`gold-mark`** — 헤리티지 표시. "Since 1970", "KS 인증", "수출 35개국" 같은 한 줄 옆에 작은 골드 도트 또는 1px 골드 underline. 같은 페이지에 `{component.blue-underline}` 있으면 골드 마크는 사용 금지 (한 페이지 한 액센트).

**`series-tag`** — 시리즈 한정 배지. 시리즈명 + 배경 `{colors.canvas}` + `{colors.royal-blue}` 텍스트 + 1px `{colors.royal-blue}` 테두리, `{rounded.sm}` 4px, 패딩 4px × 10px, 타입 `{typography.label-uppercase}`.

**`metric-block`** — 보고서 핵심 수치 강조. 값 `{typography.display-xl}` `{colors.royal-blue}`, 라벨 `{typography.label-uppercase}` `{colors.muted}` 하단. 카드 안에서만 사용.

### Footer

**`footer`** — 페이지 하단. `{colors.surface-soft}` 배경, `{colors.body}` 검정 텍스트. 3컬럼 링크(Products / Pro Service / Company) + 하단 줄에 ROYAL & CO 로고 + "Since 1970" 골드 마크 + 법적 고지 `{typography.caption}`. 수직 패딩 56px.

## Do's and Don'ts

### Do
- 페이지마다 풀블리드 도기/욕실 사진을 anchor로. 사진이 voltage.
- `{colors.royal-blue}`는 로고·헤더 라인·중요 알림·핵심 수치에만. 시그니처 마커.
- 헤드라인은 Pretendard Bold (700), 본문은 Regular (400). 굵음-일반 대비를 유지.
- 표 안의 숫자는 항상 `{typography.tabular}` (tabular-nums). B2B 보고서 신뢰감 핵심.
- 라운드는 `{rounded.sm}` 4px 기본 (카드·버튼). 도기 톤은 살짝 단단하게.
- 라벨에 1.4px tracking. "stamped on porcelain" 느낌.
- 50년 헤리티지·국내 제조·B2B 신뢰가 본문 톤의 기반.

### Don't
- `{colors.royal-blue}`를 배경 채우기로 쓰지 말 것. 시그니처가 약해진다.
- `{colors.royal-blue}`와 `{colors.glaze-gold}`를 같은 페이지에 함께 쓰지 말 것 — 한 페이지 한 액센트.
- 손글씨·세리프·italic 사용 금지. 도기 톤은 매끈한 산세리프 한 가족.
- 다크 모드 만들지 말 것. 백자 캔버스가 시스템 정체성.
- 그라디언트 배경·드롭 섀도우 사용 금지. 깊이는 사진과 surface 톤만으로.
- 라운드 12px 이상 사용 금지. 도기 모서리처럼 단단하게.
- 본문 폰트를 굵게(700) 가지 말 것. 일반(400) 사이만 사용.
- 가벼운 이모지·캐주얼 일러스트 사용 금지. B2B 브랜드 톤 유지.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Mobile | < 768px | 햄버거 nav; hero h1 48→32px; 카드 그리드 1-up; 풀블리드 사진 유지 |
| Tablet | 768–1024px | top nav 유지; 2-up 카드 그리드; 보고서 표 scroll-x |
| Desktop | 1024–1240px | 풀 nav; 3-up 카드 그리드; 보고서 표 6컬럼 가능 |
| Wide | > 1240px | desktop과 동일, 1240px 중앙 정렬 |

### Touch Targets
- `{component.button-primary}` 44 × 44px 최소.
- `{component.button-icon}` 44 × 44px.
- `{component.text-input}` 높이 44px.

### Collapsing Strategy
- top nav < 768px에서 햄버거 시트로 collapse.
- 사진은 모든 breakpoint에서 풀블리드 유지.
- 카드 그리드는 컬럼 수만 줄이고 카드 자체 크기는 유지.
- 보고서 표는 모바일에서 가로 스크롤 (숫자열 안 자르기).

### Image Behavior
- Hero 사진은 반응형 크롭 — 데스크탑 와이드, 모바일 세로.
- 매크로 도기 컷은 1:1 정사각 유지.
- 욕실 공간 사진은 16:9 또는 21:9 유지.

## Iteration Guide

1. 한 컴포넌트씩 작업. YAML 키(`{component.product-card}` 등)로 참조.
2. 새 컴포넌트는 `{rounded.sm}` 4px이 기본. 원형 아이콘만 `{rounded.full}`.
3. 변형(`-active`·`-disabled`)은 별도 `components:` 항목으로.
4. 토큰 참조만 사용 — hex 인라인 금지.
5. 호버 상태는 문서화하지 않음. Default와 Active/Pressed만.
6. 헤드라인은 Pretendard Bold (700), 본문은 Regular (400). 대비를 흐리지 말 것.
7. 블루와 골드는 같은 페이지에 동시 등장 금지 — 한 페이지 한 액센트.
8. B2B 보고서는 표 + 알림 박스가 기본. 본문 산문 최소화.

## Known Gaps

- 로얄앤컴퍼니 글로벌 브랜드 가이드라인의 정확한 hex(특히 로얄 블루)는 공개 미확인. 자사몰 mall.iroyalbath.com / iroyalbath.com 시각 톤에서 가까운 값 사용.
- 시리즈별(MOD·BLOEI·CITY·CANYON·DIVE·NeoTemp) 한정 컬러는 본 시스템 범위 밖. 시리즈 카드는 라벨로만 구분.
- 매장(직영점·전시장) 사이니지·POP 디자인은 본 시스템 범위 밖.
- 모션·트랜지션·애니메이션 미스코프.
- 폼 검증·에러·성공 상태 변형 미문서화.
- 수출 카탈로그의 영문·일문·중문 식자 디테일 미문서화.
