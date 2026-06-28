<template>
  <!-- 
      上传组件负责上传，父组件只使用了上传组件上传的结果fileList
      action 属性指定了上传接口地址
      Element Plus 的 <el-upload> 组件会在用户选择图片后，自动把文件 POST 到这个地址
      上传成功或失败后，自动更新 fileList 里对应文件的状态 
      -->
  <el-upload
    v-model:file-list="fileList"
    action="http://syt.atguigu.cn/api/oss/file/fileUpload?fileHost=userAuah"
    list-type="picture-card"
    :on-preview="handlePictureCardPreview"
    :on-remove="handleRemove"
    :before-upload="beforeAvatarUpload"
    v-bind="$attrs"
  >
    <!-- 如果传了 samplePicture 示例图，上传按钮位置就显示示例图
否则显示一个加号图标 -->
    <div>
      <div v-if="props.samplePicture" class="sample_picture">
        <img :src="props.samplePicture" alt="" />
      </div>
      <el-icon v-else><Plus /></el-icon>
    </div>
  </el-upload>

  <!-- 点击图片后弹出大图预览。 -->
  <el-dialog v-model="dialogVisible">
    <img w-full :src="dialogImageUrl" alt="Preview Image" />
  </el-dialog>
</template>
<script lang="ts">
import { defineComponent } from "vue"
export default defineComponent({
  name: "upload_img_page"
})
</script>

<script lang="ts" setup>
import { ref, onMounted, watch } from "vue"
import { Plus } from "@element-plus/icons-vue"

import type { UploadProps, UploadUserFile } from "element-plus"
import { ElMessage } from "element-plus"
const props = defineProps({
  samplePicture: {
    type: String,
    default: ""
  },
  updateUpLoadFileListHandler: {
    type: Function,
    required: true
  },
  limit: {
    type: Number,
    default: 1
  }
})

const fileList = ref<UploadUserFile[]>([])
const init = (newFileList: any[]) => {
  fileList.value = newFileList
}

const dialogImageUrl = ref("")
const dialogVisible = ref(false)
const handleRemove: UploadProps["onRemove"] = (uploadFile, uploadFiles) => {
  console.log(uploadFile, uploadFiles)
}

const handlePictureCardPreview: UploadProps["onPreview"] = (uploadFile) => {
  console.log("uploadFile", uploadFile)
  // ！非空断言，告诉编译器这里不是null或undefined
  dialogImageUrl.value = uploadFile.url!
  // 也可以这么写:dialogImageUrl.value = uploadFile.url || ""
  dialogVisible.value = true
}

// rawFile是UploadRawFile类型，包含了文件的各种元数据信息
// 这里 UploadProps["beforeUpload"] 是 TypeScript 的索引访问类型，意思是：从 UploadProps 接口中取出 beforeUpload 这个属性的类型。
// beforeUpload: (rawFile: UploadRawFile) => Awaitable<void | undefined | null | boolean | File | Blob>;
const beforeAvatarUpload: UploadProps["beforeUpload"] = (rawFile) => {
  console.log("rawFile", rawFile)
  if (fileList.value.length >= props.limit) {
    ElMessage.error(`最多只能上传${props.limit}张图片!`)
    return false
  }
  if (rawFile.type !== "image/jpeg") {
    ElMessage.error("Avatar picture must be JPG format!")
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error("Avatar picture size can not exceed 2MB!")
    return false
  }
  return true
}

// 因为 fileList 是子组件内部的状态，父组件 certification.vue 的表单校验和提交都需要用到这个列表。
// 通过 watch + 回调的方式，子组件把数据"上报"给父组件。
// fileList在图片上传的过程中其中的url、status等属性是动态变化的
watch(fileList, (newVal, oldVal) => {
  props.updateUpLoadFileListHandler(newVal)
})

// 父组件在清理表单时需要清空fieldList
defineExpose({ init })

// 这行代码虽然赋的值和默认值一样都是 []，但它重新赋值了一次，触发了 watch，于是父组件会立刻收到一个空数组
// 其实父组件也初始化了空数组，所以这里没有初始化也没什么问题
onMounted(() => {
  init([])
})
</script>
<style lang="scss" scoped>
.sample_picture {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  img {
    width: 100%;
    height: 100%;
  }
}
</style>
