<template>
  <div class="common-layout">
    <ContactService ref="ContactRef" />

    <!-- 外层容器设置为flex列布局 -->
    <el-container class="full-height">
      <el-header v-if="!noNavModel" class="header-container">
        <!-- 左侧标题区域 -->
        <el-icon @click="showAsideChange" v-show="!showAside" :size="35">
          <Expand />
        </el-icon>
        <el-icon @click="showAsideChange" v-show="showAside" :size="35">
          <Fold />
        </el-icon>
        <img :src="website.logo" class="logo">

        <!-- 右侧功能区域 -->
        <div class="header-actions">
          <!-- 功能文字链接 -->
          <div class="action-links">
            <span class="action-link" @click="showContactService">联系客服</span>
          </div>

          <el-button @click="refreshKey" :icon="Refresh" circle />

          <!-- 用户头像及下拉菜单 -->
          <el-dropdown v-if="isLogin" placement="bottom" trigger="click">
            <div class="user-avatar-wrapper" slot="reference">
              <img :src="userAvatar" alt="用户头像" class="user-avatar avatar-img">
              <el-icon class="dropdown-arrow">
                <ArrowDown />
              </el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="touserCenter">个人中心</el-dropdown-item>
                <el-dropdown-item @click="userLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button type="primary" v-if="!isLogin" @click="showLoginReg">登录/注册</el-button>
        </div>
      </el-header>
      <el-container style="height: 100%;">
        <!-- 侧边栏 - 增加响应式控制 -->
        <el-aside v-if="showAside && (!noNavModel)" width="200px">
          <div class="aside-container">
            <el-menu :default-active="route.path" class="aside-menu" background-color="#f5f7fa" text-color="#333"
              active-text-color="#3b82f6" router :unique-opened="true">
              <el-menu-item index="/home">
                <el-icon class="menu-icon">
                  <pi-worktable />
                </el-icon>
                <span>工作台</span>
              </el-menu-item>

              <el-menu-item index="/money">
                <el-icon class="menu-icon">
                  <Coin />
                </el-icon>
                <span>金额记录</span>
              </el-menu-item>
              <el-menu-item index="/check">
                <el-icon class="menu-icon">
                  <SuitcaseLine />
                </el-icon>
                <span>检测产品</span>
              </el-menu-item>
              <el-menu-item index="/check_record">
                <el-icon class="menu-icon">
                  <Reading />
                </el-icon>
                <span>检测记录</span>
              </el-menu-item>


              <el-menu-item index="/checkurl">
                <el-icon class="menu-icon">
                  <Share />
                </el-icon>
                <span>检测链接</span>
              </el-menu-item>

              <el-menu-item v-if="functions.msgsub" index="/subscribemsg">
                <el-icon class="menu-icon">
                  <Bell />
                </el-icon>
                <span>消息订阅</span>
              </el-menu-item>

              <el-sub-menu index="1">
                <template #title>
                  <el-icon>
                    <Setting />
                  </el-icon>
                  <span>设置管理</span>
                </template>
                <el-menu-item v-if="functions.attach" index="/attachment">
                  <el-icon class="menu-icon">
                    <Paperclip />
                  </el-icon>
                  <span>附件管理</span>
                </el-menu-item>
                <el-menu-item index="/customer">
                  <el-icon class="menu-icon">
                    <Avatar />
                  </el-icon>
                  <span>客服设置</span>
                </el-menu-item>

                <el-menu-item index="/payset">
                  <el-icon class="menu-icon">
                    <CreditCard />
                  </el-icon>
                  <span>支付方式</span>
                </el-menu-item>
                <el-menu-item index="/otherset">
                  <el-icon class="menu-icon">
                    <Operation />
                  </el-icon>
                  <span>其他设置</span>
                </el-menu-item>
                <el-menu-item v-if="functions.notice" index="/noticeconfig">
                  <el-icon class="menu-icon">
                    <Bell />
                  </el-icon>
                  <span>公告设置</span>
                </el-menu-item>
                <el-menu-item index="/user">
                  <el-icon class="menu-icon">
                    <User />
                  </el-icon>
                  <span>用户中心</span>
                </el-menu-item>
              </el-sub-menu>
              <el-sub-menu index="2">
                <template #title>
                  <el-icon>
                    <Briefcase />
                  </el-icon>
                  <span>提现管理</span>
                </template>
                <el-menu-item index="/withdraw">
                  <el-icon class="menu-icon">
                    <CreditCard />
                  </el-icon>
                  <span>提现申请</span>
                </el-menu-item>
                <el-menu-item index="/withdraw_record">
                  <el-icon class="menu-icon">
                    <Tickets />
                  </el-icon>
                  <span>提现记录</span>
                </el-menu-item>
              </el-sub-menu>
              <el-sub-menu v-if="reward_enabled" index="3">
                <template #title>
                  <el-icon>
                    <Avatar />
                  </el-icon>
                  <span>代理管理</span>
                </template>
                <el-menu-item index="/invite">
                  <el-icon class="menu-icon">
                    <Coordinate />
                  </el-icon>
                  <span>招募代理</span>
                </el-menu-item>
                <el-menu-item index="/invitedata">
                  <el-icon class="menu-icon">
                    <Tickets />
                  </el-icon>
                  <span>代理数据</span>
                </el-menu-item>
              </el-sub-menu>
              <el-sub-menu v-if="functions.extensions" index="4">
                <template #title>
                  <el-icon>
                    <Crop />
                  </el-icon>
                  <span>扩展功能</span>
                </template>
                <el-menu-item index="/points">
                  <el-icon class="menu-icon">
                    <Discount />
                  </el-icon>
                  <span>积分充值</span>
                </el-menu-item>
                <el-menu-item index="/pointsrecord">
                  <el-icon class="menu-icon">
                    <Tickets />
                  </el-icon>
                  <span>积分记录</span>
                </el-menu-item>
                <el-menu-item index="/checkcard">
                  <el-icon class="menu-icon">
                    <Postcard />
                  </el-icon>
                  <span>检测卡</span>
                </el-menu-item>
                <el-menu-item v-if="ecommerce" index="/cardkey">
                  <el-icon class="menu-icon">
                    <ShoppingBag />
                  </el-icon>
                  <span>绑定电商</span>
                </el-menu-item>
              </el-sub-menu>



            </el-menu>
          </div>
        </el-aside>

        <!-- 主内容区与底部容器 -->

        <el-main :key="viewKey" class="main-container">
          <RouterView />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, RouterView, useRoute } from 'vue-router'
