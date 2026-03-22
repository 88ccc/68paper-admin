<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { storeToRefs } from "pinia"
import { useRouter, useRoute } from 'vue-router'
import { useAdminInfoStore } from "@/stores/adminInfo"
import { adminLogout } from '@/utils/utils'
import { Refresh } from "@element-plus/icons-vue"

const noAsideModel = ref(true);
const showAside = ref(true);
const showAsideBt = ref(true);
const adminInfoStore = useAdminInfoStore();
const { isLogin, avatar } = storeToRefs(adminInfoStore);
const viewKey = ref(1);

// 控制移动端菜单显示状态
const showMobileMenu = ref(false);
const router = useRouter();
const route = useRoute();

function refreshKey() {
  viewKey.value = viewKey.value + 1;
}

// 定义处理窗口大小变化的函数
const handleResize = () => {
  if (window.innerWidth < 768) {
    showAside.value = false;
    if (noAsideModel.value) {
      showAsideBt.value = false;
    } else {
      showAsideBt.value = true;
    }

  } else {
    showAsideBt.value = false;
    showAside.value = true;

  }
};

// 在组件挂载时添加监听器
onMounted(async () => {
  // 初始化窗口尺寸
  handleResize();
  // 添加窗口大小变化监听器
  window.addEventListener('resize', handleResize);
});



watch(() => route.path, (newPath, oldPath) => {
  if (newPath != "/") {
    noAsideModel.value = false;
  } else {
    noAsideModel.value = true;
  }
  if (showAsideBt.value) {
    showAside.value = false;
  }
  handleResize();
}, { immediate: true });


function tologout() {
  adminLogout()
  router.push('/')
}

function showAsideChange() {
  showAside.value = !showAside.value
  showMobileMenu.value = false
}

</script>

<template>
  <div class="common-layout" style="height: 100%;">
    <el-container style="height: 100%;">
      <el-header v-show="!noAsideModel" class="header-container">
        <!-- 左侧网站地址 -->
        <el-icon @click="showAsideChange" v-show="!showAside" :size="35">
          <Expand />
        </el-icon>
        <el-icon @click="showAsideChange" v-show="showAside" :size="35">
          <Fold />
        </el-icon>
        <div class="header-logo">查重工具管理后台</div>

        <!-- 桌面端按钮区域 - 大屏显示 -->
        <div class="header-buttons desktop-buttons">
          <el-button @click="refreshKey" :icon="Refresh" circle />
          <!-- 用户头像及下拉菜单 -->
          <el-dropdown v-show="isLogin" placement="bottom" trigger="click">
            <div class="user-avatar-wrapper" slot="reference">
              <img :src="avatar" alt="用户头像" class="user-avatar avatar-img">
              <el-icon class="dropdown-arrow">
                <ArrowDown />
              </el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="tologout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-container style="height: 100%;">
        <el-aside v-if="showAside && (!noAsideModel)" width="200px">
          <div class="aside-container">
            <el-menu :default-active="route.path" class="aside-menu" background-color="#f5f7fa" text-color="#333"
              active-text-color="#3b82f6" router :unique-opened="true">
              <el-menu-item index="/home" class="menu-item">
                <el-icon class="menu-icon">
                  <pi-worktable />
                </el-icon>
                <span>工作台</span>
              </el-menu-item>
              <el-sub-menu index="1">
                <template #title>
                  <el-icon>
                    <GoodsFilled />
                  </el-icon>
                  <span>订单管理</span>
                </template>
                <el-menu-item index="/checkorder" class="menu-item">
                  <el-icon class="menu-icon">
                    <Memo />
                  </el-icon>
                  <span>检测记录</span>
                </el-menu-item>
              </el-sub-menu>
              <el-sub-menu index="2">
                <template #title>
                  <el-icon>
                    <pi-wxpublic />
                  </el-icon>
                  <span>微信公众号</span>
                </template>
                <el-menu-item index="/wechatset" class="menu-item">
                  <el-icon class="menu-icon">
                    <Setting />
                  </el-icon>
                  <span>公众号设置</span>
                </el-menu-item>
               
              </el-sub-menu>

              <el-sub-menu index="3">
                <template #title>
                  <el-icon>
                    <pi-websit />
                  </el-icon>
                  <span>网站管理</span>
                </template>
                <el-menu-item index="/storage" class="menu-item">
                  <el-icon class="menu-icon">
                    <Coin />
                  </el-icon>
                  <span>存储设置</span>
                </el-menu-item>
                <el-menu-item index="/custom" class="menu-item">
                  <el-icon class="menu-icon">
                    <pi-cso />
                  </el-icon>
                  <span>客服设置</span>
                </el-menu-item>
              </el-sub-menu>

              <el-sub-menu index="4">
                <template #title>
                  <el-icon>
                    <CreditCard />
                  </el-icon>
                  <span>支付管理</span>
                </template>
                <el-menu-item index="/paymode" class="menu-item">
                  <el-icon class="menu-icon">
                    <Money />
                  </el-icon>
                  <span>支付模板</span>
                </el-menu-item>
                <el-menu-item index="/payset" class="menu-item">
                  <el-icon class="menu-icon">
                    <Setting />
                  </el-icon>
                  <span>支付设置</span>
                </el-menu-item>
              </el-sub-menu>
              <el-sub-menu index="5">
                <template #title>
                  <el-icon>
                    <Setting />
                  </el-icon>
                  <span>系统管理</span>
                </template>
                <el-menu-item index="/manager" class="menu-item">
                  <el-icon class="menu-icon">
                    <User />
                  </el-icon>
                  <span>管理员</span>
                </el-menu-item>
              </el-sub-menu>
              <el-sub-menu index="6">
                <template #title>
                  <el-icon>
                    <Key />
                  </el-icon>
                  <span>秘钥配置</span>
                </template>
                <el-menu-item index="/checkkey" class="menu-item">
                  <el-icon class="menu-icon">
                    <IceCreamRound />
                  </el-icon>
                  <span>检测秘钥</span>
                </el-menu-item>
              </el-sub-menu>
              <el-sub-menu index="7">
                <template #title>
                  <el-icon>
                    <Grid />
                  </el-icon>
                  <span>应用管理</span>
                </template>
                <el-menu-item index="/check" class="menu-item">
                  <el-icon class="menu-icon">
                    <CollectionTag />
                  </el-icon>
                  <span>查重查AI</span>
                </el-menu-item>
              </el-sub-menu>
              <el-menu-item index="/shop" class="menu-item">
                <el-icon class="menu-icon">
                  <ShoppingCart />
                </el-icon>
                <span>店铺管理</span>
              </el-menu-item>
            </el-menu>
          </div>
        </el-aside>
        <el-main :key="viewKey" class="main-container">
          <RouterView />
        </el-main>

      </el-container>

    </el-container>
  </div>
