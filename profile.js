// 个人中心页功能模块
class ProfilePage {
    constructor() {
        this.supabase = window.supabaseConfig.supabase;
        this.currentTab = 'want-to-watch';
        this.init();
    }

    async init() {
        // 检查用户是否登录
        if (!window.authManager.isAuthenticated()) {
            this.showLoginPrompt();
            return;
        }

        // 用户已登录，显示个人中心
        this.showProfileSection();
        await this.loadUserProfile();
        await this.loadUserMovies();
        this.bindEvents();
    }

    // 显示登录提示
    showLoginPrompt() {
        const profileSection = document.getElementById('profile-section');
        const loginPrompt = document.getElementById('login-prompt');
        
        if (profileSection && loginPrompt) {
            profileSection.style.display = 'none';
            loginPrompt.style.display = 'block';
        }
    }

    // 显示个人中心
    showProfileSection() {
        const profileSection = document.getElementById('profile-section');
        const loginPrompt = document.getElementById('login-prompt');
        
        if (profileSection && loginPrompt) {
            profileSection.style.display = 'block';
            loginPrompt.style.display = 'none';
        }
    }

    // 加载用户配置文件
    async loadUserProfile() {
        try {
            const userProfile = window.authManager.getUserProfile();
            
            if (userProfile) {
                this.updateProfileUI(userProfile);
            } else {
                // 如果缓存中没有配置文件，从数据库重新加载
                const { data, error } = await this.supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', window.authManager.getCurrentUserId())
                    .single();

                if (!error && data) {
                    this.updateProfileUI(data);
                }
            }
        } catch (error) {
            console.error('加载用户配置失败:', error);
        }
    }

    // 更新用户界面
    updateProfileUI(profile) {
        // 更新头像
        const avatarImg = document.getElementById('avatar-img');
        if (avatarImg && profile.avatar_url) {
            avatarImg.src = profile.avatar_url;
        }

        // 更新用户名
        const usernameDisplay = document.getElementById('username-display');
        if (usernameDisplay) {
            usernameDisplay.textContent = profile.username;
        }

        // 更新个人简介
        const userBio = document.getElementById('user-bio');
        if (userBio) {
            userBio.textContent = profile.bio || '这位用户很懒，还没有写简介';
        }

        // 更新编辑表单的默认值
        const editUsername = document.getElementById('edit-username');
        const editAvatar = document.getElementById('edit-avatar');
        const editBio = document.getElementById('edit-bio');
        
        if (editUsername) editUsername.value = profile.username;
        if (editAvatar) editAvatar.value = profile.avatar_url || '';
        if (editBio) editBio.value = profile.bio || '';
    }

    // 加载用户电影数据
    async loadUserMovies() {
        try {
            console.log('开始加载用户电影数据...');
            
            const { data: userMovies, error } = await this.supabase
                .from('user_movies')
                .select(`
                    *,
                    movies(id, title, poster_url, director, release_year)
                `)
                .eq('user_id', window.authManager.getCurrentUserId());

            if (error) {
                console.error('数据库查询错误:', error);
                throw error;
            }

            console.log('查询到的用户电影数据:', userMovies);

            // 按状态分类
            const moviesByStatus = {
                'want_to_watch': [],
                'watched': [],
                'favorite': []
            };

            userMovies?.forEach(um => {
                if (moviesByStatus[um.status] && um.movies) {
                    moviesByStatus[um.status].push(um);
                }
            });

            console.log('按状态分类后的数据:', moviesByStatus);

            // 更新统计数据
            this.updateStats(moviesByStatus);
            
            // 渲染当前标签页的电影
            this.renderMoviesForTab(this.currentTab, moviesByStatus);
        } catch (error) {
            console.error('加载用户电影数据失败:', error);
            
            // 即使在错误情况下，也要确保显示空状态
            const moviesByStatus = {
                'want_to_watch': [],
                'watched': [],
                'favorite': []
            };
            this.renderMoviesForTab(this.currentTab, moviesByStatus);
        }
    }

    // 更新统计数据
    updateStats(moviesByStatus) {
        const watchedCount = document.getElementById('watched-count');
        const wantToWatchCount = document.getElementById('want-to-watch-count');
        const favoriteCount = document.getElementById('favorite-count');

        if (watchedCount) {
            watchedCount.textContent = moviesByStatus.watched.length;
        }
        if (wantToWatchCount) {
            wantToWatchCount.textContent = moviesByStatus.want_to_watch.length;
        }
        if (favoriteCount) {
            favoriteCount.textContent = moviesByStatus.favorite.length;
        }
    }

