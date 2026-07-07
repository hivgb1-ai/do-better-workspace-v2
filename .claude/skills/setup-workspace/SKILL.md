---
name: setup-workspace
description: 첫 clone 후 워크스페이스 초기 설정. CLAUDE.md 프로필 작성 + Python venv 세팅 + 선택 도구(gws/git) 안내 + 첫 daily note 생성까지 한번에 진행. "워크스페이스 세팅", "초기 설정", "setup", "setup-workspace" 등을 언급하면 자동 실행.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
---

# setup-workspace

Do Better Workspace를 처음 clone한 사용자를 위한 초기 설정 스킬.
핵심 단계: **루트 확인 → 프로필 → Python 환경 → 선택 도구 → 폰·수집 채널 확인 → 자리 선언표 → 첫 Daily Note**.

## 수행 작업

### 1. 워크스페이스 루트 + 시드 무결성 확인

**1-1. 루트 여부**:

```bash
test -f CLAUDE.md && test -d 40-personal && test -d 30-knowledge/00-wiki \
  || { echo "ERROR: 워크스페이스 루트에서 실행하세요 (CLAUDE.md·40-personal·30-knowledge 없음)"; exit 1; }
```

루트가 아니면 종료.

**1-2. 시드 파일/폴더 무결성**:

각 스킬이 실제로 참조하는 시드가 살아있는지 일괄 체크. 누락된 건 경고로만 출력하고 자동 복원은 하지 않음 (clone이 불완전했거나 사용자가 실수로 지운 경우 빨리 감지).

```bash
echo "=== 시드 무결성 체크 ==="
missing=()

# 템플릿 (daily-note, weekly-synthesis, ripple이 읽음)
test -f 00-system/01-templates/daily-note-template.md   || missing+=("00-system/01-templates/daily-note-template.md")
test -f 00-system/01-templates/weekly-review-template.md || missing+=("00-system/01-templates/weekly-review-template.md")
test -f 00-system/01-templates/progress-template.md     || missing+=("00-system/01-templates/progress-template.md")

# Personal 디렉토리 (daily/weekly/idea 스킬 저장 경로)
test -d 40-personal/41-daily    || missing+=("40-personal/41-daily/")
test -d 40-personal/42-weekly   || missing+=("40-personal/42-weekly/")
test -d 40-personal/43-ideas    || missing+=("40-personal/43-ideas/")
test -d 40-personal/46-todos    || missing+=("40-personal/46-todos/")

# Todo 시드 (todo/todos 스킬 타깃)
test -f 40-personal/46-todos/active-todos.md || missing+=("40-personal/46-todos/active-todos.md")

# raw 인박스 (수집기 → inbox-triage 분류 경로)
test -d 00-inbox/raw || missing+=("00-inbox/raw/")

# 자리 선언표·내 세계 사전 (morning·collect·inbox-triage가 읽는 개인 층)
test -f 00-system/08-registry/자리-선언표.yaml   || missing+=("00-system/08-registry/자리-선언표.yaml")
test -f 00-system/08-registry/내-세계-사전.yaml  || missing+=("00-system/08-registry/내-세계-사전.yaml")

# Wiki 시드 (wiki-ingest, wiki-lint가 읽고 씀)
test -f 30-knowledge/00-wiki/SCHEMA.md || missing+=("30-knowledge/00-wiki/SCHEMA.md")
test -f 30-knowledge/00-wiki/index.md  || missing+=("30-knowledge/00-wiki/index.md")
test -f 30-knowledge/00-wiki/log.md    || missing+=("30-knowledge/00-wiki/log.md")

if [ ${#missing[@]} -eq 0 ]; then
  echo "✓ 모든 시드 파일 정상"
else
  echo "⚠️  누락된 시드 (${#missing[@]}개):"
  printf '  - %s\n' "${missing[@]}"
  echo ""
  echo "이 상태로 진행 가능하나, 관련 스킬 실행 시 에러가 날 수 있습니다."
  echo "clone 상태를 확인하거나 원본 레포에서 누락된 파일을 가져오세요."
fi
```

누락이 있으면 사용자에게 "이대로 진행할까요? (y/N)" 확인. N이면 종료.

### 2. 대화형 프로필 질문

순서대로 하나씩 물어본다. 한 번에 하나씩 (일괄 질문 금지).

먼저 **CLAUDE.md의 "내 프로필" 섹션이 이미 채워져 있는지** 확인:
- 비어있으면 → 아래 질문 진행
- 이미 채워져 있으면 → "프로필이 이미 있어요. 다시 채울까요? (y/N)" → N이면 이 단계 스킵

