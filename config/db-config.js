/**
 * Supabase 데이터베이스 설정
 * 보안을 위해 이 파일은 .gitignore에 추가하는 것을 권장합니다.
 * 프로덕션 환경에서는 환경 변수를 사용하세요.
 */
const DB_CONFIG = {
    SUPABASE_URL: 'https://nnieuiiisxecakiecjyp.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uaWV1aWlpc3hlY2FraWVjanlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NDg4NTYsImV4cCI6MjA2MDAyNDg1Nn0.41jXCY2aj241ESJyJtRlUp11X37eK_9ArKF93r_HZrE',
    SUPABASE_BUCKET: 'mjcare-image',
    SUPABASE_FOLDER: 'home/home',
    SIGNED_URL_TTL: 3600,
    METADATA_STORAGE_KEY: 'mjcare-product-metadata'
};

// 전역에서 사용할 수 있도록 export (IIFE 패턴 사용 시)
if (typeof window !== 'undefined') {
    window.DB_CONFIG = DB_CONFIG;
}

