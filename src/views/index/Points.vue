<template>
    <div class="top-up-container">
        <el-card class="top-up-card">
            <template #header>
                <div class="card-header">
                    <span>积分充值</span>
                </div>
            </template>
            <div style="font-size: large;font-weight: 600;color:blue;">
                当前积分: {{ userPoints }} 元
            </div>

            <div v-show="!showPaymentResult" class="top-up-content">
                <!-- 金额选择 -->
                <div class="amount-section">
                    <div class="section-title">充值金额</div>
                    <el-input v-model.number="amount" placeholder="请输入充值金额" :min="min_amount" :max="10000"
                        :precision="0" type="number" @input="handleAmountInput">
                        <template #append>元</template>
                    </el-input>
                    <div class="amount-hint">充值金额范围：{{ min_amount }} - 10000元</div>

                    <!-- 快捷金额选择 -->
                    <div class="quick-amounts">
                        <el-button v-for="quickAmount in quickAmounts" :key="quickAmount"
                            :type="amount === quickAmount ? 'primary' : 'default'"
                            @click="selectQuickAmount(quickAmount)">
                            {{ quickAmount }}元
                        </el-button>
                    </div>
                </div>

                <!-- 支付方式选择 -->
                <div class="payment-method-section">
                    <div class="section-title">支付方式</div>
                    <div class="payment-methods-grid">
                        <div v-if="isSupportAlipay" class="payment-method-card"
                            :class="{ active: paymentMethod === 'alipay' }" @click="selectPaymentMethod('alipay')">
                            <div class="payment-method-content">
                                <i class="i-alipay"></i>
                                <div class="payment-method-info">
                                    <div class="payment-method-name">支付宝</div>
                                </div>
                            </div>
                        </div>

                        <div v-if="isSupportWechat" class="payment-method-card"
                            :class="{ active: paymentMethod === 'wechat' }" @click="selectPaymentMethod('wechat')">
                            <div class="payment-method-content">
                                <i class="i-wechat-pay"></i>
                                <div class="payment-method-info">
                                    <div class="payment-method-name">微信支付</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="(!isSupportAlipay) && (!isSupportWechat)">
                    <el-alert :title="payWaring" type="warning" />
                </div>
                <div v-if="amountErr">
                    <el-alert :title="amountErr" type="error" :closable="false" />
                </div>

                <!-- 支付按钮 -->
                <div class="pay-button-container">
                    <el-button type="primary" size="large" :disabled="!isValidAmount || !paymentMethod"
                        @click="confirmPayment" class="pay-button">
                        立即支付 ¥{{ amount }}
                    </el-button>
                </div>
            </div>

            <!-- 支付结果显示 -->
            <div v-if="showPaymentResult" class="payment-result">
                <div v-if="paymentStatus === 'pending'" class="payment-pending">
                    <el-skeleton animated>
                        <template #template>
                            <el-skeleton-item variant="image" style="width: 200px; height: 200px" />
                            <div style="margin-top: 20px">
                                <el-skeleton-item variant="text" style="width: 60%" />
                            </div>
                        </template>
                    </el-skeleton>
                </div>

                <div v-else-if="paymentStatus === 'success'" class="payment-success">
                    <el-result icon="success" title="支付成功" sub-title="您的账户已成功充值">
                        <template #extra>
                            <el-button type="primary" @click="resetPayment">继续充值</el-button>
                        </template>
                    </el-result>
                </div>

                <div v-else-if="paymentStatus === 'failed'" class="payment-failed">
                    <el-result icon="error" title="支付失败" sub-title="支付过程中出现问题，请重新尝试">
                        <template #extra>
                            <el-button type="primary" @click="retryPayment">重新支付</el-button>
                        </template>
                    </el-result>
                </div>
            </div>

            <!-- 二维码弹窗 -->
            <el-dialog @close="closeQRCodeDialog" v-model="showQRCodeDialog"
                :title="paymentMethod === 'alipay' ? '支付宝扫码支付' : '微信扫码支付'" width="350px" center>
                <div class="qrcode-container">
                    <div class="qrcode-placeholder">

                        <img :src="qrcodeUrl" alt="支付二维码" class="qrcode-image">
                    </div>
                    <div class="qrcode-amount">支付金额: ¥{{ amount }}</div>
                    <div class="qrcode-tip">
                        请使用{{ paymentMethod === 'alipay' ? '支付宝' : '微信' }}扫描二维码完成支付
                    </div>
                </div>
            </el-dialog>
            <div ref="payFormRef" class="pay-form-container" style="display: none;"></div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed, onUnmounted } from 'vue';
