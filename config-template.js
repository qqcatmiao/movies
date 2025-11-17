// Supabase配置模板
// 请将以下信息替换为您的实际项目信息

// 步骤1：从 Supabase 项目设置中获取以下信息
const SUPABASE_URL = 'https://your-project-id.supabase.co'; // 替换为您的 Project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // 替换为您的 anon key

// 步骤2：初始化Supabase客户端
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 步骤3：导出配置
window.supabaseConfig = {
    supabase: supabase,
    SUPABASE_URL: SUPABASE_URL,
    SUPABASE_ANON_KEY: SUPABASE_ANON_KEY
};

console.log('Supabase配置已加载');