</template>


<style scoped>
.main-container {
  height: calc(100vh - 64px);
  /* 减去头部高度，避免超出视口 */
  overflow-y: auto;
  /* 内容超出时显示垂直滚动条 */
  padding: 20px;
  /* 可选：添加内边距，避免内容贴边 */
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

.menu-item {
  height: 50px;
  margin-bottom: 4px;
  border-radius: 4px;
  margin-left: 8px;
  margin-right: 8px;
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

.header-container {
  background-color: #3b82f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 64px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffffff;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

/* 桌面端按钮样式 */
.desktop-buttons {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-btn {
  color: #ffffff;
  font-size: 1rem;
  padding: 6px 12px;
}

.header-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.login-btn {
  background-color: #10b981;
  color: white;
  border: none;
  padding: 6px 16px;
}

.login-btn:hover {
  background-color: #059669;
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  display: none;
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  width: 40px;
  height: 40px;
  border-radius: 6px;
  font-size: 18px;
}

.mobile-menu-btn:hover {
  background-color: rgba(255, 255, 255, 0.25);
}

/* 移动端菜单 */
.mobile-menu {
  display: none;
  position: absolute;
  top: 64px;
  left: 0;
  right: 0;
  background-color: #3b82f6;
  padding: 10px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

/* 菜单内部容器 - 修复对齐问题 */
.mobile-menu-inner {
  padding: 0 20px;
}

/* 清除Element UI按钮默认的水平间距，改为垂直间距（修复::v-deep deprecated问题） */
.mobile-menu-inner :deep(.el-button) {
  width: 100%;
  justify-content: flex-start;
  /* 普通按钮左对齐 */
  padding: 10px 15px;
  border-radius: 4px;
  margin-left: 0 !important;
  /* 强制清除左外边距 */
  margin-top: 8px;
  /* 设置垂直方向间距 */
}

/* 移除第一个按钮的顶部间距 */
.mobile-menu-inner :deep(.el-button:first-child) {
  margin-top: 0;
}

.mobile-btn {
  color: #ffffff;
}

.mobile-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* 登录按钮单独设置居中对齐 */
.mobile-login-btn {
  background-color: #10b981;
  color: white;
  border: none;
  justify-content: center !important;
  /* 覆盖左对齐，设置居中 */
}

.mobile-login-btn:hover {
  background-color: #059669;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .header-logo {
    font-size: 1.2rem;
  }

  .mobile-menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mobile-menu {
    display: block;
  }
}
</style>