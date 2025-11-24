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

        function t(key) {
            return (window.I18n && window.I18n.t) ? window.I18n.t(key) : key;
        }

        function syncAriaLabel() {
            const key = document.body.classList.contains(OPEN_CLASS) ? 'nav.menuClose' : 'nav.menuOpen';
            navToggle.setAttribute('aria-label', t(key));
        }

        function openNav() {
            document.body.classList.add(OPEN_CLASS);
            navToggle.setAttribute('aria-expanded', 'true');
            navToggle.setAttribute('aria-label', t('nav.menuClose'));
            navOverlay.hidden = false;
        }

        function closeNav() {
            document.body.classList.remove(OPEN_CLASS);
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-label', t('nav.menuOpen'));
            navOverlay.hidden = true;
        }

        function toggleNav() {
            if (document.body.classList.contains(OPEN_CLASS)) {
                closeNav();
            } else {
                openNav();
            }
        }

        navToggle.setAttribute('aria-label', t('nav.menuOpen'));

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

        window.addEventListener('languageChanged', syncAriaLabel);
    });
})();