import { storeToRefs } from "pinia"
import ContactService from '@/components/ContactService.vue'
import { useWebsitConfigStore } from '@/stores/websitConfig';
import { useUserInfoStore } from '@/stores/userinfo';
import { useSaleWebStore } from '@/stores/saleWebConfig'
import { getBrowserType } from '@/utils/browser';
import { paxios } from '@/utils/paxios';
import { userLogout } from '@/utils/utils';
import { Refresh } from "@element-plus/icons-vue"

const { isLogin, userId, userName, userEmail, userPhone, userAvatar, openid } = storeToRefs(useUserInfoStore());
const { reward_enabled, functions,ecommerce } = storeToRefs(useSaleWebStore());
const route = useRoute();
const { website } = storeToRefs(useWebsitConfigStore());
const noNavModel = ref(false);
const showAside = ref(true);
const viewKey = ref(1);

const router = useRouter();

//客服框是否显示
const ContactRef = ref();
function showContactService() {
  if (ContactRef.value) {
    ContactRef.value.dialogVisible = true;
  }
}

function refreshKey() {
  viewKey.value = viewKey.value + 1;
}


function gotoPath(path: string) {
  router.push(path);
}

// 监听窗口大小变化
const handleResize = () => {
  // 屏幕宽度小于768px时自动隐藏侧边栏
  if (window.innerWidth < 768) {
    showAside.value = false;
  } else {
    showAside.value = true;
  }
}


watch(() => route.path, (newPath: any, oldPath: any) => {
  console.log("路由变化:", newPath, oldPath);
  if (newPath != "/index" && newPath != "/" && newPath != "/index/" && (!newPath.startsWith("/login"))) {
    noNavModel.value = false;
  } else {
    noNavModel.value = true;
  }
  handleResize();
}, { immediate: true });

function touserCenter() {

  gotoPath('/user')
}
function showLoginReg() {
  gotoPath('/')

}

function showAsideChange() {
  showAside.value = !showAside.value
}




