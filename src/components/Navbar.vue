<template>
  <nav class="navbar">
    <div class="navbar-content">
      <router-link to="/home" class="navbar-brand">学习资源平台</router-link>
      
      <ul class="navbar-menu">
        <li><router-link to="/home">首页</router-link></li>
        <li><router-link to="/resources">资源库</router-link></li>
        <li><router-link to="/upload">资源上传</router-link></li>
        <li><router-link to="/profile">个人中心</router-link></li>
      </ul>
      
      <div class="navbar-actions">
        <!-- 日夜间模式切换 -->
        <button class="theme-toggle" @click="toggleTheme" :title="isDark ? '切换到日间模式' : '切换到夜间模式'">
          <svg v-if="!isDark" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 18c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6zm0-10c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm0 16c-5.5 0-10-4.5-10-10s4.5-10 10-10 10 4.5 10 10-4.5 10-10 10z"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
        
        <div class="user-info">
          <span>欢迎，{{ currentUser }}</span>
          <button class="btn btn-secondary" @click="logout" style="width: auto; padding: 8px 16px;">
            退出登录
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'Navbar',
  data() {
    return {
      isDark: false
    }
  },
  computed: {
    currentUser() {
      return localStorage.getItem('username') || '用户'
    }
  },
  mounted() {
    // 初始化主题
    this.isDark = localStorage.getItem('theme') === 'dark'
    this.applyTheme()
  },
  methods: {
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      this.$router.push('/login')
    },
    toggleTheme() {
      this.isDark = !this.isDark
      this.applyTheme()
      localStorage.setItem('theme', this.isDark ? 'dark' : 'light')
    },
    applyTheme() {
      if (this.isDark) {
        document.documentElement.setAttribute('data-theme', 'dark')
      } else {
        document.documentElement.removeAttribute('data-theme')
      }
    }
  }
}
</script>

<style scoped>
.navbar {
  background: var(--card-bg);
  padding: 15px 0;
  box-shadow: var(--shadow);
  border-bottom: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.navbar-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-brand {
  font-size: 24px;
  font-weight: bold;
  color: var(--text-color);
  text-decoration: none;
  transition: color 0.3s ease;
}

.navbar-brand:hover {
  color: var(--primary-color);
}

.navbar-menu {
  display: flex;
  list-style: none;
  gap: 30px;
  margin: 0;
  padding: 0;
}

.navbar-menu li {
  margin: 0;
}

.navbar-menu a {
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  padding: 8px 0;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.navbar-menu a:hover,
.navbar-menu a.router-link-active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.theme-toggle {
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle:hover {
  background: var(--secondary-bg);
  transform: rotate(180deg);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
  color: var(--text-color);
}

.btn-secondary {
  background: var(--secondary-bg);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--border-color);
}
</style>