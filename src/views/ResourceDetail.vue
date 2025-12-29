<template>
  <div>
    <Navbar />
    
    <div class="container">
      <!-- 资源详情 -->
      <div v-if="resource" class="resource-detail">
        <h1>{{ resource.name }}</h1>
        
        <div class="detail-info">
          <span class="detail-label">资源类型：</span>
          <span class="resource-type">{{ getResourceTypeLabel(resource.type) }}</span>
        </div>
        
        <div class="detail-info">
          <span class="detail-label">上传者：</span>
          <span>{{ resource.uploader }}</span>
        </div>
        
        <div class="detail-info">
          <span class="detail-label">上传时间：</span>
          <span>{{ formatDate(resource.uploadTime) }}</span>
        </div>
        
        <!-- 多文件显示 -->
        <div v-if="resource.files?.length" class="detail-info">
          <div>
            <span class="detail-label">文件列表 ({{ resource.fileCount }}个)：</span>
            <div class="file-list">
              <div v-for="(file, index) in resource.files" :key="index" class="file-item">
                <div>{{ file.originalName }}</div>
                <div class="file-size">大小：{{ formatFileSize(file.size) }}</div>
                <button 
                  class="btn-small" 
                  @click="downloadFile(file)"
                  :disabled="downloadingFiles.has(file.fileName)"
                >
                  {{ downloadingFiles.has(file.fileName) ? '下载中...' : '下载' }}
                </button>
              </div>
            </div>
            <div class="total-size">总大小：{{ formatFileSize(resource.totalSize) }}</div>
          </div>
        </div>
        
        <!-- 兼容单文件显示 -->
        <div v-if="!resource.files?.length" class="detail-info">
          <span class="detail-label">文件名称：</span>
          <span>{{ resource.originalName || resource.fileName }}</span>
        </div>
        
        <div v-if="resource.fileSize && !resource.files?.length" class="detail-info">
          <span class="detail-label">文件大小：</span>
          <span>{{ formatFileSize(resource.fileSize) }}</span>
        </div>
        
        <div class="detail-info">
          <span class="detail-label">资源描述：</span>
          <span>{{ resource.description }}</span>
        </div>
        
        <div style="margin-top: 30px; display: flex; gap: 10px; flex-wrap: wrap;">
          <button class="btn" @click="goBack">返回资源库</button>
          
          <!-- 下载文件按钮（仅单文件或兼容旧数据时显示） -->
          <button 
            v-if="!resource.files?.length"
            class="btn btn-primary" 
            @click="downloadFile"
            :disabled="isDownloading"
          >
            {{ isDownloading ? '下载中...' : '下载文件' }}
          </button>
          
          <!-- 只有上传者可以删除资源 -->
          <button 
            v-if="canDelete" 
            class="btn btn-danger" 
            @click="deleteResource"
            :disabled="isDeleting"
          >
            {{ isDeleting ? '删除中...' : '删除资源' }}
          </button>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <h3>资源不存在</h3>
        <p>该资源可能已被删除或链接有误</p>
        <button class="btn" @click="goBack" style="width: auto; margin-top: 20px;">
          返回资源库
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from '../components/Navbar.vue'

