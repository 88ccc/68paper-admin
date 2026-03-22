<template>
  <div class="login-container">
    <!-- 左侧背景区域 -->
    <div class="bg-section">
      <div class="absolute inset-0 opacity-20">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 800" class="wave">
          <path fill="#ffffff" fill-opacity="1"
            d="M0,320L48,325.3C96,331,192,341,288,320C384,299,480,245,576,234.7C672,224,768,256,864,261.3C960,267,1056,245,1152,229.3C1248,213,1344,203,1392,197.3L1440,192L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z">
          </path>
        </svg>
      </div>
      <div class="absolute inset-0 opacity-10">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 800" class="wave"
          style="animation-delay: -2s; animation-duration: 10s;">
          <path fill="#ffffff" fill-opacity="1"
            d="M0,384L48,368C96,352,192,320,288,320C384,320,480,352,576,368C672,384,768,384,864,362.7C960,341,1056,299,1152,282.7C1248,267,1344,283,1392,290.7L1440,299L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z">
          </path>
        </svg>
      </div>
      <div class="relative z-10 flex flex-col justify-center items-center p-8 text-white">
        <div class="text-center max-w-md animate-fade-in">
          <h1 class="text-4xl md-text-5xl font-bold mb-4 text-shadow">查重工具管理后台</h1>
          <h1 class="text-3xl md-text-4xl font-bold mb-4 text-shadow">欢迎回来</h1>
        </div>
      </div>
    </div>

    <!-- 右侧登录表单区域 -->
    <div class="form-section">
      <div class="logo-container">
        <h1 class="admin-title">查重工具管理后台</h1>
      </div>
      <div class="login-card">
        <h2 class="form-title">账号登录</h2>

        <el-form ref="loginForm" :model="form" :rules="rules" class="login-form">
          <!-- 用户名输入 -->
          <el-form-item prop="username">
            <el-input v-model="form.username" placeholder="请输入用户名" prefix-icon="User" clearable></el-input>
          </el-form-item>

          <!-- 密码输入 -->
          <el-form-item prop="password">
            <el-input v-model="form.password" type="password" placeholder="请输入密码" prefix-icon="Lock" show-password>
            </el-input>
          </el-form-item>

          <!-- 记住我 -->
          <el-form-item class="remember-me">
            <el-checkbox v-model="form.remember">记住我</el-checkbox>
          </el-form-item>

          <!-- 登录按钮 -->
          <el-form-item>
            <el-button type="primary" class="w-full" :loading="isLoading" @click="handleLogin">
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { paxios } from '@/utils/paxios';
import { ref, reactive ,onMounted} from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from "pinia"
import { useAdminInfoStore } from "@/stores/adminInfo"
const { isLogin, name, avatar, adminId } = storeToRefs(useAdminInfoStore());
/**
 * 登录表单类型
 */
interface LoginForm {
  username: string;
  password: string;
  remember: boolean;
}

/**
 * 登录响应类型
 */
interface LoginResponse {
  success: boolean;
  message?: string;
  data?: User;
}

onMounted(()=>{
  if(isLogin){
    router.push("/home");
  }
})

/**
 * 用户信息类型
 */
interface User {
  id: number;
  username: string;
  name: string;
  avatar?: string;
  role: string;
}

// 路由实例
const router = useRouter();

// 表单数据
const form = reactive<LoginForm>({
  username: '',
  password: '',
  remember: false
});

// 表单规则
const rules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
});

// 状态变量
const isLoading = ref<boolean>(false);
const loginForm = ref<InstanceType<typeof ElForm>>();

// 处理登录
const handleLogin = async (): Promise<void> => {
  // 表单验证
  if (!loginForm.value) return;


  await loginForm.value.validate();

  // 显示加载状态
  isLoading.value = true;


  paxios.post('/index/adminLogin', { username: form.username, password: form.password, remember: form.remember }).then(res => {
    if (res.data.code == 0) {
      adminId.value = res.data.data.id;
      name.value = res.data.data.name;
      avatar.value = res.data.data.avatar;
      isLogin.value = true;
      localStorage.setItem('adminid', res.data.data.id);
      localStorage.setItem('admintoken', res.data.data.token);
      router.push("/home");
    } else {
      isLogin.value = false;
      ElMessage.error(res.data.msg);
    }
  }).catch(error => {
    console.log(error);
    ElMessage.error("网络异常，请稍后再试");
  }).finally(() => {
    isLoading.value = false;
  });
};

// 页面加载时检查是否有记住的用户
const rememberedUser = localStorage.getItem('rememberedUser');
if (rememberedUser) {
  form.username = rememberedUser;
  form.remember = true;
}
</script>

<style scoped>
body {
  min-height: 100vh;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #1D2129;
  background-color: #F7F8FA;
}

/* 登录容器 */
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

@media (min-width: 769px) {
  .login-container {
    flex-direction: row;
  }
}

/* 背景区域 */
.bg-section {
  display: none;
  width: 50%;
  background: linear-gradient(135deg, #165DFF 0%, #4080FF 100%);
  position: relative;
  overflow: hidden;
  color: white;
}

@media (min-width: 769px) {
  .bg-section {
    display: flex;
  }
}

/* 表单区域 */
.form-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #ffffff;
}

/* Logo容器 */
.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

@media (min-width: 769px) {
  .logo-container {
    display: none;
  }
}

/* 登录卡片 */
.login-card {
  width: 100%;
  max-width: 28rem;
  background-color: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.1);
  padding: 1.5rem 2rem;
  animation: slideUp 0.5s ease-out;
}

/* 表单标题 */
.admin-title {
  font-size: 1.8rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 2rem;
  color: #0d58ef;
}

/* 表单标题 */
.form-title {
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 2rem;
  color: #1D2129;
}

/* 登录表单 */
.login-form {
  width: 100%;
}

/* 表单项目样式 */
.form-item-large {
  margin-bottom: 1.5rem !important;
}

/* 输入框样式 */
.input-large {
  height: 56px !important;
  font-size: 16px !important;
}

/* 记住我 */
.remember-me {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 1.5rem !important;
}

/* 页脚文本 */
.footer-text {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.875rem;
  color: #4E5969;
}

/* 动画效果 */
@keyframes fadeIn {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

@keyframes slideUp {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }

  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes wave {
  0% {
    transform: translateX(0) translateZ(0) scaleY(1);
  }

  50% {
    transform: translateX(-25%) translateZ(0) scaleY(0.8);
  }

  100% {
    transform: translateX(-50%) translateZ(0) scaleY(1);
  }
}

/* 波浪动画 */
.wave {
  animation: wave 8s linear infinite;
  transform-origin: 50% 50%;
}

/* 文本阴影 */
.text-shadow {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 工具类 */
.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.justify-center {
  justify-content: center;
}

.items-center {
  align-items: center;
}

.relative {
  position: relative;
}

.absolute {
  position: absolute;
}

.inset-0 {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.z-10 {
  z-index: 10;
}

.p-8 {
  padding: 2rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.text-white {
  color: white;
}

.text-center {
  text-align: center;
}

.max-w-md {
  max-width: 28rem;
}

.w-24 {
  width: 6rem;
}

.h-24 {
  height: 6rem;
}

.w-16 {
  width: 4rem;
}

.h-16 {
  height: 4rem;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

.w-full {
  width: 100%;
}

.md-text-5xl {
  font-size: 3rem;
}

.font-bold {
  font-weight: 700;
}
</style>
