<template>
    <el-card v-if="needName">
        <template #header>
            <div class="card-header">
                <span>设置姓名</span>
            </div>
        </template>
        <el-alert type="warning" :closable="false">
            1、请填写你的真实姓名，你有且仅有一次机会填写<br />
            2、填写假姓名会无法提现
        </el-alert>
        <el-input style="margin: 15px 5px;" v-model="newName" placeholder="请输入真实姓名" />
        <el-button type="primary" @click="setName">提交</el-button>
    </el-card>
    <el-card v-if="needDomain">
        <template #header>
            <div class="card-header">
                <span>设置个性域名</span>
            </div>
        </template>
        <el-alert type="warning" :closable="false">
            1、仅支持数字和小写字母<br />
            2、长度必须是4~32个字符<br />
            3、你有且只有一次机会设置<br />
        </el-alert>
        <el-input style="margin: 15px 5px;" v-model="newDomain" placeholder="请输入个性域名">
            <template #append>.xxxx.com</template>
        </el-input>
        <el-button type="primary" @click="setDomain">提交</el-button>
    </el-card>
    <el-card v-if="showUrl">
        <template #header>
            <div class="card-header">
                <span>检测链接</span>
            </div>
        </template>
        <el-table :data="tableData" border style="width: 100%">
    <el-table-column prop="name" label="名称" width="100" />
    <el-table-column  label="链接" >
        <template #default="scope">
            <a :href="scope.row.url" target="_blank">{{ scope.row.url }}</a>
        </template>
    </el-table-column>
  </el-table>
       
    </el-card>
</template>
<script setup lang="ts">
import { ref, onMounted, reactive, onUnmounted } from 'vue'
import { paxios } from '@/utils/paxios'
import { storeToRefs } from "pinia"
import { useSaleWebStore } from '@/stores/saleWebConfig'
import { useUserInfoStore } from "@/stores/userinfo"
const userinfo = storeToRefs(useUserInfoStore());
const { saleWebConfig } = storeToRefs(useSaleWebStore());


interface CheckItem {
    name:string;
    url:string;
}

const needName = ref(false)
const needDomain = ref(false)
const showUrl = ref(false)

const newName = ref('')
const newDomain = ref('')

const tableData = ref(<CheckItem[]>[])

onMounted(() => {
    console.log(userinfo.userName.value)
    if (userinfo.userName.value == null || userinfo.userName.value == "") {

        needName.value = true
    } else if (userinfo.domain.value == null || userinfo.domain.value == "") {

        needDomain.value = true
    } else {
        for (let i = 0; i < saleWebConfig.value.length; i++) {
            const item = saleWebConfig.value[i];
            tableData.value.push({
                name: item.name,
                url: "https://"+userinfo.domain.value+"."+item.baseurl
            });
        }
        showUrl.value = true
    }
})

async function setName() {
    let name = newName.value.trim()
    if (name == "") {
        ElMessage.error("请输入真实姓名")
        return
    }
    const res = await paxios.post("/console/setUserName", { name })
    ElMessage.success("设置成功")
    setTimeout(function () {
        location.reload(); // 刷新当前页面
    }, 500);
}

async function setDomain() {
    let domain = newDomain.value.trim()
    if (domain == "") {
        ElMessage.error("请输入个性域名")
        return
    }
    //验证 domain 只支持数字和小写字母，长度4~32个字符
    if (!/^[a-z0-9]{4,32}$/.test(domain)) {
        ElMessage.error("个性域名只支持数字和小写字母，长度4~32个字符")
        return
    }




    const res = await paxios.post("/console/setUserDomain", { domain })
    ElMessage.success("设置成功")
    setTimeout(function () {
        location.reload(); // 刷新当前页面
    }, 500);
}

</script>