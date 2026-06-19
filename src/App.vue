<template>
  <div class="layout-content">
    <HeaderTop />
    <ElConfigProvider :locale="locale">
      <!-- 这里使用页面栈路由库vue-page-stack-router替代普通的<router-view /> -->
      <PageStackRouterView />
    </ElConfigProvider>
    <!-- template中推荐FooterBottom 或者 footer-bottom，import的时候要使用FooterBottom-->
    <FooterBottom />
    <!--    登陆弹窗-->
    <LoginDialog />
    <!--    微信支付弹窗-->
    <PayDialog />
  </div>
</template>
<script setup lang="ts">
import HeaderTop from "@/components/header-top/header-top.vue"
import FooterBottom from "@/components/footer-bottom/footer-bottom.vue"
import LoginDialog from "@/components/login-dialog/login-dialog.vue"
import { ref, reactive, toRefs, computed, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import zhLocale from "element-plus/dist/locale/zh-cn.mjs"
import { useUserInfoStore } from "@/store/modules/user"
import PayDialog from "@/components/pay-dialog/pay-dialog.vue"
const locale = ref(zhLocale)
const userInfoStore = useUserInfoStore()
</script>

<style lang="scss" scoped>
.layout-content {
  position: relative;
  width: 100%;
  min-height: 100%;
  min-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