질문 목록:
1. **이름 또는 호칭** — "어떻게 불러드릴까요?"
2. **역할/직업** — "현재 어떤 일을 하고 계세요? (ex: 카페 사장, 마케터, 프리랜서 디자이너)"
3. **주요 관심사** — "요즘 가장 집중하고 있는 것 2~3개만 알려주세요"
4. **이 워크스페이스 용도** — "이 워크스페이스를 어떻게 쓰고 싶으세요? (ex: 일일 기록, 프로젝트 관리, 학습 정리)"

답변은 변수로 저장 (`USER_NAME`, `USER_ROLE`, `USER_INTERESTS`, `USER_PURPOSE`).

### 3. CLAUDE.md 업데이트

`CLAUDE.md` 하단의 "내 프로필" 섹션만 `Edit` 도구로 부분 수정. 덮어쓰기 금지.

기존 → 업데이트:
```markdown
## 내 프로필

**이름**: {USER_NAME}
**역할**: {USER_ROLE}
**관심사**: {USER_INTERESTS}
**이 워크스페이스 용도**: {USER_PURPOSE}

_작성일: YYYY-MM-DD_
```

### 4. Python 환경 세팅 (신규)

**왜 필요한가**: `csv-clean`, `excel-to-csv`, `pdf-to-md` 세 스킬이 Python 스크립트를 사용함. 나중에 갑자기 에러 나는 것보다 처음에 한 번에 세팅하는 게 편하다.

**4-1. Python 설치 확인**:

```bash
if command -v python3 &> /dev/null; then
  echo "Python: $(python3 --version)"
else
  echo "ERROR: python3 미설치. Mac은 'brew install python', Ubuntu는 'sudo apt install python3 python3-venv'"
fi
```

없으면 설치 안내 후 이 단계 스킵.

**4-2. venv 세팅 제안**:

```
데이터 처리 스킬(csv-clean, excel-to-csv, pdf-to-md)을 쓰려면 Python 패키지 3개가 필요합니다.
워크스페이스 전용 가상환경(.venv)을 지금 만들까요? (Y/n)
```

Yes (기본)면:

```bash
# 이미 .venv 있으면 스킵
if [ ! -d .venv ]; then
  python3 -m venv .venv
fi

source .venv/bin/activate
pip install --upgrade pip --quiet
pip install "pandas>=2.0.0" "openpyxl>=3.1.0" "pymupdf4llm>=0.0.17"
```

설치 완료 후 확인:
```bash
source .venv/bin/activate && python -c "import pandas, openpyxl, pymupdf4llm; print('OK: pandas', pandas.__version__, '| openpyxl', openpyxl.__version__, '| pymupdf4llm imported')"
```

**안내 출력**:
```
✓ .venv/ 생성 및 패키지 설치 완료

**사용법**: 새 터미널을 열 때마다 가상환경 활성화:
  source .venv/bin/activate

Claude Code가 Python 스크립트를 호출할 때 자동으로 이 venv를 쓰려면 매 세션 시작 시
위 명령을 한 번 실행하거나, 셸 시작 시 자동 활성화 스크립트를 설정하세요.
```

No면 "나중에 필요할 때 다시 이 스킬을 호출하거나 직접 `pip install`로 설치하세요" 안내 후 다음 단계.

### 5. 선택 도구 안내 (설치 강제 X)

**어떤 도구가 어떤 스킬을 풀어주는지** 한번에 체크하고 보여준다:

```bash
echo "=== 선택 도구 상태 ==="
command -v git &>/dev/null && echo "✓ git: $(git --version)" || echo "✗ git: 미설치 (daily-review, weekly-synthesis 동작 제한)"
command -v gws &>/dev/null && echo "✓ gws: $(gws --version 2>&1 | head -1)" || echo "✗ gws: 미설치 (daily-note의 Google Calendar 연동 스킵)"
if [ "$(uname)" = "Darwin" ]; then
  command -v sqlcipher &>/dev/null && echo "✓ sqlcipher: $(sqlcipher --version 2>&1 | head -1)" \
    || echo "✗ sqlcipher: 미설치 (kakao-read 카톡 읽기 비활성 — brew install sqlcipher)"
else
  echo "ℹ️  kakao-read: macOS 전용 — 현재 OS($(uname))에선 비활성 (다른 스킬엔 영향 없음)"
fi
```

출력 후 설명:

