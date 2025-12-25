import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  publicDir: "public",
  build: {
    assetsInlineLimit: 0
  },
  plugins: [

    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true
      },
      manifest: {
        name: "Maxımora Shop",
        short_name: "Maxımora",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#000000",
        icons: [
          {
            src: "/pwa-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/pwa-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },
      workbox: {
        navigateFallbackDenylist: [
          /^\/cart/,
          /^\/checkout/,
          /^\/login/,
          /^\/account/
        ]
      }
    })
  ]
});
