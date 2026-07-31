<template>
    <el-card>
        <template #header>
            <div class="card-header">
                <span>功能设置</span>
            </div>
        </template>
        <el-form label-width="80px" v-loading="loading">
            <el-form-item label="扩展功能">
                <el-switch v-model="extensions" inline-prompt active-text="开启" inactive-text="关闭" />
            </el-form-item>
            <el-form-item label="消息订阅">
                <el-switch v-model="msgsub" inline-prompt active-text="开启" inactive-text="关闭" />
            </el-form-item>
            <el-form-item label="附件功能">
                <el-switch v-model="attach" inline-prompt active-text="开启" inactive-text="关闭" />
            </el-form-item>
            <el-form-item label="用户公告">
                <el-switch v-model="notice" inline-prompt active-text="开启" inactive-text="关闭" />
            </el-form-item>

            <el-form-item>
                <el-button type="primary" @click="onSubmit">提交</el-button>
            </el-form-item>
        </el-form>
        <template #footer>
            说明：<br />
            开启扩展功能后，用户可以充值，可以使用检测卡检测<br />
        </template>
    </el-card>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { paxios } from '@/utils/paxios'
import { storeToRefs } from "pinia"
import { useSaleWebStore } from "@/stores/saleWebConfig"

const { functions } = storeToRefs(useSaleWebStore());


const loading = ref(false)
const attach = ref(false)
const msgsub = ref(false)
const notice = ref(false)
const extensions = ref(false)




onMounted(() => {
    if (functions.value) {
        attach.value = functions.value.attach;
        msgsub.value = functions.value.msgsub;
        notice.value = functions.value.notice;
        extensions.value = functions.value.extensions;
    }
})



function onSubmit() {
    //判断数据
    let config = {
        extensions: extensions.value,
        notice: notice.value,
        msgsub: msgsub.value,
        attach: attach.value
    }

    loading.value = true;
    paxios.post("/manage/setFunctionConfig", {
        config: config
    }).then(res => {
        if (res.data.code == 0) {
            ElMessage.success(res.data.msg);
            window.location.reload();
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
</script>