/**
 * 간단한 클라이언트 사이드 라우터
 * URL 경로에 따라 다른 섹션을 로드합니다.
 */
(function() {
    const ROUTES = {
        '/': {
            sections: [
                'sections/hero.html',
                'sections/intro.html',
                'sections/certifications.html',
                'sections/products.html',
                'sections/cs-banner.html'
            ]
        },
        '/about': {
            sections: [
                'sections/about.html'
            ]
        },
        '/ceo': {
            sections: [
                'sections/ceo.html'
            ]
        },
        '/certification': {
            sections: [
                'sections/certification.html'
            ]
        },
        '/organization': {
            sections: [
                'sections/organization.html'
            ]
        },
        '/business': {
            sections: [
                'sections/business.html'
            ]
        }
    };

    function getCurrentPath() {
        return window.location.pathname;
    }

    function getRoute(path) {
        // 정확한 매칭
        if (ROUTES[path]) {
            return ROUTES[path];
        }
        // 기본 경로로 폴백
        return ROUTES['/'];
    }

    function loadSections(sections) {
        const main = document.getElementById('pageMain');
        if (!main) return;

        // 기존 섹션 제거
        main.innerHTML = '';

        // 새 섹션 로드
        sections.forEach(sectionPath => {
            const mount = document.createElement('div');
            mount.className = 'section-mount';
            mount.setAttribute('data-include', sectionPath);
            main.appendChild(mount);
        });

        // SectionLoader가 있으면 다시 로드
        if (window.SectionLoader) {
            window.SectionLoader.reload();
        }
    }

    function initRouter() {
        const path = getCurrentPath();
        const route = getRoute(path);
        
        if (route && route.sections) {
            loadSections(route.sections);
        }
    }

    // 초기 로드 - section-loader가 로드된 후 실행되도록 약간의 지연
    function startRouter() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(initRouter, 50);
            });
        } else {
            setTimeout(initRouter, 50);
        }
    }

    // 즉시 실행
    startRouter();

    // 브라우저 뒤로/앞으로 버튼 처리
    window.addEventListener('popstate', initRouter);

    // 네비게이션 링크 클릭 처리 (SPA 방식)
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a[href^="/"]');
        if (!link || link.hasAttribute('target') || link.hasAttribute('download')) {
            return;
        }

        const href = link.getAttribute('href');
        if (href && href.startsWith('/') && !href.startsWith('//')) {
            e.preventDefault();
            window.history.pushState({}, '', href);
            initRouter();
        }
    });

    // 전역에서 사용할 수 있도록 export
    window.Router = {
        navigate: function(path) {
            window.history.pushState({}, '', path);
            initRouter();
        },
        reload: initRouter
    };
})();

