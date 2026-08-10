<template>
    <el-card>
        <template #header>
            <div class="card-header">
                <span>客服设置</span>
            </div>
        </template>
        <el-alert title="这里设置的联系方式会展现在网页上。所有代理必须设置，不能全为空，至少设置一项。" type="info" :closable="false" />
        <el-form v-loading="loading" label-width="auto" style="max-width: 600px;margin: 10px 10px">
            <el-form-item label="QQ">
                <el-input v-model="qq" />
            </el-form-item>
            <el-form-item label="微信">
                <el-input v-model="wechat" />
            </el-form-item>
            <el-form-item label="电话">
                <el-input v-model="phone" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onSubmit">提交</el-button>
            </el-form-item>
        </el-form>

    </el-card>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { paxios } from '@/utils/paxios';

const qq = ref('');
const wechat = ref('');
const phone = ref('');
const loading = ref(false);

onMounted(async () => {
    loading.value = true;
    try {
        let res = await paxios.get("/console/getCustomer");
        if (res.data.code == 0) {
            qq.value = res.data.data.qq;
            wechat.value = res.data.data.wechat;
            phone.value = res.data.data.phone;
        } else {
            ElMessage.error(res.data.msg);
        }
    } catch (error) {
        ElMessage.error('网络异常');
        console.error('网络异常:', error);
    }
    loading.value = false;

})

async function onSubmit() {
    let res = await paxios.post("/console/setCustomer", { qq: qq.value, wechat: wechat.value, phone: phone.value });
    if (res.data.code == 0) {
        ElMessage.success(res.data.msg);
    } else {
        ElMessage.error(res.data.msg);
    }
}

</script>