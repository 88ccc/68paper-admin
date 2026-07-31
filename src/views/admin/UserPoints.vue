<template>
    <div style="max-width: 600px; margin: 10px auto;">
         <div style="text-align: center;color: blue;">
            <h1>用户积分修改</h1>
        </div>
        <div style="margin-bottom: 20px;">
            <el-alert type="primary" :closable="false">
                本页面用于修改用户积分,负数是减少，正数是增加
            </el-alert>
        </div>
        <el-steps :active="active" finish-status="success">
            <el-step title="输入用户ID" />
            <el-step title="填写信息" />
            <el-step title="完成" />
        </el-steps>
        <div v-loading="loading" style="margin-top: 25px;" v-if="active === 0">
            <el-form label-width="auto">
                <el-form-item label="用户ID">
                    <el-input type="number" v-model="userId" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="nextStep">下一步</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div v-loading="loading" style="margin-top: 25px;" v-if="active === 1">
            <el-form label-width="auto">
                <el-form-item label="用户ID">
                    <el-input v-model="formData.userid" disabled />
                </el-form-item>
                <el-form-item label="用户积分">
                    <el-input v-model="formData.points" disabled>
                        <template #append>元</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="姓名">
                    <el-input v-model="formData.name" disabled />
                </el-form-item>
                <el-form-item label="类型:">
                    <el-select v-model="formData.type" placeholder="请选择类型" class="search-select">
                        <el-option label="充值" value="1" />
                        <el-option label="消费" value="2" />
                        <el-option label="退款" value="3" />
                        <el-option label="赠送" value="4" />
                        <el-option label="提现" value="5" />
                        <el-option label="其他" value="6" />
                    </el-select>
                </el-form-item>
                <el-form-item label="金额:">
                    <el-input type="number" v-model="formData.amount" clearable>
                        <template #append>元</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="订单号:">
                    <el-input type="text" v-model="formData.businessNo" clearable placeholder="选填">
                    </el-input>
                </el-form-item>
                <el-form-item label="备注:">
                    <el-input v-model="formData.remark" :autosize="{ minRows: 4, maxRows: 8 }" type="textarea" maxlength="250" show-word-limit/>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleBalance">修改积分</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div style="margin-top: 25px;" v-if="active === 2">
            <el-result v-if="result" icon="success" title="处理成功" sub-title="">
            </el-result>
            <el-result v-if="!result" icon="error" title="处理失败" :sub-title="errMsg">
            </el-result>

        </div>

    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { paxios } from '@/utils/paxios';

const active = ref(0)
const result = ref(false);
const errMsg = ref("");
const loading = ref(false);

const withdrawConfig = ref({
    count: 4,
    min: 0,
    charge: 0,
    method: [],
    days: 5,
})

const userId = ref(0);

const formData = ref({
    userid: 0,
    points: 0,
    name: "",
    amount: 0,
    type: "",
    businessNo: "",
    remark: ""

})
async function nextStep() {
    //判断userId 是否是整数
    if (userId.value <= 0) {
        ElMessage.error("非法用户ID");
        return;
    }
    if (userId.value % 1 !== 0) {
        ElMessage.error("用户ID必须是整数");
        return;
    }
    loading.value = true;
    let res = await paxios.get("/manage/getUserInfo?userid=" + userId.value);
    if (res.data.code == 0) {
        formData.value.userid = res.data.data.id;
        formData.value.name = res.data.data.name;
        formData.value.points = res.data.data.points / 100;
        active.value++
    } else {
        ElMessage.error(res.data.msg);
        return;
    }
    loading.value = false;


}

async function handleBalance() {

    const inputStr = String(formData.value.amount).trim();
    const validPattern = /^-?\d+(\.\d{1,2})?$/;
    if (!validPattern.test(inputStr)) {
        ElMessage.error('输入金额格式错误！仅允许正负整数、正负1位小数或正负2位小数的有效数字');
        return;
    }
    if (formData.value.type == "") {
        ElMessage.error('类型必须选择');
        return;
    }
    const amount = Math.round(formData.value.amount * 100); //单位分
    let remark = formData.value.remark.trim();
    try {
        loading.value = true;
        const res = await paxios.post("/manage/editUserPoints", { id: formData.value.userid, amount: amount, remark: remark, type: formData.value.type, businessNo: formData.value.businessNo });
        if (res.data.code != 0) {
            ElMessage.error(res.data.msg);
            errMsg.value = res.data.msg;
            result.value = false;
        } else {
            result.value = true;
        }

    } catch (error) {
        ElMessage.error("发生错误");
    }
    loading.value = false;
    active.value++

}

</script>