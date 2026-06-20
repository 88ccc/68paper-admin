<template>
        <div>
        <el-row :gutter="16">
            <el-col :xs="24" :sm="12" :md="6" class="data-show">
                <el-statistic title="账户余额" :precision="2" :value="balance" />
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" class="data-show">
                <el-statistic title="今日支付单数" :precision="0" :value="pay_count" />
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" class="data-show">
                <el-statistic title="今日营业额" :precision="2" :value="pay_amount" />
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" class="data-show">
                <el-statistic title="今日利润" :precision="2" :value="profit" />
            </el-col>
        </el-row>
    </div>
    <el-card>
    <template #header>
      <div class="card-header">
        <span>公告</span>
      </div>
    </template>
    <div v-html="valueHtml"></div>
  </el-card>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { paxios } from '@/utils/paxios';

const balance = ref(0);
const pay_count = ref(0);
const pay_amount = ref(0);
const profit = ref(0);
// 内容 HTML
const valueHtml = ref('')
onMounted( async () => {
    let res = await paxios.get("/console/homeData");
    if(res.data.code == 0){
        balance.value = res.data.data.balance;
        pay_count.value = res.data.data.pay_count;
        pay_amount.value = res.data.data.pay_amount;
        profit.value = res.data.data.profit;
    }
    let res1 = await paxios.get("/index/getNotice");
    if(res1.data.code == 0){
        valueHtml.value = res1.data.data;
    }
})

</script>
<style lang="css" scoped>
.data-show {
    text-align: center;
    margin-top: 10px;
    margin-bottom: 20px;
    border: 1px solid #e4e7ed;
}
</style>