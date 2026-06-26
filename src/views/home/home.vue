<template>
  <div class="home_wrapper">
    <!--    轮播-->
    <el-carousel :interval="5000" class="img_wrapper card">
      <el-carousel-item v-for="item in 4" :key="item">
        <!-- el-image加载远程图片，自带来加载和加载失败处理能力 -->
        <el-image src="http://syt.atguigu.cn/_nuxt/img/web-banner1.b91d1a1.png">
          <!-- 图片加载失败展示一个IconPicture -->
          <!-- #error具名插槽： v-slot:error -->
          <!-- 当 el-image 组件内部渲染 error 这个插槽时，用我这里的内容替代 -->
          <template #error>
            <div class="image-slot">
              <el-icon><IconPicture /></el-icon>
            </div>
          </template>
        </el-image>
      </el-carousel-item>
    </el-carousel>
    <!--    搜索-->
    <div class="search_wrapper card">
      <div class="search">
        <!-- 属性解释如下： -->
        <!-- 搜索时隐藏加载动画（不显示 loading 转圈） -->
        <!-- 输入框获得焦点时不自动触发联想，必须输入内容后才触发 -->
        <!-- 双向绑定到 searchInfo.keyWord，.trim 修饰符自动去除首尾空格 -->
        <!-- 用户输入时调用 querySearchAsync 函数获取联想建议列表 -->
        <!-- 用户从联想列表中选中一项时，触发 handleSelect 回调 -->

        <!-- 内联样式可以修改element-plus组件的样式，但是只能修改组件外层，内部样式只能通过深度选择器去修改 -->
        <el-autocomplete
          hide-loading
          :trigger-on-focus="false"
          :style="{ width: '100%', height: '45px' }"
          v-model.trim="searchInfo.keyWord"
          :fetch-suggestions="querySearchAsync"
          placeholder="请输入医院名称"
          @select="handleSelect"
        />
        <el-button :icon="Search" type="primary" class="search_btn" />
      </div>
    </div>
    <!--    医院-->
    <HospitalHome />
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue"
export default defineComponent({
  name: "home_page"
})
</script>
<script setup lang="ts">
import { Picture as IconPicture, Search } from "@element-plus/icons-vue"
import { ref, reactive, toRefs, computed, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
// 使用paina
import { useAppStore } from "@/store/modules/app"
import HospitalHome from "@/views/home/hospital_home/hostpital_home.vue"
import { getByHosname } from "@/api/modules/home"
import { HospitalInfoInterface } from "@/api/modules/home/interface"
const router = useRouter()

const searchInfo = reactive({
  keyWord: "",
  loading: false,
  suggestionsOptions: [] as HospitalInfoInterface[]
})
const appStore = useAppStore()
const querySearchAsync = async (queryString: string, cb: (arg: any) => void) => {
  console.log("queryString", queryString.trim() !== "")
  if (queryString.trim() !== "") {
    // 这里应该使用queryString作为参数查询
    getByHosname(searchInfo.keyWord).then((res: any) => {
      console.log("res---", res)
      searchInfo.suggestionsOptions = res.map((item: HospitalInfoInterface) => {
        return {
          ...item,
          // element自动补全渲染时要求必须有value字段，渲染value字段的值
          // 也可以直接指定要渲染的字段，不需要在手动添加value字段，推荐
          // <el-autocomplete
          //   value-key="hosname"
          //   :fetch-suggestions="querySearchAsync"
          // />
          value: item.hosname
        }
      })
      cb(searchInfo.suggestionsOptions)
    })
  } else {
    searchInfo.suggestionsOptions = []
  }
}
const handleSelect = (item: HospitalInfoInterface) => {
  router.push(`/hospital/registration?code=${item.hoscode}`)
}
</script>

<style lang="scss" scoped>
.card {
  width: 1200px;
}
.home_wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  :deep .el-carousel__item {
    width: 1200px;
    height: 350px;
  }
}
.img_wrapper {
  width: 1200px;
  height: 350px;
}
el-image {
  width: 1200px;
  height: 350px;
}
.search_wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 150px;
  .search {
    display: flex;
    justify-content: center;
    width: 800px;
    height: 50px;
    // 修改框架组件样式需要使用深度选择器，:deep 是vue的深度选择器，::v-deep的缩写
    :deep(.el-input__inner) {
      // .el-input__inner默认撑满父容器，这里不需要设置宽度
      // .el-input__inner {
      //   width: 100%;  /* 默认撑满父容器 */
      // }
      height: 43px;
    }
    .search_btn {
      height: 45px;
      width: 60px;
      transform: translateX(-3px);
    }
    .search_btn:focus {
      // import "element-plus/dist/index.css"时加载ele的全局，这里直接引用
      background-color: var(--el-color-primary);
    }
  }
}
</style>
