/**
 * 다국어 관리 모듈
 * 한국어(ko), 일본어(ja), 영어(en) 지원
 */
(function() {
    'use strict';

    const I18n = {
        currentLang: 'ja', // 기본 언어
        translations: null,

        /**
         * 초기화
         */
        init() {
            // 초기 로드 시 기본 언어는 항상 일본어로 설정
            // (사용자가 명시적으로 언어를 변경한 경우에만 localStorage 사용)
            const savedLang = localStorage.getItem('mjcare-language');
            // 저장된 언어가 있고, 사용자가 이전에 변경한 경우에만 사용
            // 초기 로드 시에는 항상 일본어로 시작
            if (savedLang && ['ko', 'ja', 'en'].includes(savedLang)) {
                this.currentLang = savedLang;
            } else {
                // 기본 언어는 일본어
                this.currentLang = 'ja';
                // 초기 로드 시 일본어로 설정
                localStorage.setItem('mjcare-language', 'ja');
            }

            // 번역 데이터 로드
            if (typeof window !== 'undefined' && window.TRANSLATIONS) {
                this.translations = window.TRANSLATIONS;
            } else {
                console.error('Translations not loaded');
                return;
            }

            // 언어 변경 이벤트 리스너 설정
            this.setupLanguageSelector();
            
            // 초기 번역 적용
            this.applyTranslations();

            // 초기 언어 상태 방송 (다른 모듈 동기화용)
            window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: this.currentLang } }));
        },

        /**
         * 언어 변경
         */
        setLanguage(lang) {
            if (!['ko', 'ja', 'en'].includes(lang)) {
                console.warn('Invalid language:', lang);
                return;
            }

            this.currentLang = lang;
            localStorage.setItem('mjcare-language', lang);
            document.documentElement.lang = lang;
            this.applyTranslations();

            // 언어 변경 이벤트 발생 (다른 스크립트에서 감지용)
            window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
        },

        /**
         * 번역 텍스트 가져오기
         */
        t(key) {
            if (!this.translations || !this.translations[this.currentLang]) {
                return key;
            }

            const keys = key.split('.');
            let value = this.translations[this.currentLang];

            for (const k of keys) {
                if (value && typeof value === 'object' && k in value) {
                    value = value[k];
                } else {
                    return key;
                }
            }

            return typeof value === 'string' ? value : key;
        },

        /**
         * 언어 선택기 설정
         */
        setupLanguageSelector() {
            const selectors = document.querySelectorAll('[id^="languageSelector"]');
            if (!selectors.length) return;

            selectors.forEach((selector) => {
                this.setupSingleLanguageSelector(selector);
            });
        },

        setupSingleLanguageSelector(selector) {

            const trigger = selector.querySelector('.language-selector__trigger');
            const options = selector.querySelectorAll('.language-selector__option');

            const closeDropdown = () => {
                selector.classList.remove('is-open');
                if (trigger) {
                    trigger.setAttribute('aria-expanded', 'false');
                }
            };

            const updateActiveState = () => {
                options.forEach(option => {
                    const isActive = option.dataset.lang === this.currentLang;
                    option.classList.toggle('active', isActive);
                });

                if (trigger) {
                    // 국기만 표시
                    const flagMap = {
                        'ko': '🇰🇷',
                        'ja': '🇯🇵',
                        'en': '🇺🇸'
                    };
                    trigger.textContent = flagMap[this.currentLang] || '🇯🇵';
                    
                    // aria-label 업데이트
                    const labelMap = {
                        'ko': '한국어',
                        'ja': '日本語',
                        'en': 'English'
                    };
                    trigger.setAttribute('aria-label', `언어 선택: ${labelMap[this.currentLang] || '日本語'}`);
                }
            };

            options.forEach(option => {
                option.addEventListener('click', () => {
                    const lang = option.dataset.lang;
                    if (lang) {
                        this.setLanguage(lang);
                        updateActiveState();
                        closeDropdown();
                    }
                });
            });

            if (trigger) {
                trigger.addEventListener('click', (event) => {
                    event.stopPropagation();
                    const willOpen = !selector.classList.contains('is-open');
                    selector.classList.toggle('is-open', willOpen);
                    trigger.setAttribute('aria-expanded', String(willOpen));
                });
            }

            document.addEventListener('click', (event) => {
                if (!selector.contains(event.target)) {
                    closeDropdown();
                }
            });

            selector.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') {
                    closeDropdown();
                }
            });

            updateActiveState();
        },

        /**
         * 번역 적용
         */
        applyTranslations() {
            // data-i18n 속성을 가진 모든 요소에 번역 적용
            const elements = document.querySelectorAll('[data-i18n]');
            elements.forEach(element => {
                const key = element.getAttribute('data-i18n');
                const translation = this.t(key);
                
                if (element.tagName === 'INPUT' && element.type === 'text') {
                    element.placeholder = translation;
                } else if (element.tagName === 'INPUT' && element.type === 'submit') {
                    element.value = translation;
                } else if (element.tagName === 'BUTTON') {
                    // 언어 선택기 트리거는 제외 (국기만 표시)
                    if (!element.hasAttribute('data-current-lang')) {
                        element.textContent = translation;
                    }
                } else if (element.tagName === 'IMG') {
                    element.alt = translation;
                } else if (element.hasAttribute('aria-label')) {
                    element.setAttribute('aria-label', translation);
                } else {
                    element.textContent = translation;
                }
            });

            // data-i18n-placeholder 속성을 가진 input 요소에 번역 적용
            const placeholderInputs = document.querySelectorAll('[data-i18n-placeholder]');
            placeholderInputs.forEach(input => {
                const key = input.getAttribute('data-i18n-placeholder');
                input.placeholder = this.t(key);
            });

            // HTML lang 속성 업데이트
            document.documentElement.lang = this.currentLang;
        }
    };

    // DOMContentLoaded 시 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => I18n.init());
    } else {
        I18n.init();
    }

    // 전역에서 사용할 수 있도록 export
    if (typeof window !== 'undefined') {
        window.I18n = I18n;
    }
})();

