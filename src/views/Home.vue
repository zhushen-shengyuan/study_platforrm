<template>
  <div>
    <Navbar />
    
    <div class="container">
      <!-- 轮播图 -->
      <div class="carousel">
        <div 
          v-for="(slide, index) in slides" 
          :key="index"
          :class="['carousel-slide', { active: index === currentSlide }]"
          :style="{ backgroundImage: `url(${slide.image})` }"
        ></div>
        
        <!-- 左切换按钮 -->
        <button class="carousel-btn carousel-btn-left" @click="prevSlide">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        
        <!-- 右切换按钮 -->
        <button class="carousel-btn carousel-btn-right" @click="nextSlide">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
        
        <!-- 指示器 -->
        <div class="carousel-indicators">
          <button 
            v-for="(slide, index) in slides" 
            :key="index"
            :class="['indicator', { active: index === currentSlide }]"
            @click="goToSlide(index)"
          ></button>
        </div>
      </div>
      
      <!-- 资源推荐区 -->
      <div class="recommendations">
        <h2>热门资源推荐</h2>
        <div class="resource-grid">
          <ResourceCard 
            v-for="resource in recommendedResources" 
            :key="resource.id"
            :resource="resource"
            @click="viewResource(resource.id)"
          />
        </div>
        
        <div v-if="recommendedResources.length === 0" class="empty-state">
          <h3>暂无推荐资源</h3>
          <p>快去上传一些学习资源吧！</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from '../components/Navbar.vue'
import ResourceCard from '../components/ResourceCard.vue'

export default {
  name: 'Home',
  components: {
    Navbar,
    ResourceCard
  },
  data() {
    return {
      currentSlide: 0,
      slides: [
        {
          image: '/book-419589_1280.jpg'
        },
        {
          image: '/books-1617327_640.jpg'
        },
        {
          image: '/book-1283865_640.jpg'
        },
        {
          image: '/open-book-1428428_640.jpg'
        }
      ]
    }
  },
  computed: {
    recommendedResources() {
      const resources = JSON.parse(localStorage.getItem('resources') || '[]')
      // 获取前5个资源作为推荐
      return resources.slice(0, 5)
    }
  },
  mounted() {
    // 启动轮播图自动播放
    this.startCarousel()
  },
  beforeUnmount() {
    // 清理轮播图定时器
    if (this.carouselTimer) {
      clearInterval(this.carouselTimer)
    }
  },
  methods: {
    startCarousel() {
      this.carouselTimer = setInterval(() => {
        this.nextSlide()
      }, 3000)
    },
    nextSlide() {
      this.currentSlide = (this.currentSlide + 1) % this.slides.length
    },
    prevSlide() {
      this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length
    },
    goToSlide(index) {
      this.currentSlide = index
    },
    viewResource(id) {
      this.$router.push(`/resource/${id}`)
    }
  }
}
</script>

<style scoped>
.carousel {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: var(--shadow);
}

.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0;
  transition: opacity 1s ease-in-out;
}

.carousel-slide.active {
  opacity: 1;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  color: var(--text-color);
  box-shadow: var(--shadow);
}

.carousel-btn:hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-50%) scale(1.1);
}

.carousel-btn-left {
  left: 20px;
}

.carousel-btn-right {
  right: 20px;
}

.carousel-indicators {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid var(--text-color);
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0.5;
}

.indicator:hover {
  opacity: 0.8;
}

.indicator.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  width: 16px;
  height: 16px;
  opacity: 1;
}

.recommendations {
  margin-top: 40px;
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.empty-state {
  text-align: center;
  margin-top: 40px;
  color: var(--text-color);
  opacity: 0.7;
}

.empty-state h3 {
  margin-bottom: 10px;
  color: var(--text-color);
  opacity: 1;
}
</style>