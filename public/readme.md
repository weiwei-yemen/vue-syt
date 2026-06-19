# 为什么要区分 public 和 src/assets 两种静态资源

两者的核心区别在于 **Vite 是否会处理它们**：

**`public/` 目录（静态资源，不经过构建处理）**

- 文件**直接原样复制**到构建产物根目录
- 代码中通过**绝对路径**直接引用，如 `/favicon.ico`、`/app-loading.css`
- 适合：`favicon.ico`、`robots.txt`、第三方脚本等不需要被代码 import 的文件

**`src/assets/` 目录（静态资源，经过构建处理）**

- 文件会被 Vite **处理和打包**
- 在代码中通过 `import` 引用：
  ```ts
  import logo from "@/assets/images/logo.png"
  import logoSvg from "@/assets/logo.svg"
  ```
- Vite 会做以下处理：
  - **文件名加哈希**：`logo.png` → `logo.a3f8b2c1.png`（缓存友好）
  - **小图片转 Base64**：内联到 JS 中，减少 HTTP 请求
  - **SVG 可以当组件用**：配合 `unplugin-icons` 等插件
  - **路径自动修正**：打包后路径由 Vite 管理，不会出错

**为什么要放 `src/assets/` 而不是 `public/`？**

|              | `src/assets/`    | `public/` |
| ------------ | ---------------- | --------- |
| 是否经过构建 | 是               | 否        |
| 文件名有哈希 | 有（利于缓存）   | 无        |
| 小文件内联   | 支持             | 不支持    |
| import 引用  | 支持             | 不支持    |
| 未引用检测   | 没用到的不会打包 | 全部打包  |

简单来说：**被代码引用的图片放 `src/assets/`**（让 Vite 优化处理），**不被 import 的独立静态文件放 `public/`**（原样提供）。

比如项目中的 `logo.png`、`web-banner-1.png` 都是在组件中被 import 使用的，所以放 `src/assets/`；而 `favicon.ico` 是浏览器自动请求的，不需要 import，所以放 `public/`。
