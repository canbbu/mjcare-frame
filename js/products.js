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

    const productsGrid = document.getElementById('productsGrid');
    const productAdminList = document.getElementById('productAdminList');
    const uploadForm = document.getElementById('productUploadForm');
    const fileInput = document.getElementById('productFile');
    const titleInput = document.getElementById('productTitle');
    const badgeInput = document.getElementById('productBadge');
    const priceInput = document.getElementById('productPrice');
    const subtitleInput = document.getElementById('productSubtitle');
    const uploadButton = document.getElementById('uploadButton');
    const productModal = document.getElementById('productModal');
    const productModalOpen = document.getElementById('productModalOpen');
    const productModalClose = document.getElementById('productModalClose');
    const productModalOverlay = document.getElementById('productModalOverlay');

    if (!productsGrid) {
        return;
    }

    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // 초기화
    init();

    function init() {
        loadProducts();
        setupUploadForm();
        setupProductModal();
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
            console.warn('Supabase 로드 실패 (CORS 또는 네트워크 문제). 샘플 데이터를 표시합니다.', error);
            // 에러 발생 시 샘플 데이터 표시
            renderProducts(getSampleProducts());
            renderAdminList(getSampleProducts());
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
    }

    function renderAdminList(products) {
        if (!productAdminList) return;

        // ... existing code ...
    }

    /**
     * CORS 에러 시 보여줄 샘플 데이터
     */
    function getSampleProducts() {
        return [
            {
                fileName: 'sample-1.jpg',
                title: '데일리 프레쉬가든 마스크 (진주)',
                badge: 'BEST',
                price: '2,000원',
                subtitle: 'TIME SALE',
                imageUrl: 'https://via.placeholder.com/300x300?text=Sample+Product+1',
                meta: {}
            },
            {
                fileName: 'sample-2.jpg',
                title: 'SKIN PLANET 프레쉬가든 (로얄젤리)',
                badge: 'NEW',
                price: '2,000원',
                subtitle: '',
                imageUrl: 'https://via.placeholder.com/300x300?text=Sample+Product+2',
                meta: {}
            },
            {
                fileName: 'sample-3.jpg',
                title: 'MJCARE 시트 마스크 (알로에)',
                badge: 'HOT',
                price: '1,500원',
                subtitle: 'Sold Out',
                imageUrl: 'https://via.placeholder.com/300x300?text=Sample+Product+3',
                meta: {}
            }
        ];
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
            if (!fileInput.files?.length) {
                alert(t('products.uploadSelect'));
                return;
            }

            const file = fileInput.files[0];
            const sanitizedName = `${Date.now()}-${file.name}`.replace(/\s+/g, '-');
            const storagePath = SUPABASE_FOLDER ? `${SUPABASE_FOLDER}/${sanitizedName}` : sanitizedName;

            toggleUploadButton(true, t('products.uploading'));

            const { error } = await supabaseClient
                .storage
                .from(SUPABASE_BUCKET)
                .upload(storagePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error(error);
                alert(t('products.uploadFailed'));
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
})();

