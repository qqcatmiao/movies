// 认证模块
class AuthManager {
    constructor() {
        this.supabase = window.supabaseConfig.supabase;
        this.currentUser = null;
        this.eventListeners = {};
        this.init();
    }

    // 添加事件监听器
    addEventListener(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }

    // 触发事件
    triggerEvent(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Event listener error for ${event}:`, error);
                }
            });
        }
    }

    async init() {
        // 检查当前会话
        const { data: { session } } = await this.supabase.auth.getSession();
        if (session) {
            this.currentUser = session.user;
            await this.loadUserProfile(session.user.id);
        }
        this.updateUI();
    }

    // 注册新用户
    async signUp(email, password, username) {
        try {
            const { data, error } = await this.supabase.auth.signUp({
                email: email,
                password: password
            });

            if (error) throw error;

            // 创建用户配置文件
            if (data.user) {
                const { error: profileError } = await this.supabase
                    .from('profiles')
                    .insert([{
                        id: data.user.id,
                        username: username,
                        avatar_url: 'https://via.placeholder.com/100',
                        bio: '这位用户很懒，还没有写简介',
                        created_at: new Date().toISOString()
                    }]);

                if (profileError) {
                    console.error('创建用户配置失败:', profileError);
                }
            }

            return { success: true, data };
        } catch (error) {
            console.error('注册失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 用户登录
    async signIn(email, password) {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            this.currentUser = data.user;
            await this.loadUserProfile(data.user.id);
            this.updateUI();

            return { success: true, data };
        } catch (error) {
            console.error('登录失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 用户登出
    async signOut() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;

            this.currentUser = null;
            this.updateUI();
            return { success: true };
        } catch (error) {
            console.error('登出失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 加载用户配置文件
    async loadUserProfile(userId) {
        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            
            this.userProfile = data;
            return data;
        } catch (error) {
            console.error('加载用户配置失败:', error);
            return null;
        }
    }

    // 更新用户界面状态
    updateUI() {
        const authSection = document.getElementById('auth-section');

        if (this.currentUser) {
            if (authSection) {
                authSection.innerHTML = `
                    <span style="color: white; margin-right: 1rem;">欢迎, ${this.userProfile?.username || '用户'}</span>
                    <button id="logout-btn" class="btn-secondary">登出</button>
                `;
            }
        } else {
            if (authSection) {
                authSection.innerHTML = `
                    <button id="login-btn" class="btn-primary">登录</button>
                    <button id="logout-btn" class="btn-secondary" style="display: none;">登出</button>
                `;
            }
        }
        
        // 重新绑定事件监听器到新生成的按钮
        this.bindAuthEvents();
        
        // 触发认证状态变化事件
        this.triggerEvent('authChange', {
            isAuthenticated: this.currentUser !== null,
            user: this.currentUser,
            profile: this.userProfile
        });
    }
    
    // 绑定认证事件监听器
    bindAuthEvents() {
        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const promptLoginBtn = document.getElementById('prompt-login-btn');

        console.log('绑定认证事件:', { loginBtn, logoutBtn, promptLoginBtn });

        if (loginBtn) {
            loginBtn.onclick = () => {
                console.log('登录按钮被点击');
                window.modalManager.show('login-modal');
            };
        }
        
        if (promptLoginBtn) {
            promptLoginBtn.onclick = () => {
                console.log('立即登录按钮被点击');
                window.modalManager.show('login-modal');
            };
        }
        
        if (logoutBtn) {
            logoutBtn.onclick = () => this.signOut();
        }
    }

    // 检查用户是否登录
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // 获取当前用户ID
    getCurrentUserId() {
        return this.currentUser?.id || null;
    }

    // 获取用户配置文件
    getUserProfile() {
        return this.userProfile;
    }
}

// 创建全局认证管理器实例
window.authManager = new AuthManager();

// 模态框管理
class ModalManager {
    constructor() {
        this.modals = {};
        this.init();
    }

    init() {
        // 监听所有模态框关闭按钮
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close') || e.target.classList.contains('modal')) {
                this.hideAll();
            }
        });

        // 登录/注册切换
        document.addEventListener('click', (e) => {
            if (e.target.id === 'show-signup') {
                e.preventDefault();
                this.hide('login-modal');
                this.show('signup-modal');
            } else if (e.target.id === 'show-login') {
                e.preventDefault();
                this.hide('signup-modal');
                this.show('login-modal');
            }
        });
    }

    show(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            this.modals[modalId] = modal;
        }
    }

    hide(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    hideAll() {
        Object.keys(this.modals).forEach(modalId => {
            this.hide(modalId);
        });
    }
}

// 创建全局模态框管理器
window.modalManager = new ModalManager();

// 页面加载完成后初始化事件监听
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，开始绑定事件');
    
    // 登录按钮点击事件 - 修复事件委托
    document.addEventListener('click', function(e) {
        console.log('点击事件触发:', e.target.id);
        if (e.target.id === 'login-btn' || e.target.id === 'prompt-login-btn') {
            console.log('显示登录模态框');
            window.modalManager.show('login-modal');
        }
        
        // 登出按钮点击事件 - 修复动态生成按钮的监听
        if (e.target.id === 'logout-btn' || e.target.closest('#logout-btn')) {
            window.authManager.signOut();
        }
    });
    
    // 立即绑定认证事件监听器
    window.authManager.bindAuthEvents();

    // 登录表单提交
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const result = await window.authManager.signIn(email, password);
            
            if (result.success) {
                window.modalManager.hideAll();
                showMessage('登录成功！', 'success');
                // 刷新页面或更新内容
                if (window.location.pathname.includes('profile.html')) {
                    window.location.reload();
                }
            } else {
                showMessage('登录失败: ' + result.error, 'error');
            }
        });
    }

    // 注册表单提交
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            
            const result = await window.authManager.signUp(email, password, username);
            
            if (result.success) {
                window.modalManager.hideAll();
                showMessage('注册成功！请检查邮箱验证邮件', 'success');
            } else {
                showMessage('注册失败: ' + result.error, 'error');
            }
        });
    }
});

// 显示消息提示
function showMessage(message, type = 'success') {
    // 移除现有消息
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // 创建新消息
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // 添加到页面顶部
    document.body.insertBefore(messageDiv, document.body.firstChild);
    
    // 3秒后自动移除
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}