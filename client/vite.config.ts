import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // shadcn UI components live in client/@/components/ui
      {
        find: /^@\/components\/ui\/(.*)$/,
        replacement: path.resolve(__dirname, './@/components/ui/$1'),
      },
      // Everything else under @/ maps to src/
      {
        find: /^@\/(.*)$/,
        replacement: path.resolve(__dirname, './src/$1'),
      },
    ],
  },
})
