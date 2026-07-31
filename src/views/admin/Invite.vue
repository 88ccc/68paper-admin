<template>
    <el-card>
        <template #header>
            <div class="card-header">
                <span>邀请设置</span>
            </div>
        </template>
        <el-form label-width="80px" v-loading="loading">
            <el-form-item label="邀请奖励">
                <el-switch v-model="hasInvite" inline-prompt active-text="开启" inactive-text="关闭" />
            </el-form-item>

            <el-form-item>
                <el-button type="primary" @click="onSubmit">提交</el-button>
            </el-form-item>
        </el-form>
        <template #footer>
            说明：<br />
            开启邀请奖励后，用户可以通过邀请链接注册账号，注册成功后，被邀请的人每卖出一单，邀请人将获得奖励。<br />
            开启后，默认奖励金额是0，需要你设置每个产品的邀请奖励金额。
        </template>
    </el-card>
</template>
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { paxios } from '@/utils/paxios'

const loading = ref(false)
const hasInvite = ref(false)




onMounted(() => {
    loading.value = true
    paxios.get("/index/getInviteConfig").then(res => {
        if (res.data.code == 0) {
            let str = res.data.data.enable;
            const val = String(str).trim().toLowerCase();
            hasInvite.value = (val === 'true');
        } else if (res.data.code != 10000) {
            ElMessage.error(res.data.msg);
        }
    }).catch(error => {
        console.log(error);
    }).finally(() => {
        loading.value = false
    });
})



function onSubmit() {
    //判断数据
    let config = {
        enable: hasInvite.value
    }

    loading.value = true;
    paxios.post("/manage/setInviteConfig", {
        config: config
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
</script>