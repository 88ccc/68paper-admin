<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>隐私协议</span>
      </div>
    </template>
    <div style="border: 1px solid #ccc" v-loading="loading">
      <Toolbar style="border-bottom: 1px solid #ccc" :editor="editorRef" :defaultConfig="toolbarConfig" :mode="mode" />
      <Editor style="height: 500px; overflow-y: hidden;" v-model="valueHtml" :defaultConfig="editorConfig" :mode="mode"
        @onCreated="handleCreated" />
    </div>
    <div style="margin-top: 20px;">
      <el-button type="primary" @click="onSubmit">提交</el-button>
    </div>
  </el-card>
</template>
<script setup lang="ts">
import '@wangeditor/editor/dist/css/style.css' // 引入 css

import { onBeforeUnmount, ref, shallowRef, onMounted } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { paxios } from '@/utils/paxios'

const loading = ref(false)

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

// 内容 HTML
const valueHtml = ref('')

// 模拟 ajax 异步获取内容
onMounted(() => {
  loading.value = true
  paxios.get('/index/getPrivacyPolicy').then(res => {
    if (res.data.code == 0) {
      valueHtml.value = res.data.data;
    }
  }).finally(() => { loading.value = false })
})

const mode = ref('default')


const toolbarConfig = ref({ excludeKeys: ["uploadImage", "uploadVideo"] })
const editorConfig = ref({ placeholder: '请输入内容...' })

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

const handleCreated = (editor: any) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}

function onSubmit() {
  //把valueHtml提交上去
  loading.value = true
  paxios.post("/manage/setPrivacyPolicy", { content: valueHtml.value }).then(res => {
    if (res.data.code == 0) {
      ElMessage.success(res.data.msg);
    } else {
      ElMessage.error(res.data.msg);
    }
  }).catch(error => {
    console.log(error);
    ElMessage.error("提交失败，请稍后再试");
  }).finally(() => {
    loading.value = false;
  });
}

</script>