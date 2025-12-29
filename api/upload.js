const formidable = require('formidable')
const fs = require('fs')
const path = require('path')

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  res.setHeader('Content-Type', 'application/json')
  
  const form = formidable({})
  
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: '上传失败', success: false })
    }

    const uploadedFiles = []
    const FILE_DIR = '/tmp'
    
    // 处理文件
    if (files.files) {
      const fileList = Array.isArray(files.files) ? files.files : [files.files]
      
      fileList.forEach(file => {
        if (file && file.filepath) {
          const timestamp = Date.now()
          const filename = `${timestamp}_${file.originalFilename || 'file'}`
          const newPath = path.join(FILE_DIR, filename)
          
          try {
            fs.renameSync(file.filepath, newPath)
            uploadedFiles.push({
              fileName: file.originalFilename || 'file',
              savedName: filename,
              fileSize: file.size || 0,
              uploadTime: new Date().toISOString()
            })
          } catch (error) {
            console.error('文件保存错误:', error)
          }
        }
      })
    }

    const resource = {
      id: Date.now().toString(),
      title: fields.title?.[0] || '未命名资源',
      types: fields.types?.[0] ? fields.types[0].split(',') : [],
      description: fields.description?.[0] || '',
      files: uploadedFiles,
      uploader: '当前用户',
      uploadTime: new Date().toISOString()
    }

    res.json({ 
      success: true, 
      message: '上传成功！',
      data: resource 
    })
  })
}