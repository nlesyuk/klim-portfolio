import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Klim Portfolio",
        short_name: "Klim",
        theme_color: "#c0c0c0",
        icons: [
          { src: "img/icons/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "img/icons/android-chrome-512x512.png", sizes: "512x512", type: "image/png" }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      Repositories: path.resolve(__dirname, "src/repositories/")
    }
  },
  css: {
    preprocessorOptions: {
      scss: {}
    }
  }
});
