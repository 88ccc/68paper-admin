<template>
    <el-card>
        <template #header>
            <div class="card-header">
                <span>邮箱设置</span>
            </div>
        </template>
        <el-form label-width="auto" v-loading="loading">

            <el-form-item label="邮箱服务器:">
                <el-input v-model="emailConfig.host" />
            </el-form-item>
            <el-form-item label="发件人名字:">
                <el-input v-model="emailConfig.name" />
            </el-form-item>
            <el-form-item label="发件人邮箱:">
                <el-input v-model="emailConfig.user" />
            </el-form-item>
            <el-form-item label="加密方式:">
                <el-radio-group v-model="emailConfig.secure">
                    <el-radio value="ssl">SSL</el-radio>
                    <el-radio value="tls">TLS</el-radio>
                    <el-radio value="none">无</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="端口:">
                <el-input v-model="emailConfig.port" />
            </el-form-item>
            <el-form-item label="密码:">
                <el-input v-model="emailConfig.password" />
            </el-form-item>
            <el-form-item label="注册邮件主题:">
                <el-input v-model="emailConfig.subject" />
            </el-form-item>
            <el-form-item label="注册邮件内容:">

                <el-input v-model="emailConfig.content" :autosize="{ minRows: 4, maxRows: 8 }" type="textarea" />
            </el-form-item>

            <el-form-item>
                <el-button type="primary" @click="onSubmit">提交</el-button>
                <el-button type="danger" @click="clearConfig">删除配置</el-button>
            </el-form-item>
        </el-form>
        <template #footer>
            邮件内容中{code}代表验证码，实际发送时会是6位随机数<br /><br />
            这里的配置应该根据你邮箱的SMTP的设置来填写
        </template>
    </el-card>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { paxios } from '@/utils/paxios'

const loading = ref(false)
const emailConfig = ref({
    host: "",
    name: "",
    user: "",
    password: "",
    port: "",
    secure: "none",
    subject: "网站注册",
    content: "您正在注册账号，验证码是{code}"
})

onMounted(() => {
    loading.value = true
    paxios.get("/manage/getEmailConfig").then(res => {
        if (res.data.code == 0) {
            emailConfig.value = res.data.data
        } else if (res.data.code != 10000) {
            ElMessage.error(res.data.msg);
        }
    }).finally(() => { loading.value = false })
})


function toClearConfig() {
    loading.value = true
    paxios.get("/manage/clearEmailConfig").then(res => {
        if (res.data.code == 0) {
            ElMessage.success("删除成功");
            emailConfig.value = {
                host: "",
                name: "",
                user: "",
                password: "",
                port: "",
                secure: "none",
                subject: "网站注册",
                content: "您正在注册账号，验证码是{code}"
            }
        } else {
            ElMessage.error(res.data.msg);
        }
    }).finally(() => { loading.value = false })
}

function clearConfig() {
    ElMessageBox.confirm("确定要删除配置吗？删除后邮件功能将无法使用", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
    }).then(() => {
        toClearConfig()
    });
}

function onSubmit() {
    //校验数据
    if (emailConfig.value.host == "") {
        ElMessage.error("请填写邮箱服务器");
        return
    }
    if (emailConfig.value.name == "") {
        ElMessage.error("请填写发件人名字");
        return;
    }
    if (emailConfig.value.user == "") {
        ElMessage.error("请填写发件人邮箱");
        return
    }
    if (emailConfig.value.password == "") {
        ElMessage.error("请填写密码");
        return
    }
    if (emailConfig.value.subject == "") {
        ElMessage.error("请填写注册邮件主题");
        return
    }
    if (emailConfig.value.content == "") {
        ElMessage.error("请填写注册邮件内容");
        return
    }
    loading.value = true
    paxios.post("/manage/setEmailConfig", { config: emailConfig.value }).then(res => {
        if (res.data.code == 0) {
            ElMessage.success("修改成功");
        } else {
            ElMessage.error(res.data.msg);
        }
    }).finally(() => { loading.value = false })
}

</script>