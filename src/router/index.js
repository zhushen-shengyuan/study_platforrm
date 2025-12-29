import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import ResourceLibrary from '../views/ResourceLibrary.vue'
import ResourceUpload from '../views/ResourceUpload.vue'
import Profile from '../views/Profile.vue'
import ResourceDetail from '../views/ResourceDetail.vue'

// 路由守卫：检查用户是否已登录
const requireAuth = (to, from, next) => {
  const token = localStorage.getItem('token')
  if (!token) {
    next('/login')
  } else {
    next()
  }
}

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    beforeEnter: requireAuth
  },
  {
    path: '/resources',
    name: 'ResourceLibrary',
    component: ResourceLibrary,
    beforeEnter: requireAuth
  },
  {
    path: '/upload',
    name: 'ResourceUpload',
    component: ResourceUpload,
    beforeEnter: requireAuth
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    beforeEnter: requireAuth
  },
  {
    path: '/resource/:id',
    name: 'ResourceDetail',
    component: ResourceDetail,
    beforeEnter: requireAuth
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router