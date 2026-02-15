import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'

// Plugin to copy .htaccess and API files to dist folder
const copyFilesPlugin = () => ({
  name: 'copy-files',
  closeBundle() {
    // Copy root .htaccess to dist/
    if (existsSync('.htaccess')) {
      copyFileSync('.htaccess', 'dist/.htaccess')
      console.log('✓ Copied .htaccess to dist/')
    }

    // Copy entire api/ folder to dist/api/
    if (existsSync('api')) {
      if (!existsSync('dist/api')) {
        mkdirSync('dist/api', { recursive: true })
      }

      const copyDir = (src, dest) => {
        const entries = readdirSync(src, { withFileTypes: true })
        for (const entry of entries) {
          const srcPath = join(src, entry.name)
          const destPath = join(dest, entry.name)
          
          if (entry.isDirectory()) {
            if (!existsSync(destPath)) {
              mkdirSync(destPath, { recursive: true })
            }
            copyDir(srcPath, destPath)
          } else {
            copyFileSync(srcPath, destPath)
          }
        }
      }

      copyDir('api', 'dist/api')
      console.log('✓ Copied api/ folder to dist/api/')
    }
  }
})

export default defineConfig({
  plugins: [react(), copyFilesPlugin()],
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
