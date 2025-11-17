-- Supabase 安全清理脚本 - 只删除确实存在的对象

-- 1. 检查并删除触发器（如果存在）
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        DROP TRIGGER on_auth_user_created ON auth.users;
        RAISE NOTICE '触发器 on_auth_user_created 已删除';
    ELSE
        RAISE NOTICE '触发器 on_auth_user_created 不存在，跳过删除';
    END IF;
END $$;

-- 2. 检查并删除触发器函数（如果存在）
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
        DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
        RAISE NOTICE '函数 handle_new_user 已删除';
    ELSE
        RAISE NOTICE '函数 handle_new_user 不存在，跳过删除';
    END IF;
END $$;

-- 3. 检查并删除表（如果存在）
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_movies') THEN
        DROP TABLE user_movies CASCADE;
        RAISE NOTICE '表 user_movies 已删除';
    ELSE
        RAISE NOTICE '表 user_movies 不存在，跳过删除';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'movies') THEN
        DROP TABLE movies CASCADE;
        RAISE NOTICE '表 movies 已删除';
    ELSE
        RAISE NOTICE '表 movies 不存在，跳过删除';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        DROP TABLE profiles CASCADE;
        RAISE NOTICE '表 profiles 已删除';
    ELSE
        RAISE NOTICE '表 profiles 不存在，跳过删除';
    END IF;
END $$;

-- 4. 检查并删除策略（如果存在）
DO $$ 
BEGIN
    -- profiles 表策略
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = '任何人都可以查看用户资料' AND tablename = 'profiles') THEN
        DROP POLICY "任何人都可以查看用户资料" ON profiles;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = '用户只能更新自己的资料' AND tablename = 'profiles') THEN
        DROP POLICY "用户只能更新自己的资料" ON profiles;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = '用户只能插入自己的资料' AND tablename = 'profiles') THEN
        DROP POLICY "用户只能插入自己的资料" ON profiles;
    END IF;
    
    -- movies 表策略
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = '任何人都可以查看电影' AND tablename = 'movies') THEN
        DROP POLICY "任何人都可以查看电影" ON movies;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = '认证用户可以创建电影' AND tablename = 'movies') THEN
        DROP POLICY "认证用户可以创建电影" ON movies;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = '任何人都可以更新电影' AND tablename = 'movies') THEN
        DROP POLICY "任何人都可以更新电影" ON movies;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = '任何人都可以删除电影' AND tablename = 'movies') THEN
        DROP POLICY "任何人都可以删除电影" ON movies;
    END IF;
    
    -- user_movies 表策略
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = '用户只能查看自己的电影记录' AND tablename = 'user_movies') THEN
        DROP POLICY "用户只能查看自己的电影记录" ON user_movies;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = '用户只能创建自己的电影记录' AND tablename = 'user_movies') THEN
        DROP POLICY "用户只能创建自己的电影记录" ON user_movies;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = '用户只能更新自己的电影记录' AND tablename = 'user_movies') THEN
        DROP POLICY "用户只能更新自己的电影记录" ON user_movies;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = '用户只能删除自己的电影记录' AND tablename = 'user_movies') THEN
        DROP POLICY "用户只能删除自己的电影记录" ON user_movies;
    END IF;
    
    RAISE NOTICE '所有策略清理完成';
END $$;

-- 5. 禁用行级安全策略（如果启用）
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'movies') THEN
        ALTER TABLE movies DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_movies') THEN
        ALTER TABLE user_movies DISABLE ROW LEVEL SECURITY;
    END IF;
END $$;

SELECT '安全清理完成！现在可以执行简化版脚本了。' as status;