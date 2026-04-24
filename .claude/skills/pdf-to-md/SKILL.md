---
name: pdf-to-md
description: PDF 파일을 구조화된 Markdown으로 변환. "PDF 변환", "PDF를 마크다운으로", "PDF 텍스트 추출", "문서 변환" 등을 언급하면 자동 실행.
allowed-tools:
  - Read
  - Write
---

# PDF to Markdown 변환

## 목적

PDF 파일을 깔끔한 Markdown으로 변환하여 워크스페이스에서 검색/참조 가능하게 만든다.

## 프로세스

### 1. 정보 수집

사용자에게 요청:
- **PDF 파일 경로** (절대 경로 또는 상대 경로)
- (선택) 저장할 위치 힌트 (예: "30-knowledge에 저장", "특정 프로젝트 폴더에 저장")

### 2. PDF 읽기 및 변환

Read 도구로 PDF 내용 분석:
- 텍스트: 그대로 추출
- 이미지: 텍스트 설명으로 전환 (시각 정보가 본질이면 명시)
- 표: Markdown 표 형식
- 차트: 데이터 요약

큰 PDF(10페이지 이상)는 `pages: "1-5"` 같이 범위 지정 권장.

### 3. 변환 형식

```markdown
---
source: [원본 PDF 파일명]
converted: YYYY-MM-DD
tags: [pdf, converted]
---

# [문서 제목]

## 문서 정보
- 원본: [PDF 파일명]
- 변환일: YYYY-MM-DD
- 총 페이지: N

## 내용

[PDF 내용을 구조화된 Markdown으로]
```

### 4. 저장 위치 결정

우선순위:
1. 사용자가 지정한 위치
2. 주제 기반 자동 추천:
   - 프로젝트 관련 → `./10-projects/[해당 프로젝트]/`
   - 지식/레퍼런스 → `./30-knowledge/` 또는 `./50-resources/`
   - 명확하지 않음 → `./00-inbox/` (사용자가 나중에 분류)

파일명: `{원본명}_converted.md` (공백 → 언더스코어)

### 5. 결과 보고

```
PDF 변환 완료
   원본: /path/to/report.pdf (N 페이지)
   저장: ./30-knowledge/report_converted.md
   크기: 원본 X KB → Markdown Y KB
```

## 참고

- 원본 PDF가 스캔 이미지 기반이면 OCR 필요 — "이 PDF는 이미지 기반이라 OCR 필요해 보입니다" 안내 후 종료
- 복잡한 레이아웃(다단, 각주)은 선형화 과정에서 일부 손실 가능 — 변환 후 사용자 검토 권장
