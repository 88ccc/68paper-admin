<template>
    <div class="common-layout">
        <RouterView />
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { storeToRefs } from "pinia"
import { useVisitorOpenidStore } from '@/stores/visitorOpenid';
import { getBrowserType } from '@/utils/browser';
import { paxios } from '@/utils/paxios';

const { vopenid } = storeToRefs(useVisitorOpenidStore())
const route = useRoute();




// 初始化时检查一次窗口大小
onMounted(async () => {
    try {
        document.title = "收银台";
        const browserType = getBrowserType();
        console.log("当前浏览器类型:", browserType);
        if (browserType == 'wechat') {
            let currentUrl = window.location.href;
            const code = route.query.code;
            if (code) {
                // 微信授权
                let res = await paxios.post("/index/getWechatAuthUserInfo", { code: code });
                if (res.data.code == 0) {
                    vopenid.value = res.data.data.openid;
                    localStorage.setItem('vopenid', vopenid.value);

                } else {
                    let localtopenid = localStorage.getItem('vopenid');
                    if (localtopenid) {
                        vopenid.value = localtopenid;
                    } else {
                        ElMessage.error(res.data.msg)
                    }
                }
            } else {
                let res = await paxios.post("/index/getWechatAuthUrl", { url: currentUrl });
                if (res.data.code == 0) {
                    window.location.href = res.data.data.url;
                } else {
                    let localtopenid = localStorage.getItem('vopenid');
                    if (localtopenid) {
                        vopenid.value = localtopenid;
                    } else {
                        //ElMessage.error(res.data.msg)
                    }
                }
            }

        }
    } catch (error) {
        console.log(error);
    }

})

</script>

<style scoped>
/* 确保根元素占满全屏 */
.common-layout {
    height: 100vh;
    width: 100%;
}
</style>