export default {
  name: 'ResourceDetail',
  components: {
    Navbar
  },
  data() {
    return {
      resource: null,
      isDownloading: false, // 下载状态
      isDeleting: false, // 删除状态
      downloadingFiles: new Set() // 正在下载的文件集合
    }
  },
  computed: {
    currentUser() {
      return localStorage.getItem('username')
    },
    canDelete() {
      return this.resource && this.resource.uploader === this.currentUser
    }
  },
  mounted() {
    this.loadResource()
  },
  watch: {
    '$route'() {
      this.loadResource()
    }
  },
  methods: {
    loadResource() {
      const resourceId = this.$route.params.id
      const allResources = JSON.parse(localStorage.getItem('resources') || '[]')
      this.resource = allResources.find(r => r.id == resourceId)
    },
    
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
    },
    
    goBack() {
      this.$router.push('/resources')
    },
    
    // 格式化文件大小
    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    
    // 下载文件 - 核心下载逻辑
    async downloadFile(file = null) {
      let targetFile
      const isMultiFileDownload = !!file
      
      if (isMultiFileDownload) {
        // 多文件下载中的单个文件
        targetFile = file.fileName
        
        // 检查是否已经在下载
        if (this.downloadingFiles.has(targetFile)) {
          return // 防止重复下载
        }
        
        this.downloadingFiles.add(targetFile)
      } else {
        // 单文件下载（兼容旧数据）
        targetFile = this.resource.fileName
        this.isDownloading = true
      }
      
      if (!targetFile) {
        alert('文件信息不完整，无法下载')
        if (isMultiFileDownload) {
          this.downloadingFiles.delete(targetFile)
        } else {
          this.isDownloading = false
        }
        return
      }
      
      try {
        // 调用后端下载接口
        const response = await fetch(`/api/download/${encodeURIComponent(targetFile)}`)
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || '下载失败')
        }
        
        // 创建下载链接并触发下载
        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        
        // 使用原始文件名作为下载文件名
        const fileName = isMultiFileDownload ? file.originalName : (this.resource.originalName || this.resource.fileName)
        link.href = downloadUrl
        link.download = fileName
        link.style.display = 'none'
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // 清理URL对象
        window.URL.revokeObjectURL(downloadUrl)
        
      } catch (error) {
        console.error('下载失败:', error)
        alert(`下载失败: ${error.message}`)
      } finally {
        if (isMultiFileDownload) {
          this.downloadingFiles.delete(targetFile)
        } else {
          this.isDownloading = false
        }
      }
    },
    
    // 删除资源 - 同时删除文件和元信息
    async deleteResource() {
      const fileCount = this.resource.files ? this.resource.files.length : 1
      if (!confirm(`确定要删除这个资源吗？此操作将同时删除 ${fileCount} 个文件，不可恢复。`)) {
        return
      }
      
      try {
        this.isDeleting = true
        
        // 删除所有相关文件
        if (this.resource.files && this.resource.files.length > 0) {
          // 多文件删除
          for (const file of this.resource.files) {
            try {
              const deleteResponse = await fetch(`/api/delete/${encodeURIComponent(file.fileName)}`, {
                method: 'DELETE'
              })
              const deleteResult = await deleteResponse.json()
              if (!deleteResult.success) {
                console.warn(`文件 ${file.fileName} 删除失败:`, deleteResult.message)
              }
            } catch (error) {
              console.error(`删除文件 ${file.fileName} 时出错:`, error)
            }
          }
        } else if (this.resource.fileName) {
          // 单文件删除（兼容旧数据）
          try {
            const deleteResponse = await fetch(`/api/delete/${encodeURIComponent(this.resource.fileName)}`, {
              method: 'DELETE'
            })
            const deleteResult = await deleteResponse.json()
            if (!deleteResult.success) {
              console.warn('文件删除失败，但继续删除元信息:', deleteResult.message)
            }
          } catch (error) {
            console.error('删除文件时出错:', error)
          }
        }
        
        // 删除资源元信息
        const resourceId = this.resource.id
        let allResources = JSON.parse(localStorage.getItem('resources') || '[]')
        allResources = allResources.filter(r => r.id !== resourceId)
        localStorage.setItem('resources', JSON.stringify(allResources))
        
        alert('资源删除成功')
        this.$router.push('/resources')
        
      } catch (error) {
        console.error('删除失败:', error)
        alert(`删除失败: ${error.message}`)
      } finally {
        this.isDeleting = false
      }
    }
  }
}
</script>

<style scoped>
.file-list {
  margin-top: 10px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 8px 0;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid #007bff;
}



.file-size {
  font-size: 12px;
  color: #666;
}

.btn-small {
  padding: 4px 12px;
  font-size: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.btn-small:hover {
  background-color: #0056b3;
}

.total-size {
  margin-top: 10px;
  font-weight: bold;
  color: #007bff;
}
</style>