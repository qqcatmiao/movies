// 首页功能模块 - 简化版（使用本地数据）
class HomePage {
    constructor() {
        this.init();
    }

    async init() {
        console.log('首页初始化开始...');
        
        try {
            await this.loadNewMovies();
            await this.loadPopularMovies();
            await this.loadRecentActivity();
            this.bindEvents();
            
            console.log('首页初始化完成');
        } catch (error) {
            console.error('首页初始化失败:', error);
        }
    }

    // 加载最新电影 - 使用本地数据
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
            container.innerHTML = '<p style="text-align: center; color: #666;">加载失败，使用示例数据</p>';
        }
    }

    // 加载热门电影 - 使用本地数据
    async loadPopularMovies() {
        const container = document.getElementById('popular-movies');
        if (!container) return;

        container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        try {
            console.log('开始加载热门电影...');
            
            // 使用本地示例数据，直接显示所有电影
            const movies = window.sampleData?.movies || [];

            container.innerHTML = '';
            
            if (movies.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #666;">暂无热门电影</p>';
                return;
            }

            movies.slice(0, 6).forEach(movie => {
                const movieCard = this.createMovieCard(movie, true);
                container.appendChild(movieCard);
            });
        } catch (error) {
            console.error('加载热门电影失败:', error);
            container.innerHTML = '<p style="text-align: center; color: #666;">加载失败，使用示例数据</p>';
        }
    }

    // 加载近期活动 - 使用本地数据
    async loadRecentActivity() {
        const container = document.getElementById('recent-activity');
        if (!container) return;

        container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        try {
            console.log('开始加载近期活动...');
            
            // 使用本地示例数据
            const activities = window.sampleData?.activities || [];

            container.innerHTML = '';
            
            if (activities.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #666;">暂无近期活动</p>';
                return;
            }

            activities.slice(0, 5).forEach(activity => {
                const activityItem = this.createActivityItem(activity);
                container.appendChild(activityItem);
            });
        } catch (error) {
            console.error('加载近期活动失败:', error);
            container.innerHTML = '<p style="text-align: center; color: #666;">加载失败，使用示例数据</p>';
        }
    }

    // 创建电影卡片
    createMovieCard(movie, showStats = false) {
        const card = document.createElement('div');
        card.className = 'movie-card';
        
        card.innerHTML = `
            <div class="movie-poster">
                <img src="${movie.poster_url}" alt="${movie.title}" onerror="this.src='https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300'" />
            </div>
            <div class="movie-info">
                <h4 class="movie-title">${movie.title}</h4>
                <p class="movie-director">导演：${movie.director}</p>
                <p class="movie-year">年份：${movie.release_year}</p>
                ${showStats ? `
                    <div class="movie-stats">
                        <span class="rating">⭐ 4.8</span>
                        <span class="favorites">❤️ 128</span>
                    </div>
                ` : ''}
            </div>
        `;
        
        return card;
    }

    // 创建活动项
    createActivityItem(activity) {
        const item = document.createElement('div');
        item.className = 'activity-item';
        
        const statusText = {
            'want_to_watch': '想要观看',
            'watched': '已观看',
            'favorite': '收藏了'
        }[activity.status] || '操作了';
        
        item.innerHTML = `
            <div class="activity-avatar">
                <img src="${activity.profiles.avatar_url}" alt="${activity.profiles.username}" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'" />
            </div>
            <div class="activity-content">
                <p><strong>${activity.profiles.username}</strong> ${statusText} <strong>${activity.movies.title}</strong></p>
                <span class="activity-time">${new Date(activity.created_at).toLocaleDateString('zh-CN')}</span>
                ${activity.rating ? `<span class="activity-rating">评分：${activity.rating}⭐</span>` : ''}
            </div>
        `;
        
        return item;
    }

    // 绑定事件
    bindEvents() {
        console.log('绑定首页事件...');
        
        // 搜索功能
        const searchBtn = document.getElementById('search-btn');
        const searchInput = document.getElementById('search-input');
        
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
        
        // 跳转到搜索结果页面
        window.location.href = `movie.html?search=${encodeURIComponent(query)}`;
    }
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM加载完成，初始化首页...');
    new HomePage();
});