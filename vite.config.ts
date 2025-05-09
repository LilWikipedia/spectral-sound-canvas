import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";


// https://vitejs.dev/config/
export default defineConfig(({ }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    
  ].filter(Boolean),
  base: '/spectral-sound-canvas/',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));