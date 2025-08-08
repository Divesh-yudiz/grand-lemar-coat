import { defineConfig } from 'vite'

export default defineConfig({
    assetsInclude: ['**/*.glb'],
    build: {
        assetsInlineLimit: 0,
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true
            }
        }
    },
    server: {
        fs: {
            allow: ['..']
        }
    }
})