// 电子学习资源平台 - 后端服务器
const express = require('express')
const multer = require('multer')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

const app = express()
const PORT = process.env.PORT || 3001

// 中间件配置
app.use(cors())
app.use(express.json())

// 确保file文件夹存在
const FILE_DIR = path.join(__dirname, 'file')
if (!fs.existsSync(FILE_DIR)) {
  fs.mkdirSync(FILE_DIR, { recursive: true })
  console.log('✅ 创建file文件夹成功')
}

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, FILE_DIR)
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now()
    // 确保文件名正确处理中文，使用Buffer处理编码
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8')
    const uniqueName = `${timestamp}_${originalName}`
    cb(null, uniqueName)
  }
})

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB（支持更大的压缩包文件）
})

// 文件上传接口
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '未选择文件' })
    }

    // 提取原始文件名（去掉时间戳前缀），确保正确处理中文编码
    const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8')

    res.json({
      success: true,
      message: '文件上传成功',
      data: {
        fileName: req.file.filename,
        originalName: originalName,
        size: req.file.size,
        filePath: `/file/${req.file.filename}`
      }
    })
  } catch (error) {
    console.error('文件上传失败:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

// 文件下载接口
app.get('/api/download/:filename', (req, res) => {
  try {
    // 对文件名进行URL解码
    const filename = decodeURIComponent(req.params.filename)
    const filePath = path.join(FILE_DIR, filename)
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: '文件不存在' })
    }

    const fileStats = fs.statSync(filePath)
    
    // 提取原始文件名用于下载，确保正确处理中文编码
    let downloadName = filename
    const underscoreIndex = filename.indexOf('_')
    if (underscoreIndex > 0) {
      downloadName = filename.substring(underscoreIndex + 1)
    }
    // 确保文件名编码正确
    downloadName = Buffer.from(downloadName, 'latin1').toString('utf8')
    
    res.setHeader('Content-Type', 'application/octet-stream')
    res.setHeader('Content-Length', fileStats.size)
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadName)}"`)
    
    const fileStream = fs.createReadStream(filePath)
    fileStream.pipe(res)
    
    fileStream.on('error', (error) => {
      console.error('文件下载失败:', error)
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: '文件下载失败' })
      }
    })
    
  } catch (error) {
    console.error('文件下载失败:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

// 文件删除接口
app.delete('/api/delete/:filename', (req, res) => {
  try {
    const filename = req.params.filename
    const filePath = path.join(FILE_DIR, filename)
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: '文件不存在' })
    }
    
    fs.unlinkSync(filePath)
    res.json({ success: true, message: '文件删除成功' })
    
  } catch (error) {
    console.error('文件删除失败:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

// 静态文件服务
app.use('/file', express.static(FILE_DIR))

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '服务器运行正常' })
})

// Vercel导出
if (process.env.NODE_ENV !== 'production') {
  // 本地开发环境
  app.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`)
    console.log(`📁 文件存储路径: ${FILE_DIR}`)
    console.log('✅ 文件上传下载服务已就绪')
  })
}

// Vercel云函数导出
module.exports = app