```markdown
**git**: 현재 워크스페이스가 git repo면 daily-review / weekly-synthesis가 변경사항을 분석해줍니다.
  - 세팅: `git init` 후 첫 커밋

**gws (Google Workspace CLI)**: daily-note가 오늘의 Google Calendar 일정을 자동으로 가져와줍니다.
  - 설치: `npm install -g gws-cli` (교육 과정에서 별도 안내)
  - 인증: `gws auth login` (브라우저 OAuth)
  - 없어도 daily-note는 정상 동작하며 일정 섹션만 비어있음

**sqlcipher (macOS 전용)**: kakao-read가 Mac 카카오톡 로컬 DB를 읽습니다.
  - 설치: `brew install sqlcipher`
  - 최초 1회: `python3 .claude/skills/kakao-read/scripts/kakao_read.py setup` (본인 userId 캐시)
  - 카카오톡 데스크톱 앱에 한 번 이상 로그인돼 있어야 함
  - macOS 전용 — Windows/Linux에선 자동 비활성, 다른 스킬엔 영향 없음
```

설치까지 자동으로 하지 않음. 사용자가 필요성 판단 후 진행.

### 6. 폰·컴퓨터 환경 확인 → 수집 채널 매트릭스

붙일 수 있는 수집기는 **폰 OS × 컴퓨터 OS 조합**(문자)과 **메일 제공자**에 따라 달라진다. 컴퓨터 OS는 §5에서 이미 `uname`으로 감지했다. 여기서는 **폰 OS와 주 메일 제공자를 묻고**, 그에 맞는 자동 수집 채널을 안내한다. 설치·연동까지 하지 않는다 — 어떤 채널이 되는지 알려주고, 실제 연동은 캠프(사람 진행)에서 함께.

**6-1. 질문** (하나씩 — 일괄 금지):

```
1) 주로 쓰는 폰이 안드로이드인가요, 아이폰인가요?
2) 주로 쓰는 메일이 어디인가요? (Gmail / 네이버 / 다음 / 회사 메일(아웃룩·MS365) / 기타)
```

답을 `PHONE_OS`(android/iphone), `MAIL_PROVIDER`로 저장. 컴퓨터 OS는 `uname`값(Darwin=Mac / 그 외=윈도우·리눅스).

**6-2. 채널 안내** (감지된 컴퓨터 OS + 답변한 폰 OS·메일 제공자로 아래를 출력):

- **카톡 — 폰 OS 무관, 컴퓨터 OS만 본다 (한국 사용자의 가장 든든한 자동 채널)**
  - Mac: kakao-read가 로컬 카톡 DB를 직독 (§5의 sqlcipher 세팅). ✅ 자동 채널.
  - 윈도우: kakao-read가 실행 중 카톡 메모리를 직독 (procdump 필요). ✅ 자동 채널.
  - 전제: 데스크톱 카톡에 한 번 이상 로그인돼 있어야 함.
- **문자 — 폰×컴퓨터 조합에 종속**
  - 안드로이드 (Mac·윈도우 공통): telegram-sms 앱으로 수신 문자를 텔레그램에 자동 전달 → 컴퓨터에서 읽음. ✅ 자동 (설정 가이드는 캠프에서).
  - 아이폰 + Mac: 아이폰 문자를 Mac 메시지 앱에 동기화 → Mac에서 chat.db 직독. 원리는 성립하나 🟡 **완성 수집기는 킷 로드맵**(아직 미보유). 당장은 손 수집.
  - 아이폰 + 윈도우: iOS 단축어로 받은 문자를 텔레그램에 보내 컴퓨터에서 읽는 경로가 있음 🟡(알림 배너·신뢰도 제약). 이 역시 킷 로드맵. 당장은 손 수집.
- **메일 — 두 경로. 데스크톱 메일 앱 하나로 모으는 게 범용 답**
  - 범용(권장): Apple Mail(Mac) 또는 Thunderbird(Mac·윈도우)에 메일 계정을 다 추가하면 제공자 무관하게 로컬로 수렴 → 킷이 로컬 저장소를 직독. **회사 MS365도 이 경로로 됨**(Thunderbird v145부터 M365 네이티브, 회사 관리자 승인 불필요). 카톡·문자와 같은 "로컬 직독" 계열 — **완성 수집기는 킷 로드맵**, 당장은 손 붙여넣기.
  - 제공자별 클라우드 경로(이미 IMAP 쓰는 사람): 개인 Gmail은 email-oauth2-proxy로 쉬움 / 네이버·다음은 IMAP 켜고 **앱 비밀번호** 발급이 유일한 길(API·자동전달 봉쇄) / 회사 MS365 클라우드 직결은 관리자 승인 필요.
  - 연동 전이면 어느 제공자든 손 붙여넣기로 시작.
