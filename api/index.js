const fs = require('fs')
const path = require('path')
const express = require('express')
const multer = require('multer')
const cors = require('cors')

const app = express()

// 中间件配置
app.use(cors())
app.use(express.json())

// 确保file文件夹存在
const FILE_DIR = '/tmp/file' // Vercel临时目录
if (!fs.existsSync(FILE_DIR)) {
  fs.mkdirSync(FILE_DIR, { recursive: true })
}

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, FILE_DIR)
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now()
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8')
    cb(null, `${timestamp}_${originalName}`)
  }
})

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
})

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '学习资源平台API运行正常' })
})

// 文件上传
app.post('/api/upload', upload.array('files'), (req, res) => {
  try {
    const { title, types, description } = req.body
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: '请选择文件' })
    }

    const resource = {
      id: Date.now().toString(),
      title: title || '未命名资源',
      types: types ? types.split(',') : [],
      description: description || '',
      files: req.files.map(file => ({
        fileName: file.originalname,
        savedName: file.filename,
        fileSize: file.size,
        uploadTime: new Date().toISOString()
      })),
      uploader: '当前用户',
      uploadTime: new Date().toISOString()
    }

    // 返回成功响应
    res.json({ 
      success: true, 
      message: '上传成功！',
      data: resource 
    })

  } catch (error) {
    console.error('上传错误:', error)
    res.status(500).json({ error: '上传失败，请重试' })
  }
})

// 文件下载
app.get('/api/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename
    const filePath = path.join(FILE_DIR, filename)
    
    if (fs.existsSync(filePath)) {
      res.download(filePath, (err) => {
        if (err) {
          console.error('下载错误:', err)
          res.status(500).json({ error: '下载失败' })
        }
      })
    } else {
      res.status(404).json({ error: '文件不存在' })
    }
  } catch (error) {
    console.error('下载错误:', error)
    res.status(500).json({ error: '下载失败' })
  }
})

// 文件删除
app.delete('/api/delete/:filename', (req, res) => {
  try {
    const filename = req.params.filename
    const filePath = path.join(FILE_DIR, filename)
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      res.json({ success: true, message: '删除成功' })
    } else {
      res.status(404).json({ error: '文件不存在' })
    }
  } catch (error) {
    console.error('删除错误:', error)
    res.status(500).json({ error: '删除失败' })
  }
})

// 静态文件服务
app.use('/file', express.static(FILE_DIR))

module.exports = app