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

# 如何划分动态路由和静态路由

用户说得对，我需要重新核实项目的实际路由配置。让我查看相关文件。
你说得对，我之前的解释不够准确。从实际代码来看，本项目的路由划分逻辑需要修正。

## 实际情况：静态路由中也有需要登录的页面

在 [routes.ts](file:///Users/simon/projects/syt-vue3-master/src/router/routes.ts) 中，静态路由 `staticRoutes` 里有两个子路由标记了 `needLogin: true`：

- [registration_step_1](file:///Users/simon/projects/syt-vue3-master/src/router/routes.ts#L82-L91)（第 89 行）：`needLogin: true`
- [registration_step_2](file:///Users/simon/projects/syt-vue3-master/src/router/routes.ts#L92-L101)（第 99 行）：`needLogin: true`

这两个挂号步骤页属于静态路由，但必须登录才能访问。

## 本项目真正的两层权限设计

所以本项目的权限控制实际上是**两层叠加**的：

### 第一层：路由分类（静态 / 动态）—— 决定"何时注册"

| 类型         | 注册时机                                           | 整体权限属性                                                       |
| ------------ | -------------------------------------------------- | ------------------------------------------------------------------ |
| **静态路由** | 应用启动时全部注册                                 | 默认公开，但**允许个别页面**通过 `meta.needLogin` 单独标记需要登录 |
| **动态路由** | 登录后注册（注释中提到"根据用户权限信息"动态添加） | 整体受保护，全部需要登录                                           |

### 第二层：`meta.needLogin` —— 在静态路由中做细粒度控制

关键在 [permission.ts](file:///Users/simon/projects/syt-vue3-master/src/router/permission.ts#L33) 第 33 行的守卫逻辑：

```js
} else if (staticRoutesAndAnyRoutesNameList.indexOf(to.name) !== -1 && !to.meta.needLogin) {
    next()
}
```

注意 `&& !to.meta.needLogin` 这个条件——即使目标路由属于静态路由，只要它标记了 `needLogin: true`，就会被拦截，要求登录。

## 修正后的划分依据

所以更准确的说法是：

- **静态路由**：应用启动时即注册的基础路由。其中**大部分**是公开页面（首页、医院信息、404 等），但**个别页面**通过 `meta.needLogin: true` 标记为需要登录（如挂号步骤页）。静态路由同时承担了菜单渲染的职责（见 routes.ts 第 15 行注释）。
- **动态路由**：整体作为受保护路由集合，设计上需登录后根据权限动态注册。目前本项目动态路由（`/user/*`）整体都要求登录。

**核心区别不在于"是否需要登录"这一单一维度，而在于"路由何时注册"以及"是否整体受保护"。** 静态路由中需要登录的个别页面，是通过 `meta.needLogin` 这个细粒度标记来实现的，而非通过路由分类本身。

---

我之前记忆中"静态路由=公开页面、无需登录"的描述是不准确的，我来更新一下。
这两条记忆都表述为"静态路由=公开页面、无需登录"，与实际代码不符，我来修正它们。两条内容高度重叠，我将合并为一条准确的记忆。
已完成记忆修正。

## 总结

你的质疑完全正确。本项目实际的权限设计是**两层叠加**的：

1. **路由分类层**（静态/动态）：决定路由"何时注册"和"是否整体受保护"

   - 静态路由：启动时注册，**默认公开**，但允许个别页面通过 `meta.needLogin: true` 标记需要登录
   - 动态路由：整体受保护，登录后注册

2. **`meta.needLogin` 细粒度控制层**：在静态路由内部，对个别页面（如挂号步骤页 `registration_step_1`、`registration_step_2`）单独标记需要登录

permission.ts 守卫通过 `staticRoutesAndAnyRoutesNameList.indexOf(to.name) !== -1 && !to.meta.needLogin` 这个联合条件，既放行了静态路由中的公开页面，又拦截了静态路由中标记了 `needLogin` 的页面。

所以**"是否需要登录"不是划分静态/动态路由的唯一依据**，更准确的说法是"路由何时注册"与"是否整体受保护"。我之前说"静态路由=无需登录"是不准确的，已同步修正了相关记忆。