    // 渲染指定标签页的电影
    renderMoviesForTab(tab, moviesByStatus) {
        console.log(`渲染标签页: ${tab}`, moviesByStatus);
        
        // 标签页到容器ID的映射（修复不一致问题）
        const tabToContainerIdMap = {
            'want-to-watch': 'want-to-watch-movies',
            'watched': 'watched-movies', 
            'favorites': 'favorite-movies'  // 修正为单数形式
        };
        
        const containerId = tabToContainerIdMap[tab] || '';
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`未找到容器: ${containerId} (标签页: ${tab})`);
            return;
        }

        // 标签页到数据库状态的映射
        const tabToStatusMap = {
            'want-to-watch': 'want_to_watch',
            'watched': 'watched',
            'favorites': 'favorite'
        };

        const status = tabToStatusMap[tab] || '';
        const movies = moviesByStatus[status] || [];

        console.log(`标签页 ${tab} 对应状态 ${status}, 容器ID: ${containerId}, 电影数量: ${movies.length}`);

        if (movies.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #666;">
                    <p>这里还没有电影</p>
                    <p><a href="index.html" style="color: #667eea;">去发现页面添加一些电影吧</a></p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';

        movies.forEach(userMovie => {
            const movieCard = this.createMovieCard(userMovie);
            container.appendChild(movieCard);
        });
    }

    // 创建电影卡片
    createMovieCard(userMovie) {
        const card = document.createElement('div');
        card.className = 'movie-card';
        
        const movie = userMovie.movies;
        const posterUrl = movie.poster_url || 'https://via.placeholder.com/200x300?text=No+Poster';
        
        let ratingHtml = '';
        if (userMovie.rating > 0) {
            ratingHtml = `<div style="color: #ffc107; font-size: 0.9rem;">我的评分: ${'★'.repeat(userMovie.rating)}${'☆'.repeat(5 - userMovie.rating)}</div>`;
        }

        card.innerHTML = `
            <img src="${posterUrl}" alt="${movie.title}" class="movie-poster" onerror="this.src='https://via.placeholder.com/200x300?text=No+Poster'">
            <div class="movie-info">
                <div class="movie-title">${movie.title}</div>
                <div class="movie-details">
                    <div>导演: ${movie.director || '未知'}</div>
                    <div>年份: ${movie.release_year || '未知'}</div>
                    ${ratingHtml}
                </div>
                <div style="margin-top: 0.5rem;">
                    <button class="btn-secondary" onclick="window.location.href='movie.html?id=${movie.id}'">查看详情</button>
                </div>
            </div>
        `;

        return card;
    }

    // 绑定事件
    bindEvents() {
        // 标签页切换
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });

        // 编辑资料按钮
        const editProfileBtn = document.getElementById('edit-profile-btn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                this.showEditProfileModal();
            });
        }

        // 编辑资料表单提交
        const editProfileForm = document.getElementById('edit-profile-form');
        if (editProfileForm) {
            editProfileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateProfile();
            });
        }

        // 登录提示按钮
        const promptLoginBtn = document.getElementById('prompt-login-btn');
        if (promptLoginBtn) {
            promptLoginBtn.addEventListener('click', () => {
                window.modalManager.show('login-modal');
            });
        }
    }

    // 切换标签页
    switchTab(tab) {
        // 更新按钮状态
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tab) {
                btn.classList.add('active');
            }
        });

        // 更新内容区域
        const tabPanes = document.querySelectorAll('.tab-pane');
        tabPanes.forEach(pane => {
            pane.classList.remove('active');
            if (pane.id === tab) {
                pane.classList.add('active');
            }
        });

        this.currentTab = tab;
        
        // 重新加载该标签页的电影数据
        this.loadUserMovies();
    }

    // 显示编辑资料模态框
    showEditProfileModal() {
        const modal = document.getElementById('edit-profile-modal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    // 更新用户资料
    async updateProfile() {
        const username = document.getElementById('edit-username').value.trim();
        const avatarUrl = document.getElementById('edit-avatar').value.trim();
        const bio = document.getElementById('edit-bio').value.trim();

        if (!username) {
            showMessage('用户名不能为空', 'error');
            return;
        }

        try {
            const { error } = await this.supabase
                .from('profiles')
                .update({
                    username: username,
                    avatar_url: avatarUrl || null,
                    bio: bio || null
                })
                .eq('id', window.authManager.getCurrentUserId());

            if (error) throw error;

            // 更新本地缓存
            const userProfile = window.authManager.getUserProfile();
            if (userProfile) {
                userProfile.username = username;
                userProfile.avatar_url = avatarUrl;
                userProfile.bio = bio;
            }

            // 更新UI
            this.updateProfileUI({
                username: username,
                avatar_url: avatarUrl,
                bio: bio
            });

            // 隐藏模态框
            const modal = document.getElementById('edit-profile-modal');
            if (modal) {
                modal.style.display = 'none';
            }

            showMessage('资料更新成功！', 'success');
        } catch (error) {
            console.error('更新用户资料失败:', error);
            showMessage('更新失败: ' + error.message, 'error');
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 等待认证管理器初始化完成
    const checkAuth = () => {
        if (window.authManager && window.supabaseConfig) {
            new ProfilePage();
            
            // 监听认证状态变化
            window.authManager.addEventListener('authChange', () => {
                setTimeout(() => {
                    new ProfilePage();
                }, 100);
            });
        } else {
            setTimeout(checkAuth, 100);
        }
    };
    
    checkAuth();
});

// 监听模态框关闭事件
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('close') || e.target.classList.contains('modal')) {
        const editProfileModal = document.getElementById('edit-profile-modal');
        if (editProfileModal && e.target.classList.contains('modal')) {
            editProfileModal.style.display = 'none';
        }
    }
});