import type { Ref } from 'vue';
import { getBrowserType } from '@/utils/browser';
import { ElMessage } from 'element-plus';
import { paxios } from '@/utils/paxios';
import QRCode from 'qrcode';
import { useUserInfoStore } from '@/stores/userinfo';
import { storeToRefs } from "pinia"
const { openid } = storeToRefs(useUserInfoStore());

const min_amount = ref(5); //最低充值金额

// 定义变量
const amount = ref<number | null>(null);
const paymentMethod = ref<'alipay' | 'wechat'>('wechat');
const browserType = ref<'pc' | 'mobile' | 'wechat'>('pc');
const showQRCodeDialog = ref(false);
const showPaymentResult = ref(false);
const paymentStatus = ref<'pending' | 'success' | 'failed'>('pending');
let AliapySet: any = null;
let wechatSet: any = null;
const qrcodeUrl = ref('');
const qrLoading = ref(false);
const orderId = ref('');
const payFormRef: Ref<HTMLDivElement | null> = ref(null);
const amountErr = ref('');


const userPoints = ref(0.0);

//定时器
let timer: any = null;

// 快捷金额选项
const quickAmounts = [100, 500, 1000, 3000];

// 验证金额是否有效
const isValidAmount = computed(() => {
    return amount.value !== null && amount.value >= min_amount.value && amount.value <= 10000;
});

//是否支持支付宝
const isSupportAlipay = ref(false);
//是否支持微信支付
const isSupportWechat = ref(false);
const payWaring = ref('');
//解析支付方式
const parsePaymentMethod = function (payset: any) {
    if (browserType.value == 'pc') {
        payWaring.value = "当前环境不支持支付，请用手机浏览器访问网站,或者在微信中打开网站";
    } else if (browserType.value == 'mobile') {
        payWaring.value = "当前环境不支持支付，请用电脑浏览器访问网站,或者在微信中打开网站";
    } else if (browserType.value == 'wechat') {
        payWaring.value = "当前环境不支持支付，请用电脑浏览器访问网站,或者手机浏览器访问网站";
    }
    //判断payset是否是数组
    if (Array.isArray(payset)) {
        //遍历数组
        for (let i = 0; i < payset.length; i++) {
            let isMatch = false;
            if ((browserType.value == 'pc') && (payset[i].scene == 'pc')) {
                isMatch = true;
            } else if ((browserType.value == 'mobile') && (payset[i].scene == 'h5')) {
                isMatch = true;
            } else if ((browserType.value == 'wechat') && (payset[i].scene == 'wxh5')) {
                isMatch = true;
            }
            if (isMatch) {
                if ((payset[i].type == 'wxpay') && (payset[i].status == 1)) {
                    isSupportWechat.value = true;
                    wechatSet = payset[i];
                    if (wechatSet.prefer == 1) {
                        paymentMethod.value = 'wechat';
                    }
                } else if ((payset[i].type == 'alipay') && (payset[i].status == 1)) {
                    isSupportAlipay.value = true;
                    AliapySet = payset[i];
                    if (AliapySet.prefer == 1) {
                        paymentMethod.value = 'alipay';
                    }
                }
            }
        }
    } else {
        console.log("payset不是数组");
        ElMessage.error("获取支付方式错误");
    }
};

// 挂载时获取浏览器类型
onMounted(async () => {
    browserType.value = getBrowserType();
    let res = await paxios.get("/index/getPaySet");
    if (res.data.code == 0) {
        parsePaymentMethod(res.data.data);
    } else {
        ElMessage.error(res.data.msg);
    }

    let res1 = await paxios.get("/console/getPoints");
    if (res1.data.code == 0) {
        userPoints.value = res1.data.data.points / 100;
    } else {
        ElMessage.error("获取账户积分失败");
    }

});
onUnmounted(() => {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
});

// 处理金额输入
const handleAmountInput = (value: number) => {
    if (value !== null) {
        if (value > 10000) {
            amountErr.value = '充值金额不能超过10000元';
        } else if (value < min_amount.value) {
            amountErr.value = '充值金额不能低于' + min_amount.value + "元"
        } else {
            amountErr.value = '';
        }
    }
};

// 选择快捷金额
const selectQuickAmount = (quickAmount: number) => {
    amount.value = quickAmount;
};

