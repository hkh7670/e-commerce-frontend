# e-commerce-frontend

쿠팡 스타일 이커머스 데모 프론트엔드. `spring-boot-kotlin-practice` 백엔드와 연동되는 React + Vite +
TypeScript 프로젝트로, 핵심 쇼핑 플로우(홈 / 상품목록·검색 / 상품상세 / 장바구니 / 주문·결제 / 주문내역·
취소·반품 / 로그인(이메일+OAuth))를 구현한다.

## 기술 스택

- React 19 + Vite + TypeScript, react-router-dom(라우팅), axios(API 클라이언트), zustand(상태 관리)
- 디자인: 별도 컴포넌트 라이브러리 없이 `src/index.css` 하나에 CSS 커스텀 프로퍼티 토큰 + 클래스 기반
  디자인 시스템 (쿠팡 스타일: 딥네이비 헤더 + 레드 액센트, 밀도 높은 그리드, 가격 강조)

## 빌드 / 실행

```bash
mise exec -- npm install
mise exec -- npm run dev          # 로컬 백엔드(localhost:16000)
mise exec -- npm run dev:remote   # 배포된 dev 백엔드(hkh7670.iptime.org:8080)
mise exec -- npm run build        # tsc -b && vite build
```

`mise.toml`이 `node = 24` 고정.

## 환경변수

Vite mode 기반으로 local/dev 두 환경만 분리한다:

- `.env.local` — Vite가 mode와 무관하게 항상 자동 로드하는 특수 파일, `npm run dev`(플래그 없음)의 기본값.
  `local`은 명시적 mode 이름으로 쓸 수 없다(Vite가 `.env.local` 파일명과 충돌해 명시적으로 막아둠) — 그래서
  `dev:local` 같은 스크립트는 없고 `npm run dev` 자체가 곧 local이다.
- `.env.dev` — `npm run dev:remote`(`vite --mode dev`)에서만 로드.
- `.env.local.example` / `.env.dev.example` — 커밋되는 템플릿. 실제 `.env.local`/`.env.dev`는 gitignore.
- `VITE_API_BASE_URL`: 백엔드 base URL. `VITE_TOSS_CLIENT_KEY`: Toss 결제위젯 테스트 클라이언트 키(공개
  키라 노출돼도 무방하지만 관례상 env로 분리).

## 패키지 구조

```
src/
  lib/
    http.ts        axios 인스턴스 + JWT 인터셉터(401 시 /api/v1/auth/reissue 자동 재발급 후 원 요청 재시도)
    api.ts         도메인별 API 함수 그룹 (productApi/categoryApi/deliveryOptionApi/orderApi/
                    paymentApi/authApi), CommonResponse 언래핑
  store/
    authStore.ts   zustand + persist — accessToken/refreshToken을 localStorage에 저장
    cartStore.ts   zustand + persist — 장바구니 (서버 API 없음, 아래 "장바구니" 참고)
  components/
    Header.tsx     검색바 + 카테고리 네비 + 로그인상태/장바구니뱃지
    Layout.tsx     라우터 루트 레이아웃 (Header + Outlet + Footer)
    ProductCard.tsx
  pages/           라우트 1:1 대응 — HomePage/ProductListPage/ProductDetailPage/CartPage/CheckoutPage/
                    OrderCompletePage/MyOrdersPage/OrderDetailPage/LoginPage/SignupPage/
                    OAuthCompletePage/OAuthErrorPage
  types.ts         백엔드 CommonResponse/PageResponse 및 도메인 DTO와 1:1 대응하는 TS 타입
  App.tsx          라우터 정의
```

## 공통 컨벤션

- Named export만 사용, default export 금지 (`App.tsx`도 `export function App()`, `main.tsx`가
  `import { App } from './App'`).
- API 응답은 항상 `CommonResponse<T>{resultCode, resultMsg, data}` 봉투 — `lib/api.ts`의 `unwrap()`
  헬퍼로 `data`만 꺼내고 `null`이면 에러로 취급.

## 장바구니 — 서버 API 없음, 클라이언트 전용

백엔드 `POST /api/v1/orders`가 `{deliveryOptionId, items: [{productId, count}]}`를 그대로 받는 구조라
장바구니는 서버에 전혀 존재하지 않는다. `useCartStore`(zustand + localStorage persist)가 유일한 소스다.
체크아웃에서 "결제하기"를 누르는 순간 이 스토어의 아이템들을 `orderApi.create()`로 한 번에 전송해야
비로소 `Order`/`OrderItem`이 DB에 생성된다. 트레이드오프: 기기 간 장바구니 동기화가 안 되고, 재고
체크는 담을 때가 아니라 주문 생성 시점에만 일어난다(백엔드 재고 차감 시점과 동일한 설계).

## 인증 — JWT + OAuth relay code

- 이메일: `authApi.login()`/`signUp()` → `AuthToken{accessToken, refreshToken}`을 `authStore`에 저장.
- OAuth: 버튼은 `${API_BASE_URL}/oauth2/authorization/{google|kakao|naver}`로 페이지 이동(백엔드 Spring
  Security `oauth2Login` 기본 경로) — fetch가 아니라 풀 페이지 네비게이션이어야 한다. Provider 로그인
  완료 후 백엔드가 `/oauth/complete?code=...`(성공) 또는 `/oauth/error?error=...`(실패)로 브라우저를
  리다이렉트한다. `OAuthCompletePage`가 그 `code`를 `authApi.oauthExchange()`로 교환해 `LOGIN`(기존
  회원, JWT 즉시 발급)이면 로그인 처리하고, `NEED_SIGN_UP`(신규 회원)이면 추가정보 입력 폼을 보여준 뒤
  `authApi.oauthSignUp()`으로 가입을 완료한다.
- **로컬 실행 시 주의**: 백엔드 `.env`의 `OAUTH_FRONTEND_SUCCESS_REDIRECT_URI`/`_FAILURE_REDIRECT_URI`가
  이 프론트의 실제 실행 포트(기본 3000, `vite.config.ts`의 `server.port`)를 가리키도록 맞춰져 있어야
  한다 — 안 맞으면 로그인 성공 후 브라우저가 엉뚱한 포트로 리다이렉트돼 "화면이 안 나오는" 것처럼
  보인다. 자세한 내용은 `spring-boot-kotlin-practice/CLAUDE.md`의 인증/인가 섹션 참고.

## 결제 (Toss Payments)

- `CheckoutPage`가 주문 생성(`orderApi.create()`) 후 `window.TossPayments(clientKey).requestPayment()`로
  결제창을 띄운다. `successUrl`/`failUrl`은 반드시 이 프론트의 절대 URL(`/orders/complete`, `/checkout`)
  이어야 한다 — Toss가 결제 완료 후 **브라우저를 GET으로 리다이렉트**시키기 때문에, POST + JWT가 필요한
  백엔드 confirm API를 직접 호출할 수 없다.
- `OrderCompletePage`(`/orders/complete`)가 리다이렉트로 받은 `paymentKey`/`orderId`/`amount` 쿼리
  파라미터를 읽어 `paymentApi.confirm()`으로 백엔드 결제 승인을 마무리하고, 성공 시 장바구니를 비운다.
- Toss SDK는 `index.html`에 `<script src="https://js.tosspayments.com/v1/payment">`로 로드.

## 관련 프로젝트

- `/Users/kyu/workspace/spring-boot-kotlin-practice`: 백엔드(Kotlin + Spring Boot). API 계약 변경 시
  이 프로젝트의 `src/lib/api.ts`/`src/types.ts`도 같이 갱신할 것.
