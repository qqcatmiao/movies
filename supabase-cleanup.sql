-- Supabase 清理脚本 - 删除现有对象，然后重新创建

-- 1. 删除触发器（如果存在）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. 删除触发器函数（如果存在）
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 3. 删除表（如果存在）
DROP TABLE IF EXISTS user_movies CASCADE;
DROP TABLE IF EXISTS movies CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 4. 清理策略（如果存在）
DROP POLICY IF EXISTS "任何人都可以查看用户资料" ON profiles;
DROP POLICY IF EXISTS "用户只能更新自己的资料" ON profiles;
DROP POLICY IF EXISTS "用户只能插入自己的资料" ON profiles;

DROP POLICY IF EXISTS "任何人都可以查看电影" ON movies;
DROP POLICY IF EXISTS "认证用户可以创建电影" ON movies;
DROP POLICY IF EXISTS "任何人都可以更新电影" ON movies;
DROP POLICY IF EXISTS "任何人都可以删除电影" ON movies;

DROP POLICY IF EXISTS "用户只能查看自己的电影记录" ON user_movies;
DROP POLICY IF EXISTS "用户只能创建自己的电影记录" ON user_movies;
DROP POLICY IF EXISTS "用户只能更新自己的电影记录" ON user_movies;
DROP POLICY IF EXISTS "用户只能删除自己的电影记录" ON user_movies;

-- 5. 禁用行级安全策略（如果启用）
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS movies DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_movies DISABLE ROW LEVEL SECURITY;

SELECT '清理完成！现在可以执行简化版脚本了。' as status;