import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    meta: {
      description: '主页'
    },
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/about',
    name: 'about',
    meta: {
      description: '关于',
      icon: 'setting'
    },
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('@/views/AboutView.vue')
  },
  {
    path: '/product',
    name: 'product',
    meta: {
      description: '产品管理'
    },
    component: () => import('@/views/product/ProductList.vue')
  },
  {
    path: '/sqlToJava',
    name: 'sqlToJava',
    meta: {
      description: 'Java实体生成'
    },
    component: () => import('@/views/codeGenerate/SqlToJava.vue')
  },
  {
    path: '/template',
    name: 'template',
    meta: {
      description: '字符串模板'
    },
    component: () => import('@/views/template/TemplateTable.vue')
  },
  {
    path: '/sqlToCode',
    name: 'sqlToCode',
    meta: {
      description: '根据sql生成前后端代码'
    },
    component: () => import('@/views/codeGenerate/SqlToCode.vue')
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
