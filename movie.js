// 电影详情页面功能
class MovieDetailManager {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentMovies = [];
        this.filteredMovies = [];
        this.searchQuery = '';
        this.currentMovieId = null;
        
        // 初始化示例电影数据（实际项目中应该从API获取）
        this.sampleMovies = this.generateSampleMovies();
        
        this.init();
    }
    
    // 生成示例电影数据
    generateSampleMovies() {
        const movies = [
            {
                id: 1,
                title: '肖申克的救赎',
                year: 1994,
                director: '弗兰克·德拉邦特',
                duration: '142分钟',
                rating: 9.3,
                genre: '剧情',
                description: '银行家安迪被冤枉杀害妻子及其情人，被判无期徒刑，在肖申克监狱中谋划自我救赎的故事。',
                poster: 'https://via.placeholder.com/300x450/667eea/ffffff?text=肖申克的救赎'
            },
            {
                id: 2,
                title: '阿甘正传',
                year: 1994,
                director: '罗伯特·泽米吉斯',
                duration: '142分钟',
                rating: 9.1,
                genre: '剧情/爱情',
                description: '讲述先天智障的小镇男孩福瑞斯特·甘自强不息，最终“傻人有傻福”地得到上天眷顾，在多个领域创造奇迹的励志故事。',
                poster: 'https://via.placeholder.com/300x450/764ba2/ffffff?text=阿甘正传'
            },
            {
                id: 3,
                title: '泰坦尼克号',
                year: 1997,
                director: '詹姆斯·卡梅隆',
                duration: '194分钟',
                rating: 9.4,
                genre: '剧情/爱情',
                description: '讲述处于不同阶层的两个人穷画家杰克和贵族女露丝抛弃世俗的偏见坠入爱河，最终杰克把生命的机会让给了露丝的感人故事。',
                poster: 'https://via.placeholder.com/300x450/f093fb/ffffff?text=泰坦尼克号'
            },
            {
                id: 4,
                title: '盗梦空间',
                year: 2010,
                director: '克里斯托弗·诺兰',
                duration: '148分钟',
                rating: 9.3,
                genre: '科幻/惊悚',
                description: '讲述由莱昂纳多·迪卡普里奥扮演的造梦师，带领约瑟夫·高登-莱维特、艾伦·佩吉扮演的特工团队，进入他人梦境，从他人的潜意识中盗取机密，并重塑他人梦境的故事。',
                poster: 'https://via.placeholder.com/300x450/4facfe/ffffff?text=盗梦空间'
            },
            {
                id: 5,
                title: '星际穿越',
                year: 2014,
                director: '克里斯托弗·诺兰',
                duration: '169分钟',
                rating: 9.2,
                genre: '科幻/冒险',
                description: '在不远的未来，地球环境逐渐恶化，农作物枯萎，人类面临生存危机。一群探险家通过穿越虫洞，为人类寻找新家园的星际旅行故事。',
                poster: 'https://via.placeholder.com/300x450/43e97b/ffffff?text=星际穿越'
            },
            {
                id: 6,
                title: '霸王别姬',
                year: 1993,
                director: '陈凯歌',
                duration: '171分钟',
                rating: 9.6,
                genre: '剧情/爱情',
                description: '围绕两位京剧伶人半个世纪的悲欢离合，展现了对传统文化、人的生存状态及人性的思考与领悟。',
                poster: 'https://via.placeholder.com/300x450/ff6b6b/ffffff?text=霸王别姬'
            },
            {
                id: 7,
                title: '这个杀手不太冷',
                year: 1994,
                director: '吕克·贝松',
                duration: '110分钟',
                rating: 9.4,
                genre: '剧情/动作',
                description: '讲述一名职业杀手与一个小女孩的故事，两人之间产生了一种奇妙的化学反应，在美国纽约市展开一连串的感人故事。',
                poster: 'https://via.placeholder.com/300x450/ffd89b/ffffff?text=这个杀手不太冷'
            },
            {
                id: 8,
                title: '辛德勒的名单',
                year: 1993,
                director: '史蒂文·斯皮尔伯格',
                duration: '195分钟',
                rating: 9.5,
                genre: '剧情/历史',
                description: '讲述了一名德国商人奥斯卡·辛德勒在二战期间拯救1100多名犹太人免遭法西斯杀害的真实历史事件。',
                poster: 'https://via.placeholder.com/300x450/a8edea/ffffff?text=辛德勒的名单'
            },
            {
                id: 9,
                title: '千与千寻',
                year: 2001,
                director: '宫崎骏',
                duration: '125分钟',
                rating: 9.3,
                genre: '动画/奇幻',
                description: '讲述了一个小女孩在神秘世界中，为了拯救变成猪的父母，经历了一系列冒险的故事。',
                poster: 'https://via.placeholder.com/300x450/fad0c4/ffffff?text=千与千寻'
            },
            {
                id: 10,
                title: '教父',
                year: 1972,
                director: '弗朗西斯·福特·科波拉',
                duration: '175分钟',
                rating: 9.3,
                genre: '剧情/犯罪',
                description: '讲述了以维托·唐·科莱昂为首的黑帮家族的发展过程以及科莱昂的小儿子迈克如何接任父亲成为黑帮首领的故事。',
                poster: 'https://via.placeholder.com/300x450/ffecd2/ffffff?text=教父'
            },
            {
                id: 11,
                title: '美丽人生',
                year: 1997,
                director: '罗伯托·贝尼尼',
                duration: '116分钟',
                rating: 9.5,
                genre: '剧情/喜剧',
                description: '讲述了一对犹太父子被送进纳粹集中营，父亲利用自己的想像力扯谎说他们正身处一个游戏当中，保护儿子的童心。',
                poster: 'https://via.placeholder.com/300x450/ff9a9e/ffffff?text=美丽人生'
            },
            {
                id: 12,
                title: '十二怒汉',
                year: 1957,
                director: '西德尼·吕美特',
                duration: '96分钟',
                rating: 9.4,
                genre: '剧情/悬疑',
                description: '讲述一个陪审团的12个成员在裁决一个少年是否犯有谋杀罪时，其中一人对案件提出合理怀疑，从而引发整个陪审团讨论的故事。',
                poster: 'https://via.placeholder.com/300x450/a8c0ff/ffffff?text=十二怒汉'
            },
            {
                id: 13,
                title: '海上钢琴师',
                year: 1998,
                director: '朱塞佩·托纳多雷',
                duration: '165分钟',
                rating: 9.3,
                genre: '剧情/音乐',
                description: '讲述了一个被命名为"1900"的弃婴在一艘远洋客轮上与钢琴结缘，成为钢琴大师的传奇故事。',
                poster: 'https://via.placeholder.com/300x450/fccb90/ffffff?text=海上钢琴师'
            },
            {
                id: 14,
                title: '楚门的世界',
                year: 1998,
                director: '彼得·威尔',
                duration: '103分钟',
                rating: 9.3,
                genre: '剧情/科幻',
                description: '讲述了一个叫楚门的人，他生活在一个看似完美的小镇，但实际上他的一切生活都是被设计好的真人秀节目。',
                poster: 'https://via.placeholder.com/300x450/d4fc79/ffffff?text=楚门的世界'
            },
            {
                id: 15,
                title: '机器人总动员',
                year: 2008,
                director: '安德鲁·斯坦顿',
                duration: '98分钟',
                rating: 9.3,
                genre: '动画/科幻',
                description: '讲述地球上的清扫型机器人瓦力偶遇并爱上了机器人伊娃后，追随她进入太空历险的一系列故事。',
                poster: 'https://via.placeholder.com/300x450/96e6a1/ffffff?text=机器人总动员'
            }
        ];
        
        return movies;
    }
    
    // 初始化
    init() {
        this.bindEvents();
        this.loadMovies();
        
        // 检查URL参数，看是否有指定的电影ID
        this.checkUrlParams();
    }
    
    // 检查URL参数
    checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');
        
        if (movieId) {
            this.showMovieDetail(parseInt(movieId));
        }
    }
    
    // 绑定事件
    bindEvents() {
        // 搜索按钮点击事件
        const searchBtn = document.getElementById('movie-search-btn');
        const searchInput = document.getElementById('movie-search-input');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.handleSearch());
        }
        
        if (searchInput) {
            // 回车键搜索
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch();
                }
            });
            
            // 实时搜索（可选）
            searchInput.addEventListener('input', () => {
                this.searchQuery = searchInput.value.trim();
                this.filterMovies();
            });
        }
    }
    
    // 处理搜索
    handleSearch() {
        const searchInput = document.getElementById('movie-search-input');
        if (searchInput) {
            this.searchQuery = searchInput.value.trim();
            this.currentPage = 1;
            this.filterMovies();
        }
    }
    
    // 过滤电影
    filterMovies() {
        if (!this.searchQuery) {
            this.filteredMovies = [...this.sampleMovies];
        } else {
            const query = this.searchQuery.toLowerCase();
            this.filteredMovies = this.sampleMovies.filter(movie => 
                movie.title.toLowerCase().includes(query) ||
                movie.director.toLowerCase().includes(query) ||
                movie.genre.toLowerCase().includes(query)
            );
        }
        
        this.renderMovies();
        this.renderPagination();
    }
    
    // 加载电影
    loadMovies() {
        this.filteredMovies = [...this.sampleMovies];
        this.renderMovies();
        this.renderPagination();
    }
    
    // 渲染电影列表
    renderMovies() {
        const moviesList = document.getElementById('movies-list');
        if (!moviesList) return;
        
        // 计算当前页的电影
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const currentMovies = this.filteredMovies.slice(startIndex, endIndex);
        
        if (currentMovies.length === 0) {
            moviesList.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #666;">
                    <h3>🎬 没有找到相关电影</h3>
                    <p>尝试使用其他关键词搜索</p>
                </div>
            `;
            return;
        }
        
        moviesList.innerHTML = currentMovies.map(movie => `
            <div class="movie-card" onclick="window.movieManager.showMovieDetail(${movie.id})">
                <img src="${movie.poster}" alt="${movie.title}" class="movie-poster">
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <div class="movie-details">
                        <div class="detail-item">
                            <span class="label">导演:</span>
                            <span>${movie.director}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">年份:</span>
                            <span>${movie.year}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">评分:</span>
                            <span class="rating">⭐ ${movie.rating}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">类型:</span>
                            <span>${movie.genre}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // 更新网格布局
        moviesList.className = 'movies-grid';
    }
    
    // 渲染分页控件
    renderPagination() {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;
        
        const totalPages = Math.ceil(this.filteredMovies.length / this.itemsPerPage);
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        let paginationHTML = '<div class="pagination-controls">';
        
        // 上一页按钮
        if (this.currentPage > 1) {
            paginationHTML += `<button class="page-btn" onclick="window.movieManager.goToPage(${this.currentPage - 1})">上一页</button>`;
        }
        
        // 页码按钮
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, startPage + 4);
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" onclick="window.movieManager.goToPage(${i})">${i}</button>`;
        }
        
        // 下一页按钮
        if (this.currentPage < totalPages) {
            paginationHTML += `<button class="page-btn" onclick="window.movieManager.goToPage(${this.currentPage + 1})">下一页</button>`;
        }
        
        paginationHTML += '</div>';
        
        // 页面信息
        paginationHTML += `<div class="page-info">
            第 ${this.currentPage} 页，共 ${totalPages} 页
            (${this.filteredMovies.length} 部电影)
        </div>`;
        
        pagination.innerHTML = paginationHTML;
    }
    
    // 跳转到指定页面
    goToPage(page) {
        if (page >= 1 && page <= Math.ceil(this.filteredMovies.length / this.itemsPerPage)) {
            this.currentPage = page;
            this.renderMovies();
            this.renderPagination();
            
            // 滚动到顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
    
    // 显示电影详情
    showMovieDetail(movieId) {
        const movie = this.sampleMovies.find(m => m.id === movieId);
        if (!movie) return;
        
        this.currentMovieId = movieId;
        
        // 隐藏电影列表，显示详情
        const movieListSection = document.querySelector('.movie-list-section');
        const movieDetails = document.getElementById('movie-details');
        
        if (movieListSection) movieListSection.style.display = 'none';
        if (movieDetails) {
            movieDetails.style.display = 'block';
            movieDetails.innerHTML = this.renderMovieDetail(movie);
        }
        
        // 更新URL（不刷新页面）
        const newUrl = `${window.location.pathname}?id=${movieId}`;
        window.history.pushState({}, '', newUrl);
    }
    
    // 渲染电影详情
    renderMovieDetail(movie) {
        return `
            <button class="back-button btn-secondary" onclick="window.movieManager.backToList()">← 返回列表</button>
            <div class="detail-content">
                <div class="poster-section">
                    <img src="${movie.poster}" alt="${movie.title}" class="detail-poster">
                </div>
                <div class="info-section">
                    <h1>${movie.title}</h1>
                    <div class="movie-meta">
                        <div class="meta-item"><strong>导演:</strong> ${movie.director}</div>
                        <div class="meta-item"><strong>年份:</strong> ${movie.year}</div>
                        <div class="meta-item"><strong>时长:</strong> ${movie.duration}</div>
                        <div class="meta-item"><strong>评分:</strong> ⭐ ${movie.rating}</div>
                        <div class="meta-item"><strong>类型:</strong> ${movie.genre}</div>
                    </div>
                    <div class="movie-description">
                        <h3>剧情简介</h3>
                        <p>${movie.description}</p>
                    </div>
                    
                    <!-- 用户操作区域 -->
                    <div class="user-actions">
                        <h3>我的观影状态</h3>
                        <div class="action-buttons">
                            <button class="status-btn" onclick="window.movieManager.addToWatchlist(${movie.id})">
                                📝 想看
                            </button>
                            <button class="status-btn" onclick="window.movieManager.markAsWatched(${movie.id})">
                                ✅ 已看
                            </button>
                            <button class="status-btn" onclick="window.movieManager.addToFavorite(${movie.id})">
                                ❤️ 收藏
                            </button>
                        </div>
                        <p><small>需要登录后才能管理观影状态</small></p>
                    </div>
                </div>
            </div>
        `;
    }
    
    // 返回列表
    backToList() {
        const movieListSection = document.querySelector('.movie-list-section');
        const movieDetails = document.getElementById('movie-details');
        
        if (movieListSection) movieListSection.style.display = 'block';
        if (movieDetails) movieDetails.style.display = 'none';
        
        // 更新URL
        window.history.pushState({}, '', window.location.pathname);
    }
    
    // 添加到想看列表
    addToWatchlist(movieId) {
        if (!window.authManager || !window.authManager.currentUser) {
            alert('请先登录！');
            window.modalManager.show('login-modal');
            return;
        }
        
        console.log('添加到想看列表:', movieId);
        alert('已添加到想看列表！');
    }
    
    // 标记为已看
    markAsWatched(movieId) {
        if (!window.authManager || !window.authManager.currentUser) {
            alert('请先登录！');
            window.modalManager.show('login-modal');
            return;
        }
        
        console.log('标记为已看:', movieId);
        alert('已标记为已看！');
    }
    
    // 添加到收藏
    addToFavorite(movieId) {
        if (!window.authManager || !window.authManager.currentUser) {
            alert('请先登录！');
            window.modalManager.show('login-modal');
            return;
        }
        
        console.log('添加到收藏:', movieId);
        alert('已添加到收藏！');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    window.movieManager = new MovieDetailManager();
    
    // 处理浏览器的前进后退按钮
    window.addEventListener('popstate', function() {
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');
        
        if (movieId) {
            window.movieManager.showMovieDetail(parseInt(movieId));
        } else {
            window.movieManager.backToList();
        }
    });
});