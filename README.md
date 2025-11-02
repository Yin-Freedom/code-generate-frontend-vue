# code-generate-frontend-vue

## 1. 开发规范

### 代码格式化

使用 eslint + prettier 做语法检查和格式化，使用 vscode 插件在保存时自动生效。

配置：

1. 配置文件
   |-- .vscode
   | |-- extensions.json
   | |-- settings.json
   |--
   |-- .eslintrc.js
   |-- .prettierrc.js
2. 安装 vscode 插件

### 组件库

使用 Ant Design Vue 作为组件库。

## 安装依赖

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

## 项目搭建

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



## Project setup

```
pnpm install
```

### Compiles and hot-reloads for development

```
pnpm run serve
```

### Compiles and minifies for production

```
pnpm run build
```

### Lints and fixes files

```
pnpm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

## 全局状态管理

- [pinia](https://pinia.vuejs.org/getting-started.html)
- [vuex]()

```bash
pnpm i --save-dev pinia
```
