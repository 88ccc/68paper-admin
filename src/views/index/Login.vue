<template>
    <ContactService ref="ContactRef" />
    <el-dialog v-model="articleVisible" :width="isSmallScreen ? '95%' : '600px'" :close-on-click-modal="true"
        :show-close="true" class="auth-dialog" :lock-scroll="false">

        <div v-loading="articleLoading">
            <div v-html="articleContent"></div>
        </div>
    </el-dialog>

    <div class="auth-container">

        <!-- 主卡片 -->
        <div class="auth-card">
            <div class="auth-header">
                <h1 class="title">
                    {{ currentView === 'login' ? '欢迎回来' :
                        currentView === 'register' ? '创建账号' : '找回密码' }}
                </h1>
                <p class="subtitle">
                    {{ currentView === 'login' ? '请登录您的账号以继续' :
                        currentView === 'register' ? '注册后即可享受更多服务' : '请选择找回方式重置密码' }}
                </p>
            </div>

            <!-- 登录界面 -->
            <div v-if="currentView === 'login'">
                <el-tabs v-model="loginMethod" class="auth-tabs" @tab-change="handleLoginTabChange">
                    <template>
                        <el-tab-pane label="帐号密码" name="account"></el-tab-pane>
                    </template>
                   


                </el-tabs>

                <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" class="auth-form">
                    <!-- 账号密码登录 -->
                    <template v-if="loginMethod === 'account'">
                        <el-form-item prop="account">
                            <el-input v-model="loginForm.account" placeholder="请输入手机号或邮箱" prefix-icon="User"
                                clearable></el-input>
                        </el-form-item>

                        <el-form-item prop="password">
                            <el-input v-model="loginForm.password" type="password" placeholder="请输入密码"
                                prefix-icon="Lock" clearable show-password></el-input>
                        </el-form-item>

                        <div class="form-actions">
                            <el-checkbox v-model="loginForm.remember" class="remember-me">记住我</el-checkbox>
                            <el-link type="primary" @click="switchToView('forgot')" class="forgot-link">忘记密码?</el-link>
                        </div>

                        <el-form-item>
                            <el-button type="primary" class="submit-btn" @click="handleLogin" :loading="loginLoading">
                                登录
                            </el-button>
                        </el-form-item>
                    </template>

                    <div class="register-now">
                        还没有账号?
                        <el-link type="primary" @click="switchToView('register')">立即注册</el-link>
                    </div>
                </el-form>
            </div>

            <!-- 注册界面 -->
            <div v-if="currentView === 'register'">
               
                <div >
                    <el-tabs v-model="registerMethod" class="auth-tabs" @tab-change="handleRegisterTabChange">
                        <template v-if="loginRegister.regList.indexOf('mobile') != -1">
                            <el-tab-pane label="手机号注册" name="phone"></el-tab-pane>
                        </template>
                        <template v-if="loginRegister.regList.indexOf('email') != -1">
                            <el-tab-pane label="邮箱注册" name="email"></el-tab-pane>
                        </template>


                    </el-tabs>

                    <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef" class="auth-form">
                        <el-form-item v-if="registerMethod === 'phone'" prop="phone">
                            <el-input v-model="registerForm.phone" placeholder="请输入手机号" prefix-icon="Phone"
                                clearable></el-input>
                        </el-form-item>

                        <el-form-item v-if="registerMethod === 'email'" prop="email">
                            <el-input v-model="registerForm.email" placeholder="请输入邮箱" prefix-icon="Message"
                                clearable></el-input>
                        </el-form-item>

                        <el-form-item prop="verifyCode">
                            <el-row :gutter="10">
                                <el-col :span="16">
                                    <el-input v-model="registerForm.verifyCode" placeholder="请输入验证码" prefix-icon="Key"
                                        clearable></el-input>
                                </el-col>
                                <el-col :span="8">
                                    <el-button type="default" class="send-code-btn" @click="sendRegisterCode"
                                        :disabled="registerCodeDisabled">
                                        {{ registerCodeDisabled ? `${countDown}秒后重发` : '发送验证码' }}
                                    </el-button>
                                </el-col>
                            </el-row>
                        </el-form-item>

                        <el-form-item prop="password">
                            <el-input v-model="registerForm.password" type="password" placeholder="请设置密码（6-20位字符）"
                                prefix-icon="Lock" clearable show-password></el-input>
                        </el-form-item>

                        <el-form-item prop="confirmPassword">
                            <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请确认密码"
                                prefix-icon="Lock" clearable show-password></el-input>
                        </el-form-item>

                        <el-form-item>
                            <el-button type="primary" class="submit-btn" @click="handleRegister"
                                :loading="registerLoading">
                                注册
                            </el-button>
                        </el-form-item>

                        <div class="login-now">
                            已有账号?
                            <el-link type="primary" @click="switchToView('login')">立即登录</el-link>
                        </div>
                    </el-form>
                </div>

            </div>

            <!-- 找回密码界面 -->
            <div v-if="currentView === 'forgot'">
                <el-tabs v-model="forgotMethod" class="auth-tabs" @tab-change="handleForgotTabChange">
                    <template v-if="hasSms">
                        <el-tab-pane label="手机号码找回" name="phone"></el-tab-pane>
                    </template>
                    <template v-if="hasEmail">
                        <el-tab-pane label="邮箱找回" name="email"></el-tab-pane>
                    </template>
                </el-tabs>

                <el-form :model="forgotForm" :rules="forgotRules" ref="forgotFormRef" class="auth-form">
                    <el-form-item v-if="forgotMethod === 'phone'" prop="phone">
                        <el-input v-model="forgotForm.phone" placeholder="请输入手机号" prefix-icon="Phone"
                            clearable></el-input>
                    </el-form-item>

                    <el-form-item v-if="forgotMethod === 'email'" prop="email">
                        <el-input v-model="forgotForm.email" placeholder="请输入邮箱" prefix-icon="Message"
                            clearable></el-input>
                    </el-form-item>

                    <el-form-item prop="verifyCode">
                        <el-row :gutter="10">
                            <el-col :span="16">
                                <el-input v-model="forgotForm.verifyCode" placeholder="请输入验证码" prefix-icon="Key"
                                    clearable></el-input>
                            </el-col>
                            <el-col :span="8">
                                <el-button type="default" class="send-code-btn" @click="sendForgotCode"
                                    :disabled="forgotCodeDisabled">
                                    {{ forgotCodeDisabled ? `${forgotCountDown}秒后重发` : '发送验证码' }}
                                </el-button>
                            </el-col>
                        </el-row>
                    </el-form-item>

                    <el-form-item prop="newPassword">
                        <el-input v-model="forgotForm.newPassword" type="password" placeholder="请设置新密码（6-20位字符）"
                            prefix-icon="Lock" clearable show-password></el-input>
                    </el-form-item>

                    <el-form-item prop="confirmNewPassword">
                        <el-input v-model="forgotForm.confirmNewPassword" type="password" placeholder="请确认新密码"
                            prefix-icon="Lock" clearable show-password></el-input>
                    </el-form-item>

                    <el-form-item>
                        <el-button type="primary" class="submit-btn" @click="handleResetPassword"
                            :loading="forgotLoading">
                            重置密码
                        </el-button>
                    </el-form-item>

                    <div class="login-now">
                        想起密码了?
                        <el-link type="primary" @click="switchToView('login')">立即登录</el-link>
                    </div>
                </el-form>
            </div>

            <!-- 联系客服 -->
            <div>
                <el-link type="primary" @click="showContactService">联系客服</el-link>
            </div>
        </div>


    </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted,onBeforeUnmount } from 'vue';
