# Workspace v2 Update Plan

> `do-better-workspace-v2`는 현재 `do-better-workspace` 리포의 업데이트 판. 완성되면 승격.
> 이 문서는 **v2 작업 진행 로그** 용도. 완성 후 삭제 또는 아카이브.

## 현황 (2026-04-24)

### 완료

- [x] 스켈레톤 폴더 구조 (Johnny Decimal 7 카테고리)
- [x] CLAUDE.md (pkm 기반 교육 배포판 버전)
- [x] README.md (Skills 기반 워크플로우 명시)
- [x] 00-wiki 시스템 (SCHEMA, index, log, README 초기화)
- [x] 각 카테고리 README.md 배치
- [x] 기본 템플릿 3종 (daily-note, weekly-review, project)
- [x] 46-todos/active-todos.md 시드
- [x] .claude/{skills,agents}/README.md (빈 상태 + 운영 가이드)
- [x] .gitignore

### 다음 단계 (우선순위 순)

1. **필수 core skills 포팅** ✅ 완료 (2026-04-24)
   - [x] `setup-workspace` (신규 설계)
   - [x] `daily-note` (선이 섹션/PKM_ROOT 제거, gcalcli optional)
   - [x] `daily-review` (프로젝트별 하드코딩 제거, 카테고리 그룹핑)
   - [x] `todo` (Google Tasks 의존성 제거)
   - [x] `todos` (Google Tasks/IMI/GPTers 예시 제거)
   - [x] `thinking-partner` (경미한 범용화)
   - [x] `idea` (33-insights → 43-ideas 경로 조정, wiki 승격 판단 추가)
   - [x] `weekly-synthesis` (경미한 범용화, Mac/Linux 호환성)

2. **확장 skills (워크숍에서 쓰이는 것)** ✅ 완료 (2026-04-24)
   - [x] `csv-clean` (Python 스크립트 포함, 상대 경로 변경)
   - [x] `excel-to-csv` (Python 스크립트 포함, 상대 경로 변경)
   - [x] `dashboard-prd` (references/ 포함, pkm 경로 → 상대 경로)
   - [x] `webapp-prd` (references/ 포함, scope-project 의존성 제거)
   - [x] `transcript-organizer` (templates/ + utils/ 포함, pkm/00-inbox → ./00-inbox)
   - [x] `pdf-to-md` (work-journal 하드코딩 제거, 범용 저장 경로)
   - [x] `wiki-ingest` (pkm/30-knowledge/00-wiki → ./30-knowledge/00-wiki)
   - [x] `wiki-lint` (동일 경로 조정)

3. **Agents 포팅 (범용만)**
   - `research-worker`
   - `analysis-worker`
   - `content-worker`
   - `development-worker`
   - `zettelkasten-linker`

4. **제외 (개인 맥락 강한 것)** — 가져가지 말 것
   - `inbound-reply`, `tax-invoice`, `ax-proposal`, `ax-check`, `ax-solution-architect`
   - `payroll`, `retirement`, `bolta-*`, `vendors-*`
   - `bizdev`, `book-capture` (이림 개인 책 기록)
   - `process-queue`, `slack` (이림 IMI 워크스페이스 의존)
   - `ghost-publish`, `note-publish`, `naver-seo-writer` (이림 채널)
   - `sun-update` (선이 관련)
   - `gmail`, `google-*` (개인 계정 의존)
   - `collect-telegram`, `reply-check` (개인 채널)

5. **포팅 시 조정 필요**
   - 모든 skill에서 경로 하드코딩 제거 (`/Users/rhim/Projects/pkm/` 같은 것)
   - 이림 개인 컨텍스트 언급 제거 (IMI, DBT, 이림 등)
   - 범용 예시로 재작성

6. **최종 단계**
   - git init, 초기 커밋
   - GitHub 리포 생성 (비공개 또는 공개) — 이름 미정 (`do-better-workspace-v2` 또는 다른 것)
   - 동작 테스트 (빈 state에서 setup-workspace → daily-note 플로우)
   - 현 `do-better-workspace` → `do-better-workspace-v1-archive`로 리네임
   - v2 → `do-better-workspace`로 승격
