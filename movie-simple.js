// 电影详情页功能模块 - 简化版（使用本地数据）
class MovieDetailManager {
    constructor() {
        this.supabase = window.supabaseConfig?.supabase;
        this.init();
    }

    async init() {
        console.log('电影详情页初始化开始...');
        
        try {
            await this.loadMovieDetails();
            await this.loadMovies();
            this.bindEvents();
            
            console.log('电影详情页初始化完成');
        } catch (error) {
            console.error('电影详情页初始化失败:', error);
        }
    }

    // 加载电影详情
    async loadMovieDetails() {
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');
        
        if (!movieId) {
            console.log('没有指定电影ID，显示默认页面');
            this.showMovieList();
            return;
        }

        try {
            console.log('加载电影详情，ID:', movieId);
            
            // 使用本地示例数据
            const movie = window.sampleMovieDetails?.find(m => m.id === movieId);
            
            if (movie) {
                this.renderMovieDetail(movie);
            } else {
                console.log('未找到电影详情，显示电影列表');
                this.showMovieList();
            }
        } catch (error) {
            console.error('加载电影详情失败:', error);
            this.showMovieList();
        }
    }

    // 加载电影列表
    async loadMovies() {
        const container = document.getElementById('movies-list');
        
        if (!container) return;

        try {
            console.log('开始加载电影列表...');
            
            // 使用本地示例数据
            const movies = window.sampleMovieDetails || [];
            
            console.log('电影列表数据:', movies);

            // 处理搜索查询
            const searchQuery = new URLSearchParams(window.location.search).get('search');
            if (searchQuery) {
                const searchResults = movies.filter(movie => 
                    movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    movie.director.toLowerCase().includes(searchQuery.toLowerCase())
                );
                this.renderMovies(searchResults, container);
                
                // 显示搜索查询
                const searchQueryElement = document.getElementById('search-query');
                if (!searchQueryElement) {
                    // 创建搜索查询显示元素
                    const searchHeader = document.querySelector('.search-header h2');
                    if (searchHeader) {
                        const queryElement = document.createElement('p');
                        queryElement.id = 'search-query';
                        queryElement.style.color = '#666';
                        queryElement.style.marginTop = '10px';
                        queryElement.innerHTML = `搜索关键词: <strong>${searchQuery}</strong>`;
                        searchHeader.appendChild(queryElement);
                    }
                } else {
                    searchQueryElement.textContent = `搜索关键词: ${searchQuery}`;
                }
            } else {
                this.renderMovies(movies, container);
            }
        } catch (error) {
            console.error('加载电影列表失败:', error);
        }
    }

    // 显示电影列表
    showMovieList() {
        const movieDetails = document.getElementById('movie-details');
        const moviesList = document.getElementById('movies-list');
        
        if (movieDetails) movieDetails.style.display = 'none';
        if (moviesList) moviesList.style.display = 'block';
        
        const searchQuery = new URLSearchParams(window.location.search).get('search');
        if (searchQuery && moviesList) {
            document.getElementById('search-query').textContent = searchQuery;
        }
    }