import type { FormInstance, FormItemRule, FormRules } from 'element-plus';
import { useWebsitConfigStore } from '@/stores/websitConfig';
import { storeToRefs } from "pinia"
import { paxios } from '@/utils/paxios';
import { useUserInfoStore } from '@/stores/userinfo';
import { getCookie, setCookie } from '@/utils/cookie';
import { useRoute, useRouter } from 'vue-router'

const route = useRoute();
const router = useRouter();


const { loginRegister, hasEmail, hasSms } = storeToRefs(useWebsitConfigStore());
const { isLogin, userId, userName, userEmail, userPhone, userAvatar, domain , openid } = storeToRefs(useUserInfoStore());

let userTid = 0;
const articleVisible = ref<boolean>(false);
const articleLoading = ref<boolean>(false);
const articleContent = ref<string>('');

// 生成的二维码图片地址（base64格式）
const regQrCodeUrl = ref('');
const wechaturl = ref('');
const gotoWeChat = ref(false); //必须去微信内置浏览器打开
let loginQrStr = '';

//客服框是否显示
const ContactRef = ref();
function showContactService() {
  if (ContactRef.value) {
    ContactRef.value.dialogVisible = true;
  }
}

// 当前视图（登录/注册/找回密码）
const currentView = ref<'login' | 'register' | 'forgot'>('login');

