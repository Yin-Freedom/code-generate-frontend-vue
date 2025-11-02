import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';

// 按需导入 Ant Design Vue 组件和样式
import {
  ConfigProvider,
  Layout,
  LayoutHeader,
  LayoutContent,
  LayoutFooter,
  Card,
  Form,
  FormItem,
  Input,
  InputNumber,
  Select,
  SelectOption,
  Button,
  Table,
  Pagination,
  Modal,
  Drawer,
  Switch,
  Upload,
  Space,
  Tag,
  Dropdown,
  Menu,
  MenuItem,
  Checkbox,
  Popconfirm,
  message,
} from 'ant-design-vue';

// 只导入使用的图标
import { DownOutlined, PlusOutlined } from '@ant-design/icons-vue';

// 只导入必要的样式
import 'ant-design-vue/dist/reset.css';

// 自定义样式
import './assets/css/app.css';

// 创建应用实例
const app = createApp(App);

// 按需注册 Ant Design Vue 组件
app.use(ConfigProvider);
app.use(Layout);
app.component('ALayoutHeader', LayoutHeader);
app.component('ALayoutContent', LayoutContent);
app.component('ALayoutFooter', LayoutFooter);
app.use(Card);
app.use(Form);
app.component('AFormItem', FormItem);
app.use(Input);
app.use(InputNumber);
app.use(Select);
app.use(SelectOption);
app.use(Button);
app.use(Table);
app.use(Pagination);
app.use(Modal);
app.use(Drawer);
app.use(Switch);
app.use(Upload);
app.use(Space);
app.use(Tag);
app.use(Dropdown);
app.use(Menu);
app.component('AMenuItem', MenuItem);
app.use(Checkbox);
app.use(Popconfirm);

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

// 使用路由
app.use(router);

// 状态管理
const pinia = createPinia();
app.use(pinia);

// 挂载应用
app.mount('#app');
