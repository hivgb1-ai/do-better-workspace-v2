# 프린트베이커리(PRINT BAKERY) Design Guide

> 단일 출처 비주얼 아이덴티티. PDF 보고서·HTML 대시보드·랜딩·슬라이드 어떤 산출물이든
> 이 파일을 참조하면 프린트베이커리 톤이 즉시 적용된다.
> 리서치(printbakery.com·@print_bakery·매장, 2026-06)로 확인된 톤만 반영.
> 정확한 브랜드 Hex는 공개 가이드라인이 없어 **시각 근사값**을 사용한다 (Known Gaps 참조).

## Overview

프린트베이커리의 비주얼은 **화이트 갤러리 미니멀**이다. 캔버스는 거의 순백에 가까운 **웜 화이트**(`{colors.canvas}`)이고, 그 위에 **잉크 블랙**(`{colors.ink}`)의 절제된 타이포와 작품 이미지가 액자처럼 얹힌다. 미술 작품(판화·원화)을 일상으로 끌어오는 아트 커머스답게, 화면은 화려한 색면이 아니라 **여백·정렬·작품 그 자체**로 만들어진다. 브랜드가 색을 더하지 않는 이유는 분명하다 — 색은 벽에 걸리는 작품이 맡고, 배경(브랜드)은 그 작품이 숨 쉴 흰 벽이 된다.

브랜드의 보이스는 슬로건 "**일상의 예술을 맛보다**"에 압축돼 있다. 미술관의 높은 문턱을 베이커리처럼 친근하게(Print + Bakery) 낮추는 것이 이름의 출발이다. 그래서 산출물도 **권위적인 무게가 아니라, 잘 정리된 갤러리 도록의 차분함**으로 말한다. voltage(시각적 긴장)는 색이 아니라 **압도적인 여백 위에 놓인 단 하나의 큰 작품 이미지, 그리고 또렷한 잉크 블랙 타이포**의 대비에서 나온다.

산출물에 적용할 때 핵심은 **화이트 + 무채색 절제**다. 강조색을 새로 만들지 말고, 위계는 **잉크 블랙의 농도 단계**(블랙 → 차콜 → 미드그레이 → 라이트그레이)와 1px 헤어라인, 그리고 여백의 양으로 만든다. 그림자·그라데이션은 거의 쓰지 않는다. 데이터 보고서라면 작품 이미지 자리에 **큰 KPI 숫자**가 들어가, 같은 "흰 벽 위 한 점" 구조를 그대로 따른다.

**Key Characteristics:**
- 캔버스는 웜 화이트(`{colors.canvas}`) — 갤러리의 흰 벽. 다크 모드는 이 브랜드 톤이 아니다.
- **강조색을 새로 만들지 않는다.** 색은 작품 이미지가 맡고, 브랜드는 무채색(`{colors.ink}`~`{colors.line}`)으로 물러선다.
- 타이포는 **모던 세리프 + 정제된 산세리프** 2종 운용. 제목·작품명은 세리프(갤러리 도록), 본문·UI·숫자는 산세리프.
- 위계는 색이 아니라 **잉크 농도 단계 + 헤어라인 + 여백**으로. 그림자 최소.
- 여백을 과감하게 — 섹션 간 `{spacing.section}`, 작품/카드 둘레 `{spacing.xxl}`. 빽빽함은 갤러리 톤이 아니다.
- 이미지는 **액자처럼**: 얇은 헤어라인 테두리 또는 테두리 없이 넉넉한 매트(여백) 안에.
- 모서리는 직각(`{rounded.none}`)이 기본. 도록·액자의 단정한 직각.
- KPI 숫자는 크고 또렷하게, 잉크 블랙으로 — 보고서에서 숫자가 "걸린 작품"이 된다.

## Colors

