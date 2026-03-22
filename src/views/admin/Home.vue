<template>
    <div>
        <el-row :gutter="16">
            <el-col :xs="24" :sm="12" :md="6" class="data-show">
                <el-statistic title="今日提交单数" :precision="0" :value="sub_count" />
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
    <el-card style="margin-top: 15px;">
        <template #header>
            <div class="card-header">
                <span>88学子账户余额</span>
            </div>
        </template>
        <div>
            <span style="font-size: 36px;font-weight: 800;margin: 15px 15px;">{{ balance }}</span> 元
        </div>
        <el-button type="primary" tag="a" style="margin:15px 15px;" href="https://open.88xuezi.com" target="_blank">
            去充值
        </el-button>
    </el-card>
    <el-card style="margin-top: 15px;">
        <template #header>
            <div class="card-header">
                <span>最近7天营业额</span>
            </div>
        </template>
        <div class="sales-chart">
            <div ref="payChartContainer" class="chart-container"></div>
        </div>
    </el-card>

</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { paxios } from '@/utils/paxios';
import * as echarts from 'echarts';
import type { ECharts } from 'echarts';

const sub_count = ref(0);
const pay_count = ref(0);
const pay_amount = ref(0.0);
const balance = ref(0.00);
const profit = ref(0.00);

let resizeHandler: (() => void) | null = null;
let payChartInstance: ECharts | null = null;
const payChartContainer = ref<HTMLElement | null>(null);


const initChart = () => {

    if (payChartInstance) {
        payChartInstance.dispose();
    }

    if (!payChartContainer.value) {
        console.error('充值图表容器未找到');
    }


    payChartInstance = echarts.init(payChartContainer.value);


    const payoption: echarts.EChartsOption = {
        tooltip: {
            trigger: 'axis',
            formatter: '{b}: {c} 元'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: []
        },
        yAxis: {
            type: 'value',
            min: 0,
            max: 50,
            axisLabel: {
                formatter: '{value} 元'
            }
        },
        series: [
            {
                name: '营业额',
                type: 'line',
                data: [],
                smooth: true,
                symbol: 'circle',
                symbolSize: 8,
                lineStyle: {
                    width: 3
                },
                itemStyle: {
                    color: '#409eff'
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
                        { offset: 1, color: 'rgba(64, 158, 255, 0)' }
                    ])
                }
            }
        ]
    };

    payChartInstance.setOption(payoption);
    // 窗口resize处理
    resizeHandler = () => {
        payChartInstance?.resize()
    };
    window.addEventListener('resize', resizeHandler);
};

function findMaxNumber(numbers: number[]): number {
    // 处理空数组情况
    if (numbers.length === 0) {
        throw new Error("数组不能为空，请传入至少一个数字");
    }

    // 初始化最大值为数组第一个元素
    let max = numbers[0];

    // 遍历数组比较大小
    for (let i = 1; i < numbers.length; i++) {
        if (numbers[i] > max) {
            max = numbers[i];
        }
    }

    return max;
}
onUnmounted(() => {
    if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
    }
    payChartInstance?.dispose();
});
onMounted(async () => {
    initChart();
    try {
        let res = await paxios.get("/manage/homeData");
        if (res.data.code == 0) {
            sub_count.value = res.data.data.sub_count;
            pay_count.value = res.data.data.pay_count;
            pay_amount.value = res.data.data.pay_amount;
            balance.value = res.data.data.balance;
            profit.value = res.data.data.profit;
            let payMax = findMaxNumber(res.data.data.pay);
            if (payMax < 10) {
                payMax = 10;
            }
            payChartInstance?.setOption({
                xAxis: { data: res.data.data.dates },
                yAxis: { max: payMax },
                series: [{ data: res.data.data.pay }]
            });
        }
    } catch (err) {
        ElMessage.error("获取数据失败");
    }

})

</script>
<style lang="css" scoped>
.data-show {
    text-align: center;
    margin-top: 10px;
    border: 1px solid #e4e7ed;
}

.sales-chart {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
}

.chart-container {
    width: 100%;
    height: 300px;
}
</style>