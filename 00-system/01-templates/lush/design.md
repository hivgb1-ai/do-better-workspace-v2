## Overview

러쉬코리아의 브랜드 표면은 흰 캔버스(`{colors.canvas}` — #FFFFFF) 위에 진한 검정 본문(`{colors.body}` — #1A1A1A)과 시그니처 러쉬 레드(`{colors.lush-red}` — #E2231A)가 spar­ing하게 액센트로 들어가는 구조다. 시스템 자체는 자기 voltage가 약하고, 브랜드 에너지는 **풀블리드 핸드메이드 제품 매크로 사진** — 배쓰밤 단독 컷, 거품·물 튀김 슬로모션, 핸드메이드 워크숍, 매장 컷 — 에서 나온다. 사진을 둘러싼 UI 크롬은 최소화: 가는 산세리프 본문, 1px 헤어라인 구분선(`{colors.hairline}`), 채우지 않은 검정 텍스트 버튼.

**러쉬 레드 액센트**는 절대 본문 색이나 배경 채우기로 쓰이지 않는다. 로고·헤더 1px 라인·중요 알림·CTA 버튼 텍스트에만 사용. 캠페인별로 별도 시그니처 컬러가 붙기도 한다 — 핑크리본(`{colors.charity-pink}`), 채러티팟 초록(`{colors.earth-green}`), 어스데이 갈색·녹색 등. 이들은 캠페인 한정 토큰이며 시스템 기본 팔레트가 아니다.

타이포 보이스는 **굵은 산세리프 헤드라인**(Pretendard Bold)에 **손글씨 액센트**(Caveat)가 캠페인 헤더·시그니처 메시지에 끼어드는 페어 구조다. 손글씨는 핸드메이드·진정성 voice의 핵심 — 본문은 절대 손글씨로 가지 않고, 헤드라인 한 단어 또는 캠페인 슬로건에서만 등장한다. 본문은 Pretendard Regular(400) 또는 Light(300). 굵음(700) 헤드라인과 가벼움(400) 본문의 대비가 시스템의 편집 시그니처.

**Key Characteristics:**
- 흰 캔버스(`{colors.canvas}` — #FFFFFF)에 검정 본문(`{colors.body}` — #1A1A1A). 다크 모드는 시스템에 없음.
- 러쉬 레드(`{colors.lush-red}` — #E2231A)는 시그니처 액센트. 로고·1px 헤더 라인·중요 알림·CTA 텍스트에만. 배경 채우기 금지.
- 풀블리드 매크로 제품 사진이 브랜드 voltage. 크롬은 물러난다.
- 헤드라인은 Pretendard Bold (700) 굵게, 본문은 Pretendard Regular(400) 또는 Light(300). 대비가 편집 시그니처.
- 손글씨(Caveat)는 캠페인 헤더·시그니처 한 단어에만. 본문 손글씨 금지.
- 라운드는 0~8px. 카드는 `{rounded.sm}` 4px 또는 `{rounded.md}` 8px (핸드메이드 톤). 원형 아이콘만 `{rounded.full}`.
- 스페이싱은 4px 베이스. 섹션 간 `{spacing.section}` 96px, 카드 내부 `{spacing.lg}` 24px.
- 환경·비건·동물실험 반대·핸드메이드 가치가 voice의 기반. 거짓 마케팅 톤 금지.

## Colors

### Brand & Accent
- **Lush Red** (`{colors.lush-red}` — #E2231A): 시그니처 러쉬 레드. 로고·헤더 라인·중요 알림·CTA 텍스트·강조 숫자에만. 배경 채우기·버튼 fill 금지.
- **Lush Black** (`{colors.lush-black}` — #1A1A1A): 본문 텍스트·헤드라인·표 헤더 배경. 순검정 대신 살짝 따뜻한 검정.
- **Lush White** (`{colors.canvas}` — #FFFFFF): 페이지 캔버스·표 본문 배경. 모든 표면의 기본.

### Campaign Colors (한정 사용)
- **Charity Pink** (`{colors.charity-pink}` — #E91E63): 핑크리본 캠페인 한정. 평상시 시스템에 없음.
- **Earth Green** (`{colors.earth-green}` — #2D8A3E): 어스데이·플라스틱줍깅·채러티팟 등 ESG 캠페인. 환경 가치 강조.
- **Earth Day Brown** (`{colors.earth-brown}` — #8B5A2B): 어스데이 한정 자연 톤.

### Surface
- **Canvas** (`{colors.canvas}` — #FFFFFF): 페이지 기본 표면. 순백.
- **Surface Soft** (`{colors.surface-soft}` — #FAF6EE): 핸드메이드 크림 톤. 푸터·사이드바·이벤트 배너에 사용.
- **Surface Card** (`{colors.surface-card}` — #F5F0E5): 카드 배경. 캔버스에서 한 톤 따뜻하게.
- **Surface Elevated** (`{colors.surface-elevated}` — #EDE5D5): 카드 안 nested 카드.

### Hairlines & Borders
- **Hairline** (`{colors.hairline}` — #E5E0D5): 1px 기본 구분선. 표 행간·카드 외곽·섹션 사이.
- **Hairline Strong** (`{colors.hairline-strong}` — #C9C2B2): 강조 구분선. 표 헤더 아래·중요 분리.

### Text
- **Body** (`{colors.body}` — #1A1A1A): 본문·헤드라인 기본 검정.
- **Body Soft** (`{colors.body-soft}` — #4A4A4A): 보조 본문·메타데이터.
- **Muted** (`{colors.muted}` — #888888): 푸터·캡션·약한 메타.

### Semantic (보고서 알림용)
- **Alert Red** (`{colors.alert-red}` — #E2231A): `{colors.lush-red}`와 동일. 매출 급락·ROI 미달·결품·치명 신호.
- **Alert Yellow** (`{colors.alert-yellow}` — #B58E00): 매출 급변·환불률 이상·주의 신호. 너무 노란 톤(#FFC000) 대신 살짝 어둡게.
- **Alert Green** (`{colors.alert-green}` — #2D8A3E): `{colors.earth-green}`와 동일. ROI 우수·신규가입 급증·긍정 신호.

## Typography

### Font Family
**Pretendard**가 시스템 기본 산세리프. 영문 fallback `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`. 손글씨 액센트는 **Caveat** (Google Fonts 오픈소스). 손글씨 한글 대체가 필요하면 **Gowun Dodum** 또는 **Nanum Pen Script**.

세 가지 컷:
- Display (Pretendard 700) — 헤드라인·중요 숫자·표 헤더
- Body (Pretendard 400) — 본문·표 본문·메타데이터
- Light (Pretendard 300) — 캡션·보조 본문 (선택)
- Handwritten (Caveat 400~700) — 캠페인 헤더·시그니처 한 단어 액센트

굵음(700)과 일반(400)의 대비, 그리고 산세리프와 손글씨의 대비가 편집 시그니처.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-xl}` | 56px | 700 | 1.05 | -0.5px | 보고서 표지·랜딩 hero h1 |
| `{typography.display-lg}` | 40px | 700 | 1.1 | -0.3px | 섹션 헤드 |
| `{typography.display-md}` | 28px | 700 | 1.15 | 0 | 보고서 H1·서브 섹션 헤드 |
| `{typography.display-sm}` | 22px | 700 | 1.2 | 0 | H2·중요 숫자 강조 |
| `{typography.title-lg}` | 18px | 700 | 1.3 | 0 | 카드 타이틀·H3 |
| `{typography.title-md}` | 16px | 600 | 1.4 | 0 | 표 헤더·소제목 |
| `{typography.label-uppercase}` | 12px | 700 | 1.3 | 1.2px | 카테고리 라벨·캠페인 태그 |
| `{typography.body-md}` | 14px | 400 | 1.6 | 0 | 본문 기본 |
| `{typography.body-sm}` | 12px | 400 | 1.5 | 0 | 표 본문·메타데이터·푸터 |
| `{typography.caption}` | 10px | 400 | 1.4 | 0.3px | 캡션·법적 고지 |
| `{typography.handwritten-display}` | 36px | 600 | 1.0 | 0 | 캠페인 헤더 손글씨 액센트 (Caveat) |
| `{typography.handwritten-accent}` | 18px | 400 | 1.2 | 0 | 한 단어 손글씨 액센트 (Caveat) |
| `{typography.tabular}` | 14px | 400 | 1.5 | 0 | 숫자 정렬용. `font-variant-numeric: tabular-nums` |

### Principles
산세리프 굵음(700) 헤드라인과 일반(400) 본문의 대비가 기본. 손글씨(Caveat)는 캠페인 헤더 한 곳·시그니처 한 단어에만 끼어든다 — 본문 손글씨 금지. 숫자가 표에 들어갈 때는 항상 `{typography.tabular}` (tabular-nums)로 자릿수 정렬. 라벨은 `{typography.label-uppercase}` 12px 1.2px tracking — "machined" 라기보다는 "stamped on craft paper" 느낌.

### Note on Font Substitutes
Pretendard가 없으면 **Inter** (variable, 700/400/300)가 가장 가까운 오픈소스 대체. 손글씨 Caveat가 없으면 **Gowun Dodum** (한글 손글씨 톤)이 한국어 캠페인에 적합. 영문만이라면 **Kalam** 또는 **Patrick Hand**.

## Layout

### Spacing System
- **Base unit:** 4px.
- **Tokens:** `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 40px · `{spacing.xxl}` 64px · `{spacing.section}` 96px.
- **Section padding (vertical):** `{spacing.section}` (96px) 사이 주요 편집 밴드.
- **Hero photo bands:** `{spacing.xxl}` (64px) 내부 vertical 패딩.
- **Card internal padding:** `{spacing.lg}` (24px) 콘텐츠·캠페인 카드; `{spacing.xl}` (40px) 보고서 셀.
- **Gutters:** `{spacing.lg}` (24px) 3-up 카드 사이; `{spacing.md}` (16px) 푸터 컬럼 안.

### Grid & Container
- **Max content width:** ~1200px 중앙 (BMW M보다 좁게 — 핸드메이드 톤은 너무 넓으면 차가워짐).
- **Editorial body:** 12-column 그리드. 사진 밴드는 풀블리드.
- **Card grids:** 데스크탑 3-up, 태블릿 2-up, 모바일 1-up.
- **Footer:** 데스크탑 3컬럼 (Models / Lifestyle / Owners), 모바일 1컬럼.

### Whitespace Philosophy
러쉬는 사진과 손글씨 액센트가 voltage를 만든다. 빈 공간은 절제 — 핸드메이드 톤이라 너무 비어 있으면 클리닉처럼 차갑게 느껴진다. 섹션 사이 `{spacing.section}` 96px이 균일하게 들어가지만, 카드 내부는 `{spacing.lg}` 24px로 약간 빽빽하게 — 손글씨로 가득한 노트처럼.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat | 그림자·테두리 없음 | 본문 섹션·헤더·푸터·풀블리드 사진 밴드 |
| Soft hairline | 1px `{colors.hairline}` 테두리 | 섹션 구분·카드 외곽·표 행 |
| Card surface | `{colors.surface-card}` 배경 (캔버스 위) | 콘텐츠 카드·캠페인 카드 |
| Photographic depth | 풀블리드 사진 edge-to-edge 크롭 | Hero 밴드·캠페인 피처 |

드롭 섀도우는 사용하지 않는다. 깊이는 사진(피사체+조명)과 캔버스/카드 surface 톤 차이로만.

### Decorative Depth
- **Lush Red Underline** (`{component.red-underline}`): 헤드라인 아래 4px 두께 러쉬 레드 라인. 보고서 H1·중요 섹션 표시. 캠페인 식별 마커 역할.
- **Handwritten Accent** (`{component.handwritten-accent}`): 헤드라인 옆/아래에 손글씨로 한 단어 추가 (예: "Made by hand."). 핸드메이드 voice의 시그니처.
- **Macro Photography**: 배쓰밤 단독·거품·물 튀김 매크로 사진이 풀블리드로 깊이를 만든다. 조명(매장 조명·자연광)이 드롭 섀도우 역할.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.none}` | 0px | 표 셀·풀블리드 사진 컨테이너·헤더 라인 |
| `{rounded.xs}` | 2px | 거의 미사용 |
| `{rounded.sm}` | 4px | 캠페인 태그 칩·작은 라벨·인풋 |
| `{rounded.md}` | 8px | 카드·버튼·spec 셀 — 핸드메이드 톤의 기본 |
| `{rounded.lg}` | 12px | 큰 카드·이벤트 배너 (드물게) |
| `{rounded.full}` | 9999px / 50% | 원형 아이콘 버튼·카테고리 칩·태그 |

라디우스 hierarchy는 "0 또는 8 (그리고 가끔 full)". BMW M처럼 0px-only가 아닌 이유는 핸드메이드 톤 — 약간의 둥근 모서리가 손으로 만든 느낌을 살린다.

### Photography Geometry
Hero 사진은 풀블리드, 라운드 0px. 카드 안 사진은 카드 라운드(`{rounded.md}` 8px)를 따라가되, 사진 자체는 16:9 또는 4:5 시네마/포트레이트 비율. 매크로 제품 컷은 정사각(1:1) 빈도가 높다 — 인스타·매장 디스플레이 일관성.

## Components

### Top Navigation

**`top-nav`** — 흰 캔버스 위 64px 네비. `{colors.canvas}` 배경, `{colors.body}` 검정 텍스트. 좌측 LUSH 로고(러쉬 레드 + 검정), 중앙 메뉴(Products · Campaigns · Stores · Lush Earth), 우측 검색·계정·장바구니. 메뉴 항목은 `{typography.body-md}` 검정. 호버 시 `{colors.lush-red}` 4px 언더라인.

### Buttons

**`button-primary`** — 시그니처 CTA. 배경 `{colors.lush-black}`, 텍스트 `{colors.canvas}` 흰색, 라운드 `{rounded.md}` 8px, 패딩 12px × 24px, 높이 44px. 타입 `{typography.title-md}`. 호버 시 배경 `{colors.lush-red}`.

**`button-primary-outline`** — 같은 모양에 배경 transparent, `{colors.lush-black}` 1.5px outline, 검정 텍스트. 사진 위에 얹을 때.

**`button-icon`** — 원형 아이콘 버튼. 44 × 44px, `{colors.surface-card}` 배경, `{rounded.full}`. 검색·즐겨찾기·공유.

**`text-link`** — 인라인 텍스트 링크. `{typography.body-md}` 검정, 호버 시 `{colors.lush-red}` 1px 언더라인. 캠페인 헤더에서는 손글씨(Caveat)로 변형 가능.

### Cards & Containers

**`hero-photo-band`** — 풀블리드 매크로 제품/캠페인 사진 밴드. h1은 `{typography.display-xl}` 56px / 700, 사진 위에 흰색 또는 검정 텍스트(사진 밝기에 따라). 손글씨 액센트가 옆에 한 단어 추가되기도. 수직 패딩 `{spacing.xxl}` 64px.

**`product-card`** — 제품 카드. `{colors.surface-card}` 배경, `{rounded.md}` 8px, 패딩 `{spacing.lg}` 24px. 상단 1:1 매크로 제품 컷, 아래 제품명 `{typography.title-lg}`, 가격 `{typography.body-md}` 굵게, 카테고리 라벨 `{typography.label-uppercase}`.

**`campaign-card`** — 캠페인 카드. `{colors.canvas}` 배경에 `{colors.hairline}` 1px 테두리, `{rounded.md}` 8px. 16:9 캠페인 사진 + 캠페인 태그(`{typography.label-uppercase}` 캠페인 컬러) + 헤드라인 `{typography.title-lg}` + 본문 발췌.

**`spec-cell`** — 보고서 데이터 셀. `{colors.surface-soft}` 배경, `{rounded.md}` 8px, 패딩 `{spacing.lg}` 24px. 값 `{typography.display-sm}` 22px / 700 상단, 라벨 `{typography.label-uppercase}` 하단.

**`alert-callout`** — 알림 박스. `{colors.canvas}` 배경에 좌측 4px 컬러 라인(`{colors.alert-red}` / `{colors.alert-yellow}` / `{colors.alert-green}`), 라운드 `{rounded.sm}` 4px. 헤더 `{typography.title-md}` + 본문 `{typography.body-sm}`.

### Inputs & Forms

**`text-input`** — 표준 인풋. `{colors.canvas}` 배경, 1px `{colors.hairline}` 테두리, 라운드 `{rounded.sm}` 4px, 패딩 10px × 14px, 높이 44px. 포커스 시 테두리 `{colors.lush-red}` 1.5px.

### Signature Components

**`red-underline`** — 헤드라인 아래 4px `{colors.lush-red}` 라인. 보고서 H1·랜딩 hero 헤드라인 직후. 시스템에서 가장 시그니처한 비-타이포 요소.

**`handwritten-accent`** — 손글씨(Caveat) 한 단어/한 문구. 헤드라인 옆 또는 캠페인 헤더에. 본문 절대 금지. 사용 예: "Fresh.", "Made by hand.", "비건 인증".

**`campaign-badge`** — 캠페인 한정 배지. 캠페인 컬러 배경(예: 어스데이는 `{colors.earth-green}`), 흰색 텍스트, `{rounded.full}`, 패딩 4px × 12px, 타입 `{typography.label-uppercase}`.

### Footer

**`footer`** — 페이지 하단. `{colors.surface-soft}` 배경(캔버스보다 따뜻한 크림), `{colors.body}` 검정 텍스트. 3컬럼 링크(Products / Campaigns / Owners) + 하단 줄에 LUSH 로고 + 법적 고지 `{typography.caption}`. 수직 패딩 64px.

## Do's and Don'ts

### Do
- 페이지마다 풀블리드 매크로 제품/캠페인 사진을 anchor로. 사진이 voltage.
- `{colors.lush-red}`는 로고·헤더 라인·중요 알림에만. 시그니처 마커.
- 헤드라인은 Pretendard Bold (700), 본문은 Regular (400). 굵음-일반 대비를 유지.
- 캠페인 헤더에 손글씨(Caveat) 한 단어 추가. 핸드메이드 voice의 핵심.
- 라운드는 `{rounded.md}` 8px 기본 (카드·버튼). 핸드메이드 톤은 약간 둥근 게 자연.
- 라벨에 1.2px tracking. "stamped on craft paper" 느낌.
- 환경·비건·동물실험 반대 가치를 본문에 자연스럽게 녹여.

### Don't
- `{colors.lush-red}`를 배경 채우기로 쓰지 말 것. 시그니처가 약해진다.
- 본문을 손글씨(Caveat)로 가져가지 말 것. 손글씨는 한 단어 액센트만.
- 캠페인 컬러(`{colors.charity-pink}`·`{colors.earth-green}`·`{colors.earth-brown}`)를 시스템 기본 팔레트로 끌어들이지 말 것. 캠페인 한정.
- 다크 모드 만들지 말 것. 러쉬는 흰 캔버스가 시스템 정체성.
- 그라디언트 배경·드롭 섀도우 사용 금지. 깊이는 사진과 surface 톤만으로.
- 라운드 0px만으로 가지 말 것. BMW M처럼 너무 차갑다 — 8px 둥근 코너가 핸드메이드 voice.
- 본문 폰트를 굵게(700) 가지 말 것. 일반(400)과 가벼움(300) 사이만 사용.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Mobile | < 768px | 햄버거 nav; hero h1 56→36px; 카드 그리드 1-up; 풀블리드 사진 유지 |
| Tablet | 768–1024px | top nav 유지; 2-up 카드 그리드; 사진 비율 변경 가능 |
| Desktop | 1024–1200px | 풀 nav; 3-up 카드 그리드; 보고서 표 4컬럼 가능 |
| Wide | > 1200px | desktop과 동일, 1200px 중앙 정렬 |

### Touch Targets
- `{component.button-primary}` 44 × 44px 최소.
- `{component.button-icon}` 44 × 44px.
- `{component.text-input}` 높이 44px.
- 카테고리 칩은 패딩 4px × 12px이지만 주변 spacing 포함 44px tap area 확보.

### Collapsing Strategy
- top nav < 768px에서 햄버거 시트로 collapse. 시트는 `{colors.canvas}` 풀스크린.
- 사진은 모든 breakpoint에서 풀블리드 유지.
- 카드 그리드는 컬럼 수만 줄이고 카드 자체 크기는 유지.
- 보고서 표는 4-up → 2-up → 1-up. 숫자 폰트 크기 유지.

### Image Behavior
- Hero 사진은 반응형 크롭 — 데스크탑 와이드, 모바일 세로.
- 매크로 제품 컷은 1:1 정사각 유지. 모바일에서도 자르지 않음.
- 풀블리드 캠페인 사진은 4:5 또는 16:9 유지.

## Iteration Guide

1. 한 컴포넌트씩 작업. YAML 키(`{component.product-card}` 등)로 참조.
2. 새 컴포넌트는 `{rounded.md}` 8px이 기본. 원형 아이콘만 `{rounded.full}`.
3. 변형(`-active`·`-disabled`)은 별도 `components:` 항목으로.
4. 토큰 참조만 사용 — hex 인라인 금지.
5. 호버 상태는 문서화하지 않음. Default와 Active/Pressed만.
6. 헤드라인은 Pretendard Bold (700), 본문은 Regular (400). 대비를 흐리지 말 것.
7. 캠페인 컬러는 시스템 토큰으로 승격하지 말 것 — 캠페인 한정.
8. 강조가 모호할 때: 큰 사진 + 손글씨 액센트가 큰 폰트보다 효과적.

## Known Gaps

- 러쉬 글로벌 브랜드 가이드라인의 정확한 hex(특히 러쉬 레드 #E2231A는 추정 — 공식 가이드 미공개)는 확인 불가. 자사몰 lush.co.kr 시각 톤에서 가까운 값 사용.
- Lush Handwritten 폰트는 비공개 라이선스. 오픈소스 대체로 Caveat 사용.
- 캠페인 컬러(핑크리본·채러티팟)는 캠페인별로 변동. 위 토큰은 대표 사례.
- 매장(직영점) 사이니지·POP 디자인은 본 시스템 범위 밖.
- 모션·트랜지션·애니메이션 미스코프.
- 폼 검증·에러·성공 상태 변형 미문서화.
