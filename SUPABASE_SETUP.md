# Supabase 项目配置指南

## 1. 创建 Supabase 项目

1. 访问 [Supabase官网](https://supabase.com)
2. 注册/登录账户
3. 点击 "New Project" 创建新项目
4. 填写项目信息：
   - **Name**: movie-watchlist
   - **Database Password**: 设置一个安全的密码
   - **Region**: 选择离您最近的区域（如 ap-southeast-1）
5. 点击 "Create new project"

## 2. 获取项目配置信息

项目创建完成后，进入项目设置页面：
- 左侧菜单栏点击 "Settings"
- 选择 "API" 标签页
- 复制以下信息：
  - **Project URL**: 用于替换 `config.js` 中的 `SUPABASE_URL`
  - **anon/public key**: 用于替换 `SUPABASE_ANON_KEY`

## 3. 数据库表结构创建

### 3.1 启用必要的扩展

在 SQL Editor 中执行：
```sql
-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 3.2 创建 profiles 表

```sql
-- 创建用户信息扩展表
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON profiles(created_at);

-- 启用行级安全策略
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看其他用户的公开信息
CREATE POLICY "任何人都可以查看用户资料" ON profiles
    FOR SELECT USING (true);

-- 用户只能更新自己的资料
CREATE POLICY "用户只能更新自己的资料" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- 用户只能插入自己的资料
CREATE POLICY "用户只能插入自己的资料" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
```

### 3.3 创建 movies 表

```sql
-- 创建电影信息表
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

-- 创建索引
CREATE INDEX IF NOT EXISTS movies_title_idx ON movies(title);
CREATE INDEX IF NOT EXISTS movies_director_idx ON movies(director);
CREATE INDEX IF NOT EXISTS movies_release_year_idx ON movies(release_year);
CREATE INDEX IF NOT EXISTS movies_created_by_idx ON movies(created_by);
CREATE INDEX IF NOT EXISTS movies_created_at_idx ON movies(created_at);

-- 启用行级安全策略
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;

-- 创建策略：任何人都可以查看电影
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
```

### 3.4 创建 user_movies 表

```sql
-- 创建用户电影关系表
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

-- 创建索引
CREATE INDEX IF NOT EXISTS user_movies_user_id_idx ON user_movies(user_id);
CREATE INDEX IF NOT EXISTS user_movies_movie_id_idx ON user_movies(movie_id);
CREATE INDEX IF NOT EXISTS user_movies_status_idx ON user_movies(status);
CREATE INDEX IF NOT EXISTS user_movies_rating_idx ON user_movies(rating);
CREATE INDEX IF NOT EXISTS user_movies_created_at_idx ON user_movies(created_at);

-- 启用行级安全策略
ALTER TABLE user_movies ENABLE ROW LEVEL SECURITY;

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
```

### 3.5 创建触发器函数

```sql
-- 创建更新时间戳触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为每个表创建触发器
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_movies_updated_at BEFORE UPDATE ON movies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_movies_updated_at BEFORE UPDATE ON user_movies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建用户注册后自动创建profile的触发器
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
```

## 4. 更新项目配置

将 `config.js` 中的占位符替换为实际的 Supabase 项目信息：

```javascript
const SUPABASE_URL = 'https://your-actual-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-actual-anon-key';
```

## 5. 测试连接

在浏览器中打开项目，检查控制台是否有连接错误。如果一切正常，您应该能够：
- 注册新用户
- 登录现有用户
- 查看和操作电影数据

## 6. 后续步骤

1. **添加示例数据**：在 SQL Editor 中插入一些示例电影数据
2. **配置身份验证设置**：在 Supabase 控制台的 Authentication 设置中配置重定向URL等
3. **设置存储桶**：如果需要上传用户头像或电影海报，需要配置存储桶

## 故障排除

- **连接错误**：检查 URL 和密钥是否正确
- **权限错误**：确保 RLS 策略配置正确
- **表不存在**：确认 SQL 已成功执行

需要帮助时，请参考 [Supabase文档](https://supabase.com/docs)。