<template>
    <div style="max-width: 800px; margin: 10px auto;">
        <div style="text-align: center;color: red;">
            <h1>删除用户</h1>
        </div>
        <div style="margin-bottom: 20px;">
            <el-alert title="警告" type="error" :closable="false">
                本功能会删除用户的所有数据，且无法恢复
            </el-alert>
        </div>
        <el-steps :active="active" finish-status="success">
            <el-step title="输入用户ID" />
            <el-step title="核对信息" />
            <el-step title="删除完成" />
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
            <el-descriptions title="用户信息" :column="2" border>
                <el-descriptions-item label="用户ID">{{ userInfo.id }}</el-descriptions-item>
                <el-descriptions-item label="姓名">{{ userInfo.name }}</el-descriptions-item>
                <el-descriptions-item label="手机">{{ userInfo.mobile }}</el-descriptions-item>
                <el-descriptions-item label="邮箱">{{ userInfo.email }}</el-descriptions-item>
                <el-descriptions-item label="余额">{{ userInfo.balance / 100 }}元</el-descriptions-item>
                <el-descriptions-item label="积分">{{ userInfo.points / 100 }}元</el-descriptions-item>
                <el-descriptions-item label="注册时间">{{ userInfo.regtime }}元</el-descriptions-item>
            </el-descriptions>

            <el-button style="margin-top: 20px;" type="danger" @click="userDelete">确认删除</el-button>


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

const userInfo = ref<any>();

const formData = ref({
    userid: 0,
    balance: 0,
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
        userInfo.value = res.data.data;
        active.value++
    } else {
        ElMessage.error(res.data.msg);
        return;
    }
    loading.value = false;


}

async function userDelete() {


    try {
        loading.value = true;
        const res = await paxios.post("/manage/deleteUser", { userid: userId.value });
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