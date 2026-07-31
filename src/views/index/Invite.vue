<template>
    <div class="invite-page">
        <el-card class="invite-link-card">
            <template #header>
                <div class="card-header">
                    <el-icon>
                        <Link />
                    </el-icon>
                    <span>邀请注册</span>
                </div>
            </template>
            <div class="invite-link-content">
                <div class="invite-url-section">
                    <span class="invite-label">你的专属邀请注册链接：</span>
                    <div class="invite-url-box">
                        <span class="invite-url-text">{{ inviteUrl }}</span>
                        <el-button type="primary" size="small" @click="copyUrl" :icon="DocumentCopy">复制链接</el-button>
                    </div>
                </div>
                <div class="invite-desc">
                    <p>其他人通过这个链接注册，可以和你建立邀请关系。</p>
                    <p class="invite-note">如果你已经登录，打开这个链接会直接跳转到你的后台。你可以换一个浏览器打开这个链接，或者退出登录后再打开这个链接。</p>
                </div>
            </div>
        </el-card>

        <el-card class="invite-tips-card">
            <template #header>
                <div class="card-header">
                    <el-icon>
                        <InfoFilled />
                    </el-icon>
                    <span>邀请说明</span>
                </div>
            </template>
            <div class="tips-content">
                <el-collapse>
                    <el-collapse-item title="收益规则" name="1">
                        <ul class="tips-list">
                            <li>代理A招募了代理B，代理B销售后，代理A也有收入。</li>
                            <li>代理A的收入是后台 <b>检测产品</b> 中的 <b>"邀请奖励"</b>。</li>
                            <li>举例：代理A招募了代理B，如果代理B销售了{{ reward_unit }}的{{ reward_name }}，那么代理A也可以赚 <b>{{ reward_amount
                                    }}</b>。</li>
                            <li>这里的{{ reward_amount }}不是从代理B的收入里面扣的，是公司让出自己的部分利润。</li>
                        </ul>
                    </el-collapse-item>
                    <el-collapse-item title="代理制度" name="2">
                        <ul class="tips-list">
                            <li>代理没有等级之分，所有代理都一样。</li>
                            <li>所有代理的供货价完全一样，代理A招募了代理B，A和B的后台完全一样。</li>
                            <li>大家可以想象，如果你招募了几百、几千代理，会怎么样？</li>
                        </ul>
                    </el-collapse-item>
                    <el-collapse-item title="招募技巧" name="3">
                        <ul class="tips-list">
                            <li>在毕业班群，写手群，或者一些社区，一些自媒体平台发消息很容易招到一些代理</li>
                            <li>注意不要在同一平台反复发一样的内容，很容易被平台检测到</li>
                        </ul>
                    </el-collapse-item>
                </el-collapse>
            </div>
        </el-card>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from "pinia"
import { useSaleWebStore } from '@/stores/saleWebConfig'
import { useUserInfoStore } from "@/stores/userinfo"
import { useWebsitConfigStore } from '@/stores/websitConfig'
import { DocumentCopy, Link, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { paxios } from '@/utils/paxios';

const { userId } = storeToRefs(useUserInfoStore());
const { reward_enabled } = storeToRefs(useSaleWebStore());
const { adminUrl } = storeToRefs(useWebsitConfigStore());
const inviteUrl = ref("")


const reward_unit = ref("");
const reward_name = ref("");
const reward_amount = ref("");

const copyUrl = () => {
    if (!inviteUrl.value || inviteUrl.value === "请先登录后查看" || inviteUrl.value === "没有开启该功能") {
        ElMessage.warning("暂无可复制内容")
        return
    }
    navigator.clipboard.writeText(inviteUrl.value).then(() => {
        ElMessage.success("链接已复制到剪贴板")
    }).catch(() => {
        ElMessage.error("复制失败，请手动复制")
    })
}


function convertNumberToUnit(num: number) {
    // 转为有效数字
    const number = Number(num);
    if (isNaN(number)) return '';

    // 0 特殊处理
    if (number === 0) return '篇';

    // 1️⃣ 整万倍数（最高优先级）
    if (number % 10000 === 0) {
        const val = number / 10000;
        return val === 1 ? '1万字符' : `${val}万字符`;
    }

    // 2️⃣ 整千倍数
    if (number % 1000 === 0) {
        const val = number / 1000;
        return val === 1 ? '1千字符' : `${val}千字符`;
    }

    // 3️⃣ 整百倍数
    if (number % 100 === 0) {
        const val = number / 100;
        return val === 1 ? '1百字符' : `${val}百字符`;
    }

    // 都不满足，原样返回
    return String(number) + '字符';
}

onMounted(async () => {
    if (userId.value <= 0) {
        inviteUrl.value = "请先登录后查看"
        return;
    }
    if (!reward_enabled) {
        inviteUrl.value = "没有开启该功能"
        return;
    }
    inviteUrl.value = adminUrl.value + "/su/" + userId.value + ".html"
    let url = '/console/getCheckData?pid=cqvip';
    const res = await paxios.get(url);
    if (res.data.code === 0) {
        let cqp = res.data.data[0];
        if (cqp) {
            if (cqp.punit != 0) {
                let unit10 = cqp.punit * 10;
                let unitstr = convertNumberToUnit(unit10);
                let reward = cqp.reward * 10;
                reward = reward / 100;
                reward_unit.value = unitstr;
                reward_name.value = cqp.name;
                reward_amount.value = "" + reward + "元";
            } else {
                reward_unit.value = "一篇";
                reward_name.value = cqp.name;
                reward_amount.value = "" + (cqp.reward / 100) + "元";
            }
        }
    }
})
</script>
<style lang="css" scoped>
.invite-page {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.invite-link-card .card-header,
.invite-tips-card .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
}

.invite-link-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.invite-url-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.invite-label {
    font-size: 14px;
    color: #303133;
    font-weight: 500;
}

.invite-url-box {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    background: #f5f7fa;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    flex-wrap: wrap;
}

.invite-url-text {
    flex: 1;
    font-size: 14px;
    color: #409eff;
    word-break: break-all;
    min-width: 0;
}

.invite-desc {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.invite-desc p {
    margin: 0;
    font-size: 14px;
    color: #606266;
    line-height: 1.6;
}

.invite-note {
    color: #909399 !important;
    font-size: 13px !important;
}

.tips-content {
    padding: 0;
}

.tips-list {
    margin: 0;
    padding-left: 20px;
    list-style: disc;
}

.tips-list li {
    margin-bottom: 8px;
    font-size: 14px;
    color: #606266;
    line-height: 1.7;
}

.tips-list li:last-child {
    margin-bottom: 0;
}

:deep(.el-collapse-item__header) {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
}

:deep(.el-collapse-item__content) {
    padding-bottom: 16px;
}
</style>