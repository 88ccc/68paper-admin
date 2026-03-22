<template>
    <el-card>
        <template #header>
            <div class="card-header">
                <span>存储设置</span>
            </div>
        </template>
        <el-form label-width="150px" v-loading="loading">
            <el-form-item label="存储方式">
                <el-radio-group v-model="storageType" fill="#6cf">
                    <el-radio-button label="本地存储" value="local" />
                    <el-radio-button label="阿里云" value="ali" />
                    <el-radio-button label="腾讯云" value="tencent" />
                </el-radio-group>
            </el-form-item>
            <div v-show="storageType == 'ali'">
                <el-form-item label="存储空间名称 Bucket:">
                    <el-input v-model="aliConfig.bucket" />
                </el-form-item>
                <el-form-item label="AccessKeyId:">
                    <el-input v-model="aliConfig.accessKeyId" />
                </el-form-item>
                <el-form-item label="AccessKeySecret:">
                    <el-input v-model="aliConfig.accessKeySecret" />
                </el-form-item>
                <el-form-item label="地域 Region:">
                    <el-input v-model="aliConfig.region" />
                </el-form-item>
            </div>
            <div v-show="storageType == 'tencent'">
                <el-form-item label="存储空间名称 Bucket:">
                    <el-input v-model="tencentConfig.bucket" />
                </el-form-item>
                <el-form-item label="所属地域 Region:">
                    <el-input v-model="tencentConfig.region" />
                </el-form-item>
                <el-form-item label="secretId:">
                    <el-input v-model="tencentConfig.secretId" />
                </el-form-item>
                <el-form-item label="secretKey:">
                    <el-input v-model="tencentConfig.secretKey" />
                </el-form-item>
                <el-form-item label="空间域名 Domain:">
                    <el-input v-model="tencentConfig.domain" />
                </el-form-item>
            </div>
            <el-form-item>
                <el-button type="primary" @click="onSubmit">提交</el-button>
            </el-form-item>
        </el-form>

        <template #footer><el-text size="small">设置用户文件的存储方式，包含用户的头像，用户上传的文件和用户的报告</el-text></template>
    </el-card>
</template>
<script setup lang="ts">
import { ref,onMounted } from 'vue'
import { paxios } from '../../utils/paxios'
const storageType = ref("")
const loading = ref(false)

//阿里云存储配置
const aliConfig = ref({
    bucket: "",
    accessKeyId: "",
    accessKeySecret: "",
    region: ""
})

//腾讯云配置
const tencentConfig = ref({
    bucket: "",
    region: "",
    secretId: "",
    secretKey: "",
    domain: ""

})

onMounted(()=>{ 
    loading.value = true
    paxios.get("/manage/getStorageConfig").then(res => {
        if (res.data.code == 0) {
            storageType.value = res.data.data.storageType
            if(res.data.data.storageType == "ali"){
                aliConfig.value = res.data.data.ali
            }else if(res.data.data.storageType == "tencent"){
                tencentConfig.value = res.data.data.tencent
            }
           
        } else {
            ElMessage.error(res.data.msg);
        }
    }).finally(() => { loading.value = false })
})


function onSubmit(){
    //校验数据
    if(storageType.value == ""){
        ElMessage.error("请选择存储方式")
        return
    }
    if(storageType.value == "ali"){
        if(aliConfig.value.bucket == "" || aliConfig.value.accessKeyId == "" || aliConfig.value.accessKeySecret == "" || aliConfig.value.region == ""){
            ElMessage.error("请填写完整的阿里云存储配置")
            return
        }
    }else if(storageType.value == "tencent"){
        if(tencentConfig.value.bucket == "" || tencentConfig.value.region =="" || tencentConfig.value.secretId == "" || tencentConfig.value.secretKey == "" || tencentConfig.value.domain == ""){
            ElMessage.error("请填写完整的腾讯云存储配置")
            return
        }
    }
    loading.value = true
    paxios.post("/manage/setStorageConfig", {
        storageType: storageType.value,
        aliConfig: aliConfig.value,
        tencentConfig: tencentConfig.value
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