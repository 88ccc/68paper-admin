<template>
    <el-card>
        <template #header>
            <div class="card-header">
                <span>阿索奇标准货源</span>
            </div>
        </template>
        <el-form :model="cardKey" label-width="100px" v-loading="loading">
            <el-form-item label="AppId:">
                <el-input v-model="cardKey.appid" placeholder="请输入AppId" />
            </el-form-item>
            <el-form-item label="AppSecret:">
                <el-input v-model="cardKey.secret" />
            </el-form-item>
            <el-form-item label="测试">
                <el-switch v-model="cardKey.test" inline-prompt active-text="开启" inactive-text="关闭" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onSubmit">提交</el-button>
                <el-button type="danger" @click="clearConfig">删除配置</el-button>
            </el-form-item>
        </el-form>
        <template #footer>
            说明：<br />
            需要去<a href="https://open.agiso.com/" target="_blank">阿索奇开放平台</a>创建“标准货源”应用<br />
            在上线前的测试阶段，要开启测试。正式使用时要关闭测试<br />
            测试某些失败场景时，可以给不存在的产品id<br />
            如果某些项目无法测试通过，可以试试把单号改成测试单号：T170000000
        </template>
    </el-card>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { paxios } from '@/utils/paxios'
const cardKey = ref({
    appid: '',
    secret: '',
    test: false,
})
const loading = ref(false)

function onSubmit() {
    //先验证

    if (!cardKey.value.appid) {
        ElMessage.error("请输入AppId");
        return
    }
    if (!cardKey.value.secret) {
        ElMessage.error("请输入AppSecret");
        return
    }
    loading.value = true
    paxios.post("/manage/setAgisoConfig", { config: cardKey.value }).then(res => {
        if (res.data.code == 0) {
            ElMessage.success("保存成功");
        } else {
            ElMessage.error(res.data.msg);
        }
    }).finally(() => { loading.value = false })
}
function clearConfig() {
    ElMessageBox.confirm("确定要删除配置吗？删除后阿索奇将无法使用", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
    }).then(() => {
        paxios.post("/manage/clearAgisoConfig").then(res => {
            if (res.data.code == 0) {
                ElMessage.success("删除成功");
            }
        })
    })
}
onMounted(() => {
    loading.value = true
    paxios.get("/manage/getAgisoConfig").then(res => {
        if (res.data.code == 0) {
            cardKey.value = res.data.data
            let str = res.data.data.test;
            const val = String(str).trim().toLowerCase();
            cardKey.value.test = (val === 'true');

        } else if (res.data.code != 10000) {
            ElMessage.error(res.data.msg);
        }
    }).finally(() => { loading.value = false })
})
</script>