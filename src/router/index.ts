import { createRouter, createWebHistory, useRoute } from 'vue-router'
import { useWebsitConfigStore } from '@/stores/websitConfig'
import { useSaleWebStore } from '@/stores/saleWebConfig'
import { storeToRefs } from "pinia"
import { paxios } from '@/utils/paxios'
import { CompleteUrl } from '@/utils/utils'
import { useAdminInfoStore } from "@/stores/adminInfo"
import { useUserInfoStore } from "@/stores/userinfo"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/views/index/Index.vue'),
      children: [
        {
          //后台首页
          path: "",
          component: () => import("@/views/index/Login.vue"),
        }, {
          path: 'su/:tid(\\d+).html',
          redirect: to => {
            return { path: '/login/' + to.params.tid }
          }
        }, {
          path: "su/:tid?",
          redirect: to => {
            return { path: '/login/' + to.params.tid }
          }
        }, {
          path: "login/:tid?",
          component: () => import("@/views/index/Login.vue"),
        }, {
          path: "home",
          component: () => import("@/views/index/Home.vue"),
        }, {
          path: "user",
          component: () => import("@/views/index/UserInfo.vue"),
        }, {
          path: "money",
          component: () => import("@/views/index/Money.vue"),
        }, {
          path: "check",
          component: () => import("@/views/index/Check.vue"),
        }, {
          path: "attachment",
          component: () => import("@/views/index/Attachment.vue"),
        }, {
          path: "checkurl",
          component: () => import("@/views/index/CheckUrl.vue"),
        }, {
          path: "check_record",
          component: () => import("@/views/index/CheckOrder.vue"),
        }, {
          path: "customer",
          component: () => import("@/views/index/Customer.vue"),
        }, {
          path: "withdraw",
          component: () => import("@/views/index/Withdraw.vue"),
        }, {
          path: "withdraw_record",
          component: () => import("@/views/index/WithdrawRecord.vue"),
        }, {
          path: "invite",
          component: () => import("@/views/index/Invite.vue"),
        }, {
          path: "invitedata",
          component: () => import("@/views/index/InviteData.vue"),
        }, {
          path: "payset",
          component: () => import("@/views/index/PaySet.vue"),
        }, {
          path: "points",
          component: () => import("@/views/index/Points.vue"),
        }, {
          path: "pointsrecord",
          component: () => import("@/views/index/PointsRecord.vue"),
        }, {
          path: "checkcard",
          component: () => import("@/views/index/CheckCard.vue"),
        }, {
          path: "cardkey",
          component: () => import("@/views/index/CardKey.vue"),
        }, {
          path: "otherset",
          component: () => import("@/views/index/OtherSetting.vue"),
        }, {
          path: "noticeconfig",
          component: () => import("@/views/index/NoticeConfig.vue"),
        }, {
          path: "subscribemsg",
          component: () => import("@/views/index/SubscribeMsg.vue"),
        }
      ]

    }, {
      //后台
      path: '/super',
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
        }, {
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
          //邮箱设置
          path: "emailset",
          component: () => import("@/views/admin/EmailSet.vue"),
        }, {
          //短信设置
          path: "smsset",
          component: () => import("@/views/admin/SmsSet.vue"),
        }, {
          //登录注册设置
          path: "loginset",
          component: () => import("@/views/admin/LoginSet.vue"),
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
          path: "agent",
          component: () => import("@/views/admin/Agent.vue"),
        }, {
          path: "attachlist",
          component: () => import("@/views/admin/AttachList.vue"),
        }, {
          path: "notice",
          component: () => import("@/views/admin/Notice.vue"),
        }, {
          path: "withdraw",
          component: () => import("@/views/admin/Withdraw.vue"),
        }, {
          path: "withdraw_set",
          component: () => import("@/views/admin/WithdrawSet.vue"),
        }, {
          path: "webset",
          component: () => import("@/views/admin/WebSet.vue"),
        }, {
          path: "saleweb",
          component: () => import("@/views/admin/SaleWeb.vue"),
        }, {
          path: "invite",
          component: () => import("@/views/admin/Invite.vue"),
        }, {
          path: "userbalance",
          component: () => import("@/views/admin/UserBalance.vue"),
        }, {
          path: "useragree",
          component: () => import("@/views/admin/UserAgree.vue")
        }, {
          path: "privacypolicy",
          component: () => import("@/views/admin/PrivacyPolicy.vue")
        }, {
          path: "cachemanage",
          component: () => import("@/views/admin/CacheManage.vue")
        }, {
          path: "producttips",
          component: () => import("@/views/admin/ProductTips.vue")
        }, {
          path: "userpoints",
          component: () => import("@/views/admin/UserPoints.vue")
        }, {
          //阿索奇标准货源
          path: "agiso",
          component: () => import("@/views/admin/Agiso.vue")
        }, {
          path: "checkcard",
          component: () => import("@/views/admin/CheckCard.vue")
        }, {
          path: "usernotice",
          component: () => import("@/views/admin/UserNotice.vue")
        }, {
          path: "function",
          component: () => import("@/views/admin/Function.vue")
        }, {
          path: "deleteuser",
          component: () => import("@/views/admin/DeleteUser.vue")
        }
      ]
    }, {
      path: '/pay',
      component: () => import('@/views/pay/Index.vue'),
      children: [
        {
          path: "check",
          component: () => import("@/views/pay/Check.vue")
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
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
  const { website, custom, hasEmail, hasSms, webIsInit, apiUrl, loginRegister, hasWechat, adminUrl } = storeToRefs(useWebsitConfigStore());
  const adminInfo = storeToRefs(useAdminInfoStore());
  const userinfo = storeToRefs(useUserInfoStore());
  const { saleWebConfig, reward_enabled, functions, ecommerce } = storeToRefs(useSaleWebStore());
  const route = useRoute();

  try {
    if (!webIsInit.value) {
      const res = await fetch('/config.json');
      const config = await res.json();
      apiUrl.value = config.apiUrl;
      const conres = await paxios.get("/index/getAllConfig");
      if (conres.data.code == 0) {
        if (conres.data.data.custom && conres.data.data.custom.url) {
          custom.value.url = CompleteUrl(conres.data.data.custom.url)
        }
        if (conres.data.data.loginRegister && conres.data.data.loginRegister.regList) {
          loginRegister.value.regList = conres.data.data.loginRegister.regList;
        }
        if (conres.data.data.website) {
          website.value.name = conres.data.data.website.webName;
          website.value.logo = CompleteUrl(conres.data.data.website.webLogo);
          website.value.favicon = CompleteUrl(conres.data.data.website.webFavicon);
          setFavicon(website.value.favicon);
        }
        if (conres.data.data.saleWeb) {
          saleWebConfig.value = conres.data.data.saleWeb;
        }
        if (conres.data.data.ecommerce) {
          ecommerce.value = conres.data.data.ecommerce;
        }
        if (conres.data.data.invite) {
          let str = conres.data.data.invite.enable;
          const val = String(str).trim().toLowerCase();
          reward_enabled.value = (val === 'true');
        }
        if (conres.data.data.adminUrl) {
          adminUrl.value = conres.data.data.adminUrl;
        }
        if (conres.data.data.function) {
          let str = conres.data.data.function.attach;
          let val = String(str).trim().toLowerCase();
          functions.value.attach = (val === 'true');
          str = conres.data.data.function.msgsub;
          val = String(str).trim().toLowerCase();
          functions.value.msgsub = (val === 'true');
          str = conres.data.data.function.notice;
          val = String(str).trim().toLowerCase();
          functions.value.notice = (val === 'true');
          str = conres.data.data.function.extensions;
          val = String(str).trim().toLowerCase();
          functions.value.extensions = (val === 'true');
        }
        hasEmail.value = conres.data.data.email;
        hasSms.value = conres.data.data.sms;
        hasWechat.value = conres.data.data.wechat;

      }


      if (to.path.startsWith('/super')) {
        const res = await paxios.get("/manage/adminInfo");
        if (res.data.code == 0) {
          adminInfo.adminId.value = res.data.data.id;
          adminInfo.name.value = res.data.data.name;
          adminInfo.avatar.value = res.data.data.avatar;
          adminInfo.isLogin.value = true;
        }
      } else {
        const res = await paxios.get("/console/userInfo");
        if (res.data.code == 0) {
          userinfo.userId.value = res.data.data.id;
          userinfo.userName.value = res.data.data.name;
          userinfo.userEmail.value = res.data.data.email;
          userinfo.userPhone.value = res.data.data.phone;
          userinfo.userAvatar.value = res.data.data.avatar;
          userinfo.isLogin.value = true;
          userinfo.domain.value = res.data.data.domain;
          userinfo.payType.value = res.data.data.pay_type
        }

      }


      webIsInit.value = true;

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
