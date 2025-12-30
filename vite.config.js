import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/study_platforrm/',  // GitHub Pages路径
  server: {
    port: 5173
  }
})