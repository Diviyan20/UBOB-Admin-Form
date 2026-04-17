import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
  define:{
    'process.env.VITE_ORDER_TRACKING_URL':JSON.stringify(process.env.VITE_ORDER_TRACKING_URL)
  }
})