// 辅助函数：确保规则是数组形式
const ensureArray = <T>(value: T | T[]): T[] => {
    return Array.isArray(value) ? value : [value];
};

const isSmallScreen = ref(false)

// 监听窗口大小变化，用于响应式调整
const handleResize = () => {
    isSmallScreen.value = window.innerWidth <= 768;
};

onMounted(async () => {
    if (isLogin.value) {
        router.push('/home');
    }
    let tmp = route.params.tid as string
    userTid = parseInt(tmp)
    if (Number.isNaN(userTid)) {
        userTid = 0
    }
    if (userTid < 0) {
        userTid = 0
    }
    if (userTid <= 0) {
        let tids = getCookie("tid")
        if (tids) {
            userTid = parseInt(tids)
            if (Number.isNaN(userTid)) {
                userTid = 0
            }
            if (userTid < 0) {
                userTid = 0
            }
        }

    }
    window.addEventListener('resize', handleResize);
    if (!hasSms.value) {
        forgotMethod.value = "email"
    }
   
   
        loginMethod.value = "account"
    
    console.log(loginRegister.value.regList);
    if(loginRegister.value.regList.indexOf('mobile') != -1){
        registerMethod.value = "phone";
    }else if(loginRegister.value.regList.indexOf('email') != -1){
        registerMethod.value = "email";
    }

});

// 辅助函数：更新规则的required属性
const updateRuleRequired = (
    rules: FormRules,
    field: string,
    required: boolean
) => {
    if (!rules[field]) return;

    const ruleArray = ensureArray(rules[field] as FormItemRule);
    ruleArray.forEach(rule => {
        rule.required = required;
    });

    // 重新赋值触发响应式更新
    rules[field] = ruleArray;
};

// 表单引用
const loginFormRef = ref<FormInstance>();
const registerFormRef = ref<FormInstance>();
const forgotFormRef = ref<FormInstance>();
const argreeMeet = ref(false);

// 登录表单数据
const loginForm = reactive({
    account: '',
    password: '',
    remember: false
});

// 登录方式（账号密码/微信扫码）
const loginMethod = ref<'account' | 'wechat'>('account');

// 注册表单数据
const registerForm = reactive({
    phone: '',
    email: '',
    verifyCode: '',
    password: '',
    confirmPassword: ''
});

// 注册方式（手机号/邮箱）
const registerMethod = ref<'phone' | 'email'>('phone');

// 注册验证码倒计时
const countDown = ref(60);
const registerCodeDisabled = ref(false);

// 找回密码表单数据
const forgotForm = reactive({
    phone: '',
    email: '',
    verifyCode: '',
    newPassword: '',
    confirmNewPassword: ''
});

// 找回密码方式（手机号/邮箱）
const forgotMethod = ref<'phone' | 'email'>('phone');

// 找回密码验证码倒计时
const forgotCountDown = ref(60);
const forgotCodeDisabled = ref(false);

// 加载状态
const loginLoading = ref(false);
const registerLoading = ref(false);
const forgotLoading = ref(false);

// 切换视图（登录/注册/找回密码）
const switchToView = (view: 'login' | 'register' | 'forgot') => {
    currentView.value = view;
    // 重置对应表单
    if (view === 'login' && loginFormRef.value) {
        loginFormRef.value.clearValidate();
    } else if (view === 'register' && registerFormRef.value) {
        registerFormRef.value.clearValidate();
    } else if (view === 'forgot' && forgotFormRef.value) {
        forgotFormRef.value.clearValidate();
    }
};


// 登录标签页切换
const handleLoginTabChange = () => {
    if (loginFormRef.value) {
        loginFormRef.value.clearValidate();
    }
    
};

// 注册标签页切换
const handleRegisterTabChange = () => {
    resetRegisterAccount();
    if (registerFormRef.value) {
        registerFormRef.value.clearValidate();
    }
};

// 找回密码标签页切换
const handleForgotTabChange = () => {
    resetForgotAccount();
    if (forgotFormRef.value) {
        forgotFormRef.value.clearValidate();
    }
};

// 切换注册方式时清空账号
const resetRegisterAccount = () => {
    if (registerMethod.value === 'phone') {
        registerForm.email = '';
    } else {
        registerForm.phone = '';
    }
};

