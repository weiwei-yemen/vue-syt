# 这里的 import 导入的数据是在哪配的

`import.meta.env.VITE_BASE_API` 的值来自项目根目录的**环境变量文件**。

配置在项目根目录的两个环境变量文件中：

### 开发环境 [.env.development](file:///Users/simon/projects/syt-vue3-master/.env.development)（`pnpm dev` 时生效）

```env
VITE_BASE_API = '/app-dev'   ← 这个就是 import.meta.env.VITE_BASE_API 的值
```

### 生产环境 [.env.production](file:///Users/simon/projects/syt-vue3-master/.env.production)（`pnpm build` 时生效）

```env
VITE_BASE_API = '/app-dev'   ← 生产环境也是 /app-dev
```

---

### `import.meta.env` 的工作原理

```
Vite 启动时读取 .env 文件
    ↓
所有以 VITE_ 开头的变量注入到 import.meta.env
    ↓
代码中通过 import.meta.env.VITE_BASE_API 访问
    ↓
构建时被静态替换为字符串常量 '/app-dev'
```

所以 `baseURL: import.meta.env.VITE_BASE_API` 在开发环境下等价于：

```ts
baseURL: "/app-dev"
```

> **注意**：自定义环境变量必须以 `VITE_` 开头才能通过 `import.meta.env` 访问到，这是 Vite 的硬性规定。不以 `VITE_` 开头的变量（如 `NODE_ENV`）是 Vite 内置的，有特殊处理。

# 请求拦截器合适触发？回调中的 config 对象是什么？

这段代码是 **axios 的请求拦截器**，下面解释它的触发时机和 `config` 对象：

## 触发时机

`service.interceptors.request.use()` 注册的回调函数会在**每个 HTTP 请求真正发送之前**被调用。也就是说，当你调用 `service.get()`、`service.post()` 等任何请求方法时，axios 会：

1. 先构建好请求配置（`config`）
2. **执行所有 request interceptor**（按注册顺序）
3. 最终用经过拦截器修改后的 `config` 发出 HTTP 请求

所以它是在请求**离开浏览器之前**的最后一道"关卡"。

## config 是什么对象

`config` 是 axios 的 **`InternalAxiosRequestConfig`** 对象（axios 1.x）/ `AxiosRequestConfig`（axios 0.x），包含本次请求的所有配置信息：

| 属性              | 说明                          |
| ----------------- | ----------------------------- |
| `url`             | 请求地址                      |
| `method`          | 请求方法（get/post 等）       |
| `headers`         | 请求头（`AxiosHeaders` 对象） |
| `params`          | URL 查询参数                  |
| `data`            | 请求体数据                    |
| `baseURL`         | 基础 URL                      |
| `timeout`         | 超时时间                      |
| `withCredentials` | 是否携带 cookie               |
| ...               | 其他 axios 配置项             |

## 这段代码做了什么

```typescript
service.interceptors.request.use((config) => {
  const token = useUserInfoStore().token || getToken()
  ;(config.headers as AxiosRequestHeaders).token = token
  return config
})
```

在每次请求发出前，从 Pinia store 或 `localStorage` 中取出 `token`，然后把它塞进请求头里（自定义 header 字段名为 `token`），这样后端就能从每个请求的 header 中读到用户的认证信息，无需每次调用都手动传。
