/**
 * 모바일 햄버거 내비게이션 토글
 */
(function () {
    'use strict';

    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    ready(function () {
        const navToggle = document.getElementById('navToggle');
        const navOverlay = document.getElementById('navOverlay');
        const siteNav = document.getElementById('siteNav');
        if (!navToggle || !siteNav || !navOverlay) return;

        const OPEN_CLASS = 'nav-open';
        const BREAKPOINT = 992; // px

        function openNav() {
            document.body.classList.add(OPEN_CLASS);
            navToggle.setAttribute('aria-expanded', 'true');
            navToggle.setAttribute('aria-label', '메뉴 닫기');
            navOverlay.hidden = false;
        }

        function closeNav() {
            document.body.classList.remove(OPEN_CLASS);
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-label', '메뉴 열기');
            navOverlay.hidden = true;
        }

        function toggleNav() {
            if (document.body.classList.contains(OPEN_CLASS)) {
                closeNav();
            } else {
                openNav();
            }
        }

        navToggle.addEventListener('click', toggleNav);
        navOverlay.addEventListener('click', closeNav);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && document.body.classList.contains(OPEN_CLASS)) {
                closeNav();
            }
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth > BREAKPOINT && document.body.classList.contains(OPEN_CLASS)) {
                closeNav();
            }
        });
    });
})();