// 切换找回密码方式时清空账号
const resetForgotAccount = () => {
    if (forgotMethod.value === 'phone') {
        forgotForm.email = '';
    } else {
        forgotForm.phone = '';
    }
};

// 登录表单验证规则
const loginRules = reactive<FormRules>({
    account: [
        {
            required: true,
            message: '请输入手机号或邮箱',
            trigger: 'blur'
        },
        {
            validator: (rule: any, value: any, callback: any) => {
                const phoneReg = /^1[3-9]\d{9}$/;
                const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

                if (value && !phoneReg.test(value) && !emailReg.test(value)) {
                    callback(new Error('请输入正确的手机号或邮箱'));
                } else {
                    callback();
                }
            },
            trigger: 'blur'
        }
    ],
    password: [
        {
            required: true,
            message: '请输入密码',
            trigger: 'blur'
        },
        {
            min: 6,
            max: 20,
            message: '密码长度在6-20个字符',
            trigger: 'blur'
        }
    ]
});

// 注册表单验证规则
const registerRules = reactive<FormRules>({
    phone: [
        {
            required: true,
            message: '请输入手机号',
            trigger: 'blur'
        },
        {
            pattern: /^1[3-9]\d{9}$/,
            message: '请输入正确的手机号',
            trigger: 'blur'
        }
    ],
    email: [
        {
            required: false,
            message: '请输入邮箱',
            trigger: 'blur'
        },
        {
            type: 'email',
            message: '请输入正确的邮箱',
            trigger: 'blur'
        }
    ],
    verifyCode: [
        {
            required: true,
            message: '请输入验证码',
            trigger: 'blur'
        },
        {
            len: 6,
            message: '验证码长度为6位',
            trigger: 'blur'
        }
    ],
    password: [
        {
            required: true,
            message: '请设置密码',
            trigger: 'blur'
        },
        {
            min: 6,
            max: 20,
            message: '密码长度在6-20个字符',
            trigger: 'blur'
        }
    ],
    confirmPassword: [
        {
            required: true,
            message: '请确认密码',
            trigger: 'blur'
        },
        {
            validator: (rule: any, value: any, callback: any) => {
                if (value !== registerForm.password) {
                    callback(new Error('两次输入的密码不一致'));
                } else {
                    callback();
                }
            },
            trigger: 'blur'
        }
    ]
});

// 找回密码表单验证规则
const forgotRules = reactive<FormRules>({
    phone: [
        {
            required: true,
            message: '请输入手机号',
            trigger: 'blur'
        },
        {
            pattern: /^1[3-9]\d{9}$/,
            message: '请输入正确的手机号',
            trigger: 'blur'
        }
    ],
    email: [
        {
            required: false,
            message: '请输入邮箱',
            trigger: 'blur'
        },
        {
            type: 'email',
            message: '请输入正确的邮箱',
            trigger: 'blur'
        }
    ],
    verifyCode: [
        {
            required: true,
            message: '请输入验证码',
            trigger: 'blur'
        },
        {
            len: 6,
            message: '验证码长度为6位',
            trigger: 'blur'
        }
    ],
    newPassword: [
        {
            required: true,
            message: '请设置新密码',
            trigger: 'blur'
        },
        {
            min: 6,
            max: 20,
            message: '密码长度在6-20个字符',
            trigger: 'blur'
        }
    ],
    confirmNewPassword: [
        {
            required: true,
            message: '请确认新密码',
            trigger: 'blur'
        },
        {
            validator: (rule: any, value: any, callback: any) => {
                if (value !== forgotForm.newPassword) {
                    callback(new Error('两次输入的密码不一致'));
                } else {
                    callback();
                }
            },
            trigger: 'blur'
        }
    ]
});

// 监听注册方式变化，更新验证规则
watch(registerMethod, (newVal) => {
    updateRuleRequired(registerRules, 'phone', newVal === 'phone');
    updateRuleRequired(registerRules, 'email', newVal === 'email');
});

// 监听找回密码方式变化，更新验证规则
watch(forgotMethod, (newVal) => {
    updateRuleRequired(forgotRules, 'phone', newVal === 'phone');
    updateRuleRequired(forgotRules, 'email', newVal === 'email');
});

