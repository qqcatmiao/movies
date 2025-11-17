# 观影清单 - Movie Watchlist

一个基于 Supabase 和 Netlify 的现代化观影清单平台，支持电影收藏、评分和社交发现功能。

## 功能特性

- 🎬 **电影管理**：添加、收藏、评分电影
- 🔍 **发现功能**：浏览最新热门电影
- 👥 **社交功能**：查看其他用户的观影记录
- ⭐ **评分系统**：1-5星评分和评论
- 📱 **响应式设计**：支持桌面和移动设备

## 技术栈

- **前端**：HTML5, CSS3, JavaScript (ES6+)
- **后端**：Supabase (数据库、认证、存储)
- **部署**：Netlify
- **UI框架**：自定义CSS设计

## 项目结构

```
/movies
├── index.html          # 首页/发现页面
├── movie.html          # 电影详情页面
├── profile.html        # 个人中心页面
├── index.js            # 首页逻辑
├── movie.js           # 电影详情页逻辑
├── profile.js         # 个人中心页逻辑
├── auth.js            # 认证管理
├── config.js          # Supabase配置
├── styles.css         # 样式文件
├── package.json       # 项目配置
└── netlify.toml       # Netlify部署配置
```

## Supabase 数据库设置

### 1. 创建Supabase项目

1. 访问 [supabase.com](https://supabase.com) 并注册账号
2. 创建新项目，选择合适的地域
3. 记录项目URL和anon key

### 2. 创建数据库表

在SQL编辑器中执行以下SQL语句：

```sql
-- profiles表 (用户扩展信息)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- movies表 (电影信息)
CREATE TABLE movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  director TEXT,
  release_year INTEGER,
  description TEXT,
  poster_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- user_movies表 (用户电影关系)
CREATE TABLE user_movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  movie_id UUID REFERENCES movies(id) NOT NULL,
  status TEXT CHECK (status IN ('want_to_watch', 'watched', 'favorite')) NOT NULL,
  rating INTEGER CHECK (rating >= 0 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);

-- 启用RLS (行级安全)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_movies ENABLE ROW LEVEL SECURITY;

-- profiles表策略
CREATE POLICY "用户可以查看所有用户资料" ON profiles FOR SELECT USING (true);
CREATE POLICY "用户可以更新自己的资料" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "用户可以插入自己的资料" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- movies表策略
CREATE POLICY "用户可以查看所有电影" ON movies FOR SELECT USING (true);
CREATE POLICY "用户可以插入电影" ON movies FOR INSERT WITH CHECK (auth.uid() = created_by);

-- user_movies表策略
CREATE POLICY "用户可以查看所有用户电影关系" ON user_movies FOR SELECT USING (true);
CREATE POLICY "用户只能管理自己的电影关系" ON user_movies FOR ALL USING (auth.uid() = user_id);
```

### 3. 配置环境变量

在项目根目录的 `config.js` 文件中替换以下配置：

```javascript
const SUPABASE_URL = '你的Supabase项目URL';
const SUPABASE_ANON_KEY = '你的Supabase anon key';
```

## 本地开发

1. 克隆项目到本地
2. 安装依赖：`npm install`
3. 启动开发服务器：`npm run dev`
4. 访问 http://localhost:3000

## 部署到Netlify

### 方法一：通过Git部署

1. 将项目推送到GitHub仓库
2. 登录 [Netlify](https://netlify.com)
3. 选择"New site from Git"
4. 选择你的仓库
5. 构建设置：
   - Build command: `npm run build`
   - Publish directory: `.`
6. 点击"Deploy site"

### 方法二：拖拽部署

1. 将所有文件打包成ZIP
2. 登录Netlify，拖拽ZIP文件到部署区域
3. 等待部署完成

## 使用说明

1. **注册/登录**：点击右上角登录按钮创建账户
2. **浏览电影**：在首页发现最新和热门电影
3. **添加电影**：在电影详情页可以添加电影到不同清单
4. **管理清单**：在个人中心查看和管理"想看"、"已看"、"收藏"清单
5. **评分评论**：为看过的电影评分和写评论

## 功能页面

### 首页 (/)
- 展示最新添加的电影
- 热门电影推荐
- 搜索功能
- 用户观影动态

### 电影详情页 (/movie.html?id=)
- 电影基本信息展示
- 评分和评论功能
- 添加到不同清单
- 查看其他用户评论

### 个人中心 (/profile.html)
- 用户信息展示和编辑
- 三个清单管理
- 观影统计数据
- 个人观影历史

## 提交要求

1. **Netlify部署地址**：部署完成后获得的URL
2. **Supabase数据库截图**：三张表的结构截图

## 注意事项

- 确保Supabase项目启用了邮箱认证
- 首次注册后需要验证邮箱
- 部署前确认config.js中的配置正确
- 建议使用自定义域名提升专业度

## 技术亮点

- **现代化UI设计**：采用渐变背景和卡片式布局
- **响应式布局**：适配各种屏幕尺寸
- **实时数据同步**：基于Supabase的实时数据库
- **安全认证**：基于Supabase Auth的完整认证流程
- **性能优化**：懒加载图片和分页加载

## 扩展建议

- 添加电影推荐算法
- 集成电影API自动获取信息
- 增加社交关注功能
- 添加观影统计图表
- 支持多语言

---

**开发者**：学生作业项目  
**技术栈**：HTML + CSS + JavaScript + Supabase + Netlify  
**许可证**：MIT