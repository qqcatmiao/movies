-- Supabase 观影清单项目数据库初始化脚本
-- 请复制此脚本到 Supabase 的 SQL Editor 中执行

-- 1. 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 创建 profiles 表（用户扩展信息）
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 为 profiles 表创建索引
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON profiles(created_at);

-- 3. 创建 movies 表（电影信息表）
CREATE TABLE IF NOT EXISTS movies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    director TEXT NOT NULL,
    release_year INTEGER NOT NULL,
    description TEXT,
    poster_url TEXT,
    created_by UUID REFERENCES auth.users ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 添加约束
    CONSTRAINT valid_release_year CHECK (release_year >= 1888 AND release_year <= EXTRACT(YEAR FROM NOW()) + 5),
    CONSTRAINT valid_title CHECK (char_length(title) >= 1 AND char_length(title) <= 200)
);

-- 为 movies 表创建索引
CREATE INDEX IF NOT EXISTS movies_title_idx ON movies(title);
CREATE INDEX IF NOT EXISTS movies_director_idx ON movies(director);
CREATE INDEX IF NOT EXISTS movies_release_year_idx ON movies(release_year);
CREATE INDEX IF NOT EXISTS movies_created_by_idx ON movies(created_by);
CREATE INDEX IF NOT EXISTS movies_created_at_idx ON movies(created_at);

-- 4. 创建 user_movies 表（用户电影关系表）
CREATE TABLE IF NOT EXISTS user_movies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    movie_id UUID REFERENCES movies ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('want_to_watch', 'watched', 'favorite')),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 唯一约束：一个用户对同一部电影只能有一个记录
    UNIQUE(user_id, movie_id)
);

-- 为 user_movies 表创建索引
CREATE INDEX IF NOT EXISTS user_movies_user_id_idx ON user_movies(user_id);
CREATE INDEX IF NOT EXISTS user_movies_movie_id_idx ON user_movies(movie_id);
CREATE INDEX IF NOT EXISTS user_movies_status_idx ON user_movies(status);
CREATE INDEX IF NOT EXISTS user_movies_rating_idx ON user_movies(rating);
CREATE INDEX IF NOT EXISTS user_movies_created_at_idx ON user_movies(created_at);

-- 5. 创建更新时间戳触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为每个表创建更新时间戳触发器
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_movies_updated_at BEFORE UPDATE ON movies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_movies_updated_at BEFORE UPDATE ON user_movies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. 创建用户注册后自动创建profile的触发器
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7. 启用行级安全策略 (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_movies ENABLE ROW LEVEL SECURITY;

-- 8. 创建 profiles 表的 RLS 策略
-- 任何人都可以查看用户资料
CREATE POLICY "任何人都可以查看用户资料" ON profiles
    FOR SELECT USING (true);

-- 用户只能更新自己的资料
CREATE POLICY "用户只能更新自己的资料" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- 用户只能插入自己的资料
CREATE POLICY "用户只能插入自己的资料" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 9. 创建 movies 表的 RLS 策略
-- 任何人都可以查看电影
CREATE POLICY "任何人都可以查看电影" ON movies
    FOR SELECT USING (true);

-- 认证用户可以创建电影
CREATE POLICY "认证用户可以创建电影" ON movies
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 用户只能更新自己创建的电影
CREATE POLICY "用户只能更新自己创建的电影" ON movies
    FOR UPDATE USING (auth.uid() = created_by);

-- 用户只能删除自己创建的电影
CREATE POLICY "用户只能删除自己创建的电影" ON movies
    FOR DELETE USING (auth.uid() = created_by);

-- 10. 创建 user_movies 表的 RLS 策略
-- 用户只能查看自己的电影记录
CREATE POLICY "用户只能查看自己的电影记录" ON user_movies
    FOR SELECT USING (auth.uid() = user_id);

-- 用户只能创建自己的电影记录
CREATE POLICY "用户只能创建自己的电影记录" ON user_movies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的电影记录
CREATE POLICY "用户只能更新自己的电影记录" ON user_movies
    FOR UPDATE USING (auth.uid() = user_id);

-- 用户只能删除自己的电影记录
CREATE POLICY "用户只能删除自己的电影记录" ON user_movies
    FOR DELETE USING (auth.uid() = user_id);

-- 11. 插入示例电影数据（可选）
INSERT INTO movies (title, director, release_year, description, poster_url) VALUES
('肖申克的救赎', '弗兰克·德拉邦特', 1994, '银行家安迪被冤枉杀害妻子及其情人，被判无期徒刑，在肖申克监狱中，他凭借自己的知识和毅力，最终成功越狱并获得自由。', 'https://example.com/poster1.jpg'),
('阿甘正传', '罗伯特·泽米吉斯', 1994, '先天智障的小镇男孩福瑞斯特·甘自强不息，最终在多个领域创造奇迹的励志故事。', 'https://example.com/poster2.jpg'),
('泰坦尼克号', '詹姆斯·卡梅隆', 1997, '穷画家杰克和贵族女露丝在泰坦尼克号上相遇相爱，最终随着巨轮沉没而永别的爱情故事。', 'https://example.com/poster3.jpg'),
('盗梦空间', '克里斯托弗·诺兰', 2010, '盗梦者柯布带领团队进入他人梦境，植入思想，展开一场惊心动魄的科幻冒险。', 'https://example.com/poster4.jpg'),
('星际穿越', '克里斯托弗·诺兰', 2014, '一组宇航员穿越虫洞，为人类寻找新家园的太空探索故事。', 'https://example.com/poster5.jpg');

-- 执行完成提示
SELECT '数据库初始化完成！' as status;