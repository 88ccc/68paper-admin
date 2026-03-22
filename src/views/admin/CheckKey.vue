<template>
    <el-card>
        <template #header>
            <div class="card-header">
                <span>检测秘钥</span>
            </div>
        </template>
        <el-form :model="checkKey" label-width="100px" v-loading="loading">
            <el-form-item label="供货商:">
                <el-radio-group v-model="checkKey.supply">
                    <el-radio value="88xuezi">88学子</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="UserId:">
                <el-input v-model="checkKey.userid" placeholder="请输入userid" />
            </el-form-item>
            <el-form-item label="API Key:">
                <el-input v-model="checkKey.key"/>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onSubmit">提交</el-button>
                <el-button type="danger" @click="clearConfig">删除配置</el-button>
            </el-form-item>
        </el-form>

        <template #footer>前往88学子开放平台(<a href="https://open.88xuezi.com" target="_blank" >https://open.88xuezi.com</a>)获取</template>
    </el-card>
</template>
<script setup lang="ts">
import { ref,onMounted } from 'vue'
import { paxios } from '@/utils/paxios'
const checkKey = ref({
    supply: "",
    userid: '',
    key: '',
})
const loading = ref(false)

function onSubmit() {
    //先验证
    if (!checkKey.value.supply) {
        ElMessage.error("请选择供货商");
        return
    }
    if (!checkKey.value.key) {
        ElMessage.error("请输入API Key");
        return
    }
    if (!checkKey.value.userid) {
        ElMessage.error("请输入userid");
        return
    }
    loading.value = true
    paxios.post("/manage/setCheckKeyConfig", {config:checkKey.value}).then(res => {
        if (res.data.code == 0) {
            ElMessage.success("保存成功");
        } else {
            ElMessage.error(res.data.msg);
        }
    }).finally(() => { loading.value = false })
}
function clearConfig() {
    ElMessageBox.confirm("确定要删除配置吗？删除后检查功能将无法使用", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
    }).then(() => {
        paxios.post("/manage/clearCheckKeyConfig").then(res => {
            if (res.data.code == 0) {
                ElMessage.success("删除成功");
            }
        })
    })
}
onMounted(() => {
    loading.value = true
    paxios.get("/manage/getCheckKeyConfig").then(res => {
        if (res.data.code == 0) {
            checkKey.value = res.data.data
           
        } else if (res.data.code != 10000) {
            ElMessage.error(res.data.msg);
        }
    }).finally(() => { loading.value = false })
})
</script>