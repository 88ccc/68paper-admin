<template>
    <div class="pay-container">
        <h1 class="pay-title">微信收银台</h1>
        <div>
            <div v-if="payId" style="margin-bottom: 10px;">
                支付订单号：<span style="color: red;">{{ payId }}</span>
            </div>
            <div v-if="payId">
                <el-button type="primary" @click="downreport">下载报告</el-button>
            </div>
        </div>
        <div v-loading="loading">
            <el-descriptions :column="2" border class="info-descriptions">
                <el-descriptions-item :span="2" label="检测系统"><span style="color: var(--el-color-primary);">{{
                    formData.check_system
                        }}</span></el-descriptions-item>
                <el-descriptions-item label="论文标题">{{ formData.title }}</el-descriptions-item>
                <el-descriptions-item label="作者">{{ formData.author }}</el-descriptions-item>
                <el-descriptions-item v-if="formData.endTime" label="发表日期">{{ formData.endTime
                }}</el-descriptions-item>

                <el-descriptions-item v-if="formData.wordCount" label="字数">{{ formData.wordCount.toLocaleString() }}
                    字</el-descriptions-item>
                <el-descriptions-item label="件数">
                    {{ formData.piece }}件
                </el-descriptions-item>
                <el-descriptions-item label="单价">
                    {{ formData.unit_price / 100 }}元
                </el-descriptions-item>
                <el-descriptions-item label="总价">
                    <span class="price-text">{{ formData.total_price / 100 }}元</span>
                </el-descriptions-item>
            </el-descriptions>
        </div>

    </div>

</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from "pinia"
import { useVisitorOpenidStore } from '@/stores/visitorOpenid';
import { useRoute } from 'vue-router';
import { paxios } from '@/utils/paxios'
const route = useRoute();
let orderid = "";
let rurl = "";
const checkProducts = ref<any[]>([])
const loading = ref(false)
const formData = ref<any>({})
const wxpaymodeid = ref(-1);

const payId = ref("");

const { vopenid } = storeToRefs(useVisitorOpenidStore())

let timer: any = null;


const getSystemName = (system: string) => {
    for (var i = 0; i < checkProducts.value.length; i++) {
        if (checkProducts.value[i].id === system) {
            return checkProducts.value[i].name
        }
    }
    return '';
}

function downreport() {
    window.location.href = "https://" + rurl + "/report?orderNo=" + payId.value;
}

function parsePaymentMethod(payset: any) {
    if (Array.isArray(payset)) {
        //遍历数组
        for (let i = 0; i < payset.length; i++) {
            if ((payset[i].scene == 'wxh5') && (payset[i].type == "wxpay") && (payset[i].status == 1)) {
                wxpaymodeid.value = payset[i].modeid;
            }
        }
    }
}


onMounted(async () => {
    orderid = String(route.query.orderid ?? '');
    rurl = String(route.query.rurl ?? '');
    if (orderid.length < 3) {
        ElMessage.error("订单号错误");
        return;
    }
    if (rurl.length < 3) {
        ElMessage.error("回跳地址错误");
        return;
    }

    loading.value = true

    let res2 = await paxios.get("/index/getPaySet");
    if (res2.data.code == 0) {
        parsePaymentMethod(res2.data.data);
    } else {
        ElMessage.error(res2.data.msg);
    }
    if (wxpaymodeid.value < 0) {
        ElMessage.error("未找到有效的微信支付方式1");
        return;
    }
    for(let i=0;i<10;i++){
        if (vopenid.value.length > 3){
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    if (vopenid.value.length < 3) {
        ElMessage.error("未找到有效的微信支付方式2");
        return;
    }

    let url = '/index/getCheckIdAndName';
    const res1 = await paxios.get(url);
    if (res1.data.code === 0) {
        checkProducts.value = res1.data.data;
    } else {
        ElMessage.error(res1.data.msg);
    }


    let res = await paxios.post("/index/getOrderInfo", { orderid: orderid });
    if (res.data.code == 0) {
        formData.value.check_system = getSystemName(res.data.data.product_id);
        formData.value.title = res.data.data.title;
        formData.value.author = res.data.data.author;
        if (res.data.data.end_date) {
            formData.value.endTime = res.data.data.end_date;
        } else {
            formData.value.endTime = '';
        }
        formData.value.wordCount = res.data.data.words;
        formData.value.piece = res.data.data.piece;
        formData.value.unit_price = res.data.data.unit_price;
        formData.value.total_price = res.data.data.total_price;
    } else {
        ElMessage.error(res.data.msg);
    }


    let res3 = await paxios.post("/index/getMPpay", { type: 'wechat', orderid: orderid, amount: formData.value.total_price / 100, modeid: wxpaymodeid.value, openid: vopenid.value })
    if (res3.data.code == 0) {
        payId.value = res3.data.data.payid;
        let param = {
            "appId": res3.data.data.appId,     //公众号ID，由商户传入     
            "timeStamp": res3.data.data.timeStamp,    //时间戳，自1970年以来的秒数     
            "nonceStr": res3.data.data.nonceStr,      //随机串     
            "package": res3.data.data.package,
            "signType": res3.data.data.signType,     //微信签名方式：     
            "paySign": res3.data.data.paySign, //微信签名 
        };
        onBridgeReady(param);
    }

    loading.value = false

})





function onBridgeReady(data: any) {
    // 使用 window 访问 WeixinJSBridge，避免 TypeScript 类型错误
    if (typeof (window as any).WeixinJSBridge === "undefined") {
        ElMessage.error('不支持的支付方式');
    } else {
        (window as any).WeixinJSBridge.invoke('getBrandWCPayRequest', data,
            function (res: any) {
                if (res.err_msg == "get_brand_wcpay_request:ok") {
                    if (timer) {
                        clearInterval(timer);
                    }
                    // 支付成功，轮询查询订单状态确认支付结果
                    timer = setInterval(async () => {
                        try {
                            let ret = await paxios.post("/index/payquery", { payid: payId.value });
                            if (ret.data.code == 0) {
                                if (ret.data.data.status == 1) {
                                    //支付成功
                                    let url = "https://" + rurl + "/report?orderNo=" + payId.value;
                                    window.location.href = url;
                                }
                            }
                        } catch (error) {
                            console.error('查询订单状态错误：', error);
                        }
                    }, 3000);
                } else if (res.err_msg == "get_brand_wcpay_request:cancel") {
                    ElMessage.info('支付已取消');
                } else {
                    ElMessage.error('支付失败');
                }
            });
    }
}
</script>

<style scoped>
.pay-container {
    max-width: 640px;
    margin: 40px auto;
    padding: 32px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
}

.pay-title {
    text-align: center;
    font-size: 22px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 24px 0;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebeef5;
}

.info-descriptions {
    margin-top: 8px;
}

.info-descriptions :deep(.el-descriptions__label) {
    font-weight: 500;
    color: #606266;
    width: 110px;
    white-space: nowrap;
}

.info-descriptions :deep(.el-descriptions__content) {
    color: #303133;
}

.price-text {
    font-size: 18px;
    font-weight: 700;
    color: #f56c6c;
}

.unit-text {
    color: #909399;
    font-size: 13px;
}
</style>