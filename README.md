# code-generate-frontend-vue

## 0. 技术栈
框架：vue@3（组合式 API）、vue-router@4（路由控制）、pinia（在 main.ts 中创建全局 store）。
UI：ant-design-vue@4.2.6、自定义样式配合 tailwindcss@3 与 postcss/autoprefixer。
数据通信：axios 封装在 src/api；全局 message 由 Ant Design Vue 注册。
语言与构建：typescript@~4.5.5、@vue/cli-service@5，脚手架依旧沿用 Vue CLI（serve/build/lint 等 npm 脚本）。
质量与格式：eslint@8 + eslint-plugin-vue/@typescript-eslint + prettier@2（通过 eslint-config-prettier、eslint-plugin-prettier 协同）。
其它：core-js polyfill；ant-design/icons-vue 精选导入；项目配置文件如 .browserslistrc、tailwind.config.js、.prettierrc.js 提供兼容与编码规范。

## 1. 开发规范

### 代码格式化

使用 eslint + prettier 做语法检查和格式化，使用 vscode 插件在保存时自动生效。

配置：

1. 配置文件
```bash
   |-- .vscode
   | |-- extensions.json
   | |-- settings.json
   |--
   |-- .eslintrc.js
   |-- .prettierrc.js
```

2. 安装 vscode 插件

### 组件库

使用 Ant Design Vue 作为组件库。

## 2. 安装依赖

- andv
  pnpm i --save ant-design-vue@4.x

- taiwind
  pnpm install -D tailwindcss postcss autoprefixer

  手动创建两个配置文件（推荐做法）：tailwind.config.js、postcss.config.js

  添加 /src/assets/css/app.css 文件

  main.ts 引入

  安装插件提供补全 Tailwind CSS IntelliSense，关闭其他插件单独启用该插件好像不行，必须得有 Vue 插件才行。

  问题 1：tailwind4 没法启用 vscode 插件补全和提示，降级到 tailwind3 解决。

- axios
  pnpm install axios

## 3. 项目搭建

使用脚手架搭建 vue 项目

1. 使用 node 版本管理工具 nvm，安装 node LTS（稳定版本）
2. node -v， 检查版本号
3. vue-cli 脚手架

文档：https://cli.vuejs.org/#getting-started

```js
// install
npm install -g @vue/cli

// create a project
vue create my-project
```



### Project setup

```
pnpm install
```

- Compiles and hot-reloads for development

```
pnpm run serve
```

- Compiles and minifies for production

```
pnpm run build
```

- Lints and fixes files

```
pnpm run lint
```

- Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

## 全局状态管理

- [pinia](https://pinia.vuejs.org/getting-started.html)
- [vuex]()

```bash
pnpm i --save-dev pinia
```

## 添加模块

1. 添加路由 `@/src/router/index.ts`
2. 添加api `@/src/api/`
3. 添加组件 `@/src/views/`