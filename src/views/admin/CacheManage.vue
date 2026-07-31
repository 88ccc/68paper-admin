<template>
    <el-card>
        <template #header>
            <div class="card-header">
                <span>缓存管理</span>
            </div>
        </template>
        <el-form label-width="auto" v-loading="loading">

            <el-form-item label="报告保存:">
                <el-input-number v-model="cacheConfig.report" :precision="0" :step="1" :min="7">
                    <template #suffix>
                        <span>天</span>
                    </template>
                </el-input-number>
            </el-form-item>
            <el-form-item label="检测记录保存:">
                <el-input-number v-model="cacheConfig.check" :precision="0" :step="1" :min="1">
                    <template #suffix>
                        <span>年</span>
                    </template>
                </el-input-number>
            </el-form-item>
            <el-form-item label="资金流水保存:">
                <el-input-number v-model="cacheConfig.amount" :precision="0" :step="1" :min="1">
                    <template #suffix>
                        <span>年</span>
                    </template>
                </el-input-number>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onSubmit">提交</el-button>
            </el-form-item>
        </el-form>
    </el-card>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { paxios } from '@/utils/paxios'

const loading = ref(false)
const cacheConfig = ref({
    report: 0,
    check: 0,
    amount: 0
})

onMounted(() => {
    loading.value = true
    paxios.get("/manage/getCacheConfig").then(res => {
        if (res.data.code == 0) {
            cacheConfig.value = res.data.data
        } else if (res.data.code != 10000) {
            ElMessage.error(res.data.msg);
        }
    }).finally(() => { loading.value = false })
})




function onSubmit() {
    //校验数据
    if (cacheConfig.value.report < 7) {
        ElMessage.error("报告缓存不得低于7天");
        return
    }
    if (cacheConfig.value.check < 1) {
        ElMessage.error("检测记录缓存不得少于1年");
        return;
    }
    if (cacheConfig.value.amount < 1) {
        ElMessage.error("资金流水记录缓存不得少于1年");
        return
    }

    loading.value = true
    paxios.post("/manage/setCacheConfig", { config: cacheConfig.value }).then(res => {
        if (res.data.code == 0) {
            ElMessage.success("修改成功");
        } else {
            ElMessage.error(res.data.msg);
        }
    }).finally(() => { loading.value = false })
}

</script>