// 发送注册验证码
const sendRegisterCode = () => {
    let account = '';
    let type = '';

    if (registerMethod.value === 'phone') {
        if (!registerForm.phone) {
            ElMessage.warning('请输入手机号');
            return;
        }

        const phoneReg = /^1[3-9]\d{9}$/;
        if (!phoneReg.test(registerForm.phone)) {
            ElMessage.warning('请输入正确的手机号');
            return;
        }

        account = registerForm.phone;
        type = 'phone';
    } else {
        if (!registerForm.email) {
            ElMessage.warning('请输入邮箱');
            return;
        }

        const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailReg.test(registerForm.email)) {
            ElMessage.warning('请输入正确的邮箱');
            return;
        }

        account = registerForm.email;
        type = 'email';
    }

    // 开始倒计时
    registerCodeDisabled.value = true;
    let timer = setInterval(() => {
        countDown.value--;
        if (countDown.value <= 0) {
            clearInterval(timer);
            countDown.value = 60;
            registerCodeDisabled.value = false;
        }
    }, 1000);
    if (type === 'phone') {
        paxios.post('/index/sendSmsCode', { phone: account }).then(res => {
            if (res.data.code == 0) {
                ElMessage.success('验证码发送成功');
            } else {
                ElMessage.error(res.data.msg);
            }
        }).catch(err => {
            ElMessage.error(err.message);
        })
    } else if (type === 'email') {
        paxios.post('/index/sendEmailCode', { email: account, isReg: true }).then(res => {
            if (res.data.code == 0) {
                ElMessage.success('验证码发送成功');
            } else {
                ElMessage.error(res.data.msg);
            }
        }).catch(err => {
            ElMessage.error(err.message);
        })
    }
};

// 发送找回密码验证码
const sendForgotCode = () => {
    let account = '';
    let type = '';

    if (forgotMethod.value === 'phone') {
        if (!forgotForm.phone) {
            ElMessage.warning('请输入手机号');
            return;
        }

        const phoneReg = /^1[3-9]\d{9}$/;
        if (!phoneReg.test(forgotForm.phone)) {
            ElMessage.warning('请输入正确的手机号');
            return;
        }

        account = forgotForm.phone;
        type = 'phone';
    } else {
        if (!forgotForm.email) {
            ElMessage.warning('请输入邮箱');
            return;
        }

        const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailReg.test(forgotForm.email)) {
            ElMessage.warning('请输入正确的邮箱');
            return;
        }

        account = forgotForm.email;
        type = 'email';
    }

    // 开始倒计时
    forgotCodeDisabled.value = true;
    let timer = setInterval(() => {
        forgotCountDown.value--;
        if (forgotCountDown.value <= 0) {
            clearInterval(timer);
            forgotCountDown.value = 60;
            forgotCodeDisabled.value = false;
        }
    }, 1000);
    if (type === 'phone') {
        paxios.post('/index/sendSmsCode', { phone: account }).then(res => {
            if (res.data.code == 0) {
                ElMessage.success('验证码发送成功');
            } else {
                ElMessage.error(res.data.msg);
            }
        }).catch(err => {
            ElMessage.error(err.message);
        })
    } else if (type === 'email') {
        paxios.post('/index/sendEmailCode', { email: account, isReg: false }).then(res => {
            if (res.data.code == 0) {
                ElMessage.success('验证码发送成功');
            } else {
                ElMessage.error(res.data.msg);
            }
        }).catch(err => {
            ElMessage.error(err.message);
        })
    }
};

// 处理登录
const handleLogin = async () => {
    if (!loginFormRef.value) return;

    try {
        await loginFormRef.value.validate();
        loginLoading.value = true;

        // 模拟登录请求
        let res = await paxios.post('/index/login', { account: loginForm.account, password: loginForm.password,remember:loginForm.remember });
        if (res.data.code == 0) {
            ElMessage.success(res.data.msg);
            userId.value = res.data.data.id;
            userName.value = res.data.data.name;
            userEmail.value = res.data.data.email;
            userPhone.value = res.data.data.phone;
            userAvatar.value = res.data.data.avatar;
            domain.value = res.data.data.domain;
            isLogin.value = true;
            localStorage.setItem('userid', res.data.data.id);
            localStorage.setItem('token', res.data.data.token);
            router.push('/home');
        } else {
            ElMessage.error(res.data.msg);
        }
        loginLoading.value = false;
    } catch (error) {
        loginLoading.value = false;
        console.log('登录表单验证失败', error);
    }
};

