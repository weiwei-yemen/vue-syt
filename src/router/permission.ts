import router from "@/router"
import NProgress from "nprogress"
import "nprogress/nprogress.css"
import { getToken } from "@/utils/tokens"
import { useUserInfoStore } from "@/store/modules/user"
import pinia from "@/store"
import { staticRoutes, allAsyncRoutes, anyRoutes } from "@/router/routes"
import { getTreeDataProperty } from "@/utils/utils"

NProgress.configure({ showSpinner: false })
// 这个文件不在app组件及子组件中，所以要手动传入pinia
const userInfoStore = useUserInfoStore(pinia)
// 免登录白名单
const whiteList: string[] = []
const allAsyncRoutesNameList = getTreeDataProperty(allAsyncRoutes, "name")
const staticRoutesAndAnyRoutesNameList = getTreeDataProperty(
  [...staticRoutes, ...anyRoutes],
  "name"
)
// 路由守卫
router.beforeEach(async (to, _from, next) => {
  NProgress.start()
  // 设置网页标题名称
  document.title = `尚医通-${to.meta.title}` || "尚医通"
  // 判断该用户是否登录
  if (getToken()) {
    next()
  } else {
    // 如果没有 Token
    if (whiteList.indexOf(to.path) !== -1) {
      // 如果在免登录的白名单中，则直接进入
      next()
    } else if (staticRoutesAndAnyRoutesNameList.indexOf(to.name) !== -1 && !to.meta.needLogin) {
      // 如果去往的页面是没有访问权限的页面 或者页面是否必须需要登陆才能访问&& !to.meta.needLogin
      // 判断当前用户是否有访问该页面的权限
      // 如果有访问权限，则进入该页面
      next()
    } else {
      // 其他没有访问权限的页面将被重定向到登录页面
      next(`/home?redirect=${encodeURIComponent(to.fullPath)}`)
      // 调用登陆弹窗
      userInfoStore.showLoginDialog()
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
