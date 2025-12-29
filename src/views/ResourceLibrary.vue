<template>
  <div>
    <Navbar />
    
    <div class="container">
      <h1 class="page-title">资源库</h1>
      
      <!-- 使用筛选器组件 -->
      <ResourceFilter
        :selected-type="selectedType"
        :selected-year="selectedYear"
        :selected-month="selectedMonth"
        :available-years="availableYears"
        :result-count="filteredResources.length"
        @update:selectedType="selectedType = $event"
        @update:selectedYear="selectedYear = $event"
        @update:selectedMonth="selectedMonth = $event"
        @reset="resetFilters"
      />
      
      <!-- 资源列表 -->
      <div class="resource-grid">
        <ResourceCard 
          v-for="resource in filteredResources" 
          :key="resource.id"
          :resource="resource"
          @click="viewResource(resource.id)"
        />
      </div>
      
      <div v-if="filteredResources.length === 0" class="empty-state">
        <h3>暂无资源</h3>
        <p>{{ getEmptyMessage() }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from '../components/Navbar.vue'
import ResourceCard from '../components/ResourceCard.vue'
import ResourceFilter from '../components/ResourceFilter.vue'

export default {
  name: 'ResourceLibrary',
  components: {
    Navbar,
    ResourceCard,
    ResourceFilter
  },
  data() {
    return {
      selectedType: '',
      selectedYear: '',
      selectedMonth: '',
      allResources: []
    }
  },
  computed: {
    // 获取可用的年份列表
    availableYears() {
      const years = [...new Set(this.allResources.map(resource => 
        new Date(resource.uploadTime).getFullYear()
      ))].sort((a, b) => b - a)
      return years
    },
    
    // 筛选后的资源列表
    filteredResources() {
      let filtered = [...this.allResources]
      
      // 按类型筛选
      if (this.selectedType) {
        filtered = filtered.filter(resource => resource.type === this.selectedType)
      }
      
      // 按年份筛选
      if (this.selectedYear) {
        filtered = filtered.filter(resource => {
          const year = new Date(resource.uploadTime).getFullYear()
          return year.toString() === this.selectedYear
        })
      }
      
      // 按月份筛选
      if (this.selectedMonth) {
        filtered = filtered.filter(resource => {
          const month = new Date(resource.uploadTime).getMonth() + 1
          return month.toString() === this.selectedMonth
        })
      }
      
      return filtered.sort((a, b) => b.uploadTime - a.uploadTime)
    }
  },
  mounted() {
    this.loadResources()
  },
  methods: {
    loadResources() {
      const resources = localStorage.getItem('resources')
      this.allResources = resources ? JSON.parse(resources) : []
    },
    
    // 重置所有筛选条件
    resetFilters() {
      this.selectedType = ''
      this.selectedYear = ''
      this.selectedMonth = ''
    },
    
    // 获取空状态提示消息
    getEmptyMessage() {
      if (this.selectedType && this.selectedYear && this.selectedMonth) {
        const typeLabel = this.getTypeLabel()
        return `${this.selectedYear}年${this.selectedMonth}月的${typeLabel}暂无资源`
      } else if (this.selectedType && this.selectedYear) {
        const typeLabel = this.getTypeLabel()
        return `${this.selectedYear}年的${typeLabel}暂无资源`
      } else if (this.selectedYear && this.selectedMonth) {
        return `${this.selectedYear}年${this.selectedMonth}月暂无资源`
      } else if (this.selectedType) {
        const typeLabel = this.getTypeLabel()
        return `${typeLabel}暂无资源`
      } else if (this.selectedYear) {
        return `${this.selectedYear}年暂无资源`
      } else if (this.selectedMonth) {
        return `请先选择年份`
      } else {
        return '快去上传一些学习资源吧！'
      }
    },
    
    // 获取类型标签
    getTypeLabel() {
      const typeMap = {
        'ppt': 'PPT',
        'word': 'Word',
        'pdf': 'PDF',
        'ebook': '电子书',
        'video': '视频',
        'other': '其他'
      }
      return typeMap[this.selectedType] || '资源'
    },
    
    viewResource(id) {
      this.$router.push(`/resource/${id}`)
    }
  }
}
</script>