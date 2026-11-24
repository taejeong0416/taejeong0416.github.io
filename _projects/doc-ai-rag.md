---
order: 4
title: 문서 AI RAG MVP
nav: 문서 AI RAG
summary: 문서를 올리면 OCR로 읽고 종류를 분류한 뒤 내용으로 질문에 답하는 문서 AI 웹 애플리케이션
description: 미래내일 일경험 프로그램에서 오픈소스 OCR과 sLLM을 평가하고 문서 AI RAG MVP를 만든 프로젝트
lede: 오픈소스 OCR과 sLLM 후보를 물류와 은행 문서로 평가해 스택을 고르고, 문서 업로드부터 OCR, 분류, RAG 질의응답까지 동작하는 MVP를 만들었다. 미래내일 일경험 프로그램에서 언커먼랩 과제를 4인 팀으로 8주 동안 수행했고, 나는 모델 평가 실험과 백엔드 성능 개선을 맡았다.
meta:
  - { label: 역할, value: 4인 팀에서 리서치와 백엔드 }
  - { label: 기간, value: 2026.04-05 }
  - { label: 기술, value: "PaddleOCR-VL(vLLM), Ollama와 qwen3, BGE-M3, Qdrant, FastAPI, Next.js 15, langchain-text-splitters", card: "PaddleOCR-VL, qwen3, Qdrant, FastAPI" }
  - { label: 프로그램, value: "미래내일 일경험, 참여 기업 언커먼랩", card: false }
  - { label: 상태, value: MVP 완성 }
links:
  - { label: GitHub, url: "https://github.com/snorlax914/gamja-docs", note: "(MVP)" }
  - { label: GitHub, url: "https://github.com/snorlax914/open-ocr-llm-eval", note: "(모델 평가와 실험)" }
result: 오픈소스 OCR과 sLLM을 실제 문서로 평가해 스택을 고르고 동작하는 문서 AI RAG MVP 완성
---

## 문제

언커먼랩은 서비스 고도화를 위해 도메인 문서를 처리할 오픈소스 OCR과 sLLM이 필요했다. 과제는 후보 모델을 실제 문서로 평가해 스택을 고르고, 그 스택으로 문서를 읽고 분류하고 질문에 답하는 MVP를 8주 안에 만드는 것이었다.

## 접근

팀은 주차별 과제에 따라 후보 조사, 평가, 선정, MVP 개발 순서로 진행했다.

- OCR과 LLM 후보를 조사해 실제 문서로 돌려 봤다. 문서 분류 모델은 은행 문서 40장으로 정확도, p50과 p95 지연, JSON 파싱 성공률을 쟀고, Instruct 모델과 5초 이내 응답은 멘토가 준 조건이었다.
- 청킹 단계에서는 splitter 4종과 overlap 비율을 물류 문서로 비교했다.
- MVP에 올린 문서는 PaddleOCR-VL 텍스트 추출, qwen3 문서 종류 분류, 청킹, BGE-M3 임베딩, Qdrant 저장 순서로 처리된다. 질문이 오면 top-k로 찾은 관련 청크를 바탕으로 qwen3가 SSE 스트리밍으로 답한다.

## 결과

| 분류 모델 | 한국어 프롬프트 정확도 | p50 | p95 |
|---|---|---|---|
| Qwen3-8B | 100% (40/40) | 1.1초 | 2.2초 |
| EXAONE 3.5 7.8B | 75% (30/40) | 3.5초 | 7.2초 |

Ministral-3-8B는 RTX 3060 12GB에서 로딩 중 VRAM이 모자라 테스트하지 못했다. 이 비교로 Qwen3-8B를 골랐고, MVP에는 하드웨어 제한으로 qwen3:4b를 올렸다.
{: .soft}

| Overlap | 토큰 비용 증가 | 표 무결성 |
|---|---|---|
| 0% | 기준 | 0% |
| 10% | +7.3% | 0% |
| 20% | +14.4% | 0% |
| 30% | +22.6% | 0% |

물류 문서 5개를 chunk_size 1500으로 나눈 결과다. overlap을 30%까지 올려도 잘린 표는 복원되지 않고 토큰 비용만 늘었다.
{: .soft}

## 판단과<br>트레이드오프

4주차 과제는 표가 청킹에서 잘렸을 때 overlap이 복원에 도움이 되는지 확인하는 것이었다. 실험해 보니 PaddleOCR-VL은 표를 줄바꿈 없는 HTML `<table>` 한 줄로 내보내서, 문자와 줄 단위로 겹치는 overlap으로는 표 구조를 되살릴 수 없었다. 팀 분석 문서가 권장한 `\n|` separator도 마크다운 파이프 표를 전제한 것이라 결과가 기본 조건과 같았다.

그래서 overlap 비율을 고르지 않고 표 단위 전처리를 제안했다. 분할 전에 `<table>` 블록을 한 청크로 떼어 두고, 큰 표는 `<tr>` 행 단위로 나누면서 첫 행을 헤더로 복제한다. 5주차 회의에서 팀은 HTML 표를 Markdown으로 바꾼 뒤 청킹하는 방향으로 설계를 정했다.

<div class="trade">
  <div><h3>얻은 것</h3><p>토큰만 늘리는 overlap 조정 대신 표를 청크 경계에서 자르지 않는 방향으로 접근했다</p></div>
  <div><h3>포기한 것</h3><p>splitter 설정만으로 끝나지 않아 표 추출과 행 단위 분할 코드를 따로 만들어야 한다</p></div>
</div>

## 내 역할

팀은 4명이고 주차마다 역할을 나눴다. 평가지표 수립과 MVP 백엔드 초기 코드는 다른 팀원이 맡았다.

- 2주차에 분류 모델 후보를 조사하고 평가 스크립트를 작성했다. 정확도와 함께 p50, p95 지연, JSON 파싱 성공률, 5회 반복 일관성을 재게 했고, 이 결과로 분류 모델 선정과 보고서를 맡았다.
- 4주차에 청킹 실험 스크립트를 만들어 splitter 4종과 overlap 8조건을 비교했다. 표가 반드시 잘리는 chunk_size 800 조건은 따로 돌린 뒤 보고서를 썼다.
- 6주차에 백엔드 성능을 개선했다. PDF 페이지 OCR을 순차 처리에서 asyncio 병렬 처리로 바꾸고, vLLM 서버의 GPU 메모리를 고려해 동시 처리를 4페이지로 제한했다. 청크 결과는 업로드 시점에 파일로 저장해 조회할 때마다 다시 청킹하지 않게 했다.
- 2, 3, 5, 6, 7주차 보고서를 작성했다.

구현에는 Claude Code를 활용했다.
{: .soft}

## 한계

MVP 청커는 마크다운 표만 통째로 보존하고 HTML 표는 일반 문단처럼 나누며, 4주차에 제안한 표 단위 전처리는 MVP에 들어가지 않았다. 병렬화 전후의 OCR 처리 시간은 측정해 남기지 않았고, MVP에 올린 qwen3:4b는 분류 JSON에서 필드를 가끔 빠뜨렸다.