// 处理注册
const handleRegister = async () => {
    if (!registerFormRef.value) return;

    try {
        await registerFormRef.value.validate();
        registerLoading.value = true;

        // 模拟注册请求
        let account = '';
        if (registerMethod.value === 'phone') {
            account = registerForm.phone;
        } else if (registerMethod.value === 'email') {
            account = registerForm.email;
        }
        let tid = getCookie('tid');
        if (tid == null) {
            tid = '0';
        }
        let res = await paxios.post('/index/register', { account: account, password: registerForm.password, code: registerForm.verifyCode, tid: tid, openid: openid.value });
        registerLoading.value = false;
        if (res.data.code == 0) {
            ElMessage.success(res.data.msg);
            switchToView('login');
            loginForm.account = registerMethod.value === 'phone' ? registerForm.phone : registerForm.email;
        } else {
            ElMessage.error(res.data.msg);
        }
    } catch (error) {
        registerLoading.value = false;
        console.log('注册表单验证失败', error);
    }
};

// 处理重置密码
const handleResetPassword = async () => {
    if (!forgotFormRef.value) return;

    try {
        await forgotFormRef.value.validate();
        let account = '';

        if (forgotMethod.value === 'phone') {
            if (!forgotForm.phone) {
                ElMessage.warning('请输入手机号');
                return;
            }

            const phoneReg = /^1[3-9]\d{9}$/;
            if (!phoneReg.test(forgotForm.phone)) {
                ElMessage.warning('请输入正确的手机号');
                return;
            }

            account = forgotForm.phone;
        } else {
            if (!forgotForm.email) {
                ElMessage.warning('请输入邮箱');
                return;
            }

            const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailReg.test(forgotForm.email)) {
                ElMessage.warning('请输入正确的邮箱');
                return;
            }

            account = forgotForm.email;
        }
        forgotLoading.value = true;
        const res = await paxios.post('/index/resetPassword', { account: account, password: forgotForm.newPassword, code: forgotForm.verifyCode });
        if (res.data.code == 0) {
            ElMessage.success(res.data.msg);
            switchToView('login');
            // 自动填充账号
            loginForm.account = forgotMethod.value === 'phone' ? forgotForm.phone : forgotForm.email;
        } else {
            ElMessage.error(res.data.msg);
        }
        forgotLoading.value = false;
    } catch (error) {
        console.log('重置密码表单验证失败', error);
    }
};


// 组件卸载前确保清除定时器
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

</script>

<style scoped>
.refresh-qrcode {
    color: #165dff;
    font-size: 13px;
    align-items: center;
    gap: 5px;
    cursor: pointer;
}

.auth-container {
    min-height: calc(100vh - 64px);; /* 修改为100vh确保占满整个视口高度 */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #f5f7fa;
    position: relative;
    padding: 20px;
    margin: 0; /* 重置可能存在的外边距 */
}

.auth-card {
    width: 100%;
    max-width: 420px;
    background-color: #fff;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    padding: 36px;
    z-index: 1;
    /* 添加以下属性确保卡片本身也垂直居中 */
    margin: auto; /* 自动外边距确保居中 */
}

.auth-header {
    text-align: center;
    margin-bottom: 20px;
}

.title {
    font-size: 24px;
    font-weight: 600;
    color: #1d2129;
    margin: 0 0 8px 0;
}

.subtitle {
    font-size: 14px;
    color: #86909c;
    margin: 0;
}

.auth-tabs {
    margin-bottom: 24px;
}

.auth-form {
    width: 100%;
}

.form-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    font-size: 14px;
}

.remember-me {
    color: #4e5969;
}

.forgot-link {
    font-size: 14px;
}

.submit-btn {
    width: 100%;
    height: 44px;
    font-size: 16px;
}

.register-now,
.login-now {
    text-align: center;
    margin-top: 15px;
    font-size: 14px;
    color: #86909c;
}

.send-code-btn {
    width: 100%;
}

.wechat-login {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px 0;
}

.qrcode-container {
    width: 180px;
    height: 180px;
    border: 1px solid #e5e6eb;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
}

.qrcode-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.wechat-icon-failed {
    font-size: 48px;
    color: #CC0033;
    margin-bottom: 12px;
}

.wechat-icon-loading {
    font-size: 48px;
    color: #CCCCCC;
    margin-bottom: 12px;
}

.wechat-icon-expired {
    font-size: 48px;
    color: #FF9966;
    margin-bottom: 12px;
}

.qrcode-tip {
    font-size: 14px;
    color: #86909c;
    margin: 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
    .auth-card {
        padding: 24px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .title {
        font-size: 20px;
    }

    .qrcode-container {
        width: 160px;
        height: 160px;
    }
}
</style>