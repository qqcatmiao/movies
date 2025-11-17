// Supabase配置
const SUPABASE_URL = 'https://jpymroeqkzjpzrsbdstw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpweW1yb2Vxa3pqcHpyc2Jkc3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMzE1OTMsImV4cCI6MjA3ODkwNzU5M30.uq25Y6l807oURIDv9ww5h38HNY_8urAdP3G9d1V4iuc';

// 初始化Supabase客户端
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 导出配置
window.supabaseConfig = {
    supabase: supabase,
    SUPABASE_URL: SUPABASE_URL,
    SUPABASE_ANON_KEY: SUPABASE_ANON_KEY
};

console.log('Supabase配置已加载 - 项目: movie-watchlist-new');