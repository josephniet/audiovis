// vite.config.js
export default {
    plugins: [],
    optimizeDeps: {
        include: [],
    },
    resolve: {
        alias: {
            '@': '/src',   // now '@' always maps to your src root
        },
    },
}