// 选择支付方式
const selectPaymentMethod = (method: 'alipay' | 'wechat') => {
    // 如果在微信浏览器中，不允许选择支付宝
    if (browserType.value === 'wechat' && method === 'alipay') {
        ElMessage.warning('微信内仅支持微信支付');
        return;
    }
    paymentMethod.value = method;
};

// 确认支付
const confirmPayment = () => {
    if (!isValidAmount.value) {
        ElMessage.error('请输入有效的充值金额（' + min_amount.value + '-10000元）');
        return;
    }
    qrcodeUrl.value = "";

    // 根据浏览器类型决定支付方式
    if (browserType.value === 'pc') {
        // PC端显示二维码
        showPayQRcode();
        //processH5Payment();

    } else if (browserType.value === 'mobile') {
        // 移动端调用H5支付
        processH5Payment();
    } else if (browserType.value === 'wechat') {
        // 微信内只支持微信支付
        processWechatPayment();
    }
};

function closeQRCodeDialog() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}

async function showPayQRcode() {
    showQRCodeDialog.value = true;
    qrcodeUrl.value = "/images/loading.gif";
    let modeid = wechatSet?.modeid;
    if (paymentMethod.value == 'alipay') {
        modeid = AliapySet?.modeid;
    }
    if (!modeid) {
        ElMessage.error('支付方式未配置');
        return;
    }
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    try {
        let res = await paxios.post("/console/getPayQRcode", { type: paymentMethod.value, business: 'recharge', amount: amount.value, modeid: modeid });
        if (res.data.code == 0) {
            let qrcode = res.data.data.qr;
            orderId.value = res.data.data.payid;
            // 调用 qrcode.toDataURL 生成二维码的 base64 格式图片
            // 配置参数：宽度 200，容错级别 high
            const base64Url = await QRCode.toDataURL(qrcode, {
                width: 200,
                errorCorrectionLevel: 'high'
            });
            qrcodeUrl.value = base64Url; // 赋值给图片地址
            qrLoading.value = false;
            //启动定时器，每5秒检查订单状态
            timer = setInterval(async () => {
                try {
                    let ret = await paxios.post("/index/payquery", { payid: orderId.value });
                    if (ret.data.code == 0) {
                        if (ret.data.data.status == 1) {
                            //支付成功
                            clearInterval(timer);
                            timer = null;
                            showQRCodeDialog.value = false;
                            showPaymentResult.value = true;
                            paymentStatus.value = 'success';
                            let res1 = await paxios.get("/console/getPoints");
                            if (res1.data.code == 0) {
                                userPoints.value = res1.data.data.points / 100;
                            } else {
                                ElMessage.error("获取账户积分失败");
                            }
                        }
                    }
                } catch (error) {
                    console.error('查询订单状态错误：', error);
                }
            }, 3000);
        } else {
            ElMessage.error(res.data.msg);
        }

    } catch (error) {

        ElMessage.error('获取支付二维码失败');

        console.error('获取支付二维码错误:', error);

    }


}

