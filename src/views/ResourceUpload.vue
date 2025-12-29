<template>
  <div>
    <Navbar />
    
    <div class="container">
      <h1 class="page-title">资源上传</h1>
      
      <!-- 成功提示 -->
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
      
      <!-- 上传表单 -->
      <div class="profile-section">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="resourceName">资源名称 *</label>
            <input 
              type="text" 
              id="resourceName" 
              v-model="uploadForm.name" 
              placeholder="请输入资源名称"
              required
            >
            <div v-if="errors.name" class="error-message">{{ errors.name }}</div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>资源类型 *</label>
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" value="ppt" v-model="uploadForm.type">
                  <span>PPT</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" value="word" v-model="uploadForm.type">
                  <span>Word</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" value="pdf" v-model="uploadForm.type">
                  <span>PDF</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" value="ebook" v-model="uploadForm.type">
                  <span>电子书</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" value="video" v-model="uploadForm.type">
                  <span>视频</span>
                </label>

                <label class="checkbox-label">
                  <input type="checkbox" value="other" v-model="uploadForm.type">
                  <span>其他</span>
                </label>
              </div>
              <div v-if="errors.type" class="error-message">{{ errors.type }}</div>
            </div>
            
            <div class="form-group">
              <label for="fileUpload">文件上传 *</label>
              <input 
                type="file" 
                id="fileUpload" 
                @change="handleFileChange"
                accept=".ppt,.pptx,.doc,.docx,.pdf,.epub,.mobi,.txt,.mp4,.avi,.mov,.zip,.rar,.7z,.tar,.gz"
                :disabled="isUploading"
                multiple
              >
              <div v-if="selectedFiles.length > 0" class="resource-meta" style="margin-top: 5px;">
                已选择 {{ selectedFiles.length }} 个文件：
                <div v-for="(file, index) in selectedFiles" :key="index" class="selected-file">
                  {{ file.name }}
                </div>
              </div>
              <div v-if="errors.fileName" class="error-message">{{ errors.fileName }}</div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="description">资源描述</label>
            <textarea 
              id="description" 
              v-model="uploadForm.description" 
              rows="4" 
              placeholder="请输入资源描述（可选）"
            ></textarea>
          </div>
          
          <button type="submit" class="btn" :disabled="isUploading">
            {{ isUploading ? '上传中...' : '提交上传' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from '../components/Navbar.vue'

export default {
  name: 'ResourceUpload',
  components: {
    Navbar
  },
  data() {
    return {
      uploadForm: {
        name: '',
        type: [],
        description: '',
        fileName: ''
      },
      selectedFiles: [], // 选择的文件对象数组
      errors: {},
      successMessage: '',
      isUploading: false // 上传状态
    }
  },
  methods: {
    handleFileChange(event) {
      const files = Array.from(event.target.files)
      if (files.length > 0) {
        this.selectedFiles = files
        this.uploadForm.fileName = `${files.length}个文件`
      } else {
        this.selectedFiles = []
        this.uploadForm.fileName = ''
      }
    },
    
    async handleSubmit() {
      // 清空错误信息
      this.errors = {}
      this.successMessage = ''
      
      // 表单验证
      if (!this.uploadForm.name.trim()) {
        this.errors.name = '请输入资源名称'
        return
      }
      
      if (!this.uploadForm.type.length) {
        this.errors.type = '请选择至少一个资源类型'
        return
      }
      
      if (!this.selectedFiles.length) {
        this.errors.fileName = '请选择要上传的文件'
        return
      }
      
      try {
        this.isUploading = true
        this.successMessage = '正在上传文件...'
        
        // 为每个文件创建单独的资源记录
        const uploadResults = []
        
        for (let i = 0; i < this.selectedFiles.length; i++) {
          const file = this.selectedFiles[i]
          
          // 创建FormData对象进行文件上传
          const formData = new FormData()
          formData.append('file', file)
          
          // 调用后端上传接口
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })
          
          const result = await response.json()
          
          if (!result.success) {
            throw new Error(`文件 ${file.name} 上传失败: ${result.message || '上传失败'}`)
          }
          
          uploadResults.push({
            fileName: result.data.fileName,
            originalName: result.data.originalName,
            size: result.data.size
          })
        }
        
        // 创建资源对象（多个文件合并为一个资源记录）
        const newResource = {
          id: Date.now(),
          name: this.uploadForm.name,
          type: this.uploadForm.type,
          uploader: localStorage.getItem('username'),
          uploadTime: Date.now(),
          description: this.uploadForm.description || '暂无描述',
          files: uploadResults, // 存储所有上传的文件信息
          fileCount: uploadResults.length, // 文件数量
          totalSize: uploadResults.reduce((sum, file) => sum + file.size, 0) // 总文件大小
        }
        
        // 保存资源元信息到 localStorage
        const existingResources = JSON.parse(localStorage.getItem('resources') || '[]')
        existingResources.unshift(newResource)
        localStorage.setItem('resources', JSON.stringify(existingResources))
        
        // 显示成功消息
        this.successMessage = '资源上传成功！正在跳转到资源库...'
        
        // 重置表单
        this.uploadForm = {
          name: '',
          type: [],
          description: '',
          fileName: ''
        }
        this.selectedFiles = []
        document.getElementById('fileUpload').value = '' // 清空文件选择框
        
        // 延迟跳转
        setTimeout(() => {
          this.$router.push('/resources')
        }, 1500)
        
      } catch (error) {
        console.error('上传失败:', error)
        this.successMessage = ''
        alert(`上传失败: ${error.message}`)
      } finally {
        this.isUploading = false
      }
    }
  }
}
</script>

<style scoped>
.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 5px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}

.checkbox-label input[type="checkbox"] {
  margin-right: 5px;
  transform: scale(1.1);
}

.checkbox-label:hover {
  color: #007bff;
}

.selected-file {
  padding: 2px 8px;
  margin: 2px 0;
  background-color: #f0f8ff;
  border-radius: 4px;
  font-size: 12px;
  word-break: break-all;
}
</style>