### Brand & Ink
- **Ink** (`{colors.ink}` — #16140F): 로고·헤드라인·핵심 텍스트. 순흑보다 살짝 따뜻한 잉크 블랙.
- **Charcoal** (`{colors.charcoal}` — #3A3733): 부제·강조 본문. 한 단계 옅은 먹.
- **Mid Gray** (`{colors.mid}` — #6E6A63): 본문 보조·캡션 직전 톤.
- **(강조색 없음)**: 시그니처 액센트 컬러를 정의하지 않는다. 강조가 꼭 필요하면 잉크 블랙 면(반전) 또는 굵기·크기·여백으로 푼다.

### Surface
- **Canvas** (`{colors.canvas}` — #FBFAF7): 기본 페이지 바닥. 웜 화이트 갤러리 벽.
- **Surface Soft** (`{colors.surface-soft}` — #F4F2EC): 표 헤더·푸터 인접 스트립용 한 톤 낮은 면.
- **Surface Card** (`{colors.surface-card}` — #FFFFFF): 카드·작품 매트. 캔버스보다 살짝 밝은 순백으로 면 분리.
- **Ink Panel** (`{colors.ink-panel}` — #16140F): 반전 강조 밴드(표지·핵심 인용). 위에 캔버스색 텍스트.

### Hairlines & Borders
- **Line** (`{colors.line}` — #E3DFD6): 기본 1px 구분선·표 행·카드 외곽·액자 테두리.
- **Line Strong** (`{colors.line-strong}` — #C9C3B6): 강조 구분선·표 헤더 하단·섹션 구획.

### Text
- **On Canvas** (`{colors.on-canvas}` — #16140F): 캔버스 위 기본 텍스트 = Ink.
- **Body** (`{colors.body}` — #3A3733): 본문 러닝 텍스트.
- **Muted** (`{colors.muted}` — #8C877E): 캡션·메타·라벨·푸터.
- **On Ink** (`{colors.on-ink}` — #FBFAF7): 잉크 패널(반전) 위 텍스트 = 캔버스색.

### Semantic (절제 — 무채 톤 안에서만)
- **Positive** (`{colors.positive}` — #2F6F4F): 마진 양호·목표 달성. 차분한 딥 그린, 면적 최소.
- **Negative** (`{colors.negative}` — #9E3B33): 마진 누수·역마진·목표 미달. 머트 브릭 레드, 수치 강조에만.
- **Warning** (`{colors.warning}` — #9A7B2E): 수수료 과다·저효율 주의. 머스터드 톤, 셀 강조에만.
- 세 색은 **데이터 보고서의 신호 전용**. 브랜드 표면(랜딩·표지)에는 쓰지 않는다.

## Typography

### Font Family
세리프(도록 제목) + 산세리프(본문·데이터) 2종 운용. 공식 서체 미공개이므로 시스템/오픈소스 대체 스택을 쓴다.
- 제목/작품명(세리프): `"Nanum Myeongjo", "Noto Serif KR", "Apple SD Gothic Neo", serif` — 갤러리 도록 톤.
- 본문/UI(산세리프): `"Pretendard", "Noto Sans KR", -apple-system, "Segoe UI", sans-serif` — 가독·정밀.
- 숫자(KPI): 산세리프 스택 + `font-variant-numeric: tabular-nums` — 표·대시보드 정렬.

### Hierarchy
| 토큰 | 용도 | 크기/두께(데스크톱) |
|------|------|---------------------|
| `{typography.display-xl}` | 표지·히어로 타이틀 (세리프) | 46–56px / 400 |
| `{typography.display-lg}` | 섹션 대제목 (세리프) | 30px / 400 |
| `{typography.heading}` | 소제목 (산세리프) | 20px / 600 |
| `{typography.label-uppercase}` | 라벨·카테고리 (산세리프) | 11px / 600 / letter-spacing 0.14em / muted |
| `{typography.body-lg}` | 리드 문단 | 18px / 400 |
| `{typography.body-md}` | 기본 본문 | 15px / 400 |
| `{typography.caption}` | 캡션·메타 | 12px / 400 muted |
| `{typography.number}` | KPI 수치 | 34–44px / 600, tabular-nums, Ink |

### Principles
- **세리프는 제목·작품명에만**, 본문·데이터는 산세리프. 두 종의 역할을 섞지 않는다.
- 라벨은 작게·자간 넓게(`{typography.label-uppercase}`) 도록 캡션처럼, muted 색으로.
- 숫자(KPI)는 크게·tabular-nums, 색은 잉크 블랙 — 강조색 대신 크기로 도드라지게.

### Note on Font Substitutes
프린트베이커리 실제 서체는 비공개. 위 스택은 "갤러리 미니멀(세리프 제목 + 산세리프 본문)"이라는 확인된 무드를 시스템/오픈소스 폰트로 근사한 것. 실제 사이트 서체와 다를 수 있음.

## Layout

### Spacing System
- `{spacing.section}` — 80px (섹션 간 — 갤러리 여백)
- `{spacing.xxl}` — 56px (작품/표지 둘레 매트)
- `{spacing.xl}` — 36px (카드 내부)
- `{spacing.lg}` — 24px
- `{spacing.md}` — 16px
- `{spacing.sm}` — 8px

### Grid & Container
- 최대 콘텐츠 폭 1080–1160px, 중앙 정렬. 좌우 여백을 넉넉히 남겨 갤러리 매트 효과.
- 작품/이미지 그리드는 2–3열, 카드 사이 간격 `{spacing.xl}` 이상.

### Whitespace Philosophy
여백이 곧 디자인이다. 채우려 하지 말고, 흰 벽 위에 작품(또는 숫자) 하나가 숨 쉬게. 빽빽함이 보이면 요소가 아니라 여백을 늘린다.

## Elevation & Depth

| Level | 용도 | 처리 |
|-------|------|------|
| 0 | 캔버스 | 그림자 없음 |
| 1 | 카드/작품 매트 | `{colors.surface-card}` 순백 면 + 1px 라인(`{colors.line}`), 그림자 없음 |
| 2 | 강조 밴드 | `{colors.ink-panel}` 반전 면 (잉크 블랙), 위에 캔버스색 텍스트 |

### Decorative Depth
깊이는 **그림자가 아니라 잉크 농도 단계와 헤어라인, 여백**으로 만든다. 액자 매트처럼 얇은 라인 한 줄이 카드를 띄운다. 드롭섀도는 쓰지 않는다(써야 한다면 매우 옅은 1px 라인으로 대체).

## Shapes

### Border Radius Scale
| 토큰 | 값 | 용도 |
|------|----|----|
| `{rounded.none}` | 0px | 기본 — 액자·표·이미지·밴드. 갤러리 직각 |
| `{rounded.sm}` | 2px | 버튼·칩 (최소한의 부드러움만) |
| `{rounded.full}` | 9999px | 상태 점·아이콘 버튼만 |

### Photography Geometry
작품·제품 이미지는 **흰 매트(여백) 안 직각 프레임**. 풀블리드보다 매트 안 배치를 우선 — 도록 톤. 테두리는 없거나 `{colors.line}` 1px. 이미지가 색을 담당하므로 배경·UI는 무채로 비운다. 데이터 차트도 같은 원칙: 직각, 무채 그레이 스케일 + 신호색 최소.

## Components

### Top Navigation
웜 화이트 캔버스 위 잉크 블랙 텍스트. 로고 좌측(블랙 워드마크), 메뉴 우측. 하단 1px 라인(`{colors.line}`). 그림자 없음. 스크롤 시 surface-soft로 한 톤.

### Buttons
- **Primary** (`{component.button-primary}`): 잉크 블랙 면(`{colors.ink}`) + 캔버스색 텍스트, `{rounded.sm}`. 호버 시 charcoal.
- **Secondary**: 투명 배경 + 1px 라인 테두리 + 잉크 텍스트. 호버 시 surface-soft.
- **Ghost**: 텍스트만, 밑줄 호버, 잉크 텍스트.

### Cards & Containers
`{colors.surface-card}` 순백 배경 + `{colors.line}` 1px 테두리 + `{rounded.none}`. 작품 매트처럼 단정. KPI 카드는 큰 숫자(`{typography.number}`, 잉크) + 아래 해석 한 줄(muted).

### Inputs & Forms
canvas 배경 + 라인 테두리. 포커스 시 라인-strong 테두리(색 강조 없이 농도로). `{rounded.sm}`. 잉크 텍스트.

### Signature Components
- **Matte Frame** (`{component.matte-frame}`): 작품/이미지/KPI를 넉넉한 흰 여백 안에 직각으로 놓는 시그니처. 프린트베이커리의 얼굴 — "흰 벽 위 한 점".
- **KPI Row** (`{component.kpi-row}`): 캔버스 위 3–4 KPI를 라인으로만 구획해 가로 배열. 큰 잉크 숫자 + muted uppercase 라벨 + 해석 한 줄. 강조색 없이 크기·여백으로 도드라지게.
- **Ink Band** (`{component.ink-band}`): `{colors.ink-panel}` 반전 밴드 — 표지·핵심 헤드라인·슬로건("일상의 예술을 맛보다")에. 위에 캔버스색 세리프.

### Footer
`{colors.surface-soft}` 배경 + 블랙 워드마크 + 주소(서울 중구 장충단로 166)·연락처 + 상단 1px 라인. muted 텍스트. @print_bakery.

## Do's and Don'ts

### Do
- 캔버스는 웜 화이트로 — 갤러리 흰 벽.
- 색은 작품 이미지에 맡기고, 브랜드 UI는 무채로 비우기.
- 위계는 잉크 농도 + 헤어라인 + 여백으로.
- 제목·작품명은 세리프, 본문·숫자는 산세리프로 역할 분리.
- KPI 숫자는 크게·잉크 블랙으로 — 크기가 강조다.
- 여백을 과감하게 — 의심되면 더 비우기.

### Don't
- 다크 배경 쓰지 않기 — 화이트 갤러리가 프린트베이커리.
- **새 강조색(브랜드 컬러) 만들지 않기** — 무채 + 신호색(데이터 전용)만.
- 그라데이션·드롭섀도 쓰지 않기 — 라인과 여백으로 대체.
- 둥근 모서리(8px+) 쓰지 않기 — 액자 직각이 기본.
- 요소를 빽빽이 채우지 않기 — 여백이 디자인.
- 세리프를 본문 전체에 쓰지 않기 — 제목 전용.

## Responsive Behavior

### Breakpoints
| 이름 | 폭 |
|------|----|
| Mobile | < 640px |
| Tablet | 640–1024px |
| Desktop | > 1024px |

### Touch Targets
버튼·링크 최소 44×44px.

### Collapsing Strategy
KPI 3–4열 → 모바일 1–2열. 표는 가로 스크롤 또는 카드형 전환. 작품 그리드 3열 → 모바일 1열(매트 여백 유지).

### Image Behavior
작품·차트는 비율 유지, 매트 여백 두고 축소. 모바일에서도 흰 여백을 지나치게 줄이지 않는다(갤러리 톤 유지).

## Iteration Guide
1. 새 산출물은 캔버스(웜 화이트) + 잉크 블랙 본문에서 시작.
2. 강조가 필요하면 색이 아니라 크기·굵기·여백으로 먼저 푼다.
3. 구획은 1px 라인 또는 잉크 밴드(반전).
4. 표지·슬로건엔 Ink Band(반전).
5. 숫자(KPI)는 크게·tabular-nums·잉크 블랙.
6. 그림자 대신 헤어라인 + 여백으로 깊이.
7. 이미지·작품은 흰 매트 안 직각 프레임으로.
8. 색을 하나 추가하고 싶으면 멈추고 여백·무게·크기로 먼저 해결한다 — 색은 작품의 몫.

## Known Gaps
- **정확한 브랜드 Hex 미확인**: 공개 브랜드 가이드라인 없음. 자사몰·인스타·매장에서 "화이트 베이스 + 블랙 로고 + 무채 갤러리 톤"까지 확인, CSS/로고 이미지 직접 파싱은 미수행. 위 잉크/캔버스 값은 "웜 화이트 갤러리"의 **시각 근사값** — printbakery.com 개발자 도구(F12)로 CSS 직접 확인 후 보정 권장.
- **공식 서체명 미확인**: 시스템/오픈소스 대체 스택(Nanum Myeongjo / Pretendard) 사용. 실제 세리프·산세리프 서체와 다를 수 있음.
- **로고 형태/마크 미확인**: 워드마크는 블랙 텍스트 기반으로 추정. 실제 로고 파일 별도 확보 필요.
- 모션/인터랙션 가이드 미스코프(정적 산출물 우선).