// 处理H5支付
async function processH5Payment() {
    let modeid = wechatSet?.modeid;
    if (paymentMethod.value == 'alipay') {
        modeid = AliapySet?.modeid;
    }
    if (!modeid) {
        ElMessage.error('支付方式未配置');
        return;
    }
    const currentDomain = window.location.origin;
    // 拼接 /report 路径
    const returnUrl = currentDomain + "/money";
    try {
        let res = await paxios.post("/console/getH5Pay", { type: paymentMethod.value, business: 'recharge', amount: amount.value, modeid: modeid, returnUrl: returnUrl });
        if (res.data.code == 0) {
            orderId.value = res.data.data.payid;
            if (paymentMethod.value == 'alipay') {
                if (payFormRef.value) {
                    payFormRef.value.innerHTML = res.data.data.pay_form;
                    const payForm = payFormRef.value.querySelector('form');
                    if (payForm) {
                        payForm.submit();
                    } else {
                        ElMessage.error('支付表单解析失败');
                    }
                }
            } else if (paymentMethod.value == 'wechat') {
                window.open(res.data.data.pay_url, '_blank');
            }

        } else {
            ElMessage.error(res.data.msg);
        }

    } catch (error) {
        console.error('H5支付处理错误:', error);
        paymentStatus.value = 'failed';
    }
}

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
                            let ret = await paxios.post("/index/payquery", { payid: orderId.value });
                            if (ret.data.code == 0 && ret.data.data.status == 1) {
                                clearInterval(timer);
                                timer = null;
                                showPaymentResult.value = true;
                                paymentStatus.value = 'success';
                                ElMessage.success('支付成功');
                                let res1 = await paxios.get("/console/getPoints");
                                if (res1.data.code == 0) {
                                    userPoints.value = res1.data.data.points / 100;
                                } else {
                                    ElMessage.error("获取账户积分失败");
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


// 处理微信内支付
async function processWechatPayment() {
    //判断openid是否是空的
    if (openid.value == '') {
        ElMessage.error('不支持在微信内支付，请用浏览器打开');
        return;
    }
    let modeid = wechatSet?.modeid;
    if (paymentMethod.value == 'alipay') {
        modeid = AliapySet?.modeid;
    }
    if (!modeid) {
        ElMessage.error('支付方式未配置');
        return;
    }
    let res = await paxios.post("/console/getMPpay", { type: paymentMethod.value, business: 'recharge', amount: amount.value, modeid: modeid, openid: openid.value })
    if (res.data.code == 0) {
        orderId.value = res.data.data.payid;
        let param = {
            "appId": res.data.data.appId,     //公众号ID，由商户传入     
            "timeStamp": res.data.data.timeStamp,    //时间戳，自1970年以来的秒数     
            "nonceStr": res.data.data.nonceStr,      //随机串     
            "package": res.data.data.package,
            "signType": res.data.data.signType,     //微信签名方式：     
            "paySign": res.data.data.paySign, //微信签名 
        };
        onBridgeReady(param);
    } else {
        ElMessage.error(res.data.msg);
    }
};

// 重置支付状态
const resetPayment = () => {
    showPaymentResult.value = false;
    paymentStatus.value = 'pending';
    amount.value = null;
};

// 重新支付
const retryPayment = () => {
    showPaymentResult.value = false;
    paymentStatus.value = 'pending';
    confirmPayment();
};
</script>

<style scoped>
.top-up-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

.top-up-card {
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
    font-size: 18px;
    font-weight: bold;
    text-align: center;
}

.top-up-content {
    padding: 20px 0;
}

.section-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px;
    color: #333;
}

.amount-section,
.payment-method-section {
    margin-bottom: 30px;
}

.amount-hint {
    margin-top: 10px;
    font-size: 12px;
    color: #999;
}

.quick-amounts {
    margin-top: 20px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.quick-amounts .el-button {
    flex: 1;
    min-width: 100px;
}

.payment-methods-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
}

.payment-method-card {
    border: 2px solid #ebeef5;
    border-radius: 8px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    background-color: #fafafa;
}

.payment-method-card:hover {
    border-color: #409eff;
    transform: translateY(-2px);
    box-shadow: 0 2px 12px 0 rgba(64, 158, 255, 0.2);
}

.payment-method-card.active {
    border-color: #409eff;
    background-color: #ecf5ff;
    box-shadow: 0 2px 12px 0 rgba(64, 158, 255, 0.2);
}

.payment-method-content {
    display: flex;
    align-items: center;
    gap: 15px;
}

.payment-method-info {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.payment-method-name {
    font-size: 16px;
    font-weight: 500;
    color: #333;
}

.payment-method-desc {
    font-size: 12px;
    color: #999;
}

.i-alipay,
.i-wechat-pay {
    display: inline-block;
    width: 40px;
    height: 40px;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
}

.i-alipay {
    background-image: url('@/assets/images/alipay_icon.png');
}

.i-wechat-pay {
    background-image: url('@/assets/images/wechat_pay_icon.png');
}

.pay-button-container {
    text-align: center;
    margin-top: 30px;
}

.pay-button {
    width: 100%;
    max-width: 300px;
    height: 45px;
    font-size: 16px;
}

.qrcode-container {
    text-align: center;
}

.qrcode-placeholder {
    width: 200px;
    height: 200px;
    margin: 0 auto 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px dashed #dcdfe6;
    border-radius: 8px;
}

.qrcode-image {
    max-width: 100%;
    max-height: 100%;
}

.qrcode-amount {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
}

.qrcode-tip {
    font-size: 14px;
    color: #666;
}

.payment-result {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #eee;
}

@media (max-width: 768px) {
    .top-up-container {
        padding: 10px;
    }

    .quick-amounts {
        gap: 8px;
    }

    .quick-amounts .el-button {
        min-width: 80px;
        font-size: 12px;
        padding: 8px 10px;
    }

    .payment-methods-grid {
        grid-template-columns: 1fr;
    }

    .payment-method-content {
        gap: 12px;
    }

    .i-alipay,
    .i-wechat-pay {
        width: 36px;
        height: 36px;
    }

    .payment-method-name {
        font-size: 15px;
    }
}
</style>