import { createRouter, createWebHistory } from "vue-router"
import { staticRoutes, allAsyncRoutes, anyRoutes } from "@/router/routes"

const router = createRouter({
  // 采用history路由，详见router目录下的readme.md文件解释
  history: createWebHistory(),
  //一旦路由器创建,则映射关系已经确定,将来改变这个staticRoutes是无效的了,是无法添加映射关系了
  //但是router对象有一个addRoute方法,可以给已经确定映射关系的router 添加新的路由映射关系
  routes: [...staticRoutes, ...allAsyncRoutes, ...anyRoutes],

  /**
    这段配置的作用是：**每次路由切换后，页面自动滚动到顶部（左上角）**。
        - `top: 0` → 滚动到垂直方向最顶部
        - `left: 0` → 滚动到水平方向最左侧
        
      为什么需要这个？
      默认情况下，SPA（单页应用）切换页面时，浏览器不会像传统多页应用那样自动回到顶部。比如用户从首页往下滚了 500px，然后点击导航进入另一个页面，新页面可能还停留在滚动了 500px 的位置，体验很差。
      有了 `scrollBehavior`，每次切换路由后页面都会自动回到顶部，行为和传统网站一致。
   */
  scrollBehavior() {
    return { top: 0, left: 0 }
  }
})

// 导出路由
export default router