    // 渲染电影详情
    async renderMovieDetail(movie) {
        const container = document.getElementById('movie-details');
        if (!container) return;

        container.style.display = 'block';
        
        const moviesList = document.getElementById('movies-list');
        if (moviesList) moviesList.style.display = 'none';

        // 获取当前用户的电影状态
        let currentStatus = '';
        if (window.authManager?.currentUser) {
            currentStatus = await this.getUserMovieStatus(movie.id);
        }

        // 生成状态显示文本
        const statusText = {
            'want_to_watch': '已加入想看',
            'watched': '已标记为已观看',
            'favorite': '已收藏'
        }[currentStatus] || '';

        container.innerHTML = `
            <button class="back-button" onclick="window.history.back()">← 返回列表</button>
            <div class="detail-content">
                <div class="poster-section">
                    <img class="detail-poster" src="${movie.poster_url}" alt="${movie.title}" 
                         onerror="this.src='https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400'" />
                </div>
                <div class="info-section">
                    <h1>${movie.title}</h1>
                    <div class="movie-meta">
                        <div class="meta-item"><strong>导演：</strong>${movie.director}</div>
                        <div class="meta-item"><strong>年份：</strong>${movie.release_year}</div>
                        <div class="meta-item"><strong>类型：</strong>${movie.genre}</div>
                        <div class="meta-item"><strong>时长：</strong>${movie.duration}分钟</div>
                        <div class="meta-item"><strong>评分：</strong>⭐ ${movie.rating}</div>
                    </div>
                    <div class="user-actions">
                        <h3>${currentStatus ? '当前状态' : '添加到观影清单'}</h3>
                        ${currentStatus ? 
                            `<div class="current-status">
                                <p class="status-indicator">${statusText}</p>
                                <button class="btn-secondary" onclick="MovieDetailManager.removeFromWatchlist('${movie.id}')">
                                    ❌ 取消
                                </button>
                            </div>` : 
                            `<div class="action-buttons">
                                <button class="status-btn" onclick="MovieDetailManager.addToWatchlist('${movie.id}', 'want_to_watch')">
                                    📝 想看
                                </button>
                                <button class="status-btn" onclick="MovieDetailManager.addToWatchlist('${movie.id}', 'watched')">
                                    ✅ 已看
                                </button>
                                <button class="status-btn" onclick="MovieDetailManager.addToWatchlist('${movie.id}', 'favorite')">
                                    ❤️ 收藏
                                </button>
                            </div>`
                        }
                    </div>
                </div>
            </div>
            <div class="movie-description">
                <h3>剧情简介</h3>
                <p>${movie.description}</p>
            </div>
            ${currentStatus === 'watched' || currentStatus === 'favorite' ? `
            <div class="user-actions">
                <h3>用户评价</h3>
                <div class="review-section">
                    <textarea id="review-text" placeholder="写下你的观影感受..." rows="4"></textarea>
                    <div class="rating-input">
                        <label>评分：</label>
                        <select id="review-rating">
                            <option value="">请选择</option>
                            <option value="5">⭐️⭐️⭐️⭐️⭐️ 5分</option>
                            <option value="4">⭐️⭐️⭐️⭐️ 4分</option>
                            <option value="3">⭐️⭐️⭐️ 3分</option>
                            <option value="2">⭐️⭐️ 2分</option>
                            <option value="1">⭐️ 1分</option>
                        </select>
                    </div>
                    <button class="btn-primary" onclick="MovieDetailManager.submitReview('${movie.id}')">
                        提交评价
                    </button>
                </div>
            </div>` : ''}
        `;
    }

    // 获取用户的电影状态
    async getUserMovieStatus(movieId) {
        if (!window.authManager?.currentUser) return '';
        
        try {
            // 首先查找数据库中的电影UUID
            const movie = window.sampleMovieDetails?.find(m => m.id === movieId);
            if (!movie) return '';
            
            const { data: dbMovies, error: searchError } = await window.supabaseConfig.supabase
                .from('movies')
                .select('id')
                .eq('title', movie.title)
                .eq('release_year', movie.release_year);
            
            if (searchError || !dbMovies || dbMovies.length === 0) return '';
            
            const dbMovieId = dbMovies[0].id;
            
            // 查询用户电影状态
            const { data: userMovies, error } = await window.supabaseConfig.supabase
                .from('user_movies')
                .select('status')
                .eq('user_id', window.authManager.currentUser.id)
                .eq('movie_id', dbMovieId);
            
            if (error || !userMovies || userMovies.length === 0) return '';
            
            return userMovies[0].status;
        } catch (error) {
            console.error('获取用户电影状态失败:', error);
            return '';
        }
    }

