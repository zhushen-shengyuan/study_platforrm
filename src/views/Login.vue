<template>
  <div class="login-container">
    <div class="login-form">
      <h2>学习资源平台登录</h2>
      
      <!-- 成功提示 -->
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            type="text" 
            id="username" 
            v-model="loginForm.username" 
            placeholder="请输入用户名"
            required
          >
          <div v-if="errors.username" class="error-message">{{ errors.username }}</div>
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            type="password" 
            id="password" 
            v-model="loginForm.password" 
            placeholder="请输入密码"
            required
          >
          <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
        </div>
        
        <div class="form-group">
          <div class="checkbox-group">
            <input type="checkbox" id="remember" v-model="loginForm.remember">
            <label for="remember">记住密码</label>
          </div>
        </div>
        
        <button type="submit" class="btn">登录</button>
      </form>
      
      <div style="margin-top: 20px; text-align: center; color: #666; font-size: 14px;">
        <p>测试账号：</p>
        <p>用户名：student1，密码：123456</p>
        <p>用户名：student2，密码：123456</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      loginForm: {
        username: '',
        password: '',
        remember: false
      },
      errors: {},
      successMessage: ''
    }
  },
  mounted() {
    // 检查是否有记住的用户信息
    const savedUsername = localStorage.getItem('savedUsername')
    if (savedUsername) {
      this.loginForm.username = savedUsername
      this.loginForm.remember = true
    }
  },
  methods: {
    handleLogin() {
      // 清空错误信息
      this.errors = {}
      this.successMessage = ''
      
      // 表单验证
      if (!this.loginForm.username.trim()) {
        this.errors.username = '请输入用户名'
        return
      }
      
      if (!this.loginForm.password.trim()) {
        this.errors.password = '请输入密码'
        return
      }
      
      // 验证测试账号
      const validAccounts = [
        { username: 'student1', password: '123456' },
        { username: 'student2', password: '123456' }
      ]
      
      const isValidAccount = validAccounts.some(
        account => account.username === this.loginForm.username && 
                   account.password === this.loginForm.password
      )
      
      if (isValidAccount) {
        // 登录成功
        localStorage.setItem('token', 'mock-token-' + Date.now())
        localStorage.setItem('username', this.loginForm.username)
        
        // 记住密码功能
        if (this.loginForm.remember) {
          localStorage.setItem('savedUsername', this.loginForm.username)
        } else {
          localStorage.removeItem('savedUsername')
        }
        
        // 初始化示例数据（如果不存在）
        this.initSampleData()
        
        this.successMessage = '登录成功，正在跳转...'
        
        // 延迟跳转以显示成功消息
        setTimeout(() => {
          this.$router.push('/home')
        }, 1000)
      } else {
        this.errors.username = '用户名或密码错误'
      }
    },
    
    // 初始化示例数据
    initSampleData() {
      const existingResources = localStorage.getItem('resources')
      if (!existingResources) {
        const sampleResources = [
          {
            id: Date.now() + 1,
            name: 'Vue.js 入门教程',
            type: 'ppt',
            uploader: 'student1',
            uploadTime: Date.now() - 86400000,
            description: 'Vue.js 基础知识讲解，适合初学者',
            fileName: 'vue入门教程.pptx'
          },
          {
            id: Date.now() + 2,
            name: 'JavaScript 高级编程',
            type: 'pdf',
            uploader: 'student1',
            uploadTime: Date.now() - 172800000,
            description: 'JavaScript 深入理解',
            fileName: 'js高级编程.pdf'
          },
          {
            id: Date.now() + 3,
            name: 'React 实战项目',
            type: 'video',
            uploader: 'student2',
            uploadTime: Date.now() - 259200000,
            description: 'React 项目实战视频教程',
            fileName: 'react实战.mp4'
          }
        ]
        localStorage.setItem('resources', JSON.stringify(sampleResources))
      }
    }
  }
}
</script>