import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync } from 'fs'

// Plugin to copy .htaccess files to dist folder
const copyHtaccessPlugin = () => ({
  name: 'copy-htaccess',
  closeBundle() {
    // Copy root .htaccess to dist/
    if (existsSync('.htaccess')) {
      copyFileSync('.htaccess', 'dist/.htaccess')
      console.log('✓ Copied .htaccess to dist/')
    }
    // Copy api/.htaccess
    if (existsSync('api/.htaccess')) {
      if (!existsSync('dist/api')) {
        mkdirSync('dist/api', { recursive: true })
      }
      copyFileSync('api/.htaccess', 'dist/api/.htaccess')
      console.log('✓ Copied api/.htaccess to dist/api/')
    }
  }
})

export default defineConfig({
  plugins: [react(), copyHtaccessPlugin()],
  // Base path for deployment - subdirectory deployment under /association/
  base: '/association/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
})
