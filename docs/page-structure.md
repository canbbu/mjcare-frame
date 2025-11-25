# 페이지 구조 확장 가이드

## 레이아웃 기본 구성
- `index.html`은 공통 `<head>`, `<header>`, `<footer>`만 포함하고, 본문 섹션은 `data-include` 속성으로 외부 조각을 불러옵니다.
- 공통 UI 조각은 `partials/`, 페이지/섹션 단위 조각은 `sections/` 아래에 둡니다.
- 새 페이지를 만들 때는 `layouts/shell.html` 등 공용 레이아웃이 필요하면 복제하거나, `index.html` 구조를 그대로 복사한 뒤 `data-include` 목록만 변경하세요.

## 새로운 섹션 추가 절차
1. `sections/새섹션.html`에 마크업 작성.
2. 필요한 경우 `partials/`에 재사용 가능한 하위 조각을 나눠 `data-include` 속성으로 삽입.
3. `styles/sections/새섹션.css`를 만들고, 섹션 전용 스타일을 정의한 뒤 `styles/main.css`의 `@import` 목록에 추가.
4. JS가 필요한 섹션이라면 `js/{섹션}` 혹은 `js/components` 하위에 모듈을 만들고 `index.html` 또는 해당 페이지에서만 로드하도록 스크립트 태그를 추가.

## 페이지 생성 예시 (`about.html`)
1. `about.html`을 만들고 `index.html`에서 `<head>`, `<header>`, `<main>`, `<footer>` 구조를 복사.
2. `<main>` 내부에 필요한 섹션 플레이스홀더만 남기고 `data-include` 경로를 조정.
3. About 전용 섹션이 필요하면 `sections/about/mission.html` 등으로 분리해 재사용.
4. 페이지별 스크립트/스타일은 `scripts/about.js`, `styles/sections/about.css`로 추가 후 `main.css`에서 `@import` 처리.

## SectionLoader 활용
- 모든 조각은 `data-include` 속성만 지정하면 됩니다. 중첩된 include도 자동으로 처리됩니다.
- 조각 업데이트 후 필요 시 `window.SectionLoader.reload()`로 다시 로드할 수 있습니다 (예: CMS 미리보기 환경).

## 빌드 타임 전환 로드맵
- Eleventy, Nunjucks 등 SSG로 전환 시 `sections/`와 `partials/`를 템플릿 include 경로로 매핑하면 현재 구조를 그대로 재활용할 수 있습니다.
- 전환 전까지는 런타임 include 방식을 유지하고, 빌드 타임 환경에서는 `SectionLoader`을 비활성화하거나 no-op으로 처리하면 됩니다.

