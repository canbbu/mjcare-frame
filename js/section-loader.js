(function () {
    const INCLUDE_ATTR = 'data-include';
    const EVENT_NAME = 'sections:ready';

    async function fetchFragment(src) {
        const response = await fetch(src, { cache: 'no-cache' });
        if (!response.ok) {
            throw new Error(`Failed to load ${src}: ${response.status}`);
        }
        return response.text();
    }

    async function processIncludes(root = document) {
        const targets = Array.from(root.querySelectorAll(`[${INCLUDE_ATTR}]`));
        for (const target of targets) {
            const src = target.getAttribute(INCLUDE_ATTR);
            if (!src) continue;

            try {
                const html = await fetchFragment(src);
                target.innerHTML = html;
                target.removeAttribute(INCLUDE_ATTR);
                await processIncludes(target);
            } catch (error) {
                console.error(error);
                target.innerHTML = `<p class="include-error">콘텐츠를 불러오지 못했습니다: ${src}</p>`;
            }
        }
    }

    async function init() {
        await processIncludes();
        document.dispatchEvent(new CustomEvent(EVENT_NAME));
        
        // 섹션 로드 후 번역 적용
        if (window.I18n && typeof window.I18n.applyTranslations === 'function') {
            window.I18n.applyTranslations();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.SectionLoader = {
        reload: init
    };
})();

