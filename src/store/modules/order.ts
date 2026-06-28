import { defineStore } from "pinia"

import { getPayUrl, queryPayStatus } from "@/api/modules/order"
import { PayOrderInterfaceRes } from "@/api/modules/order/interface"
import { ElMessage } from "element-plus"

/**
 * 订单信息
 * @methods setUserInfos 设置订单信息
 */
export const useOrderInfoStore = defineStore("orderInfo", {
  state: () => {
    return {
      isShowDialog: false, //是否显示支付弹窗
      payObj: {} as PayOrderInterfaceRes, // 微信url支付对象
      orderId: "", // 订单id
      timer: null as any // 轮询定时器
    }
  },

  actions: {
    // 设置订单id
    setOrderId(orderId: string) {
      this.orderId = orderId
    },
    // 显示登陆弹窗
    showDialog() {
      this.isShowDialog = true
    },
    // 隐藏登陆弹窗
    hideDialog() {
      // 清空定时器
      clearInterval(this.timer)
      this.isShowDialog = false
    },

    // 请求微信支付接口url
    async getPayUrl(orderId?: string | number) {
      const res = await getPayUrl(orderId || this.orderId)
      this.payObj = res
    },

    // 轮询检测是否已经支付
    // 当前用 setInterval 配合 async/await 有个潜在问题：如果某次 queryPayStatus 请求超过 2 秒还没返回，下一次轮询会重叠发起。
    // 虽然这个项目里影响可能不大，但生产环境中更推荐用 setTimeout 递归的方式，确保上一次请求完成后再发起下一次。

    // 这里也可以使用setTimeout的递归方式实现：为什么setTimeout可以保证上一次请求完成才会执行下一次？？
    // 因为 setTimeout 递归模式下，下一次定时是在上一次异步请求完成后才创建的。

    // setInterval 是定时触发器，不是 Promise/async 流程控制工具。它只管到点就触发，不管上次触发的东西有没有执行完。

    checkPayStatus(callback: () => void) {
      this.timer = setInterval(async () => {
        const res = await queryPayStatus(this.orderId)
        console.log(res)
        if (res) {
          clearInterval(this.timer)
          this.clearAll()
          callback()
          ElMessage.success("支付成功")
        }
      }, 2000)
    },

    // 微信一键支付流程 callback支付成功回调,一般用于页面重新请求数据
    async payOrder(orderId: string, callback: () => void = () => {}) {
      // 显示登陆弹窗
      this.showDialog()
      // 设置订单号
      this.setOrderId(orderId)
      // 请求微信支付接口url，等到这一步执行完this.payObj = res二维码才会展示出来
      await this.getPayUrl()
      // 轮询检测是否已经支付
      await this.checkPayStatus(callback)
    },
    // 清空所有信息
    clearAll() {
      this.isShowDialog = false
      this.payObj = {} as PayOrderInterfaceRes
      this.orderId = ""
    }
  }
})
