<template>
    <el-card>
        <template #header>
            <div class="card-header">
                <span>其他设置</span>
            </div>
        </template>
        <el-form label-width="80px" v-loading="loading">
            <el-form-item label="显示加盟">
                <el-switch v-model="showJoin" inline-prompt active-text="开启" inactive-text="关闭" />
            </el-form-item>

            <el-form-item>
                <el-button type="primary" @click="onSubmit">提交</el-button>
            </el-form-item>
        </el-form>
        <template #footer>
            说明：<br />
            显示加盟：开启后，用户检测页面会显示加盟按钮<br />
        </template>
    </el-card>
</template>
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { paxios } from '@/utils/paxios'


const loading = ref(false)
const showJoin = ref(false)




onMounted(async () => {
    let res = await paxios.get("/console/getOtherSetting");
    loading.value = true;
    if(res.data.code == 0){
        showJoin.value = res.data.data.showJoin;
    }else{
        ElMessage.error(res.data.msg);
    }
    loading.value = false;
})



function onSubmit() {
    //判断数据
    let config = {
        showJoin: showJoin.value
    }

    loading.value = true;
    paxios.post("/console/setOtherSetting", {
        config
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