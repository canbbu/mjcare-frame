/**
 * Supabase 데이터베이스 설정
 * 보안을 위해 이 파일은 .gitignore에 추가하는 것을 권장합니다.
 * 프로덕션 환경에서는 환경 변수를 사용하세요.
 */
const DB_CONFIG = {
    SUPABASE_URL: 'https://iyjftcdacscaixbehxro.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5amZ0Y2RhY3NjYWl4YmVoeHJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMzk2NTIsImV4cCI6MjA3OTcxNTY1Mn0.OSy7BAll0xwvOY6mxOTeHuCmIJ0f6Bm9HRmr0F3rOYk',
    SUPABASE_BUCKET: 'mjcare-image',
    SUPABASE_FOLDER: 'home/home',
    SIGNED_URL_TTL: 3600,
    METADATA_STORAGE_KEY: 'mjcare-product-metadata'
};

// 전역에서 사용할 수 있도록 export (IIFE 패턴 사용 시)
if (typeof window !== 'undefined') {
    window.DB_CONFIG = DB_CONFIG;
}

