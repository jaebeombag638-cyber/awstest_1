# 영양제 추천 웹서비스

건강 설문 5문항을 작성하면 GPT-4o가 맞춤 영양제를 추천하고, 약국 제품 vs 온라인 제품을 비교한 뒤 최종 추천까지 해주는 한국어 웹 앱. **비상업용 연습 프로젝트.**

## 서비스 플로우

```
건강 설문 (5문항) → AI 영양제 카테고리 추천 (3~4개)
→ 약국 제품 vs 온라인 제품 비교 → AI 최종 추천 + 약국 지도 / 쿠팡 링크
```

## 기술 스택

| | |
|---|---|
| 프레임워크 | Next.js 16.2.9 (App Router, TypeScript) |
| 스타일 | Tailwind CSS v4 |
| AI | OpenAI GPT-4o |
| 지도 | Kakao Maps JS SDK + Kakao Local REST API |

## 실행 방법

```bash
# 1. 환경변수 설정
cp .env.local.example .env.local
# OPENAI_API_KEY, KAKAO_REST_API_KEY, NEXT_PUBLIC_KAKAO_MAP_KEY 입력

# 2. 의존성 설치 및 개발 서버 실행
npm install
npm run dev
# → http://localhost:3000
```

## 주요 한계

- 리뷰 및 제품 정보가 하드코딩된 가상 데이터 (실시간 DB 없음)
- AI 추천은 설문 기반이며 의학적 조언을 대체하지 않음
- 현재 로컬(`localhost:3000`) 전용, 미배포 상태

---

*자세한 내용은 [awstest1.md](awstest1.md) 참고*
