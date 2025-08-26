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
    server: {
        allowedHosts: ['localhost', '127.0.0.1', '0.0.0.0', 'bb014b30dc3a.ngrok-free.app'],
    }
}