/**
 * 다국어 번역 데이터
 * 한국어(ko), 일본어(ja), 영어(en) 지원
 */
const TRANSLATIONS = {
    ko: {
        // 네비게이션
        nav: {
            about: 'ABOUT US',
            business: 'BUSINESS',
            production: 'PRODUCTION FACILITY',
            brand: 'BRAND',
            contact: 'CONTACT US',
            shop: 'SHOP'
        },
        // 히어로 섹션
        hero: {
            global: 'GLOBAL',
            companyName: 'MIJIN COSMETICS',
            description1: '미진화장품은 시트 마스크팩 제조 및 판매,',
            description2: 'OEM/ODM 전문기업으로서 국내외 유통망을 통해',
            description3: '전세계의 고객들에게 다가가고 있습니다.'
        },
        // About 섹션
        about: {
            title1: '최고의 아름다움을',
            title2: '이끌어내는 미진화장품',
            subtitle: 'MIJIN COSMETICS brings out the best beauty',
            more: 'more'
        },
        // Solutions 섹션
        solutions: {
            title1: '트렌드에 맞춘',
            title2: '맞춤형 솔루션',
            subtitle: 'Customized solutions for trends',
            certification: '인증 취득'
        },
        // Products 섹션
        products: {
            title: 'Monthly product',
            subtitle: '수분크림을 듬뿍 바른 듯한 사용감의 크림 마스크',
            loading: '제품 정보를 불러오는 중입니다...',
            noProducts: '등록된 제품 이미지가 없습니다.',
            loadError: '제품 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
            noDisplayable: '표시할 수 있는 제품 이미지가 없습니다.',
            addManage: '제품 추가 / 관리',
            addImage: '제품 이미지 추가',
            productImage: '제품 이미지',
            productName: '제품명 (선택)',
            productNamePlaceholder: '예: 신제품 마스크팩',
            badge: '배지 (선택)',
            badgePlaceholder: '예: BEST',
            price: '가격 (선택)',
            pricePlaceholder: '예: 2,000원',
            subtitleText: '서브텍스트 (선택)',
            subtitlePlaceholder: '예: TIME SALE',
            addButton: '이미지 추가',
            uploadNote: '※ 파일명은 자동으로 카드 제목에 반영되며, 입력한 상세 정보는 이번 세션에서만 표시됩니다.',
            manage: '제품 관리 (수정 / 삭제)',
            metaTitle: '제목',
            metaBadge: '배지',
            metaPrice: '가격',
            metaSubtitle: '서브텍스트',
            saveMeta: '메타 저장',
            delete: '삭제',
            metaSaved: '메타 정보가 저장되었습니다.',
            deleteConfirm: '정말로 삭제하시겠습니까?',
            deleteFailed: '삭제에 실패했습니다. 콘솔 로그를 확인해주세요.',
            deleteSuccess: '삭제가 완료되었습니다.',
            uploadSelect: '업로드할 이미지를 선택해주세요.',
            uploading: '업로드 중...',
            uploadFailed: '업로드에 실패했습니다. 콘솔 로그를 확인해주세요.',
            uploadSuccess: '업로드가 완료되었습니다. 목록을 새로 불러옵니다.',
            deleting: '삭제 중...',
            processing: '처리 중...',
            modalClose: '제품 관리 팝업 닫기'
        },
        // Footer
        footer: {
            companyInfo: '회사 정보',
            companyName: '회사명',
            companyNameValue: '(주)미진화장품',
            ceo: '대표자',
            ceoValue: '장원표',
            address: '주소',
            addressValue: '경상북도 구미시 1공단로 6길 53-45',
            businessNumber: '사업자등록번호',
            businessNumberValue: '264-81-51849',
            salesNumber: '통신판매업신고 번호',
            salesNumberValue: '제2011-경북구미-0026호',
            email: '이메일',
            copyright: 'COPYRIGHT MIJIN COSMETICS. ALL RIGHTS RESERVED.',
            quickLinks: '빠른 링크',
            csCenter: 'CS CENTER',
            phone: '054.461.8081',
            weekday: '평일',
            weekdayHours: '09:00 - 18:00',
            lunch: '점심시간',
            lunchHours: '13:00 - 14:00',
            closed: '휴무안내',
            closedDays: '토, 일, 공휴일',
            weekendNote: '*주말 및 공휴일에는 1:1문의로 남겨주세요',
            terms: '이용약관',
            privacy: '개인정보처리방침'
        }
    },
    ja: {
        nav: {
            about: 'ABOUT US',
            business: 'BUSINESS',
            production: 'PRODUCTION FACILITY',
            brand: 'BRAND',
            contact: 'CONTACT US',
            shop: 'SHOP'
        },
        hero: {
            global: 'GLOBAL',
            companyName: 'MIJIN COSMETICS',
            description1: 'ミジン化粧品はシートマスクパックの製造・販売、',
            description2: 'OEM/ODM専門企業として国内外の流通網を通じて',
            description3: '世界中のお客様にアプローチしています。'
        },
        about: {
            title1: '最高の美しさを',
            title2: '引き出すミジン化粧品',
            subtitle: 'MIJIN COSMETICS brings out the best beauty',
            more: 'more'
        },
        solutions: {
            title1: 'トレンドに合わせた',
            title2: 'カスタマイズソリューション',
            subtitle: 'Customized solutions for trends',
            certification: '認証取得'
        },
        products: {
            title: 'Monthly product',
            subtitle: 'クリームをたっぷり塗ったような使用感のクリームマスク',
            loading: '製品情報を読み込んでいます...',
            noProducts: '登録された製品画像がありません。',
            loadError: '製品情報を読み込めませんでした。しばらくしてから再度お試しください。',
            noDisplayable: '表示できる製品画像がありません。',
            addManage: '製品追加 / 管理',
            addImage: '製品画像追加',
            productImage: '製品画像',
            productName: '製品名（任意）',
            productNamePlaceholder: '例：新製品マスクパック',
            badge: 'バッジ（任意）',
            badgePlaceholder: '例：BEST',
            price: '価格（任意）',
            pricePlaceholder: '例：2,000円',
            subtitleText: 'サブテキスト（任意）',
            subtitlePlaceholder: '例：TIME SALE',
            addButton: '画像追加',
            uploadNote: '※ファイル名は自動的にカードタイトルに反映され、入力した詳細情報はこのセッションでのみ表示されます。',
            manage: '製品管理（編集 / 削除）',
            metaTitle: 'タイトル',
            metaBadge: 'バッジ',
            metaPrice: '価格',
            metaSubtitle: 'サブテキスト',
            saveMeta: 'メタ保存',
            delete: '削除',
            metaSaved: 'メタ情報が保存されました。',
            deleteConfirm: '本当に削除しますか？',
            deleteFailed: '削除に失敗しました。コンソールログを確認してください。',
            deleteSuccess: '削除が完了しました。',
            uploadSelect: 'アップロードする画像を選択してください。',
            uploading: 'アップロード中...',
            uploadFailed: 'アップロードに失敗しました。コンソールログを確認してください。',
            uploadSuccess: 'アップロードが完了しました。リストを再読み込みします。',
            deleting: '削除中...',
            processing: '処理中...',
            modalClose: '製品管理ポップアップを閉じる'
        },
        footer: {
            companyInfo: '会社情報',
            companyName: '会社名',
            companyNameValue: '（株）ミジン化粧品',
            ceo: '代表者',
            ceoValue: '장원표',
            address: '住所',
            addressValue: '경상북도 구미시 1공단로 6길 53-45',
            businessNumber: '事業者登録番号',
            businessNumberValue: '264-81-51849',
            salesNumber: '通信販売業届出番号',
            salesNumberValue: '제2011-경북구미-0026호',
            email: 'メール',
            copyright: 'COPYRIGHT MIJIN COSMETICS. ALL RIGHTS RESERVED.',
            quickLinks: 'クイックリンク',
            csCenter: 'CS CENTER',
            phone: '054.461.8081',
            weekday: '平日',
            weekdayHours: '09:00 - 18:00',
            lunch: '昼休み',
            lunchHours: '13:00 - 14:00',
            closed: '休業案内',
            closedDays: '土、日、祝日',
            weekendNote: '*週末および祝日は1:1お問い合わせでお願いします',
            terms: '利用規約',
            privacy: '個人情報処理方針'
        }
    },
    en: {
        nav: {
            about: 'ABOUT US',
            business: 'BUSINESS',
            production: 'PRODUCTION FACILITY',
            brand: 'BRAND',
            contact: 'CONTACT US',
            shop: 'SHOP'
        },
        hero: {
            global: 'GLOBAL',
            companyName: 'MIJIN COSMETICS',
            description1: 'MIJIN COSMETICS manufactures and sells sheet mask packs,',
            description2: 'and as an OEM/ODM specialized company, we reach out to',
            description3: 'customers worldwide through domestic and international distribution networks.'
        },
        about: {
            title1: 'MIJIN COSMETICS',
            title2: 'Bringing Out the Best Beauty',
            subtitle: 'MIJIN COSMETICS brings out the best beauty',
            more: 'more'
        },
        solutions: {
            title1: 'Customized Solutions',
            title2: 'for Trends',
            subtitle: 'Customized solutions for trends',
            certification: 'Certification Acquired'
        },
        products: {
            title: 'Monthly product',
            subtitle: 'Cream mask with a rich, creamy texture like applying moisturizer',
            loading: 'Loading product information...',
            noProducts: 'No product images registered.',
            loadError: 'Failed to load product information. Please try again later.',
            noDisplayable: 'No displayable product images.',
            addManage: 'Add / Manage Products',
            addImage: 'Add Product Image',
            productImage: 'Product Image',
            productName: 'Product Name (Optional)',
            productNamePlaceholder: 'e.g.: New Mask Pack',
            badge: 'Badge (Optional)',
            badgePlaceholder: 'e.g.: BEST',
            price: 'Price (Optional)',
            pricePlaceholder: 'e.g.: $20',
            subtitleText: 'Subtitle (Optional)',
            subtitlePlaceholder: 'e.g.: TIME SALE',
            addButton: 'Add Image',
            uploadNote: '※ File name is automatically reflected in the card title, and detailed information entered is displayed only in this session.',
            manage: 'Product Management (Edit / Delete)',
            metaTitle: 'Title',
            metaBadge: 'Badge',
            metaPrice: 'Price',
            metaSubtitle: 'Subtitle',
            saveMeta: 'Save Meta',
            delete: 'Delete',
            metaSaved: 'Meta information has been saved.',
            deleteConfirm: 'Are you sure you want to delete?',
            deleteFailed: 'Deletion failed. Please check the console log.',
            deleteSuccess: 'Deletion completed.',
            uploadSelect: 'Please select an image to upload.',
            uploading: 'Uploading...',
            uploadFailed: 'Upload failed. Please check the console log.',
            uploadSuccess: 'Upload completed. Reloading the list.',
            deleting: 'Deleting...',
            processing: 'Processing...',
            modalClose: 'Close product management popup'
        },
        footer: {
            companyInfo: 'Company Information',
            companyName: 'Company Name',
            companyNameValue: 'MIJIN COSMETICS Co., Ltd.',
            ceo: 'CEO',
            ceoValue: 'Jang Won Pyo',
            address: 'Address',
            addressValue: '53-45, 1 Gongdan-ro 6-gil, Gumi-si, Gyeongsangbuk-do',
            businessNumber: 'Business Registration Number',
            businessNumberValue: '264-81-51849',
            salesNumber: 'Online Sales Registration Number',
            salesNumberValue: 'No. 2011-Gyeongbuk-Gumi-0026',
            email: 'Email',
            copyright: 'COPYRIGHT MIJIN COSMETICS. ALL RIGHTS RESERVED.',
            quickLinks: 'Quick Links',
            csCenter: 'CS CENTER',
            phone: '054.461.8081',
            weekday: 'Weekdays',
            weekdayHours: '09:00 - 18:00',
            lunch: 'Lunch Break',
            lunchHours: '13:00 - 14:00',
            closed: 'Closed',
            closedDays: 'Sat, Sun, Holidays',
            weekendNote: '*Please leave a 1:1 inquiry on weekends and holidays',
            terms: 'Terms of Service',
            privacy: 'Privacy Policy'
        }
    }
};

// 전역에서 사용할 수 있도록 export
if (typeof window !== 'undefined') {
    window.TRANSLATIONS = TRANSLATIONS;
}

