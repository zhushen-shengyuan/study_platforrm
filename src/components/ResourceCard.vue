<template>
  <div class="resource-card" @click="$emit('click')">
    <h3>{{ resource.name }}</h3>
    <div class="resource-meta">
      <span class="resource-type">{{ getResourceTypeLabel(resource.type) }}</span>
      <span>上传者：{{ resource.uploader }}</span>
    </div>
    <div class="resource-meta">
      <span>上传时间：{{ formatDate(resource.uploadTime) }}</span>
    </div>
    <div class="resource-meta" v-if="resource.description">
      <span>{{ resource.description }}</span>
    </div>
    <!-- 多文件显示 -->
    <div class="resource-meta" v-if="resource.files?.length">
      <div class="file-list">
        <span>文件列表 ({{ resource.fileCount }}个)：</span>
        <div v-for="(file, index) in resource.files" :key="index" class="file-item">
          {{ file.originalName }}
        </div>
      </div>
    </div>
    <!-- 兼容单文件显示 -->
    <div class="resource-meta" v-else-if="resource.originalName || resource.fileName">
      <span>文件：{{ resource.originalName || resource.fileName }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResourceCard',
  props: {
    resource: {
      type: Object,
      required: true
    }
  },
  emits: ['click'],
  methods: {
    getResourceTypeLabel(type) {
      const typeMap = {
        'ppt': 'PPT',
        'word': 'Word',
        'pdf': 'PDF',
        'ebook': '电子书',
        'video': '视频',
        'other': '其他'
      }
      
      // 支持多选类型
      if (Array.isArray(type)) {
        return type.map(t => typeMap[t] || '其他').join('、')
      }
      
      return typeMap[type] || '其他'
    },
    formatDate(timestamp) {
      return new Date(timestamp).toLocaleString('zh-CN')
    }
  }
}
</script>

<style scoped>
.resource-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow);
}

.resource-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.resource-card h3 {
  color: var(--text-color);
  margin-bottom: 15px;
  font-size: 18px;
}

.resource-meta {
  margin: 8px 0;
  color: var(--text-color);
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.resource-type {
  background: var(--primary-color);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.file-list {
  margin-top: 5px;
}

.file-item {
  font-size: 12px;
  color: var(--text-color);
  opacity: 0.8;
  margin: 2px 0;
  padding: 2px 5px;
  background: var(--secondary-bg);
  border-radius: 3px;
  word-break: break-all;
}
</style>