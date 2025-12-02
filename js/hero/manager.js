(function () {
    const STORAGE_KEY = 'mjcare.heroSlides';
    
    // DB 설정 로드 확인
    if (!window.DB_CONFIG) {
        console.error('DB_CONFIG not loaded');
    }
    
    const {
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        SUPABASE_BUCKET,
        SUPABASE_FOLDER
    } = window.DB_CONFIG || {};
    const DEFAULT_SLIDES = [
        {
            imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1600&q=80',
            imageAlt: '생산 설비에서 시트 마스크를 점검하는 연구원',
            eyebrow: 'GLOBAL OEM · ODM',
            title: 'MIJIN COSMETICS',
            description1: '시트 마스크팩 제조 및 판매, 글로벌 유통망을 통한 맞춤형 솔루션.',
            description2: '엄격한 품질관리 시스템과 다양한 브랜드 포트폴리오로 세계 고객과 만납니다.',
            primaryLabel: '회사 소개',
            primaryLink: '/about',
            secondaryLabel: 'CONTACT US',
            secondaryLink: '/21',
            textColor: '#ffffff',
            accentColor: '#fe6b00',
            fontFamily: "'Playfair Display', serif",
            overlayColor: '#080c18',
            overlayOpacity: 0.9
        },
        {
            imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1600&q=80',
            imageAlt: '스마트 팩토리 라인을 따라 이동하는 시트 마스크',
            eyebrow: 'SMART FACTORY',
            title: 'Data Driven Manufacturing',
            description1: '실시간 공정 모니터링과 자동화 설비를 통해 품질 편차를 최소화합니다.',
            description2: '글로벌 인증 규격을 만족하는 설비로 안정적인 대량 생산을 지원합니다.',
            primaryLabel: 'BUSINESS',
            primaryLink: '/business',
            secondaryLabel: 'PRODUCTION',
            secondaryLink: '/19',
            textColor: '#ffffff',
            accentColor: '#f3ba2f',
            fontFamily: "'Pretendard', sans-serif",
            overlayColor: '#050b19',
            overlayOpacity: 0.85
        },
        {
            imageUrl: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1600&q=80',
            imageAlt: '시트 마스크 제품 패키지를 검수하는 모습',
            eyebrow: 'GLOBAL NETWORK',
            title: 'Brand-tailored Solutions',
            description1: '맞춤형 브랜딩, 패키징, 마켓 인사이트를 통합한 토탈 솔루션.',
            description2: '해외 법규 대응과 물류까지 전담하여 파트너의 시장 진입을 돕습니다.',
            primaryLabel: 'BRAND',
            primaryLink: '/20',
            secondaryLabel: 'CONTACT US',
            secondaryLink: '/21',
            textColor: '#ffffff',
            accentColor: '#7dd3fc',
            fontFamily: "'Playfair Display', serif",
            overlayColor: '#051225',
            overlayOpacity: 0.82
        }
    ];

    const clone = (data) => JSON.parse(JSON.stringify(data));

    const escapeHtml = (value = '') =>
        value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

    const padIndex = (index) => String(index + 1).padStart(2, '0');

    function normalizeFontFamily(value) {
        if (!value) return "var(--font-serif)";
        const trimmed = value.trim();
        if (!trimmed) {
            return "var(--font-serif)";
        }
        const containsQuote = /['"]/.test(trimmed);
        if (containsQuote) return trimmed;
        return trimmed.includes(' ')
            ? `'${trimmed}'`
            : trimmed;
    }

    function normalizeOpacity(value, fallback = 0.85) {
        const numeric = Number(value);
        if (Number.isNaN(numeric)) return fallback;
        return Math.min(Math.max(numeric, 0), 1);
    }

    function createSlideTemplate(slide, index) {
        const inlineVars = [
            `--hero-text-color:${slide.textColor || '#ffffff'}`,
            `--hero-accent-color:${slide.accentColor || 'var(--color-accent)'}`,
            `--hero-font-family:${normalizeFontFamily(slide.fontFamily)}`,
            `--hero-overlay-color:${slide.overlayColor || '#080c18'}`,
            `--hero-overlay-opacity:${typeof slide.overlayOpacity === 'number' ? slide.overlayOpacity : 0.85}`
        ].join(';');

        const descriptions = [slide.description1, slide.description2]
            .filter(Boolean)
            .map((text) => `<p>${escapeHtml(text)}</p>`)
            .join('');

        const primaryCta = slide.primaryLabel && slide.primaryLink
            ? `<a href="${escapeHtml(slide.primaryLink)}" class="btn btn-primary">${escapeHtml(slide.primaryLabel)}</a>`
            : '';

        const secondaryCta = slide.secondaryLabel && slide.secondaryLink
            ? `<a href="${escapeHtml(slide.secondaryLink)}" class="btn btn-outline">${escapeHtml(slide.secondaryLabel)}</a>`
            : '';

        const actions = (primaryCta || secondaryCta)
            ? `<div class="hero-actions">${primaryCta}${secondaryCta}</div>`
            : '';

        return `
            <article class="hero-slide${index === 0 ? ' is-active' : ''}" data-slide-index="${index}" id="hero-slide-${index}" style="${inlineVars}">
                <img
                    src="${escapeHtml(slide.imageUrl)}"
                    alt="${escapeHtml(slide.imageAlt || '')}"
                    class="hero-slide__media"
                    loading="lazy"
                >
                <div class="hero-slide__content">
                    <div class="hero-slide__text">
                        ${slide.eyebrow ? `<p class="hero-eyebrow">${escapeHtml(slide.eyebrow)}</p>` : ''}
                        <h1>${escapeHtml(slide.title)}</h1>
                        ${descriptions}
                        ${actions}
                    </div>
                </div>
            </article>
        `;
    }

    const HeroManager = (() => {
        function loadSlides() {
            try {
                const stored = window.localStorage?.getItem(STORAGE_KEY);
                if (!stored) return clone(DEFAULT_SLIDES);
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length) {
                    return parsed.map((slide, index) => ({
                        ...clone(DEFAULT_SLIDES[index] || DEFAULT_SLIDES[0]),
                        ...slide
                    }));
                }
            } catch (error) {
                console.warn('히어로 슬라이드 데이터를 불러오지 못했습니다.', error);
            }
            return clone(DEFAULT_SLIDES);
        }

        function saveSlides(slides) {
            try {
                window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(slides));
            } catch (error) {
                console.warn('히어로 슬라이드 데이터를 저장하지 못했습니다.', error);
            }
        }

        function boot() {
            const sliderRoot = document.getElementById('heroSlider');
            const viewport = document.getElementById('heroSliderViewport');
            const dotsContainer = document.getElementById('heroSliderDots');
            const form = document.getElementById('heroAdminForm');
            const slideSelect = document.getElementById('heroSlideSelect');
            const resetBtn = document.getElementById('heroAdminReset');
            const imageFileInput = document.getElementById('heroImageFile');
            const imageUrlInput = form?.elements?.imageUrl;

            if (!sliderRoot || !viewport || !dotsContainer) return;
            if (sliderRoot.dataset.heroManaged === 'true') return;
            sliderRoot.dataset.heroManaged = 'true';

            let slidesData = loadSlides();
            let selectedIndex = 0;
            
            // Supabase 클라이언트 초기화 (DB_CONFIG가 있는 경우)
            let supabaseClient = null;
            if (SUPABASE_URL && SUPABASE_ANON_KEY && typeof supabase !== 'undefined') {
                supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            }

            function renderDots() {
                dotsContainer.innerHTML = slidesData
                    .map((_, index) => `
                        <button
                            type="button"
                            class="hero-slider__dot${index === 0 ? ' is-active' : ''}"
                            data-slide-target="${index}"
                            role="tab"
                            aria-selected="${index === 0}"
                            aria-controls="hero-slide-${index}"
                        >
                            ${padIndex(index)}
                        </button>
                    `)
                    .join('');
            }

            function renderSlides() {
                viewport.innerHTML = slidesData.map(createSlideTemplate).join('');
                renderDots();
                window.HeroSlider?.init(sliderRoot);
            }

            function populateSelect() {
                if (!slideSelect) return;
                slideSelect.innerHTML = slidesData
                    .map((slide, index) => `
                        <option value="${index}">슬라이드 ${padIndex(index)} · ${escapeHtml(slide.title)}</option>
                    `)
                    .join('');
                slideSelect.value = String(selectedIndex);
            }

            function hydrateForm() {
                if (!form) return;
                const current = slidesData[selectedIndex];
                if (!current) return;

                const fields = [
                    'imageUrl',
                    'imageAlt',
                    'eyebrow',
                    'title',
                    'description1',
                    'description2',
                    'primaryLabel',
                    'primaryLink',
                    'secondaryLabel',
                    'secondaryLink',
                    'textColor',
                    'accentColor',
                    'fontFamily',
                    'overlayColor'
                ];

                fields.forEach((name) => {
                    if (form.elements[name]) {
                        form.elements[name].value = current[name] ?? '';
                    }
                });

                if (form.elements.overlayOpacity) {
                    form.elements.overlayOpacity.value = current.overlayOpacity ?? 0.85;
                }
            }

            async function uploadImageFile(file) {
                if (!supabaseClient || !SUPABASE_BUCKET) {
                    alert('이미지 업로드 기능을 사용할 수 없습니다. DB 설정을 확인해주세요.');
                    return null;
                }

                try {
                    // 파일 크기 검증 (10MB 제한)
                    const maxSize = 10 * 1024 * 1024; // 10MB
                    if (file.size > maxSize) {
                        alert('파일 크기가 너무 큽니다. 10MB 이하의 파일만 업로드할 수 있습니다.');
                        return null;
                    }

                    // 파일 형식 검증
                    if (!file.type.startsWith('image/')) {
                        alert('이미지 파일만 업로드할 수 있습니다.');
                        return null;
                    }

                    const sanitizedName = `hero-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '-')}`;
                    const storagePath = SUPABASE_FOLDER ? `${SUPABASE_FOLDER}/${sanitizedName}` : sanitizedName;

                    const { data, error } = await supabaseClient
                        .storage
                        .from(SUPABASE_BUCKET)
                        .upload(storagePath, file, {
                            cacheControl: '3600',
                            upsert: false
                        });

                    if (error) {
                        console.error('업로드 에러:', error);
                        let errorMessage = '이미지 업로드에 실패했습니다.';
                        if (error.message?.includes('already exists')) {
                            errorMessage = '이미 같은 이름의 파일이 존재합니다.';
                        } else if (error.message?.includes('permission') || error.message?.includes('unauthorized')) {
                            errorMessage = '업로드 권한이 없습니다.';
                        }
                        alert(errorMessage);
                        return null;
                    }

                    // 업로드된 파일의 공개 URL 생성
                    const { data: signedData } = await supabaseClient
                        .storage
                        .from(SUPABASE_BUCKET)
                        .createSignedUrl(storagePath, 3600);

                    if (signedData?.signedUrl) {
                        return signedData.signedUrl;
                    }

                    // 공개 URL이 없는 경우 기본 URL 생성
                    const { data: publicData } = supabaseClient
                        .storage
                        .from(SUPABASE_BUCKET)
                        .getPublicUrl(storagePath);

                    return publicData?.publicUrl || null;
                } catch (err) {
                    console.error('예상치 못한 에러 발생:', err);
                    alert('업로드 중 예상치 못한 에러가 발생했습니다.');
                    return null;
                }
            }

            async function handleImageFileChange(event) {
                const file = event.target.files?.[0];
                if (!file || !imageUrlInput) return;

                const uploadedUrl = await uploadImageFile(file);
                if (uploadedUrl) {
                    imageUrlInput.value = uploadedUrl;
                    updateSlideField('imageUrl', uploadedUrl);
                    // 파일 입력 초기화
                    event.target.value = '';
                }
            }

            function updateSlideField(name, value) {
                const targetSlide = slidesData[selectedIndex];
                if (!targetSlide || !(name in targetSlide || name === 'overlayOpacity')) return;

                if (name === 'overlayOpacity') {
                    targetSlide.overlayOpacity = normalizeOpacity(value, targetSlide.overlayOpacity ?? 0.85);
                } else {
                    targetSlide[name] = value;
                }

                saveSlides(slidesData);
                renderSlides();
            }

            function handleFormChange(event) {
                const { name, value } = event.target;
                if (!name) return;

                if (name === 'selectedSlide') {
                    selectedIndex = Number(value) || 0;
                    hydrateForm();
                    return;
                }

                updateSlideField(name, value);
            }

            function resetSlides() {
                if (!window.confirm('히어로 슬라이드를 기본값으로 복원할까요?')) return;
                slidesData = clone(DEFAULT_SLIDES);
                selectedIndex = 0;
                saveSlides(slidesData);
                populateSelect();
                hydrateForm();
                renderSlides();
            }

            renderSlides();
            populateSelect();
            hydrateForm();

            slideSelect?.addEventListener('change', handleFormChange);
            form?.addEventListener('input', handleFormChange);
            form?.addEventListener('change', handleFormChange);
            resetBtn?.addEventListener('click', resetSlides);
            imageFileInput?.addEventListener('change', handleImageFileChange);
        }

        return { boot };
    })();

    window.HeroManager = HeroManager;

    document.addEventListener('sections:ready', () => HeroManager.boot());
    document.addEventListener('DOMContentLoaded', () => HeroManager.boot());
})();

