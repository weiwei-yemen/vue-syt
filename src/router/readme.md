# Hash 模式中的#是什么含义

`#` 在 URL 中叫做**片段标识符（Fragment Identifier）**，也叫**锚点**。

**它原本的设计用途是：** 指向页面内的某个锚点位置，比如 `http://example.com/page.html#section1` 表示跳转到页面中 `id="section1"` 的元素位置。

**它的关键特性是：** `#` 后面的部分**不会发送给服务器**。浏览器请求的永远是 `#` 前面的地址，`#` 后面的内容只在浏览器端有意义。

**Hash 路由正是利用了这一点：**

- `http://example.com/#/user/profile`
- 浏览器实际请求服务器的是 `http://example.com/`（永远只请求根页面）
- `#/user/profile` 这部分由前端 JS 读取和解析
- 当 URL 中 `#` 后面的内容变化时，浏览器不会刷新页面，但会触发 `hashchange` 事件
- Vue Router 监听这个事件，根据 hash 值渲染对应的组件

**所以 Hash 模式的优势就很明显了：**

- 不管怎么改 `#` 后面的路径，浏览器都不会向服务器发起请求
- 刷新页面时，服务器收到的请求始终是 `/`，返回 `index.html` 即可
- 不需要服务器做任何特殊配置

# 为什么 History 模式需要服务器配置

因为 History 模式的 URL 中**没有 `#`**，路径是真实的 URL 路径，浏览器会**真的把它发送给服务器**。

**举个例子：**

当前页面是 `http://example.com/user/profile`，用户按 F5 刷新：

1. 浏览器发送请求：`GET /user/profile`
2. 服务器收到这个请求，去找 `user/profile` 这个文件或目录
3. 服务器上并没有这个文件 → 返回 **404**

**这就是问题所在：** `/user/profile` 这个路径在服务器上并不存在，它只是前端路由定义的一个虚拟路径。

**所以需要服务器配置"兜底"规则：**

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

这行配置的意思是：

1. 先尝试找这个真实文件/目录（`$uri`、`$uri/`）
2. 如果找不到，**统一返回 `index.html`**

这样服务器收到 `/user/profile` 请求后，虽然找不到对应的文件，但会返回 `index.html`。前端 JS 加载后，Vue Router 读取当前 URL 路径 `/user/profile`，匹配路由规则，渲染对应组件。

**对比 Hash 模式：**

- Hash：`/#/user/profile` → 服务器收到的是 `GET /` → 天然能找到 `index.html` → 不需要配置
- History：`/user/profile` → 服务器收到的是 `GET /user/profile` → 找不到文件 → 必须配兜底规则
