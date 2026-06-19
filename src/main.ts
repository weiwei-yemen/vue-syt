import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import { createPageStackRouter } from "vue-page-stack-router"
import pinia from "./store"
import "@/router/permission"
// css
import "uno.css"
import "normalize.css"
import "element-plus/dist/index.css"
// 全局加载项目的公共样式
import "@/styles/index.scss"
//引入element-plus
import ElementPlus from "element-plus"
import * as ElementPlusIconsVue from "@element-plus/icons-vue"
// 引入 ant-design-vue
import Antd from "ant-design-vue"
import "ant-design-vue/dist/antd.css"
import * as Icons from "@ant-design/icons-vue"
const app = createApp(App)
//从 @element-plus/icons-vue 中导入所有图标并进行全局注册
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
for (const [key, component] of Object.entries(Icons)) {
  app.component(key, component)
}

/**
 * 普通 Vue Router 的行为：
  页面 A → 页面 B → 页面 C
  点浏览器后退，回到 B，但页面是重新渲染的，之前滚动的位置、表单填写的内容都丢失了
  
  页面栈路由的行为：
  页面 A → 页面 B → 页面 C（栈：[A, B, C]）
  后退时，C 被"弹出"，B 直接从缓存中恢复，保留滚动位置、输入内容等状态
  前进时，重新渲染下一个页面
 */
const pageStackRouter = createPageStackRouter({ router })
app.use(ElementPlus)
app.use(Antd)
app.use(router)
app.use(pageStackRouter)
app.use(pinia)
// 路由加载完成后挂载
router.isReady().then(() => {
  app.mount("#app")
})
