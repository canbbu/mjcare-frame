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
        SUPABASE_FOLDER,
        SIGNED_URL_TTL
    } = window.DB_CONFIG || {};
    
    // Hero 전용 폴더 경로
    const HERO_FOLDER = 'home/hero';
    const HERO_DATA_FILE = 'slides.json';
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
        // 기본 스타일 변수 (간단한 구조를 위해 고정값 사용)
        const inlineVars = [
            `--hero-text-color:#ffffff`,
            `--hero-accent-color:var(--color-accent)`,
            `--hero-font-family:var(--font-serif)`,
            `--hero-overlay-color:#080c18`,
            `--hero-overlay-opacity:0.85`
        ].join(';');

        // 설명 텍스트 (description 필드 사용, 없으면 description1/description2 호환)
        const description = slide.description || slide.description1 || '';
        const descriptionHtml = description
            ? `<p>${escapeHtml(description)}</p>`
            : '';

        // 버튼 (buttonLabel과 buttonLink 사용, 없으면 primaryLabel/primaryLink 호환)
        const buttonLabel = slide.buttonLabel || slide.primaryLabel || '';
        const buttonLink = slide.buttonLink || slide.primaryLink || '';
        const button = (buttonLabel && buttonLink)
            ? `<div class="hero-actions"><a href="${escapeHtml(buttonLink)}" class="btn btn-primary">${escapeHtml(buttonLabel)}</a></div>`
            : '';

        return `
            <article class="hero-slide${index === 0 ? ' is-active' : ''}" data-slide-index="${index}" id="hero-slide-${index}" style="${inlineVars}">
                <img
                    src="${escapeHtml(slide.imageUrl)}"
                    alt="${escapeHtml(slide.imageAlt || slide.title || '')}"
                    class="hero-slide__media"
                    loading="lazy"
                >
                <div class="hero-slide__content">
                    <div class="hero-slide__text">
                        <h1>${escapeHtml(slide.title || '')}</h1>
                        ${descriptionHtml}
                        ${button}
                    </div>
                </div>
            </article>
        `;
    }

    const HeroManager = (() => {
        async function loadSlidesFromSupabase(supabaseClient) {
            if (!supabaseClient || !SUPABASE_BUCKET) {
                return null;
            }

            try {
                const filePath = `${HERO_FOLDER}/${HERO_DATA_FILE}`;
                
                // Supabase Storage에서 JSON 파일 다운로드
                const { data, error } = await supabaseClient
                    .storage
                    .from(SUPABASE_BUCKET)
                    .download(filePath);

                if (error) {
                    // 파일이 없으면 null 반환 (에러가 아닌 경우)
                    if (error.message?.includes('not found') || error.statusCode === '404') {
                        return null;
                    }
                    console.warn('Supabase에서 슬라이드 데이터를 불러오지 못했습니다:', error);
                    return null;
                }

                // Blob을 텍스트로 변환
                const text = await data.text();
                const parsed = JSON.parse(text);
                
                if (Array.isArray(parsed) && parsed.length) {
                    return parsed.map((slide, index) => ({
                        ...clone(DEFAULT_SLIDES[index] || DEFAULT_SLIDES[0]),
                        ...slide
                    }));
                }
            } catch (error) {
                console.warn('Supabase 슬라이드 데이터 파싱 실패:', error);
            }
            return null;
        }

        async function loadSlides(supabaseClient) {
            // 1. Supabase에서 먼저 시도
            if (supabaseClient) {
                const supabaseData = await loadSlidesFromSupabase(supabaseClient);
                if (supabaseData) {
                    // Supabase 데이터를 localStorage에도 백업
                    try {
                        window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(supabaseData));
                    } catch (e) {
                        console.warn('localStorage 백업 실패:', e);
                    }
                    return supabaseData;
                }
            }

            // 2. Supabase 실패 시 localStorage에서 불러오기
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
                console.warn('localStorage에서 슬라이드 데이터를 불러오지 못했습니다.', error);
            }
            
            // 3. 모두 실패 시 기본값 반환
            return clone(DEFAULT_SLIDES);
        }

        async function saveSlidesToSupabase(slides, supabaseClient) {
            if (!supabaseClient || !SUPABASE_BUCKET) {
                return false;
            }

            try {
                const filePath = `${HERO_FOLDER}/${HERO_DATA_FILE}`;
                const jsonData = JSON.stringify(slides, null, 2);
                const blob = new Blob([jsonData], { type: 'application/json' });

                const { error } = await supabaseClient
                    .storage
                    .from(SUPABASE_BUCKET)
                    .upload(filePath, blob, {
                        cacheControl: '3600',
                        upsert: true,
                        contentType: 'application/json'
                    });

                if (error) {
                    console.error('Supabase에 슬라이드 데이터 저장 실패:', error);
                    return false;
                }

                return true;
            } catch (error) {
                console.error('Supabase 저장 중 예상치 못한 에러:', error);
                return false;
            }
        }

        async function saveSlides(slides, supabaseClient) {
            // 1. Supabase에 저장 시도
            if (supabaseClient) {
                const success = await saveSlidesToSupabase(slides, supabaseClient);
                if (!success) {
                    console.warn('Supabase 저장 실패, localStorage에만 저장합니다.');
                }
            }

            // 2. localStorage에도 백업 저장
            try {
                window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(slides));
            } catch (error) {
                console.warn('localStorage에 슬라이드 데이터를 저장하지 못했습니다.', error);
            }
        }

        function boot() {
            const sliderRoot = document.getElementById('heroSlider');
            const viewport = document.getElementById('heroSliderViewport');
            const dotsContainer = document.getElementById('heroSliderDots');
            const form = document.getElementById('heroAdminForm');
            const slideSelect = document.getElementById('heroSlideSelect');
            const resetBtn = document.getElementById('heroAdminReset');
            const addSlideBtn = document.getElementById('heroSlideAdd');
            const insertSlideBtn = document.getElementById('heroSlideInsert');
            const deleteSlideBtn = document.getElementById('heroSlideDelete');
            const imageFileInput = document.getElementById('heroImageFile');
            const imageUrlInput = form?.elements?.imageUrl;

            if (!sliderRoot || !viewport || !dotsContainer) return;
            if (sliderRoot.dataset.heroManaged === 'true') return;
            sliderRoot.dataset.heroManaged = 'true';

            // 전역 Supabase 클라이언트 사용 (중복 인스턴스 방지)
            let supabaseClient = window.supabaseClient || null;

            let slidesData = clone(DEFAULT_SLIDES);
            let selectedIndex = 0;
            
            // 초기 렌더링 (기본값으로 먼저 표시)
            (async () => {
                await renderSlides();
                populateSelect();
                hydrateForm();
            })();
            
            // Supabase에서 슬라이드 데이터 비동기 로드
            (async () => {
                const loaded = await loadSlides(supabaseClient);
                if (loaded && Array.isArray(loaded) && loaded.length) {
                    slidesData = loaded;
                    await renderSlides();
                    populateSelect();
                    hydrateForm();
                }
            })();

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

            async function getImageSignedUrl(imagePath, supabaseClient) {
                // 외부 URL인 경우 (http:// 또는 https://로 시작) 그대로 반환
                if (imagePath && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
                    return imagePath;
                }

                // Supabase Storage 파일인 경우 Signed URL 생성
                if (!supabaseClient || !imagePath || !SUPABASE_BUCKET) {
                    return imagePath || '';
                }

                try {
                    // products.js와 동일한 방식: 경로가 폴더를 포함하지 않으면 HERO_FOLDER 추가
                    let filePath = imagePath;
                    if (!filePath.includes('/')) {
                        // 파일명만 있는 경우 HERO_FOLDER 추가
                        filePath = `${HERO_FOLDER}/${filePath}`;
                    } else if (!filePath.startsWith(HERO_FOLDER) && !filePath.startsWith(SUPABASE_FOLDER)) {
                        // 경로가 있지만 HERO_FOLDER나 SUPABASE_FOLDER로 시작하지 않으면 HERO_FOLDER 추가
                        filePath = `${HERO_FOLDER}/${filePath}`;
                    }

                    const { data: signedData, error: signedError } = await supabaseClient
                        .storage
                        .from(SUPABASE_BUCKET)
                        .createSignedUrl(filePath, SIGNED_URL_TTL || 3600);

                    if (signedError || !signedData?.signedUrl) {
                        console.error('Signed URL 생성 실패:', signedError || '알 수 없는 에러', '경로:', filePath);
                        return imagePath; // 실패 시 원본 경로 반환
                    }

                    return signedData.signedUrl;
                } catch (err) {
                    console.error('Signed URL 생성 중 예상치 못한 에러:', err);
                    return imagePath; // 실패 시 원본 경로 반환
                }
            }

            async function renderSlides() {
                // 모든 슬라이드의 이미지 URL을 Signed URL로 변환
                const slidesWithUrls = await Promise.all(
                    slidesData.map(async (slide) => {
                        const signedUrl = await getImageSignedUrl(slide.imageUrl || slide.imageFileName, supabaseClient);
                        return {
                            ...slide,
                            imageUrl: signedUrl
                        };
                    })
                );

                // 임시로 slidesData를 업데이트하여 렌더링
                const originalSlides = slidesData;
                slidesData = slidesWithUrls;
                viewport.innerHTML = slidesData.map(createSlideTemplate).join('');
                renderDots();
                window.HeroSlider?.init(sliderRoot);
                // 원본 데이터 복원 (Signed URL은 렌더링에만 사용)
                slidesData = originalSlides;
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

                // 간단한 필드만 처리
                const fields = [
                    'imageUrl',
                    'title',
                    'description',
                    'buttonLabel',
                    'buttonLink'
                ];

                fields.forEach((name) => {
                    if (form.elements[name]) {
                        // 호환성을 위해 기존 필드에서 값 가져오기
                        let value = current[name];
                        if (!value) {
                            // 기존 데이터 구조와 호환
                            if (name === 'description') {
                                value = current.description1 || current.description || '';
                            } else if (name === 'buttonLabel') {
                                value = current.primaryLabel || '';
                            } else if (name === 'buttonLink') {
                                value = current.primaryLink || '';
                            }
                        }
                        form.elements[name].value = value ?? '';
                    }
                });
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

                    const sanitizedName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '-')}`;
                    const storagePath = `${HERO_FOLDER}/${sanitizedName}`;

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
                        if (error.message) {
                            errorMessage += '\n\n에러: ' + error.message;
                        }
                        if (error.statusCode) {
                            errorMessage += '\n상태 코드: ' + error.statusCode;
                        }
                        if (error.message?.includes('already exists')) {
                            errorMessage = '이미 같은 이름의 파일이 존재합니다. 파일명을 변경해주세요.';
                        } else if (error.message?.includes('size')) {
                            errorMessage = '파일 크기가 너무 큽니다. 더 작은 파일을 업로드해주세요.';
                        } else if (error.message?.includes('permission') || error.message?.includes('unauthorized')) {
                            errorMessage = '업로드 권한이 없습니다. 관리자에게 문의해주세요.';
                        } else if (error.message?.includes('bucket')) {
                            errorMessage = '저장소 버킷을 찾을 수 없습니다. 설정을 확인해주세요.';
                        }
                        alert(errorMessage);
                        return null;
                    }

                    // products.js 방식: 파일명만 반환 (경로 포함)
                    return storagePath;
                } catch (err) {
                    console.error('예상치 못한 에러 발생:', err);
                    alert('업로드 중 예상치 못한 에러가 발생했습니다.');
                    return null;
                }
            }

            async function handleImageFileChange(event) {
                const file = event.target.files?.[0];
                if (!file || !imageUrlInput) return;

                const uploadedPath = await uploadImageFile(file);
                if (uploadedPath) {
                    // products.js 방식: 파일 경로만 저장
                    imageUrlInput.value = uploadedPath;
                    await updateSlideField('imageUrl', uploadedPath);
                    // 파일 입력 초기화
                    event.target.value = '';
                }
            }

            async function updateSlideField(name, value) {
                const targetSlide = slidesData[selectedIndex];
                if (!targetSlide) return;

                // 간단한 필드만 업데이트
                const allowedFields = ['imageUrl', 'title', 'description', 'buttonLabel', 'buttonLink'];
                if (allowedFields.includes(name)) {
                    targetSlide[name] = value;
                    await saveSlides(slidesData, supabaseClient);
                    await renderSlides();
                }
            }

            async function handleFormChange(event) {
                const { name, value } = event.target;
                if (!name) return;

                if (name === 'selectedSlide') {
                    selectedIndex = Number(value) || 0;
                    hydrateForm();
                    return;
                }

                await updateSlideField(name, value);
            }

            function createNewSlide() {
                // 간단한 기본 슬라이드 템플릿 생성
                return clone({
                    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1600&q=80',
                    title: '새 슬라이드',
                    description: '',
                    buttonLabel: '',
                    buttonLink: ''
                });
            }

            async function addSlide() {
                const newSlide = createNewSlide();
                slidesData.push(newSlide);
                selectedIndex = slidesData.length - 1;
                await saveSlides(slidesData, supabaseClient);
                populateSelect();
                hydrateForm();
                await renderSlides();
            }

            async function insertSlide() {
                const newSlide = createNewSlide();
                slidesData.splice(selectedIndex + 1, 0, newSlide);
                selectedIndex = selectedIndex + 1;
                await saveSlides(slidesData, supabaseClient);
                populateSelect();
                hydrateForm();
                await renderSlides();
            }

            async function deleteSlide() {
                if (slidesData.length <= 1) {
                    alert('최소 1개의 슬라이드는 유지해야 합니다.');
                    return;
                }

                const slideTitle = slidesData[selectedIndex]?.title || `슬라이드 ${padIndex(selectedIndex)}`;
                if (!window.confirm(`"${slideTitle}" 슬라이드를 삭제하시겠습니까?`)) {
                    return;
                }

                slidesData.splice(selectedIndex, 1);
                
                // 삭제 후 인덱스 조정
                if (selectedIndex >= slidesData.length) {
                    selectedIndex = slidesData.length - 1;
                }

                await saveSlides(slidesData, supabaseClient);
                populateSelect();
                hydrateForm();
                await renderSlides();
            }

            async function resetSlides() {
                if (!window.confirm('히어로 슬라이드를 기본값으로 복원할까요?')) return;
                slidesData = clone(DEFAULT_SLIDES);
                selectedIndex = 0;
                await saveSlides(slidesData, supabaseClient);
                populateSelect();
                hydrateForm();
                await renderSlides();
            }

            slideSelect?.addEventListener('change', handleFormChange);
            form?.addEventListener('input', handleFormChange);
            form?.addEventListener('change', handleFormChange);
            resetBtn?.addEventListener('click', resetSlides);
            addSlideBtn?.addEventListener('click', addSlide);
            insertSlideBtn?.addEventListener('click', insertSlide);
            deleteSlideBtn?.addEventListener('click', deleteSlide);
            imageFileInput?.addEventListener('change', handleImageFileChange);
        }

        return { boot };
    })();

    window.HeroManager = HeroManager;

    document.addEventListener('sections:ready', () => HeroManager.boot());
    document.addEventListener('DOMContentLoaded', () => HeroManager.boot());
})();

