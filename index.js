// 首页功能模块
class HomePage {
    constructor() {
        this.supabase = window.supabaseConfig.supabase;
        this.init();
    }

    async init() {
        console.log('首页初始化开始...');
        console.log('Supabase配置:', window.supabaseConfig);
        
        try {
            // 测试数据库连接
            const { data: testData, error: testError } = await this.supabase
                .from('movies')
                .select('count')
                .single();
            
            if (testError) {
                console.error('数据库连接测试失败:', testError);
            } else {
                console.log('数据库连接成功，电影总数:', testData);
            }
            
            await this.loadNewMovies();
            await this.loadPopularMovies();
            await this.loadRecentActivity();
            this.bindEvents();
        } catch (error) {
            console.error('首页初始化失败:', error);
        }
    }

    // 加载最新电影
    async loadNewMovies() {
        const container = document.getElementById('new-movies');
        if (!container) return;

        container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        try {
            console.log('开始加载最新电影...');
            
            // 使用本地示例数据
            const movies = window.sampleData?.movies || [];
            
            // 排序并取前6部
            const latestMovies = movies
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 6);

            console.log('最新电影数据:', latestMovies);

            container.innerHTML = '';
            
            if (latestMovies.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #666;">暂无电影数据</p>';
                return;
            }

            latestMovies.forEach(movie => {
                const movieCard = this.createMovieCard(movie);
                container.appendChild(movieCard);
            });
        } catch (error) {
            console.error('加载最新电影失败:', error);
            container.innerHTML = '<p style="text-align: center; color: red;">加载失败，使用示例数据</p>';
            
            // 降级到示例数据
            this.loadSampleMovies('new-movies');
        }
    }

    // 加载热门电影
    async loadPopularMovies() {
        const container = document.getElementById('popular-movies');
        if (!container) return;

        container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        try {
            console.log('开始加载热门电影...');
            
            // 先获取所有电影，再单独获取评分信息
            const { data: allMovies, error } = await this.supabase
                .from('movies')
                .select('*');

            if (error) throw error;
            
            console.log('所有电影数据:', allMovies);

            // 获取每部电影的评分信息
            const moviesWithStats = await Promise.all(
                allMovies.map(async (movie) => {
                    const { data: userMovies } = await this.supabase
                        .from('user_movies')
                        .select('status, rating')
                        .eq('movie_id', movie.id);
                    
                    const ratings = userMovies?.filter(um => um.rating > 0) || [];
                    const favorites = userMovies?.filter(um => um.status === 'favorite') || [];
                    
                    const avgRating = ratings.length > 0 
                        ? ratings.reduce((sum, um) => sum + um.rating, 0) / ratings.length 
                        : 0;
                    
                    return {
                        ...movie,
                        avgRating: Math.round(avgRating * 10) / 10,
                        favoriteCount: favorites.length
                    };
                })
            );

            // 计算每部电影的平均评分和收藏数
            const moviesWithStats = allMovies.map(movie => {
                const ratings = movie.user_movies.filter(um => um.rating > 0);
                const favorites = movie.user_movies.filter(um => um.status === 'favorite');
                
                const avgRating = ratings.length > 0 
                    ? ratings.reduce((sum, um) => sum + um.rating, 0) / ratings.length 
                    : 0;
                
                return {
                    ...movie,
                    avgRating: Math.round(avgRating * 10) / 10,
                    favoriteCount: favorites.length
                };
            });

            // 按收藏数排序，取前6部
            const popularMovies = moviesWithStats
                .sort((a, b) => b.favoriteCount - a.favoriteCount)
                .slice(0, 6);

            container.innerHTML = '';
            
            if (popularMovies.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #666;">暂无热门电影</p>';
                return;
            }

            popularMovies.forEach(movie => {
                const movieCard = this.createMovieCard(movie, true);
                container.appendChild(movieCard);
            });
        } catch (error) {
            console.error('加载热门电影失败:', error);
            container.innerHTML = '<p style="text-align: center; color: red;">加载失败，请刷新页面重试</p>';
        }
    }

    // 加载近期活动
    async loadRecentActivity() {
        const container = document.getElementById('recent-activity');
        if (!container) return;

        container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        try {
            // 先获取近期活动
            const { data: activities, error } = await this.supabase
                .from('user_movies')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;

            // 为每个活动获取电影和用户信息
            const activitiesWithDetails = await Promise.all(
                activities.map(async (activity) => {
                    const { data: movie } = await this.supabase
                        .from('movies')
                        .select('title, poster_url')
                        .eq('id', activity.movie_id)
                        .single();
                    
                    const { data: userProfile } = await this.supabase
                        .from('profiles')
                        .select('username, avatar_url')
                        .eq('id', activity.user_id)
                        .single();
                    
                    return {
                        ...activity,
                        movies: movie || { title: '未知电影', poster_url: null },
                        profiles: userProfile || { username: '未知用户', avatar_url: null }
                    };
                })
            );

            container.innerHTML = '';
            
            if (activitiesWithDetails.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #666;">暂无近期活动</p>';
                return;
            }

            activitiesWithDetails.forEach(activity => {
                const activityItem = this.createActivityItem(activity);
                container.appendChild(activityItem);
            });
        } catch (error) {
            console.error('加载近期活动失败:', error);
            container.innerHTML = '<p style="text-align: center; color: red;">加载失败，请刷新页面重试</p>';
        }
    }

    // 创建电影卡片
    createMovieCard(movie, showStats = false) {
        const card = document.createElement('div');
        card.className = 'movie-card';
        
        // 设置默认海报
        const posterUrl = movie.poster_url || 'https://via.placeholder.com/300x450?text=No+Poster';
        
        let statsHTML = '';
        if (showStats) {
            statsHTML = `
                <div style="display: flex; justify-content: space-between; margin-top: 0.5rem;">
                    <span>⭐ ${movie.avgRating || 0}</span>
                    <span>❤️ ${movie.favoriteCount || 0}</span>
                </div>
            `;
        }

        card.innerHTML = `
            <img src="${posterUrl}" alt="${movie.title}" class="movie-poster" onerror="this.src='https://via.placeholder.com/300x450?text=No+Poster'">
            <div class="movie-info">
                <div class="movie-title">${movie.title}</div>
                <div class="movie-details">
                    <div>导演: ${movie.director || '未知'}</div>
                    <div>年份: ${movie.release_year || '未知'}</div>
                    ${statsHTML}
                </div>
            </div>
        `;

        // 点击卡片跳转到电影详情页
        card.addEventListener('click', () => {
            window.location.href = `movie.html?id=${movie.id}`;
        });

        return card;
    }

    // 创建活动项
    createActivityItem(activity) {
        const item = document.createElement('div');
        item.className = 'activity-item';

        const statusMap = {
            'want_to_watch': '想看了',
            'watched': '已观看',
            'favorite': '收藏了'
        };

        const avatarUrl = activity.profiles.avatar_url || 'https://via.placeholder.com/40';
        const actionText = statusMap[activity.status] || '操作了';

        item.innerHTML = `
            <img src="${avatarUrl}" alt="头像" class="activity-avatar" onerror="this.src='https://via.placeholder.com/40'">
            <div>
                <strong>${activity.profiles.username}</strong> ${actionText} 
                <strong>《${activity.movies.title}》</strong>
                ${activity.rating ? `并给出了 ${activity.rating} 星评价` : ''}
                <div style="color: #666; font-size: 0.9rem;">
                    ${new Date(activity.created_at).toLocaleDateString('zh-CN')}
                </div>
            </div>
        `;

        // 点击活动项跳转到电影详情页
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => {
            window.location.href = `movie.html?id=${activity.movie_id}`;
        });

        return item;
    }

    // 绑定事件
    bindEvents() {
        // 搜索功能
        const searchBtn = document.getElementById('search-btn');
        const searchInput = document.getElementById('search-input');

        if (searchBtn && searchInput) {
            const performSearch = () => {
                const query = searchInput.value.trim();
                if (query) {
                    // 跳转到电影详情页进行搜索
                    window.location.href = `movie.html?search=${encodeURIComponent(query)}`;
                }
            };

            searchBtn.addEventListener('click', performSearch);
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 确保配置文件已加载
    if (window.supabaseConfig) {
        new HomePage();
    } else {
        // 如果配置文件尚未加载，等待一段时间后重试
        setTimeout(() => {
            if (window.supabaseConfig) {
                new HomePage();
            } else {
                console.error('Supabase配置未加载成功');
            }
        }, 1000);
    }
});

