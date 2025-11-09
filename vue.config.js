const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 3000,
    client: {
      overlay: {
        errors: true,
        warnings: false,
        runtimeErrors: error => {
          const ignoreErrors = [
            'ResizeObserver loop limit exceeded',
            'ResizeObserver loop completed with undelivered notifications'
          ];
          if (ignoreErrors.some(msg => error.message.includes(msg))) {
            return false;
          }
          return true;
        }
      }
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