    // 渲染电影列表
    renderMovies(movies, container) {
        if (!container) return;

        container.innerHTML = '';
        
        if (movies.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">暂无电影数据</p>';
            return;
        }

        movies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            movieCard.onclick = () => this.showMovieDetail(movie.id);
            
            movieCard.innerHTML = `
                <div class="movie-poster">
                    <img src="${movie.poster_url}" alt="${movie.title}" 
                         onerror="this.src='https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300'" />
                </div>
                <div class="movie-info">
                    <h4 class="movie-title">${movie.title}</h4>
                    <div class="movie-details">
                        <div class="detail-item">
                            <span class="label">导演：</span>
                            <span>${movie.director}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">年份：</span>
                            <span>${movie.release_year}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">评分：</span>
                            <span class="rating">⭐ ${movie.rating}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">类型：</span>
                            <span>${movie.genre}</span>
                        </div>
                    </div>
                </div>
            `;
            
            container.appendChild(movieCard);
        });
    }

    // 显示电影详情
    showMovieDetail(movieId) {
        window.location.href = `movie.html?id=${movieId}`;
    }

    // 绑定事件
    bindEvents() {
        console.log('绑定电影详情页事件...');
        
        // 搜索功能 - 使用正确的元素ID
        const searchBtn = document.getElementById('movie-search-btn');
        const searchInput = document.getElementById('movie-search-input');
        
        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', () => {
                this.performSearch(searchInput.value);
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(searchInput.value);
                }
            });
        }
    }

    // 执行搜索
    performSearch(query) {
        if (!query.trim()) {
            alert('请输入搜索关键词');
            return;
        }
        
        window.location.href = `movie.html?search=${encodeURIComponent(query)}`;
    }

    // 静态方法：添加到观影清单
    static async addToWatchlist(movieId, status) {
        // 检查全局认证管理器的登录状态
        if (!window.authManager?.currentUser) {
            alert('请先登录后再操作');
            return;
        }
        
        const movie = window.sampleMovieDetails?.find(m => m.id === movieId);
        if (!movie) {
            alert('未找到该电影信息');
            return;
        }
        
        try {
            const statusText = {
                'want_to_watch': '想看',
                'watched': '已观看',
                'favorite': '收藏'
            }[status];
            
            // 首先在数据库中查找对应的电影UUID
            const { data: dbMovies, error: searchError } = await window.supabaseConfig.supabase
                .from('movies')
                .select('id')
                .eq('title', movie.title)
                .eq('release_year', movie.release_year);
            
            if (searchError) throw searchError;
            
            let dbMovieId;
            
            if (dbMovies && dbMovies.length > 0) {
                // 如果数据库中存在相同电影，使用数据库中的UUID
                dbMovieId = dbMovies[0].id;
            } else {
                // 如果数据库中不存在，生成UUID并插入
                dbMovieId = this.generateUUID();
                
                const { error: insertError } = await window.supabaseConfig.supabase
                    .from('movies')
                    .insert([{
                        id: dbMovieId,
                        title: movie.title,
                        poster_url: movie.poster_url,
                        director: movie.director,
                        release_year: movie.release_year,
                        genre: movie.genre,
                        duration: movie.duration,
                        rating: movie.rating,
                        description: movie.description
                    }]);
                
                if (insertError) {
                    console.warn('插入电影数据失败:', insertError);
                    // 继续尝试插入观影记录
                }
            }
            
            // 检查是否已存在该电影的观影记录
            const { data: existingUserMovies, error: userMovieError } = await window.supabaseConfig.supabase
                .from('user_movies')
                .select('id')
                .eq('user_id', window.authManager.currentUser.id)
                .eq('movie_id', dbMovieId);
            
            if (userMovieError) throw userMovieError;
            
            if (existingUserMovies && existingUserMovies.length > 0) {
                // 更新现有记录 - 只更新状态字段，避免字段不存在的问题
                const { error: updateError } = await window.supabaseConfig.supabase
                    .from('user_movies')
                    .update({ 
                        status: status
                    })
                    .eq('id', existingUserMovies[0].id);
                
                if (updateError) throw updateError;
                
                alert(`已将《${movie.title}》更新为${statusText}状态`);
            } else {
                // 插入新记录 - 只插入必需字段
                const { error: insertError } = await window.supabaseConfig.supabase
                    .from('user_movies')
                    .insert([{
                        user_id: window.authManager.currentUser.id,
                        movie_id: dbMovieId,
                        status: status
                    }]);
                
                if (insertError) throw insertError;
                
                alert(`已将《${movie.title}》添加到${statusText}清单`);
            }
            
            // 触发个人中心页面刷新（如果当前在个人中心页面）
            if (window.location.pathname.includes('profile.html')) {
                // 重新加载页面以显示最新数据
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
            
        } catch (error) {
            console.error('添加观影记录失败:', error);
            alert('操作失败，请稍后重试');
        }
    }

    // 生成UUID的辅助方法
    static generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // 静态方法：提交评价
    static submitReview(movieId) {
        const reviewText = document.getElementById('review-text')?.value;
        const rating = document.getElementById('review-rating')?.value;
        
        if (!rating) {
            alert('请选择评分');
            return;
        }
        
        const movie = window.sampleMovieDetails?.find(m => m.id === movieId);
        if (movie) {
            alert(`已为《${movie.title}》提交${rating}星评价${reviewText ? '和评论' : ''}`);
            
            if (document.getElementById('review-text')) {
                document.getElementById('review-text').value = '';
            }
            if (document.getElementById('review-rating')) {
                document.getElementById('review-rating').value = '';
            }
        }
    }
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM加载完成，初始化电影详情页...');
    new MovieDetailManager();
});