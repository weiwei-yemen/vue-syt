# 微信扫码登录共涉及哪些页面跳转

让我先确认回调页的代码：

## 微信扫码登录的完整跳转链路

```
┌─ 前端 ─┐    ┌─ 微信 ─┐    ┌─ 后端 ─┐    ┌─ 前端 ─┐
│  网站   │ ←→ │ 服务器  │ ←→ │ 服务器  │ ←→ │  网站   │
└────────┘    └────────┘    └────────┘    └────────┘
```

### 全部跳转环节

| 序号 | 跳转方向    | 触发时机                   | 地址                                                       |
| ---- | ----------- | -------------------------- | ---------------------------------------------------------- |
| ①    | 前端 → 前端 | 用户点击"微信扫码登录"     | 当前页面（弹窗内渲染二维码）                               |
| ②    | 微信 → 后端 | 用户手机确认授权           | `http://syt.atguigu.cn/api/...?code=xxx&state=yyy`         |
| ③    | 后端 → 前端 | 后端处理完，302 重定向     | `http://localhost:3333/wxLoginCallBack?token=xxx&name=xxx` |
| ④    | 前端 → 前端 | 回调页写入 token，隐藏页面 | 轮询检测到 token → 关闭弹窗                                |

### 详细流程图

```
① 前端渲染二维码（无跳转，弹窗内调用 WxLogin SDK）
   │
   │  new WxLogin({
   │    redirect_uri: "http://syt.atguigu.cn/api/user/wechat/callback",
   │    self_redirect: true
   │  })
   │
   ↓ 用户手机扫码 → 点击"确认登录"

② 微信服务器 → 后端（302 重定向）
   │
   │  微信把 code 发给后端：
   │  http://syt.atguigu.cn/api/user/wechat/callback?code=xxx&state=yyy
   │
   │  后端操作：
   │  ├─ 用 code 换取 access_token
   │  ├─ 用 access_token 获取用户信息
   │  ├─ 创建/查找用户，生成 token
   │  └─ 302 重定向到前端回调页
   │
   ↓

③ 后端 → 前端回调页（302 重定向）
   │
   │  http://localhost:3333/wxLoginCallBack?token=xxx&name=xxx
   │
   │  回调页操作：
   │  ├─ localStorage.setItem('user', ...)    写入用户信息
   │  ├─ setToken(token)                       写入 token
   │  └─ document.html.style.display = 'none'  隐藏页面
   │
   ↓

④ 登录弹窗轮询检测到 token（无跳转）
   │
   │  userInfoStore.queryLoginStatus()
   │  每 3 秒检查 localStorage 是否有 token
   │
   ↓ 检测到 token
   │
   ├─ 关闭登录弹窗
   └─ 登录成功 ✅
```

### 各跳转的控制方

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  前端     │     │ 微信SDK   │     │  后端     │     │ 前端回调页 │
│          │     │          │     │          │     │          │
│ WxLogin  │     │          │     │          │     │          │
│ 配置     │────→│ 授权后   │────→│ 302重定向 │────→│ 写入token │
│redirect  │     │ 跳到     │     │ 跳到前端  │     │ 轮询检测  │
│ _uri     │     │redirect  │     │ 回调页    │     │ 关闭弹窗  │
│          │     │ _uri     │     │          │     │          │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
   步骤①            步骤②            步骤③            步骤④
```

**一句话总结：4 次跳转 — 前端渲染二维码 → 微信回调后端 → 后端重定向到前端回调页 → 轮询检测到 token 关闭弹窗。**
