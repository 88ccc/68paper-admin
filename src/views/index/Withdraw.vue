<template>
    <div style="max-width: 600px; margin: 10px auto;">
        <div style="margin-bottom: 20px;">
            <el-alert type="primary" :closable="false">
                当前可提现金额：{{ balance }}元，本月剩余可提现次数：{{ wcount }}次
            </el-alert>
        </div>
        <el-steps :active="active" finish-status="success">
            <el-step title="填写入款信息" />
            <el-step title="确认入款信息" />
            <el-step title="完成" />
        </el-steps>
        <div style="margin-top: 25px;" v-if="active === 0">
            <el-form label-width="auto">

                <el-form-item label="账号类型">
                    <el-select v-model="formData.method" placeholder="请选择类型" class="search-select">
                        <el-option v-if="showAlipay" label="支付宝" value="alipay" />
                        <el-option v-if="showWechat" label="微信手机号" value="wechat" />
                    </el-select>
                </el-form-item>
                <el-form-item label="账号">
                    <el-input v-model="formData.account" />
                </el-form-item>
                <el-form-item label="姓名">
                    <el-input v-model="formData.name" disabled />
                </el-form-item>
                <el-form-item label="提现金额">
                    <el-input v-model="formData.amount" type="number" placeholder="最多两位小数">
                        <template #append>元</template>
                    </el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="nextStep">下一步</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div style="margin-top: 25px;" v-if="active === 1">
            <el-form label-width="auto">

                <el-form-item label="账号类型">
                    <el-select v-model="formData.method" placeholder="请选择类型" class="search-select" disabled>
                        <el-option v-if="showAlipay" label="支付宝" value="alipay" />
                        <el-option v-if="showWechat" label="微信手机号" value="wechat" />
                    </el-select>
                </el-form-item>
                <el-form-item label="账号">
                    <el-input v-model="formData.account" disabled />
                </el-form-item>
                <el-form-item label="姓名">
                    <el-input v-model="formData.name" disabled />
                </el-form-item>
                <el-form-item label="提现金额">
                    <el-input v-model="formData.amount" type="number" placeholder="最多两位小数" disabled>
                        <template #append>元</template>
                    </el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submit">确认提现</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div style="margin-top: 25px;" v-if="active === 2">
            <el-result v-if="result" icon="success" title="提现申请成功" sub-title="请等待管理员处理">
            </el-result>
            <el-result v-if="!result" icon="error" title="提现申请失败" :sub-title="errMsg">
            </el-result>

        </div>

    </div>
    <el-divider />
    <div>
        <h3>提现说明</h3>
        <p>1. 提现金额需大于{{ withdrawConfig.min }}元</p>
        <p>2. 一个月提现次数为{{ withdrawConfig.count }}次</p>
        <p>3. 提现手续费为{{ withdrawConfig.charge }}%</p>
        <p>4. 提现时间预计{{ withdrawConfig.days }}个工作日内完成</p>
    </div>
</template>
<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { paxios } from '@/utils/paxios';

const active = ref(0)
const showAlipay = ref(false);
const showWechat = ref(false);
const result = ref(false);
const errMsg = ref("");

const withdrawConfig = ref({
    count: 4,
    min: 0,
    charge: 0,
    method: [],
    days: 5,
})

const balance = ref(0);
const wcount = ref(0);

const formData = ref({
    method: "",
    account: "",
    name: "",
    amount: 0,
})

onMounted(async () => {
    let res = await paxios.get("/index/getWithdrawConfig");
    if (res.data.code == 0) {
        withdrawConfig.value = res.data.data;
        withdrawConfig.value.method.forEach((item) => {
            if (item == "alipay") {
                showAlipay.value = true;
            } else if (item == "wechat") {
                showWechat.value = true;
            }
        });
    }

    let res1 = await paxios.get("/console/getWithdrawInfo");
    if (res1.data.code == 0) {
        balance.value = res1.data.data.balance / 100;
        wcount.value = withdrawConfig.value.count - res1.data.data.count;
        if (wcount.value < 0) {
            wcount.value = 0;
        }
        formData.value.name = res1.data.data.name;
    }

});
function nextStep() {
    if (formData.value.method.length < 1) {
        ElMessage.error("请选择提现账号类型");
        return;
    }
    if (formData.value.account.length < 1) {
        ElMessage.error("请输入提现账号");
        return;
    }
    //判断formData.value.amount 最多两位小数
    const parts = formData.value.amount.toString().split(".");
    if (parts[1] && parts[1].length > 2) {
        ElMessage.error("提现金额最多两位小数");
        return;
    }
    if (formData.value.amount < withdrawConfig.value.min) {
        ElMessage.error("提现金额不能小于" + withdrawConfig.value.min + "元");
        return;
    }
    if (formData.value.amount > balance.value) {
        ElMessage.error("提现金额不能大于可提现金额");
        return;
    }

    if (wcount.value < 1) {
        ElMessage.error("本月提现次数已达上限");
        return;
    }
    active.value++
}

async function submit() {
    let res = await paxios.post("/console/withdrawSubmit", {
        method: formData.value.method,
        account: formData.value.account,
        amount: formData.value.amount * 100,
    });
    if (res.data.code == 0) {
        ElMessage.success("提现申请成功");

        result.value = true;
    } else {
        ElMessage.error(res.data.msg);
        errMsg.value = res.data.msg;
        result.value = false;
    }
    active.value = 2;

}

</script>