- **통화 전사 — 모든 조합에서 자동 전달 경로 없음.** 중요한 통화만 수동 공유(손 수집).

**6-3. 최소 성립 판정 한 줄**:

**자동 채널이 최소 1개 확보되는지** 확인해 알려준다. 가장 든든한 바닥은 **카톡**이다(컴퓨터 OS 기준 Mac·윈도우 둘 다 자동, 데스크톱 카톡 로그인 전제). 메일은 제공자에 따라 자동이 될 수도(개인 Gmail·앱 비밀번호 낸 네이버·다음) 어려울 수도(회사 MS365) 있으니 바닥으로 기대지 않는다.
- 카톡 자동 확보 시: "이 조합은 자동 채널 ✅ — 시스템이 성립합니다. 문자·메일은 위 안내대로 조합·제공자에 맞게 붙이면 됩니다."
- 카톡도 메일도 자동이 아니면: "자동 채널부터 하나 세워야 감시가 됩니다 — 카톡(가장 쉬움) 또는 메일 앱 비밀번호부터. 손 수집만으로는 '멈춤'과 '없음'을 구분할 수 없어 시스템이 살아있는지 볼 수 없습니다."

> 왜 자동 채널 1개가 최소 조건인지, 조합·제공자별 성립 근거는 `00-system/03-guides/수집기-약속.md`. 새 수집기를 붙일 땐 `/collector-check`로 검사표 6문을 통과시킨다.

### 7. 자리 선언표 안내 (일-순환 스킬의 지도)

morning(아침 상태판)·collect(수집 러너)·inbox-triage(가르기)는 자기 목록 없이 **자리 선언표**(`00-system/08-registry/자리-선언표.yaml`)와 **내 세계 사전**(`내-세계-사전.yaml`)을 읽고 돈다. 여기서는 안내만 한다:

- **기본값**(할일·일기·위키·원본함)은 이 골격 그대로면 손댈 것 없음 — 바로 동작한다.
- **[빈칸]은 지금 다 채우지 않는다.** 세팅은 질문지가 아니라 **실물에 잣대 대기** — 내 업무의 중심 표·내 채널·"항상 패스" 목록은 실물(카톡방·엑셀·메일함)을 열어 놓고 하나씩 채운다. 쓰다가 교정이 생길 때마다 사전에 한 줄씩 쌓인다 (그게 정상 속도).
- **최소 성립 조건**은 §6에서 이미 판정했다 — 자동 채널 1개(카톡 또는 메일). 선언표의 수집기 절은 그 채널을 등록하는 자리다.
- 새 수집기를 붙일 땐 `/collector-check`로 검사표 6문을 통과시킨다 (기준: `00-system/03-guides/수집기-약속.md`).

### 8. 첫 Daily Note 생성 제안

"오늘의 첫 Daily Note를 만들까요? (Y/n)"
Yes면 `daily-note` 스킬 호출.

### 9. 다음 단계 안내

```
워크스페이스 세팅 완료!

다음에 해볼 것:
1. "morning" → 아침 상태판 (수집기 신선도 + 표면 점검 + 이어가기)
2. "오늘 daily note 만들어줘" → 매일의 기록 시작
3. "할 일 추가해줘: XXX" → 첫 todo 추가
4. "카톡 체크" (Mac) → 첫 수집 → "인박스 분류해줘" → 가르기 한 바퀴
5. "같이 생각해보자: XXX" → thinking-partner로 문제 탐색

폴더 구조 힌트:
- 00-inbox/ : 생각나는 즉시 캡처
- 10-projects/ : 시한부 프로젝트
- 20-operations/ : 지속적 운영
- 30-knowledge/00-wiki/ : 지식 복리 축적
- 40-personal/ : Daily/Weekly/Ideas/Todos

Python 스킬 사용 시: source .venv/bin/activate 먼저 실행

자세한 건 README.md 참고!
```

## 원칙

- **일괄 질문 금지**. 하나씩 물어야 인지 부담 낮음.
- **답변은 짧게 유도**. 긴 자기소개 요구하지 말 것.
- **CLAUDE.md 덮어쓰기 금지**. "내 프로필" 섹션만 `Edit` 도구로 부분 수정.
- **이미 채워져 있으면** 덮어쓰기 전 사용자에게 확인.
- **Python 환경은 권장, 강제 X**. 데이터 스킬 안 쓸 사람도 있음.
- **선택 도구(git/gws)는 상태만 체크**. 자동 설치·인증은 안 함 (교육 과정에서 별도 안내되는 영역).
- **재실행 안전**. 이미 세팅된 항목은 스킵.
