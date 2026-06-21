import axios, { type AxiosRequestHeaders, type AxiosResponse } from "axios"
import { ElMessage, ElMessageBox } from "element-plus"
import pinia from "@/store/index"
import { useUserInfoStore } from "@/store/modules/user"
import { getToken } from "@/utils/tokens"

/* 定义response对象的data接口 */
interface ResponseData<T> {
  code: number
  data: T
  message: string
}

/**
 *  import.meta.env.VITE_BASE_API是在哪里配置的？
 *  1 .env.devlopment和.env.production是两个环境变量配置文件
 *  2 VITE_BASE_API是配置在这2个文件中配置的
 *  3 自定义环境变量必须以 VITE_ 开头才能通过 import.meta.env 访问到，这是 Vite 的硬性规定
 */

// import.meta.env 的工作原理 ?

// Vite 启动时读取 .env 文件
//     ↓
// 所有以 VITE_ 开头的变量注入到 import.meta.env
//     ↓
// 代码中通过 import.meta.env.VITE_BASE_API 访问
//     ↓
// 构建时被静态替换为字符串常量 '/app-dev'

// 配置新建一个 axios 实例
const service = axios.create({
  //去环境变量中读取对应环境的axios请求前缀
  baseURL: import.meta.env.VITE_BASE_API,
  timeout: 10000
})
console.log("import.meta.env.VITE_API_URL", import.meta.env.VITE_BASE_API)
// 添加请求拦截器
service.interceptors.request.use((config) => {
  const token = useUserInfoStore().token || getToken()
  // as 断言，你比编译器更清楚是什么类型，直接告诉编译器这是什么类型
  ;(config.headers as AxiosRequestHeaders).token = token
  // 其实这里不需要断言也是ok的，ts编译不会报错
  // config.headers.token = token
  return config
})

// 添加响应拦截器
service.interceptors.response.use(
  /* 约束一下response */
  async (response: AxiosResponse<ResponseData<any>>) => {
    // 对响应数据做点什么
    const res = response.data
    if (res.code !== 200) {
      /* 成功数据的code值为20000/200 */
      // ElMessage是顶部通知条，不阻断，轻量提示，无交互
      ElMessage({
        // 错误信息的优先级：res.data（字符串时） > res.message > "Error"
        message: (typeof res.data == "string" && res.data) || res.message || "Error",
        type: "error",
        duration: 5 * 1000
      })
      if (response.status === 208) {
        const storeUserInfo = useUserInfoStore(pinia)
        storeUserInfo.showLoginDialog()
        // ElMessageBox.alert是页面中央弹窗，阻断的，用户必须点击确认才关闭
        ElMessageBox.alert("请登录", "提示", {})
          .then(() => {})
          .catch(() => {})
      }

      // 为什么下面的代码永远不会执行到？
      // - 成功回调（第1个）	HTTP 状态码 2xx（200、201、208 等）
      // - 失败回调（第2个）	HTTP 状态码非 2xx（401、404、500 等）

      // `token` 过期或者账号已在别处登录
      if (response.status === 401) {
        const storeUserInfo = useUserInfoStore(pinia)
        await storeUserInfo.reset()
        storeUserInfo.showLoginDialog()
        ElMessageBox.alert("你已被登出，请重新登录", "提示", {})
          .then(() => {})
          .catch(() => {})
      }
      return Promise.reject(service.interceptors.response)
    } else {
      return res.data /* 返回成功响应数据中的data属性数据 */
    }
  },
  (error) => {
    // 对响应错误做点什么
    if (error.message.indexOf("timeout") != -1) {
      ElMessage.error("网络超时")
    } else if (error.message == "Network Error") {
      ElMessage.error("网络连接错误")
    } else {
      if (error.response.data) ElMessage.error(error.response.statusText)
      else ElMessage.error("接口路径找不到")
    }
    return Promise.reject(error)
  }
)

export default service
