import { createRouter, createWebHistory, useRoute } from 'vue-router'
import { useWebsitConfigStore } from '@/stores/websitConfig'
import { storeToRefs } from "pinia"
import { paxios } from '@/utils/paxios'
import { CompleteUrl } from '@/utils/utils'
import { useAdminInfoStore } from "@/stores/adminInfo"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      //后台
      path: '/',
      component: () => import('@/views/admin/Index.vue'),
      children: [
        {
          //后台首页
          path: "",
          component: () => import("@/views/admin/Login.vue"),
        }, {
          //后台首页
          path: "home",
          component: () => import("@/views/admin/Home.vue"),
        },{
          //检测记录
          path: "checkorder",
          component: () => import("@/views/admin/CheckOrder.vue"),
        }, {
          //存储设置
          path: "storage",
          component: () => import("@/views/admin/Storage.vue"),
        }, {
          //客服设置
          path: "custom",
          component: () => import("@/views/admin/Custom.vue"),
        }, {
          //支付模板
          path: "paymode",
          component: () => import("@/views/admin/PayMode.vue"),
        }, {
          //支付设置
          path: "payset",
          component: () => import("@/views/admin/PaySet.vue"),
        }, {
          //微信公众号设置
          path: "wechatset",
          component: () => import("@/views/admin/WechatSet.vue"),
        }, {
          path: "manager",
          component: () => import("@/views/admin/Manager.vue"),
        }, {
          path: "checkkey",
          component: () => import("@/views/admin/CheckKey.vue"),
        }, {
          path: "check",
          component: () => import("@/views/admin/Check.vue"),
        }, 
        {
          path: "shop",
          component: () => import("@/views/admin/Shop.vue"),
        }, {
          path: "shopd",
          component: () => import("@/views/admin/shop/Index.vue"),
          children: [
            {
              //后台首页
              path: "",
              component: () => import("@/views/admin/shop/Home.vue"),
            }
          ]
        }

      ]
    }


  ],
})

// 动态修改 favicon 的函数
const setFavicon = (iconPath: string) => {
  // 查找现有 favicon 标签
  let link = document.querySelector<HTMLLinkElement>('link[rel*="icon"]');

  if (link) {
    // 若存在则直接修改 href
    link.href = iconPath;
  } else {
    // 若不存在则创建新标签
    link = document.createElement('link');
    link.rel = 'icon';
    link.href = iconPath;
    document.head.appendChild(link);
  }
};


// 路由守卫：进入页面前置处理
router.beforeEach(async (to, from, next) => {
  const { website, custom, webIsInit, apiUrl, hasWechat } = storeToRefs(useWebsitConfigStore());
  const adminInfo = storeToRefs(useAdminInfoStore());
  const route = useRoute();

  try {
    if (!webIsInit.value) {
      const res = await fetch('/config.json');
      const config = await res.json();
      apiUrl.value = config.apiUrl;
      const conres = await paxios.get("/index/getAllConfig");
      if (conres.data.code == 0) {
        custom.value.url = CompleteUrl(conres.data.data.custom.url)
        hasWechat.value = conres.data.data.wechat;
      }
      const res1 = await paxios.get("/manage/adminInfo");
      if (res1.data.code == 0) {
        adminInfo.adminId.value = res1.data.data.id;
        adminInfo.name.value = res1.data.data.name;
        adminInfo.avatar.value = res1.data.data.avatar;
        adminInfo.isLogin.value = true;
      }

      webIsInit.value = true;

    }

    if (!adminInfo.isLogin.value) {
      if (to.path != "/") {
        next("/");
        return;
      }
    }

    next();
  } catch (err) {
    // 4. 配置加载失败：跳转到错误页或提示
    //next('/config-error'); 
    console.log("配置初始化失败")
    console.log(err)
    next();
  }
});

export default router
