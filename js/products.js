/**
 * 제품 관리 스크립트
 * DB 설정과 다국어를 사용하여 제품을 관리합니다.
 */
(function () {
    'use strict';

    // DB 설정 로드 확인
    if (!window.DB_CONFIG) {
        console.error('DB_CONFIG not loaded');
        return;
    }

    const {
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        SUPABASE_BUCKET,
        SUPABASE_FOLDER,
        SIGNED_URL_TTL,
        METADATA_STORAGE_KEY
    } = window.DB_CONFIG;

    const PRODUCT_METADATA = loadStoredMetadata();

    let productsGrid;
    let productAdminList;
    let uploadForm;
    let fileInput;
    let titleInput;
    let badgeInput;
    let priceInput;
    let subtitleInput;
    let uploadButton;
    let productModal;
    let productModalOpen;
    let productModalClose;
    let productModalOverlay;
    let supabaseClient;
    let languageHandlerBound = false;
    let productsSliderPrev;
    let productsSliderNext;
    let currentSlideIndex = 0;
    let itemsPerSlide = 5;
    let autoSlideInterval = null;

    function bootstrap() {
        productsGrid = document.getElementById('productsGrid');
        productAdminList = document.getElementById('productAdminList');
        uploadForm = document.getElementById('productUploadForm');
        fileInput = document.getElementById('productFile');
        titleInput = document.getElementById('productTitle');
        badgeInput = document.getElementById('productBadge');
        priceInput = document.getElementById('productPrice');
        subtitleInput = document.getElementById('productSubtitle');
        uploadButton = document.getElementById('uploadButton');
        productModal = document.getElementById('productModal');
        productModalOpen = document.getElementById('productModalOpen');
        productModalClose = document.getElementById('productModalClose');
        productModalOverlay = document.getElementById('productModalOverlay');
        productsSliderPrev = document.getElementById('productsSliderPrev');
        productsSliderNext = document.getElementById('productsSliderNext');

        if (!productsGrid) {
            return;
        }

        if (productsGrid.dataset.productsBound === 'true') {
            return;
        }
        productsGrid.dataset.productsBound = 'true';

        // 전역 Supabase 클라이언트 사용 (중복 인스턴스 방지)
        supabaseClient = window.supabaseClient || (typeof supabase !== 'undefined' ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null);

        init();

        if (!languageHandlerBound) {
            window.addEventListener('languageChanged', () => {
                loadProducts();
            });
            languageHandlerBound = true;
        }
    }

    function init() {
        loadProducts();
        setupUploadForm();
        setupProductModal();
        setupSlider();
    }

    /**
     * 번역 텍스트 가져오기 헬퍼
     */
    function t(key) {
        if (window.I18n && window.I18n.t) {
            return window.I18n.t(key);
        }
        // I18n이 로드되지 않은 경우 기본값 반환
        return key;
    }

    async function loadProducts() {
        setStatus(t('products.loading'));

        const { data: files, error } = await supabaseClient
            .storage
            .from(SUPABASE_BUCKET)
            .list(SUPABASE_FOLDER, {
                limit: 50,
                sortBy: { column: 'name', order: 'asc' }
            });

        if (error) {
            console.warn('Supabase 로드 실패 (CORS 또는 네트워크 문제).', error);
            setStatus(t('products.noProducts'));
            renderAdminList([]);
            return;
        }

        if (!files || files.length === 0) {
            setStatus(t('products.noProducts'));
            renderAdminList([]);
            return;
        }

        const cards = [];

        for (const file of files) {
            if (file.name.startsWith('.')) continue;

            const filePath = SUPABASE_FOLDER ? `${SUPABASE_FOLDER}/${file.name}` : file.name;
            const { data: signedData, error: signedError } = await supabaseClient
                .storage
                .from(SUPABASE_BUCKET)
                .createSignedUrl(filePath, SIGNED_URL_TTL);

            if (signedError || !signedData?.signedUrl) {
                console.error(signedError || 'Signed URL 생성 실패');
                continue;
            }

            const meta = PRODUCT_METADATA[file.name] || {};
            cards.push({
                fileName: file.name,
                title: meta.title || formatFileName(file.name),
                badge: meta.badge,
                price: meta.price,
                subtitle: meta.subtitle,
                imageUrl: signedData.signedUrl,
                meta
            });
        }

        if (cards.length === 0) {
            setStatus(t('products.noDisplayable'));
            renderAdminList([]);
            return;
        }

        renderProducts(cards);
        renderAdminList(cards);
        updateSliderButtons(cards.length);
    }

    function renderProducts(products) {
        productsGrid.innerHTML = '';
        products.forEach((product) => {
            const card = document.createElement('div');
            card.className = 'product-card';

            const image = document.createElement('img');
            image.className = 'product-image';
            image.src = product.imageUrl;
            image.alt = product.title;

            const info = document.createElement('div');
            info.className = 'product-info';

            if (product.badge) {
                const badge = document.createElement('span');
                badge.className = 'product-badge';
                badge.textContent = product.badge;
                info.appendChild(badge);
            }

            const title = document.createElement('h3');
            title.textContent = product.title;
            info.appendChild(title);

            if (product.price) {
                const price = document.createElement('div');
                price.className = 'product-price';
                price.textContent = product.price;
                info.appendChild(price);
            }

            if (product.subtitle) {
                const subtitle = document.createElement('div');
                subtitle.style.fontSize = '12px';
                subtitle.style.color = '#999';
                subtitle.style.marginTop = '5px';
                subtitle.textContent = product.subtitle;
                info.appendChild(subtitle);
            }

            card.appendChild(image);
            card.appendChild(info);
            productsGrid.appendChild(card);
        });

        // 슬라이드 위치 업데이트
        currentSlideIndex = 0;
        setTimeout(() => {
            // 제품 렌더링 후 표시 개수 재계산
            if (productsSliderPrev && productsSliderNext) {
                const container = productsGrid.parentElement;
                if (container) {
                    const containerWidth = container.offsetWidth;
                    const cardWidth = 220;
                    const gap = window.innerWidth <= 768 ? 20 : 30;
                    const itemsThatFit = Math.floor((containerWidth + gap) / (cardWidth + gap));
                    itemsPerSlide = Math.max(1, Math.min(itemsThatFit, 5));
                }
            }
            updateSliderPosition();
            updateSliderButtons(products.length);
            // 제품 렌더링 후 자동 슬라이드 재시작
            if (typeof resetAutoSlide === 'function') {
                resetAutoSlide();
            }
        }, 100);
    }

    function renderAdminList(products) {
        if (!productAdminList) return;

        if (!products.length) {
            productAdminList.innerHTML = `<p class="loading-message">${t('products.noProducts')}</p>`;
            return;
        }

        productAdminList.innerHTML = '';

        products.forEach((product) => {
            const row = document.createElement('div');
            row.className = 'product-admin-row';

            const nameLabel = document.createElement('strong');
            nameLabel.textContent = product.fileName;
            row.appendChild(nameLabel);

            const titleField = createMetaInput(product.meta?.title || '', t('products.metaTitle'));
            const badgeField = createMetaInput(product.meta?.badge || '', t('products.metaBadge'));
            const priceField = createMetaInput(product.meta?.price || '', t('products.metaPrice'));
            const subtitleField = createMetaInput(product.meta?.subtitle || '', t('products.metaSubtitle'));

            row.appendChild(titleField);
            row.appendChild(badgeField);
            row.appendChild(priceField);
            row.appendChild(subtitleField);

            const saveButton = document.createElement('button');
            saveButton.type = 'button';
            saveButton.className = 'btn-save-meta';
            saveButton.textContent = t('products.saveMeta');
            saveButton.addEventListener('click', async () => {
                const meta = {};
                if (titleField.value.trim()) meta.title = titleField.value.trim();
                if (badgeField.value.trim()) meta.badge = badgeField.value.trim();
                if (priceField.value.trim()) meta.price = priceField.value.trim();
                if (subtitleField.value.trim()) meta.subtitle = subtitleField.value.trim();

                if (Object.keys(meta).length === 0) {
                    delete PRODUCT_METADATA[product.fileName];
                } else {
                    PRODUCT_METADATA[product.fileName] = meta;
                }

                saveStoredMetadata();
                alert(t('products.metaSaved'));
                await loadProducts();
            });

            const deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.className = 'btn-delete';
            deleteButton.textContent = t('products.delete');
            deleteButton.addEventListener('click', async () => {
                const confirmed = window.confirm(t('products.deleteConfirm'));
                if (!confirmed) return;

                toggleRowButtons(deleteButton, saveButton, true);

                const filePath = SUPABASE_FOLDER ? `${SUPABASE_FOLDER}/${product.fileName}` : product.fileName;
                const { error } = await supabaseClient
                    .storage
                    .from(SUPABASE_BUCKET)
                    .remove([filePath]);

                if (error) {
                    console.error(error);
                    alert(t('products.deleteFailed'));
                    toggleRowButtons(deleteButton, saveButton, false);
                    return;
                }

                delete PRODUCT_METADATA[product.fileName];
                saveStoredMetadata();
                alert(t('products.deleteSuccess'));
                toggleRowButtons(deleteButton, saveButton, false);
                await loadProducts();
            });

            row.appendChild(saveButton);
            row.appendChild(deleteButton);
            productAdminList.appendChild(row);
        });
    }


    function createMetaInput(value, placeholder) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = placeholder;
        input.value = value;
        return input;
    }

    function setStatus(message) {
        productsGrid.innerHTML = `<p class="loading-message">${message}</p>`;
    }

    function formatFileName(filename) {
        return filename
            .replace(/\.[^/.]+$/, '')
            .replace(/[_-]+/g, ' ')
            .trim();
    }

    function loadStoredMetadata() {
        try {
            const raw = window.localStorage.getItem(METADATA_STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (error) {
            console.warn('메타데이터 로드 실패', error);
            return {};
        }
    }

    function saveStoredMetadata() {
        try {
            window.localStorage.setItem(METADATA_STORAGE_KEY, JSON.stringify(PRODUCT_METADATA));
        } catch (error) {
            console.warn('메타데이터 저장 실패', error);
        }
    }

    function setupUploadForm() {
        if (!uploadForm || !fileInput) return;

        uploadForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            try {
                if (!fileInput.files?.length) {
                    alert(t('products.uploadSelect'));
                    return;
                }

                const file = fileInput.files[0];
                
                // 파일 크기 검증 (10MB 제한)
                const maxSize = 10 * 1024 * 1024; // 10MB
                if (file.size > maxSize) {
                    alert('파일 크기가 너무 큽니다. 10MB 이하의 파일만 업로드할 수 있습니다.');
                    return;
                }

                // 파일 형식 검증
                if (!file.type.startsWith('image/')) {
                    alert('이미지 파일만 업로드할 수 있습니다.');
                    return;
                }

                const sanitizedName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '-')}`;
                const storagePath = SUPABASE_FOLDER ? `${SUPABASE_FOLDER}/${sanitizedName}` : sanitizedName;

                toggleUploadButton(true, t('products.uploading'));

                const { data, error } = await supabaseClient
                    .storage
                    .from(SUPABASE_BUCKET)
                    .upload(storagePath, file, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (error) {
                    console.error('업로드 에러 상세:', error);
                    
                    // 에러 메시지 구체화
                    let errorMessage = t('products.uploadFailed');
                    if (error.message) {
                        errorMessage += '\n\n에러: ' + error.message;
                    }
                    if (error.statusCode) {
                        errorMessage += '\n상태 코드: ' + error.statusCode;
                    }
                    
                    // 일반적인 에러 케이스 처리
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
                    toggleUploadButton(false);
                    return;
                }

                const meta = {};
                if (titleInput?.value.trim()) meta.title = titleInput.value.trim();
                if (badgeInput?.value.trim()) meta.badge = badgeInput.value.trim();
                if (priceInput?.value.trim()) meta.price = priceInput.value.trim();
                if (subtitleInput?.value.trim()) meta.subtitle = subtitleInput.value.trim();

                if (Object.keys(meta).length > 0) {
                    PRODUCT_METADATA[sanitizedName] = meta;
                    saveStoredMetadata();
                }

                uploadForm.reset();
                alert(t('products.uploadSuccess'));
                toggleUploadButton(false);
                await loadProducts();
            } catch (err) {
                console.error('예상치 못한 에러 발생:', err);
                alert('업로드 중 예상치 못한 에러가 발생했습니다: ' + (err.message || '알 수 없는 에러'));
                toggleUploadButton(false);
            }
        });
    }

    function toggleUploadButton(disabled, text) {
        if (!uploadButton) return;
        uploadButton.disabled = disabled;
        uploadButton.textContent = text || t('products.addButton');
    }

    function toggleRowButtons(deleteButton, saveButton, disabled) {
        deleteButton.disabled = disabled;
        saveButton.disabled = disabled;
        deleteButton.textContent = disabled ? t('products.deleting') : t('products.delete');
        if (disabled) {
            saveButton.dataset.originalText = saveButton.textContent;
            saveButton.textContent = t('products.processing');
        } else if (saveButton.dataset.originalText) {
            saveButton.textContent = saveButton.dataset.originalText;
            delete saveButton.dataset.originalText;
        }
    }

    function setupProductModal() {
        if (!productModal || !productModalOpen) return;

        let previousBodyOverflow = '';

        const openModal = () => {
            previousBodyOverflow = document.body.style.overflow || '';
            document.body.style.overflow = 'hidden';
            productModal.classList.add('is-active');
            productModal.setAttribute('aria-hidden', 'false');
            productModalClose?.focus();
        };

        const closeModal = () => {
            productModal.classList.remove('is-active');
            productModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = previousBodyOverflow;
        };

        const handleKeydown = (event) => {
            if (event.key === 'Escape' && productModal.classList.contains('is-active')) {
                closeModal();
            }
        };

        productModalOpen.addEventListener('click', openModal);
        productModalClose?.addEventListener('click', closeModal);
        productModalOverlay?.addEventListener('click', closeModal);
        document.addEventListener('keydown', handleKeydown);
    }

    function setupSlider() {
        if (!productsSliderPrev || !productsSliderNext) return;

        // 반응형으로 itemsPerSlide 조정 (카드 너비 220px + gap 기준)
        function updateItemsPerSlide() {
            if (!productsGrid) return;
            
            const container = productsGrid.parentElement;
            if (!container) return;
            
            const containerWidth = container.offsetWidth;
            const cardWidth = 220; // 고정된 카드 너비
            const gap = window.innerWidth <= 768 ? 20 : 30;
            
            // 컨테이너 너비에 맞춰 표시 가능한 개수 계산
            const availableWidth = containerWidth;
            const itemsThatFit = Math.floor((availableWidth + gap) / (cardWidth + gap));
            
            // 최소 1개, 최대 5개
            itemsPerSlide = Math.max(1, Math.min(itemsThatFit, 5));
        }

        if (productsGrid) {
            updateItemsPerSlide();
        }
        
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                updateItemsPerSlide();
                currentSlideIndex = 0;
                updateSliderPosition();
                if (productsGrid) {
                    const cards = productsGrid.querySelectorAll('.product-card');
                    updateSliderButtons(cards.length);
                }
            }, 150);
        });

        productsSliderPrev.addEventListener('click', () => {
            if (currentSlideIndex > 0) {
                currentSlideIndex--;
                updateSliderPosition();
                updateSliderButtons(productsGrid?.querySelectorAll('.product-card').length || 0);
            }
            // 수동 클릭 시 자동 슬라이드 재시작
            resetAutoSlide();
        });

        productsSliderNext.addEventListener('click', () => {
            if (productsGrid) {
                const totalCards = productsGrid.querySelectorAll('.product-card').length;
                const maxSlides = Math.ceil(totalCards / itemsPerSlide);
                if (currentSlideIndex < maxSlides - 1) {
                    currentSlideIndex++;
                    updateSliderPosition();
                    updateSliderButtons(totalCards);
                }
            }
            // 수동 클릭 시 자동 슬라이드 재시작
            resetAutoSlide();
        });

        // 자동 슬라이드 시작
        startAutoSlide();

        // 마우스 호버 시 자동 슬라이드 일시정지
        const sliderWrapper = productsGrid?.closest('.products-slider-wrapper');
        if (sliderWrapper) {
            sliderWrapper.addEventListener('mouseenter', pauseAutoSlide);
            sliderWrapper.addEventListener('mouseleave', startAutoSlide);
        }
    }

    function startAutoSlide() {
        // 기존 인터벌이 있으면 제거
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
        }

        // 3초마다 자동 슬라이드
        autoSlideInterval = setInterval(() => {
            if (!productsGrid) return;

            const totalCards = productsGrid.querySelectorAll('.product-card').length;
            if (totalCards === 0) return;

            const maxSlides = Math.ceil(totalCards / itemsPerSlide);
            
            // 다음 슬라이드로 이동
            if (currentSlideIndex < maxSlides - 1) {
                currentSlideIndex++;
            } else {
                // 마지막 슬라이드면 처음으로
                currentSlideIndex = 0;
            }
            
            updateSliderPosition();
            updateSliderButtons(totalCards);
        }, 3000);
    }

    function pauseAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    }

    function resetAutoSlide() {
        pauseAutoSlide();
        startAutoSlide();
    }

    function updateSliderPosition() {
        if (!productsGrid) return;
        
        const cards = productsGrid.querySelectorAll('.product-card');
        if (cards.length === 0) return;

        // 고정된 카드 너비 사용 (CSS에서 설정한 220px)
        const cardWidth = 220;
        // 화면 크기에 따라 gap 조정
        const gap = window.innerWidth <= 768 ? 20 : 30;
        const translateX = -(currentSlideIndex * itemsPerSlide * (cardWidth + gap));
        
        productsGrid.style.transform = `translateX(${translateX}px)`;
    }

    function updateSliderButtons(totalCards) {
        if (!productsSliderPrev || !productsSliderNext) return;

        const maxSlides = Math.ceil(totalCards / itemsPerSlide);
        
        productsSliderPrev.disabled = currentSlideIndex === 0;
        productsSliderNext.disabled = currentSlideIndex >= maxSlides - 1 || totalCards <= itemsPerSlide;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }
    document.addEventListener('sections:ready', bootstrap);
})();

