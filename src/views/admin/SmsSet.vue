<template>
    <el-card>
        <template #header>
            <div class="card-header">
                <span>短信设置</span>
            </div>
        </template>
        <el-form label-width="auto" v-loading="loading">
            <el-form-item label="短信引擎">
                <el-radio-group v-model="smsType" fill="#6cf">
                    <el-radio-button label="阿里云" value="ali" />
                    <el-radio-button label="腾讯云" value="tencent" />
                </el-radio-group>
            </el-form-item>
            <div v-show="smsType == 'ali'">
                <el-form-item label="AccessKeyId:">
                    <el-input v-model="aliConfig.accessKeyId" />
                </el-form-item>
                <el-form-item label="AccessKeySecret:">
                    <el-input v-model="aliConfig.accessKeySecret" />
                </el-form-item>
                <el-form-item label="短信签名:">
                    <el-input v-model="aliConfig.signature" />
                </el-form-item>
                <el-form-item label="模板ID:">
                    <el-input v-model="aliConfig.template" />
                </el-form-item>
            </div>
            <div v-show="smsType == 'tencent'">
                <el-form-item label="SdkAppID:">
                    <el-input v-model="tencentConfig.sdkAppID" />
                </el-form-item>
                <el-form-item label="AccessKeyId:">
                    <el-input v-model="tencentConfig.accessKeyId" />
                </el-form-item>
                <el-form-item label="AccessKeySecret:">
                    <el-input v-model="tencentConfig.accessKeySecret" />
                </el-form-item>
                <el-form-item label="短信签名:">
                    <el-input v-model="tencentConfig.signature" />
                </el-form-item>
                <el-form-item label="模板ID:">
                    <el-input v-model="tencentConfig.template" />
                </el-form-item>
            </div>
            <el-form-item>
                <el-button type="primary" @click="onSubmit">提交</el-button>
                <el-button type="danger" @click="clearConfig">删除配置</el-button>
            </el-form-item>
        </el-form>
    </el-card>
</template>
<script setup lang="ts">
import { paxios } from '@/utils/paxios'
import { ref, onMounted } from 'vue'
const smsType = ref("")
const loading = ref(false)

//阿里云短信配置
const aliConfig = ref({
    accessKeyId: "",
    accessKeySecret: "",
    signature: "",
    template: ""
})

//腾讯云配置
const tencentConfig = ref({
    sdkAppID: "",
    accessKeyId: "",
    accessKeySecret: "",
    signature: "",
    domain: "",
    template: ""

})

function toClearConfig() {
    loading.value = true
    paxios.get("/manage/clearSmsConfig").then(res => {
        if (res.data.code == 0) {
            ElMessage.success("删除成功");
            smsType.value = ""
            aliConfig.value = {
                accessKeyId: "",
                accessKeySecret: "",
                signature: "",
                template: ""
            }
            tencentConfig.value = {
                sdkAppID: "",
                accessKeyId: "",
                accessKeySecret: "",
                signature: "",
                domain: "",
                template: ""
            }
        } else {
            ElMessage.error(res.data.msg);
        }
    }).finally(() => { loading.value = false })
}
function clearConfig() {
    ElMessageBox.confirm("确定要删除配置吗？删除后短信功能将无法使用", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
    }).then(() => {
        toClearConfig()
    });
}

function onSubmit() {
    //校验数据
    if (smsType.value == "") {
        ElMessage.error("请选择短信引擎");
        return
    }
    if (smsType.value == "ali") {
        if (aliConfig.value.accessKeyId == "") {
            ElMessage.error("请填写AccessKeyId");
            return
        }
        if (aliConfig.value.accessKeySecret == "") {
            ElMessage.error("请填写AccessKeySecret");
            return
        }
        if (aliConfig.value.signature == "") {
            ElMessage.error("请填写短信签名");
        }
        if (aliConfig.value.template == "") {
            ElMessage.error("请填写模板ID");
            return
        }
    }if (smsType.value == "tencent") { 
        if (tencentConfig.value.sdkAppID == "") {
            ElMessage.error("请填写SdkAppID");
            return
        }
        if (tencentConfig.value.accessKeyId == "") {
            ElMessage.error("请填写AccessKeyId");
            return
        }
        if (tencentConfig.value.accessKeySecret == "") {
            ElMessage.error("请填写AccessKeySecret");
            return
        }
        if (tencentConfig.value.signature == "") {
            ElMessage.error("请填写短信签名");
        }
        if (tencentConfig.value.template == "") {
            ElMessage.error("请填写模板ID");
            return
        }
    }
    loading.value = true
    paxios.post("/manage/setSmsConfig", {
        smsType: smsType.value,
        aliConfig: aliConfig.value,
        tencentConfig: tencentConfig.value
    }).then(res => {
        if (res.data.code == 0) {
            ElMessage.success(res.data.msg);
        } else {
            ElMessage.error(res.data.msg);
        }
    }).catch(error => {
        console.log(error);
        ElMessage.error("提交失败，请稍后再试");
    }).finally(() => {
        loading.value = false
    });

}

onMounted(() => {
    //获取短信配置
    loading.value = true
    paxios.get("/manage/getSmsConfig").then(res => {
        if (res.data.code == 0) {
            smsType.value = res.data.data.smsType
            if (res.data.data.smsType == "ali") {
                aliConfig.value = res.data.data.ali
            } else if (res.data.data.smsType == "tencent") {
                tencentConfig.value = res.data.data.tencent
            }
        } else if (res.data.code != 10000) {
            ElMessage.error(res.data.msg);
        }
    }).finally(() => { loading.value = false })
})

</script>