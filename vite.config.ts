import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'


import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const isDev = mode === 'development'
    return {
        base: '/',
        plugins: [
            vue(),
            isDev && vueDevTools(), // exclude devtools from production build
            tailwindcss()
        ].filter(Boolean),
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            }
        }
    }
})
