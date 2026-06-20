<template>
    <el-card>
        <template #header>
            <div class="card-header">
                <span>登录注册设置</span>
            </div>
        </template>
        <el-form label-width="80px" v-loading="loading">
            <el-form-item label="注册方式:">
                <el-checkbox-group v-model="regList">
                    <el-checkbox label="手机号" value="mobile" />
                    <el-checkbox label="邮箱" value="email" />
                </el-checkbox-group>
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
const regList = ref<string[]>([])
const regHasAccount = ref(false)
const loading = ref(false)


onMounted(() => {
    loading.value = true
    paxios.get("/index/getLoginRegisterConfig").then(res => {
        if (res.data.code == 0) {
            regList.value = res.data.data.regList;
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
   
    if (regList.value.length == 0) {
        ElMessage.error('请选择注册方式');
        return;
    }
    loading.value = true;
    paxios.post("/manage/setLoginRegisterConfig", {
        regList: regList.value,
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