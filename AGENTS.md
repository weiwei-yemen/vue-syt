# AGENTS.md

This file provides guidance to Qoder (qoder.com) when working with code in this repository.

## 项目概述

尚医通（syt-vue3）是一个医疗预约挂号平台的前端项目，基于 Vue 3 + TypeScript + Vite 构建。后端 API 地址为 `http://syt.atguigu.cn`。

## 常用命令

```bash
# 安装依赖（必须使用 pnpm）
pnpm i

# 启动开发服务器（端口由 .env 中 VITE_BASE_API_PORT 决定，默认 3333）
pnpm dev

# 构建生产版本（含 TypeScript 类型检查）
pnpm build:prod

# 构建（跳过类型检查）
pnpm build

# Lint 检查与修复
pnpm lint:eslint
pnpm lint:prettier
pnpm lint

# 运行测试（Vitest + jsdom）
pnpm test
```

## 技术栈

- **框架**: Vue 3.2（Composition API + `<script setup>`）
- **语言**: TypeScript 4.9
- **构建工具**: Vite 4
- **UI 库**: Element Plus 和 Ant Design Vue **同时全局使用**（两者均已全量引入并全局注册图标）
- **状态管理**: Pinia（使用 `pinia-plugin-persistedstate` 持久化插件）
- **路由**: vue-router 4 + vue-page-stack-router（页面栈导航）
- **样式**: UnoCSS（presetUno + presetAttributify）、SCSS
- **HTTP**: axios（封装在 `src/api/request.ts`）
- **认证**: 手机号 + 短信验证码登录，微信扫码登录（回调页 `/wxLoginCallBack`）
- **自动导入**: unplugin-auto-import、unplugin-vue-components、unplugin-icons

## 架构说明

### 路由与权限

路由定义在 `src/router/routes.ts`，分为三类：

- `staticRoutes`：静态路由（首页、医院信息、404 等，无需登录）
- `allAsyncRoutes`：动态路由（用户中心等，需要登录权限）
- `anyRoutes`：兜底路由（匹配任意路径重定向到 404，必须最后注册）

路由守卫在 `src/router/permission.ts`：
- 通过 `localStorage` 中的 `token` 判断登录状态
- 未登录用户访问需要权限的页面时，重定向到首页并弹出登录弹窗（`userInfoStore.showLoginDialog()`）
- 路由 `meta.needLogin: true` 标记的页面强制要求登录

### API 层

- `src/api/request.ts`：axios 实例，`baseURL` 来自 `VITE_BASE_API` 环境变量
- 请求拦截器：自动在 header 中注入 `token`
- 响应拦截器：`code !== 200` 时统一错误提示；状态码 `208` 弹出登录提示；`401` 清除 token 并弹出登录提示
- API 模块按业务划分在 `src/api/modules/` 下：`user/`、`hospital/`、`order/`、`home/`、`sms/`
- 每个模块有 `index.ts`（请求函数）和 `interface.ts`（TypeScript 类型定义）

### 状态管理

Store 定义在 `src/store/modules/`：

- `user.ts`（`useUserInfoStore`）：用户 token、登录/登出、登录弹窗控制、微信登录轮询
- `order.ts`（`useOrderInfoStore`）：微信支付流程（获取支付 URL → 轮询支付状态）
- `home.ts`（`useUserStore`）：首页相关状态

Token 存储使用 `localStorage`（key: `token`），工具函数在 `src/utils/tokens.ts`。

### 全局组件结构

`App.vue` 布局：
```
HeaderTop（顶部导航）
  └─ PageStackRouterView（页面栈路由视图）
FooterBottom（底部）
LoginDialog（全局登录弹窗，由 user store 控制显隐）
PayDialog（全局微信支付弹窗，由 order store 控制显隐）
```

### 开发代理

开发环境下，所有以 `VITE_BASE_API`（默认 `/app-dev`）为前缀的请求会被代理到 `VITE_BASE_API_HTTP`（默认 `http://syt.atguigu.cn`），并自动去除前缀。

## 代码规范

- **Prettier**: 双引号、无尾逗号、无分号、printWidth 100、tabWidth 2
- **ESLint**: `@typescript-eslint/no-explicit-any` 已关闭；未使用变量以 `_` 前缀忽略；Vue 组件允许多单词命名（`multi-word-component-names: off`）
- **路径别名**: `@` 指向 `src/` 目录
- Vue 组件使用 `<script setup lang="ts">` 语法

## 环境变量

所有自定义环境变量必须以 `VITE_` 开头，定义在 `.env.development` 和 `.env.production` 中：

| 变量 | 说明 |
|------|------|
| `VITE_BASE_API_HTTP` | 后端接口地址 |
| `VITE_BASE_API` | API 请求前缀（代理匹配路径） |
| `VITE_BASE_API_PORT` | 开发服务器端口 |
| `VITE_ROUTER_HISTORY` | 路由模式（hash/html5） |
| `VITE_PUBLIC_PATH` | 打包路径前缀 |
