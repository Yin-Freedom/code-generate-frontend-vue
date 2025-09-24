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
