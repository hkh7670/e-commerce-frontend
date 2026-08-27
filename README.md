# e-commerce-frontend

쿠팡 스타일 이커머스 데모 프론트엔드. [`spring-boot-kotlin-practice`](https://github.com/hkh7670/spring-boot-kotlin-practice)
백엔드와 연동되는 React + Vite + TypeScript 프로젝트로, 핵심 쇼핑 플로우(홈 / 상품목록·검색 / 상품상세 /
장바구니 / 주문·결제 / 주문내역·취소·반품 / 로그인(이메일+OAuth))를 구현합니다.

## 기술 스택

- React 19 + Vite + TypeScript
- react-router-dom (라우팅) · axios (API 클라이언트) · zustand (상태 관리)
- 디자인: 별도 컴포넌트 라이브러리 없이 `src/index.css` 하나에 CSS 커스텀 프로퍼티 토큰 + 클래스 기반
  디자인 시스템 (쿠팡 스타일: 딥네이비 헤더 + 레드 액센트)

## 시작하기

`mise.toml`이 `node = 24`를 고정합니다.

```bash
mise exec -- npm install
mise exec -- npm run dev          # 로컬 백엔드(localhost:16000)와 연동
mise exec -- npm run dev:remote   # 배포된 dev 백엔드와 연동
mise exec -- npm run build        # tsc -b && vite build
```

## 환경변수

Vite mode 기반으로 local/dev 두 환경만 분리합니다. `.env.local.example` / `.env.dev.example`을 복사해
각각 `.env.local` / `.env.dev`로 만든 뒤 값을 채워주세요(두 파일 모두 gitignore 대상).

- `VITE_API_BASE_URL`: 백엔드 API base URL
- `VITE_TOSS_CLIENT_KEY`: Toss 결제위젯 테스트 클라이언트 키

## 관련 프로젝트

- [`spring-boot-kotlin-practice`](https://github.com/hkh7670/spring-boot-kotlin-practice): 백엔드
  (Kotlin + Spring Boot)

프로젝트 구조와 컨벤션에 대한 자세한 내용은 [`CLAUDE.md`](./CLAUDE.md)를 참고하세요.
