<template>
  <div>
    <Navbar />
    
    <div class="container">
      <h1 class="page-title">个人中心</h1>
      
      <!-- 用户信息 -->
      <div class="profile-section">
        <div class="profile-header">
          <h2>用户信息</h2>
          <div class="detail-info">
            <span class="detail-label">用户名：</span>
            <span>{{ currentUser }}</span>
          </div>
        </div>
        
        <button class="btn btn-danger" @click="logout">退出登录</button>
      </div>
      
      <!-- 我的资源 -->
      <div class="profile-section">
        <h2>我的资源</h2>
        <div class="resource-grid">
          <ResourceCard 
            v-for="resource in myResources" 
            :key="resource.id"
            :resource="resource"
            @click="viewResource(resource.id)"
          />
        </div>
        
        <div v-if="myResources.length === 0" class="empty-state">
          <h3>您还没有上传任何资源</h3>
          <p>去 <router-link to="/upload" style="color: #667eea;">上传资源</router-link> 吧！</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from '../components/Navbar.vue'
import ResourceCard from '../components/ResourceCard.vue'

export default {
  name: 'Profile',
  components: {
    Navbar,
    ResourceCard
  },
  computed: {
    currentUser() {
      return localStorage.getItem('username') || '未知用户'
    },
    myResources() {
      const allResources = JSON.parse(localStorage.getItem('resources') || '[]')
      return allResources.filter(resource => resource.uploader === this.currentUser)
    }
  },
  methods: {
    viewResource(id) {
      this.$router.push(`/resource/${id}`)
    },
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      this.$router.push('/login')
    }
  }
}
</script>