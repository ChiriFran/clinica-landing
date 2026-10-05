import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('/firebase/firestore/') || id.includes('/@firebase/firestore/')) return 'firestore'
          if (id.includes('/firebase/storage/') || id.includes('/@firebase/storage/')) return 'storage-sdk'
          if (id.includes('/firebase/auth/') || id.includes('/@firebase/auth/')) return 'auth-sdk'
          if (id.includes('/firebase/') || id.includes('/@firebase/')) return 'firebase-core'
          return 'react'
        },
      },
    },
  },
})