// 初始化时检查一次窗口大小
onMounted(async () => {
  //检查当前路由
  handleResize()
  window.addEventListener('resize', handleResize)
  try {

    const browserType = getBrowserType();
    console.log("当前浏览器类型:", browserType);
    if (browserType == 'wechat') {
      let currentUrl = window.location.href;
      const code = route.query.code;
      if (code) {
        // 微信授权
        let res = await paxios.post("/index/getWechatAuthUserInfo", { code: code });
        if (res.data.code == 0) {
          //判断是否登录成功
          openid.value = res.data.data.openid;
          localStorage.setItem('openid', openid.value);
          if (res.data.data.islogin == 1) {
            //登录成功
            userId.value = res.data.data.id;
            userName.value = res.data.data.name;
            userEmail.value = res.data.data.email;
            userPhone.value = res.data.data.phone;
            userAvatar.value = res.data.data.avatar;
            isLogin.value = true;
            localStorage.setItem('userid', res.data.data.id);
            localStorage.setItem('token', res.data.data.token);
          }
        } else {
          let localtopenid = localStorage.getItem('openid');
          if (localtopenid) {
            openid.value = localtopenid;
          } else {
            ElMessage.error(res.data.msg)
          }
        }
        console.log(res.data);
      } else {
        let res = await paxios.post("/index/getWechatAuthUrl", { url: currentUrl });
        if (res.data.code == 0) {
          window.location.href = res.data.data.url;
        } else {
          let localtopenid = localStorage.getItem('openid');
          if (localtopenid) {
            openid.value = localtopenid;
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

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

</script>

<style scoped>
.logo {
  max-height: 90%;
}

/* 保持60px高度限制 */
.el-header.header-container {
  height: 60px !important;
  padding: 0 20px;
  background-color: #CCFFFF;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  line-height: normal;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 侧边栏菜单样式 */
.aside-container {
  padding-top: 16px;
  height: calc(100% - 16px);
}

.aside-menu {
  border-right: none;
  height: calc(100% - 16px);
}

.menu-icon {
  margin-right: 12px;
  font-size: 18px;
}

/* 选中状态样式 - 增强视觉区分度 */
.el-menu-item.is-active {
  background-color: rgba(59, 130, 246, 0.15) !important;
  font-weight: 500;
}

/* 悬停状态样式 */
.el-menu-item:hover {
  background-color: rgba(59, 130, 246, 0.08) !important;
}


/* 右侧功能区域样式 */
.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  height: 100%;
}

/* 功能文字链接样式 */
.action-links {
  display: flex;
  gap: 20px;
}

.action-link {
  font-size: 0.875rem;
  color: #333333;
  cursor: pointer;
  transition: color 0.2s;
}

.action-link:hover {
  color: #409eff;
  /* Element Plus主题色 */
}

/* 用户头像及箭头样式 */
.user-avatar-wrapper {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid #eee;
}

.avatar-img {
  width: 40px;
  height: 40px;
  object-fit: cover;
}

.dropdown-arrow {
  color: #666;
  font-size: 14px;
  transition: transform 0.2s;
}

/* 下拉菜单激活时箭头旋转效果 */
.el-dropdown.open .dropdown-arrow {
  transform: rotate(180deg);
}



.select-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px;
  border-radius: 4px;
}

/* 确保根元素占满全屏 */
.common-layout {
  height: 100vh;
  width: 100%;
}

/* 外层容器使用flex列布局 */
.full-height {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.main-container {
  height: calc(100vh - 64px);
  /* 减去头部高度，避免超出视口 */
  overflow-y: auto;
  /* 内容超出时显示垂直滚动条 */
  padding: 20px;
  /* 可选：添加内边距，避免内容贴边 */
}

/* 主内容区域可滚动 */
.el-main {
  flex: 1;
  overflow-y: auto;
  /* 仅el-main区域滚动 */
  /* 确保没有额外内边距导致高度溢出 */
  padding: 10px !important;
  box-sizing: border-box;
  /* 关键：确保padding不影响整体高度计算 */
  -webkit-overflow-scrolling: touch;
  /* 增加移动端滚动流畅度 */
}

/* 底部固定高度 */
.el-footer {
  height: 60px;
  flex-shrink: 0;
}

/* 头部样式 - 用于放置菜单按钮 */
.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 响应式样式 - 屏幕宽度小于768px时 */
@media (max-width: 767px) {

  /* 给主内容增加底部边距，避免被底部导航遮挡 */
  .el-main {
    padding-bottom: 100px !important;
  }

  .header-container {
    padding: 0 15px;
  }

  .action-links {
    gap: 12px;
  }

  .action-link {
    font-size: 0.8rem;
  }

  .header-actions {
    gap: 12px;
  }
}
</style>