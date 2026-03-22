<template>
    <el-card>
        <template #header>
            <div class="card-header">
                <span>公众号设置</span>
            </div>
        </template>
        <el-form label-width="auto" v-loading="loading">

            <el-form-item label="开发者ID(AppID):">
                <el-input v-model="wxPbulicConfig.appid" />
            </el-form-item>
            <el-form-item label="开发者密码(AppSecret):">
                <el-input v-model="wxPbulicConfig.appSecret" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onSubmit">提交</el-button>
                <el-button type="danger" @click="clearConfig">删除配置</el-button>
            </el-form-item>
        </el-form>
    </el-card>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useWebsitConfigStore } from '@/stores/websitConfig'
import { storeToRefs } from "pinia"
import { paxios } from '@/utils/paxios'

let websitConfigStore = useWebsitConfigStore()
const { apiUrl } = storeToRefs(websitConfigStore)

const loading = ref(false)
const wxPbulicConfig = ref({
    appid: "",
    appSecret: ""
})

onMounted(() => {
    loading.value = true
    paxios.get("/manage/getWxPublicConfig").then(res => {
        if (res.data.code == 0) {
            wxPbulicConfig.value = res.data.data
        } else if (res.data.code != 10000) {
            ElMessage.error(res.data.msg);
        }

    }).finally(() => {
        
        loading.value = false
    })
})


function toClearConfig() {
    loading.value = true
    paxios.get("/manage/clearWxPublicConfig").then(res => {
        if (res.data.code == 0) {
            ElMessage.success("删除成功");
            wxPbulicConfig.value = {
                appid: "",
                appSecret: ""
            }
        } else {
            ElMessage.error(res.data.msg);
        }
    }).finally(() => { loading.value = false })
}
function clearConfig() {
    ElMessageBox.confirm("确定要删除配置吗？删除后微信相关功能将无法使用", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
    }).then(() => {
        toClearConfig()
    });
}


function onSubmit() {
    //验证表单
    if (wxPbulicConfig.value.appid == "" || wxPbulicConfig.value.appSecret == "") {
        ElMessage.error("请填写完整！");
        return;
    }
    loading.value = true
    paxios.post("/manage/setWxPublicConfig", { config: wxPbulicConfig.value }).then(res => {
        if (res.data.code == 0) {
            ElMessage.success(res.data.msg);
        } else {
            ElMessage.error(res.data.msg);
        }
    }).finally(() => {
        loading.value = false
    })
}
</script>