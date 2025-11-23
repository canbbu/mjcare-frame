/**
 * 다국어 관리 모듈
 * 한국어(ko), 일본어(ja), 영어(en) 지원
 */
(function() {
    'use strict';

    const I18n = {
        currentLang: 'ko', // 기본 언어
        translations: null,

        /**
         * 초기화
         */
        init() {
            // 저장된 언어 설정 불러오기
            const savedLang = localStorage.getItem('mjcare-language');
            if (savedLang && ['ko', 'ja', 'en'].includes(savedLang)) {
                this.currentLang = savedLang;
            } else {
                // 브라우저 언어 감지
                const browserLang = navigator.language || navigator.userLanguage;
                if (browserLang.startsWith('ja')) {
                    this.currentLang = 'ja';
                } else if (browserLang.startsWith('en')) {
                    this.currentLang = 'en';
                } else {
                    this.currentLang = 'ko';
                }
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
            const selector = document.querySelector('.language-selector');
            if (!selector) return;

            const buttons = selector.querySelectorAll('button');
            buttons.forEach(button => {
                button.addEventListener('click', () => {
                    const lang = button.dataset.lang;
                    if (lang) {
                        this.setLanguage(lang);
                        // 활성 버튼 업데이트
                        buttons.forEach(btn => btn.classList.remove('active'));
                        button.classList.add('active');
                    }
                });

                // 현재 언어 버튼 활성화
                if (button.dataset.lang === this.currentLang) {
                    button.classList.add('active');
                }
            });
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
                    element.textContent = translation;
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

