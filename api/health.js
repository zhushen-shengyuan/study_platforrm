module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'public, max-age=3600')
  res.json({ status: 'ok', message: '学习资源平台API运行正常' })
}