import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
 
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3173,
    proxy: {
      "/user": "http://localhost:3174",
      "/chat": "http://localhost:3174",
      "/messages": "http://localhost:3174",
      "/uploads": "http://localhost:3174",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})