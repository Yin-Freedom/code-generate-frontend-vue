import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';

// Ant Design Vue Components
import Antd from 'ant-design-vue';
import { message } from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';

// 只导入使用的图标
import { DownOutlined, PlusOutlined } from '@ant-design/icons-vue';

// 只导入必要的样式
import 'ant-design-vue/dist/reset.css';

// 自定义样式
import './assets/css/app.css';

// 创建应用实例
const app = createApp(App);

app.use(Antd);

// 注册图标
app.component('DownOutlined', DownOutlined);
app.component('PlusOutlined', PlusOutlined);

// 全局配置 message
app.config.globalProperties.$message = message;

// 开发环境优化
if (process.env.NODE_ENV === 'development') {
  // Vue 3 不再支持通过 app.config.devtools 开启 DevTools
  // app.config.devtools = true;
  // 开启性能追踪
  app.config.performance = true;
  // 提供更友好的警告信息
  app.config.warnHandler = (msg, vm, trace) => {
    console.warn(`[Vue warn]: ${msg}`, trace);
  };
}

// 全局错误处理
app.config.errorHandler = (error, instance, info) => {
  console.error('[Global Error]:', error);
  console.error('[Error Info]:', info);

  // 在生产环境中可以发送错误到监控服务
  if (process.env.NODE_ENV === 'production') {
    // 发送错误日志到服务端
    // sendErrorToService(error, info);
  }
};

// 抑制 ResizeObserver 错误 - 这是一个浏览器良性警告
const resizeObserverLoopErr =
  /^ResizeObserver loop (completed with undelivered notifications|limit exceeded)/;

window.addEventListener('error', (e: ErrorEvent) => {
  if (resizeObserverLoopErr.test(e.message)) {
    const resizeObserverErrDiv = document.getElementById('webpack-dev-server-client-overlay-div');
    const resizeObserverErr = document.getElementById('webpack-dev-server-client-overlay');
    if (resizeObserverErr) {
      resizeObserverErr.setAttribute('style', 'display: none');
    }
    if (resizeObserverErrDiv) {
      resizeObserverErrDiv.setAttribute('style', 'display: none');
    }
    e.stopImmediatePropagation();
    e.stopPropagation();
    e.preventDefault();
  }
});

// 使用路由
app.use(router);

// 状态管理
const pinia = createPinia();
app.use(pinia);

// 挂载应用
app.mount('#app');
