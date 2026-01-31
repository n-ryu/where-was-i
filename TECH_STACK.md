# 기술 스택

## 개발 환경

| 항목 | 기술 | 비고 |
|------|------|------|
| Node.js | 22 LTS | .nvmrc로 버전 관리 |
| 패키지 매니저 | pnpm | 빠른 설치, 디스크 효율적 |
| Git 훅 | husky + lint-staged | 커밋 전 린트/포맷/타입체크 |
| 에디터 설정 | .editorconfig | 에디터 공통 설정 |

## 프론트엔드

| 항목 | 기술 | 비고 |
|------|------|------|
| 언어 | TypeScript | 타입 안정성, IDE 지원 |
| 프레임워크 | React | 넓은 생태계, PWA 지원 우수 |
| 빌드 도구 | Vite | 빠른 HMR, 간결한 설정 |
| 스타일링 | styled-components | CSS-in-JS, 동적 스타일링 |
| 상태 관리 | Jotai | 원자적 상태 관리, React 친화적 |
| 라우팅 | TanStack Router | 타입 안전성 강조 |

## 데이터

| 항목 | 기술 | 비고 |
|------|------|------|
| 저장소 | IndexedDB | 브라우저 로컬 저장소 |
| 래퍼 | Dexie.js | 간결한 API, TypeScript 지원 우수 |

## PWA

| 항목 | 기술 | 비고 |
|------|------|------|
| 플러그인 | vite-plugin-pwa | Service Worker 자동 생성 |

## 개발 도구

| 항목 | 기술 | 비고 |
|------|------|------|
| 테스트 | Vitest | Vite 네이티브, 빠른 실행 |
| 린팅 | ESLint | 코드 품질 검사 |
| 포맷팅 | Prettier | 코드 스타일 통일 |

## 주요 패키지 (예정)

```
react
react-dom
typescript
vite
styled-components
jotai
@tanstack/react-router
dexie
vite-plugin-pwa

# 개발 의존성
vitest
@testing-library/react
eslint
prettier
husky
lint-staged
```
