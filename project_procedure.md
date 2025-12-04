# 프로젝트 경로 구조

## 🛣️ URL 경로 → 파일 경로 매핑

### 라우팅 경로 (`js/router.js` 기준)

```
URL 경로                    →  로드되는 섹션 파일
─────────────────────────────────────────────────────
/ (홈)                     →  sections/hero.html
                            →  sections/intro.html
                            →  sections/certifications.html
                            →  sections/products.html
                            →  sections/cs-banner.html

/about                     →  sections/about.html

/business                  →  sections/business.html (미구현)

/19                        →  (라우터 미정의)
/20                        →  (라우터 미정의)
/21                        →  (라우터 미정의)
```

## 📁 파일 경로 구조

```
프로젝트 루트/
│
├── index.html                    # 메인 진입점
│
├── sections/                     # 페이지 섹션
│   ├── hero.html                 # / → sections/hero.html
│   ├── intro.html                # / → sections/intro.html
│   ├── certifications.html       # / → sections/certifications.html
│   ├── products.html             # / → sections/products.html
│   ├── cs-banner.html            # / → sections/cs-banner.html
│   └── about.html                # /about → sections/about.html
│
├── partials/                     # 재사용 컴포넌트
│   └── product-modal.html        # sections/products.html에서 참조
│
├── js/
│   ├── router.js                 # 라우팅 정의
│   ├── section-loader.js         # 섹션 로드 처리
│   └── hero/
│       ├── slider.js
│       └── manager.js
│
├── styles/
│   ├── main.css
│   └── sections/
│       ├── hero.css              # sections/hero.html 스타일
│       ├── intro.css             # sections/intro.html 스타일
│       ├── certifications.css    # sections/certifications.html 스타일
│       ├── products.css          # sections/products.html 스타일
│       ├── cs-banner.css         # sections/cs-banner.html 스타일
│       └── about.css             # sections/about.html 스타일
│
└── assets/images/                # 이미지 저장 경로
    ├── hero/                     # 히어로 슬라이더 이미지
    ├── products/                 # 제품 이미지
    ├── about/                    # 회사 소개 이미지
    └── common/                   # 공통 이미지
```

## 📸 이미지 경로 사용

```
이미지 용도              →  저장 경로
─────────────────────────────────────────────
히어로 슬라이더          →  assets/images/hero/
제품 이미지              →  assets/images/products/
회사 소개 이미지         →  assets/images/about/
로고, 아이콘 등          →  assets/images/common/
```

### HTML에서 참조 예시
```html
<img src="assets/images/hero/slide-1.jpg">
<img src="assets/images/products/product-1.jpg">
<img src="assets/images/about/about-1.jpg">
```