// 添加电影模态框管理
class AddMovieModal {
    constructor() {
        this.modal = document.getElementById('add-movie-modal');
        this.init();
    }

    init() {
        // 创建添加电影模态框（如果不存在）
        if (!this.modal) {
            this.createModal();
        }
    }

    createModal() {
        const modal = document.createElement('div');
        modal.id = 'add-movie-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>添加新电影</h3>
                <form id="add-movie-form">
                    <input type="text" id="movie-title" placeholder="电影标题" required>
                    <input type="text" id="movie-director" placeholder="导演">
                    <input type="number" id="movie-year" placeholder="上映年份" min="1900" max="2030">
                    <textarea id="movie-description" placeholder="电影简介"></textarea>
                    <input type="url" id="movie-poster" placeholder="海报图片URL">
                    <button type="submit" class="btn-primary">添加电影</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        // 绑定表单提交事件
        const form = document.getElementById('add-movie-form');
        if (form) {
            form.addEventListener('submit', this.handleAddMovie.bind(this));
        }
    }

    async handleAddMovie(e) {
        e.preventDefault();

        if (!window.authManager.isAuthenticated()) {
            showMessage('请先登录后再添加电影', 'error');
            return;
        }

        const title = document.getElementById('movie-title').value;
        const director = document.getElementById('movie-director').value;
        const year = document.getElementById('movie-year').value;
        const description = document.getElementById('movie-description').value;
        const posterUrl = document.getElementById('movie-poster').value;

        try {
            const { data, error } = await window.supabaseConfig.supabase
                .from('movies')
                .insert([{
                    title: title,
                    director: director,
                    release_year: year ? parseInt(year) : null,
                    description: description,
                    poster_url: posterUrl || null,
                    created_by: window.authManager.getCurrentUserId(),
                    created_at: new Date().toISOString()
                }]);

            if (error) throw error;

            showMessage('电影添加成功！', 'success');
            this.hide();
            
            // 刷新页面
            window.location.reload();
        } catch (error) {
            console.error('添加电影失败:', error);
            showMessage('添加电影失败: ' + error.message, 'error');
        }
    }

    show() {
        if (this.modal) {
            this.modal.style.display = 'block';
        }
    }

    hide() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }
}

// 全局添加电影功能
window.addMovieModal = new AddMovieModal();