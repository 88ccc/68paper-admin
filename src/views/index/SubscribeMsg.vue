<template>
    <el-card>
        <template #header>
            <div class="card-header">
                <span>消息订阅</span>
            </div>
        </template>
        <el-form label-width="100px" v-loading="loading">
            <el-form-item label="订阅事件:">
                <el-checkbox-group v-model="eventList">
                    <el-checkbox label="提现失败" value="txfail" />
                    <el-checkbox label="提现成功" value="txsucc" />
                    <el-checkbox v-if="functions.extensions" label="积分告警" value="points" />
                </el-checkbox-group>
            </el-form-item>
            <el-form-item v-if="showThreshold" label="积分告警阈值:">
                <el-input-number v-model="threshold" :precision="2" :step="1" :min="0">
                    <template #suffix>
                        <span>元</span>
                    </template>
                </el-input-number>
            </el-form-item>
            <el-form-item label="订阅方式:">
                <el-checkbox-group v-model="methodList">
                    <el-checkbox label="邮箱" value="email" />
                </el-checkbox-group>
            </el-form-item>

            <el-form-item>
                <el-button type="primary" @click="onSubmit">提交</el-button>
            </el-form-item>
        </el-form>
        <template #footer>
            说明：<br />
            如果不想收到消息，把所有选项去掉，点击 提交<br />
            积分告警阈值必须大于0才有效，等于0 不会有告警消息
        </template>
    </el-card>
</template>
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { paxios } from '@/utils/paxios'
import { useSaleWebStore } from '@/stores/saleWebConfig'
import { storeToRefs } from "pinia"

const loading = ref(false)
const eventList = ref<string[]>([])
const methodList = ref<string[]>([])
const threshold = ref(0);
const showThreshold = ref(false);
const { functions } = storeToRefs(useSaleWebStore());


watch(eventList, (newValue, oldValue) => {
    if (newValue.indexOf('points') === -1) {
        showThreshold.value = false;
        threshold.value = 0;
    } else {
        showThreshold.value = true;
    }
});

onMounted(async () => {
    let res = await paxios.get("/console/getSubscribeMsg");
    if (res.data.code == 0) {
        eventList.value = res.data.data.event.split(',').filter(Boolean);
        methodList.value = res.data.data.method.split(',').filter(Boolean);
        threshold.value = res.data.data.threshold / 100;
    } else {
        ElMessage.error(res.data.msg);
    }
    if (!functions.value.extensions) {
        for (let i = 0; i < eventList.value.length; i++) {
            if (eventList.value[i] == 'points') {
                eventList.value.splice(i, 1);
                threshold.value = 0;
            }
        }
    }
})



function onSubmit() {
    //判断数据
    loading.value = true;
    let tmp = threshold.value;
    let tmpthreshold = Math.round(tmp * 100)
    paxios.post("/console/setSubscribeMsg", {
        event: eventList.value.toString(),
        threshold: tmpthreshold,
        method: methodList.value.toString()
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