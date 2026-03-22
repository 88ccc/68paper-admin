<template>
    <!-- 弹窗组件 -->
    <el-dialog v-model="dialogVisible" title="联系客服" width="300px" :modal="true" :close-on-click-modal="false">
        <!-- 弹窗内容 -->
        <div class="dialog-content">
            <p class="qr-code-desc">请用微信扫描下方二维码</p>
            <div class="qr-code-container">
                <!-- 这里使用示例二维码，实际项目中替换为真实客服二维码 -->
                <img :src="custom.url" alt="客服微信二维码" class="qr-code-image">
            </div>
        </div>
    </el-dialog>
</template>

<script setup lang="ts" name="ContactService">
import { storeToRefs } from "pinia"
import { ref, onMounted, onUnmounted } from 'vue';

import { useWebsitConfigStore } from '@/stores/websitConfig';
const { custom } = storeToRefs(useWebsitConfigStore());


// 控制弹窗显示与隐藏
const dialogVisible = ref(false);

defineExpose({ dialogVisible })
</script>

<style scoped>
.dialog-content {
    text-align: center;
}

.qr-code-desc {
    font-size: 16px;
    color: #333;
    margin-bottom: 10px;
    margin-top: 5px;
    line-height: 1.5;
}

.qr-code-container {
    display: flex;
    justify-content: center;
    align-items: center;
}

.qr-code-image {
    width: 200px;
    height: 200px;
    object-fit: contain;
    border: 1px solid #eee;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>