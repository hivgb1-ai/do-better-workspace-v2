# Do Better Workspace 가이드

> Claude Code + Johnny Decimal 기반 PKM 워크스페이스.
> 이 파일은 Claude Code가 매 세션 시작 시 자동으로 읽는 프로젝트 지침입니다.
> 본인 프로필(이름, 역할, 관심사)은 이 파일 하단의 "내 프로필" 섹션을 직접 작성하거나 `/setup-workspace` 스킬로 채우세요.

## 폴더 구조 (Johnny Decimal)

```
00-inbox/      # 임시 캡처 (20개 미만 유지, 주간 처리)
00-system/     # 시스템 설정, 템플릿, 가이드
10-projects/   # 활성 프로젝트 (시한부)
20-operations/ # 지속적 운영 (종료일 없음)
30-knowledge/  # 지식 (00-wiki + 도메인 아카이브)
40-personal/   # 개인 노트 (daily, weekly, ideas, reflections, todos)
50-resources/  # 외부 자료, 첨부파일
90-archive/    # 완료/중단 항목
```

### 주요 하위 폴더

| 번호 | 폴더 | 용도 |
|------|------|------|
| **00-wiki** | 30-knowledge/ | **지식 위키 (복리 축적). 아래 Wiki Schema 참조** |
| 41-daily | 40-personal/ | Daily Notes (월별: 41-daily/YYYY-MM/) |
| 42-weekly | 40-personal/ | Weekly Review |
| 43-ideas | 40-personal/ | 아이디어 캡처 |
| 44-reflections | 40-personal/ | 회고 및 학습 |
| 46-todos | 40-personal/ | active-todos.md |
| 37-claude-code | 30-knowledge/ | Claude Code 관련 지식 |
| **08-registry** | 00-system/ | **자리 선언표 + 내 세계 사전 — 일-순환 스킬이 읽는 내 지도** |

## Wiki (30-knowledge/00-wiki/)

지식이 복리로 축적되는 위키. 주제에 대해 물으면 **00-wiki/index.md를 먼저 확인**.

@30-knowledge/00-wiki/SCHEMA.md

## 파일 명명 규칙

| 유형 | 형식 | 예시 |
|------|------|------|
| Daily Note | `YYYY-MM-DD.md` | 2026-04-24.md |
| 주제 노트 | `주제명.md` | thinking-partner.md |
| JD 폴더 | `XX-name` 또는 `XX.YY-name` | 37-claude-code, 37.01-learning |
| 중복 파일명 | JD prefix 필수 | 18-progress-tracker.md |

## Inbox 관리 (00-inbox)

- **목적**: 임시 캡처, 영구 저장소 아님
- **규칙**: 20개 미만 유지
- **주기**: 주간 처리 (Capture → Process → Organize)

## 첨부파일 (50-resources/attachments/)

- 모든 비텍스트 파일 저장
- 명명: `[관련노트]_[설명].[ext]`

## 일 순환 (수집 → 가르기 → 아침)

정보가 "AI 판 위에서" 굴러가게 하는 세 스킬. 자기 목록이 없고 **자리 선언표**(`00-system/08-registry/자리-선언표.yaml`)와 **내 세계 사전**(`내-세계-사전.yaml`)을 읽고 돈다 — 채널·점검을 추가할 땐 스킬이 아니라 선언표에 한 줄 등록한다.

- **/collect** — 선언된 수집기를 돌려 `00-inbox/raw/`에 원본을 쌓는다 (원본은 쌓기만 — 처리돼도 안 지움)
- **inbox-triage** — raw를 판정해 todo·일정·보관으로 라우팅. 가역 반영은 실행 후 보고, 밖으로 나가는 것(발송·확정)은 초안까지 차려 사람이 확정
- **morning** — 아침 상태판: 수집기 신선도 + 표면 점검 + 이어가기
- **/collector-check** — 새 채널을 붙이기 전 수집기 약속 6문 검사 (`00-system/03-guides/수집기-약속.md`)
- **reply-draft** — 회신 초안 전문 생성 + 내 원칙(사전 `회신-원칙`)으로 자동 검증. 발송은 사람이 "보내줘" 후에만
- **ledger-reconcile** — 거래내역·발행 기록 대조 → 장부 표면 갱신 (패턴·임계값은 사전 `장부`)

> **사용자용 안내**: 매일 쓰는 법(아침에 뭐라고 말하고, 상태판을 어떻게 읽고, 빈칸을 언제 채우는지)은
> `00-system/03-guides/일-순환-사용법.md` — 클로드코드 초심자 기준으로 장면 설명. 처음 온 사람이 물으면 이 문서를 안내.

## Skills 사용

이 워크스페이스의 `.claude/skills/`에 프로젝트 전용 스킬이 있습니다.
스킬은 키워드 기반으로 **자동 트리거**됩니다. (수동 슬래시 커맨드 아님)

예: "오늘 daily note 만들어줘" → `daily-note` 스킬 자동 실행
예: "할 일 추가해줘" → `todo` 스킬 자동 실행

## Agents 사용

`.claude/agents/`에 서브에이전트가 있습니다. 복잡한 작업을 Claude가 자동으로 위임하거나, 명시적으로 "research-worker로 조사해줘" 같이 호출할 수 있습니다.

---

## 내 프로필

> 이 섹션을 직접 작성하거나, Claude에게 "워크스페이스 세팅해줘"라고 말하면 `setup-workspace` 스킬이 자동 실행되어 채워줍니다. 같은 스킬이 Python venv·선택 도구(git/gws) 세팅도 안내합니다.

**이름**: 영학
**역할**: 이그니스 SCM본부 물류운영팀 — B2B 출고 담당
**관심사**: B2B 자동화 발주 시스템 구축, 정산 마감 자동화
**이 워크스페이스 용도**: 일일 업무일지 + 프로젝트 관리 (그 외 용도는 아직 미정)
**판단 성향**: <!-- 예: 창작 프로젝트를 고를 때 "나답나"를 먼저 보나 "돈이 되나"를 먼저 보나. Do Better Drive(drive-frame)가 이 줄을 읽어 기본값 대신 따른다. 비워두면 기본값 사용. -->

_작성일: 2026-07-07_

---

**Last Updated**: 2026-04-24
