<template>
    <el-card>
        <template #header>
            <div class="card-header">
                <span>销售网站设置</span>
            </div>
        </template>
        <div v-for="(web, index) in saleWebList" :key="index" class="sale-web-list">
            <el-input v-model="web.name" class="sale-web-name" placeholder="网站名称" />
            <el-input v-model="web.baseurl" class="sale-web-baseurl" placeholder="网站地址" />
            <el-button type="danger" :icon="Delete" circle @click="delWeb(index)" />
        </div>
        <el-button type="primary" style="margin-right: 15px;" @click="addWeb">添加网站</el-button>
        <el-button type="success" @click="onSubmit">保存设置</el-button>
        <template #footer>
            说明：<br />
            这里的设置，展示在用户后台的“检测链接”中。<br />
            网址不要协议头，例如网站可以填“wf.68paper.com”。不要填“https://wf.68paper.com”
        </template>
    </el-card>
</template>
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { paxios } from '@/utils/paxios'
import { Delete } from '@element-plus/icons-vue'
interface SaleWeb {
    name: string;
    baseurl: string;
}
let saleSet: SaleWeb[] = [];
const loading = ref(false)
const saleWebList = ref(<SaleWeb[]>[])


function delWeb(index: number) {
    saleWebList.value.splice(index, 1)
    if (saleWebList.value.length == 0) {
        saleWebList.value.push({
            name: "",
            baseurl: ""
        })
    }
}

function addWeb() {
    if (saleWebList.value.length >= 20) {
        ElMessage.warning("最多只能添加20个销售网站");
        return;
    }
    saleWebList.value.push({
        name: "",
        baseurl: ""
    })
}

onMounted(() => {
    loading.value = true
    paxios.get("/index/getSaleWebConfig").then(res => {
        if (res.data.code != 0) {
            saleWebList.value.push({
                name: "",
                baseurl: ""
            })
        }
        if (res.data.code == 0) {
            saleSet = res.data.data;
            if (saleSet.length == 0) {
                saleWebList.value.push({
                    name: "",
                    baseurl: ""
                })
            } else {
                saleSet.forEach((element, index) => {
                    saleWebList.value.push(element);
                });
            }
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
    let list: SaleWeb[] = [];
    for (let i = 0; i < saleWebList.value.length; i++) {
        const web = saleWebList.value[i];
        if (web.name.trim() == "" || web.baseurl.trim() == "") {
            continue;
        }
        if (web.baseurl.trim().startsWith("http://") || web.baseurl.trim().startsWith("https://")) {
            ElMessage.error("网站地址不要协议头，例如网站可以填“wf.68paper.com”。不要填“https://wf.68paper.com”");
            return;
        }
        list.push({
            name: web.name.trim(),
            baseurl: web.baseurl.trim()
        });
    }

    loading.value = true;
    paxios.post("/manage/setSaleWebConfig", {
        config: list,
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
<style lang="css" scoped>
.sale-web-list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    margin: 16px 0;
    padding: 16px;
    border: 1px solid #bbbdc2;
    border-radius: 6px;
    background: #f5f7fa;
}

.sale-web-name {
    width: 200px;
    flex-shrink: 0;
}

.sale-web-baseurl {
    width: 400px;
    flex: 1;
    min-width: 200px;
}
</style>