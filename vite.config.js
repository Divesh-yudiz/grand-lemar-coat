import { defineConfig } from 'vite'

export default defineConfig({
    assetsInclude: ['**/*.glb'],
    build: {
        assetsInlineLimit: 0, // Prevents small assets from being inlined as base64
    },
    server: {
        fs: {
            // Allow serving files from one level up to the project root
            allow: ['..']
        }
    }
}) 