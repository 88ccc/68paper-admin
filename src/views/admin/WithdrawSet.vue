<template>
    <el-card>
        <template #header>
            <div class="card-header">
                <span>提现设置</span>
            </div>
        </template>
        <el-form label-width="80px" v-loading="loading">
            <el-form-item label="提现次数">
                <el-input-number v-model="withdrawConfig.count" :precision="0" :step="1" :min="1" :max="30" />
                <div class="el-form-item__error" style="position: static; color: #999;">
                    提示：每月可以提现几次
                </div>
            </el-form-item>
            <el-form-item label="提现方式:">

                <el-checkbox-group v-model="withdrawConfig.method">
                    <el-checkbox label="支付宝" value="alipay" />
                    <el-checkbox label="微信手机号" value="wechat" />
                </el-checkbox-group>
            </el-form-item>
            <el-form-item label="最低金额">
                <el-input-number v-model="withdrawConfig.min" :precision="0" :step="1" :min="0" />
                <div class="el-form-item__error" style="position: static; color: #999;">
                    提示：最低提现金额,单位元
                </div>
            </el-form-item>
            <el-form-item label="手续费">
                <el-input-number v-model="withdrawConfig.charge" :precision="0" :step="1" :min="0" :max="100">
                    <template #suffix>
                        <span>%</span>
                    </template>

                </el-input-number>
                <div class="el-form-item__error" style="position: static; color: #999;">
                    提示：每次提现需要扣除百分之几的手续费
                </div>
            </el-form-item>
            <el-form-item label="处理速度">
                <el-input-number v-model="withdrawConfig.days" :precision="0" :step="1" :min="0" :max="100">
                    <template #suffix>
                        <span>天</span>
                    </template>

                </el-input-number>
                <div class="el-form-item__error" style="position: static; color: #999;">
                    提示：承诺多少天内处理提现申请
                </div>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onSubmit">提交</el-button>
            </el-form-item>
        </el-form>
    </el-card>
</template>
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { paxios } from '@/utils/paxios'

const regHasAccount = ref(false)
const loading = ref(false)

const withdrawConfig = ref({
    count: 4,
    min: 0,
    charge: 0,
    method: [],
    days:5,
})


onMounted(() => {
    loading.value = true
    paxios.get("/index/getWithdrawConfig").then(res => {
        if (res.data.code == 0) {
            withdrawConfig.value = res.data.data;
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
    if(withdrawConfig.value.count < 1){
        ElMessage.error('提现次数必须大于0');
        return;
    }
    if(withdrawConfig.value.min < 0){
        ElMessage.error('最低金额必须大于0');
        return;
    }
    if(withdrawConfig.value.days <1){
        ElMessage.error('处理速度必须大于0天');
        return;
    }
    if(withdrawConfig.value.method.length <1){
        ElMessage.error('请选择提现方式');
        return;
    }
    
    loading.value = true;
    paxios.post("/manage/setWithdrawConfig", {
        config: withdrawConfig.value
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