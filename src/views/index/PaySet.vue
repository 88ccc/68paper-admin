<template>
    <el-card>
        <template #header>
            <div class="card-header">
                <span>支付方式</span>
            </div>
        </template>
        <el-alert title="排序数字越小越靠前" type="info" :closable="false" />
        <div v-loading="loading" style="margin: 15px 10px;">
            <div class="pay-list">
                <span class="pay-name">微信支付</span>
                <el-switch v-model="pay_wechat" inline-prompt active-text="开启" inactive-text="关闭" />
                <span class="pay-index">排序</span>
                <el-select v-model="pay_wechat_index" placeholder="Select" style="width: 70px">
                    <el-option label="1" :value="1" />
                    <el-option label="2" :value="2" />
                    <el-option label="3" :value="3" />
                </el-select>
            </div>
            <div class="pay-list">
                <span class="pay-name">支付宝支付</span>
                <el-switch v-model="pay_ali" inline-prompt active-text="开启" inactive-text="关闭" />
                <span class="pay-index">排序</span>
                <el-select v-model="pay_ali_index" placeholder="Select" style="width: 70px">
                    <el-option label="1" :value="1" />
                    <el-option label="2" :value="2" />
                    <el-option label="3" :value="3" />
                </el-select>
            </div>
            <div v-if="functions.extensions" class="pay-list">
                <span class="pay-name">检测卡</span>
                <el-switch v-model="pay_card" inline-prompt active-text="开启" inactive-text="关闭" />
                <span class="pay-index">排序</span>
                <el-select v-model="pay_card_index" placeholder="Select" style="width: 70px">
                    <el-option label="1" :value="1" />
                    <el-option label="2" :value="2" />
                    <el-option label="3" :value="3" />
                </el-select>
            </div>
            <el-button type="primary" @click="onSubmit">提交</el-button>
        </div>






    </el-card>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { paxios } from '@/utils/paxios';
import { useUserInfoStore } from "@/stores/userinfo"
import { storeToRefs } from "pinia"
import { useSaleWebStore } from "@/stores/saleWebConfig"

const { payType } = storeToRefs(useUserInfoStore());
const { functions } = storeToRefs(useSaleWebStore());


const pay_wechat = ref(false);
const pay_wechat_index = ref(1);
const pay_ali = ref(false);
const pay_ali_index = ref(1);
const pay_card = ref(false);
const pay_card_index = ref(1);
const loading = ref(false);
onMounted(async () => {
    if (payType.value.length > 2) {
        const myArray = payType.value.split(",");
        for (let i = 0; i < myArray.length; i++) {
            if (myArray[i] == "wechat") {
                pay_wechat.value = true;
                pay_wechat_index.value = i + 1;
            } else if (myArray[i] == "alipay") {
                pay_ali.value = true;
                pay_ali_index.value = i + 1;
            } else if (myArray[i] == "card") {
                pay_card.value = true;
                pay_card_index.value = i + 1;
            }
        }
    }
    if (functions.value.extensions == false) {
        pay_card.value = false;
        pay_card_index.value = 1;
    }

})

async function onSubmit() {
    if ((pay_ali.value == false) && (pay_wechat.value == false) && (pay_card.value == false)) {
        ElMessage.error("必须至少开启一种支付方式");
        return;
    }
    let payset = [];
    if (pay_ali.value) {
        payset.push({ name: "alipay", value: pay_ali_index.value })
    }
    if (pay_wechat.value) {
        payset.push({ name: "wechat", value: pay_wechat_index.value })
    }
    if (pay_card.value) {
        payset.push({ name: "card", value: pay_card_index.value })
    }
    payset.sort((a, b) => a.value - b.value);
    let paystr = "";
    for (let i = 0; i < payset.length; i++) {
        if (paystr.length < 1) {
            paystr = payset[i].name;
        } else {
            paystr = paystr + "," + payset[i].name;
        }
    }
    loading.value = true;
    try {
        let res = await paxios.post("/console/setPayType", { pay_type: paystr });
        if (res.data.code == 0) {
            ElMessage.success("设置成功");
            payType.value = res.data.data;
        } else {
            ElMessage.error(res.data.msg);
        }
    } catch (error) {
        ElMessage.error('网络异常');
        console.error('网络异常:', error);
    }
    loading.value = false;

}

</script>
<style lang="css" scoped>
.pay-list {
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

.pay-name {
    width: 85px;
}

.pay-index {
    width: 40px;
}
</style>