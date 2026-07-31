<template>
    <div class="user-center-container" v-loading="loading">
        <!-- 主内容区 -->
        <div class="user-profile-card">
            <div class="profile-header">
                <h2>个人资料</h2>
            </div>

            <!-- 头像设置 -->
            <div class="profile-item">
                <span class="item-label">头像</span>
                <div class="item-content">
                    <div class="avatar-container">
                        <el-avatar :size="80" :src="userAvatar" class="current-avatar" />
                        <el-button type="primary" size="small" @click="showAvatarDialog = true">
                            更换
                        </el-button>
                    </div>
                </div>
            </div>

            <!-- 昵称设置 -->
            <div class="profile-item">
                <span class="item-label">用户ID</span>
                <div class="item-content">
                    <span class="info-text">{{ userId }}</span>
                </div>
            </div>

            <!-- 昵称设置 -->
            <div class="profile-item">
                <span class="item-label">姓名</span>
                <div class="item-content">
                    <span class="info-text">{{ userName }}</span>
                </div>
            </div>

            <!-- 手机号设置 -->
            <div v-if="hasSms" class="profile-item">
                <span class="item-label">手机号</span>
                <div class="item-content">
                    <span class="info-text">{{ userPhone || '未绑定' }}</span>
                    <el-button type="primary" text @click="bindPhone">
                        {{ userPhone ? '更换' : '绑定' }}
                    </el-button>
                </div>
            </div>

            <!-- 邮箱设置 -->
            <div v-if="hasEmail" class="profile-item">
                <span class="item-label">邮箱</span>
                <div class="item-content">
                    <span class="info-text">{{ userEmail || '未绑定' }}</span>
                    <el-button type="primary" text @click="bindEmail">
                        {{ userEmail ? '更换' : '绑定' }}
                    </el-button>
                </div>
            </div>

            <!-- 修改密码 -->
            <div class="profile-item">
                <span class="item-label">密码</span>
                <div class="item-content">
                    <span class="info-text">******</span>
                    <el-button type="primary" text @click="showPasswordDialog = true">
                        <el-icon>
                            <Lock />
                        </el-icon> 修改密码
                    </el-button>
                </div>
            </div>
        </div>

        <!-- 头像选择弹窗 -->
        <el-dialog title="上传头像" v-model="showAvatarDialog" :width="dialogWidth">
            <el-upload class="avatar-uploader" style="text-align: center;" :auto-upload="false" :show-file-list="false"
                :on-change="avatarHandChange">
                <img v-if="imageUrl" :src="imageUrl" class="avatar" />
                <el-button v-if="imageUrl" icon="Delete" circle size="small" class="delete-btn"
                    @click.stop="avatarHandleDelete" />
                <el-icon v-else class="avatar-uploader-icon">
                    <Plus />
                </el-icon>
            </el-upload>
            <br /><br />
            <el-text class="mx-1">上传的头像应该裁剪成正方形的小图片</el-text><br /><br />
            <template #footer>
                <el-button @click="showAvatarDialog = false">取消</el-button>
                <el-button type="primary" @click="handleAvatarChange">确定</el-button>
            </template>
        </el-dialog>


        <!-- 手机号修改弹窗 -->
        <el-dialog :title="bindPhoneTitle" v-model="showPhoneDialog" :width="dialogWidth">
            <el-form :model="phoneForm" :rules="phoneRules" ref="phoneFormRef">
                <el-form-item v-if="phoneForm.modfiy">
                    <el-input v-model="phoneForm.oldPhone" disabled maxlength="11" />
                </el-form-item>
                <el-form-item v-if="phoneForm.modfiy">
                    <el-row :gutter="10" class="code-row">
                        <el-col :xs="16" :sm="16" :md="16" :lg="16">
                            <el-input v-model="phoneForm.oldCode" placeholder="旧手机验证码" />
                        </el-col>
                        <el-col :xs="8" :sm="8" :md="8" :lg="8">
                            <el-button type="primary" :disabled="sendingOldCode || !phoneForm.oldPhone"
                                @click="sendOldPhoneCode" class="code-button">
                                {{ sendingOldCode ? `${oldCountdown}s后重发` : '获取验证码' }}
                            </el-button>
                        </el-col>
                    </el-row>
                </el-form-item>

                <el-form-item prop="phone">
                    <el-input v-model="phoneForm.phone" placeholder="请输入新手机号" maxlength="11" />
                </el-form-item>
                <el-form-item prop="code">
                    <el-row :gutter="10" class="code-row">
                        <el-col :xs="16" :sm="16" :md="16" :lg="16">
                            <el-input v-model="phoneForm.code" placeholder="新手机验证码" />
                        </el-col>
                        <el-col :xs="8" :sm="8" :md="8" :lg="8">
                            <el-button type="primary" :disabled="sendingCode || !phoneForm.phone" @click="sendPhoneCode"
                                class="code-button">
                                {{ sendingCode ? `${countdown}s后重发` : '获取验证码' }}
                            </el-button>
                        </el-col>
                    </el-row>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showPhoneDialog = false">取消</el-button>
                <el-button type="primary" @click="handlePhoneChange">确定</el-button>
            </template>
        </el-dialog>

        <!-- 邮箱修改弹窗 -->
        <el-dialog :title="bindEmailTitle" v-model="showEmailDialog" :width="dialogWidth">
            <el-form :model="emailForm" :rules="emailRules" ref="emailFormRef">
                <el-form-item v-if="emailForm.modfiy">
                    <el-input v-model="emailForm.oldEmail" disabled />
                </el-form-item>
                <el-form-item v-if="emailForm.modfiy">
                    <el-row :gutter="10" class="code-row">
                        <el-col :xs="16" :sm="16" :md="16" :lg="16">
                            <el-input v-model="emailForm.oldCode" placeholder="旧邮箱验证码" />
                        </el-col>
                        <el-col :xs="8" :sm="8" :md="8" :lg="8">
                            <el-button type="primary" :disabled="sendingOldEmailCode || !emailForm.oldEmail"
                                @click="sendOldEmailCode" class="code-button">
                                {{ sendingOldEmailCode ? `${oldEmailCountdown}s后重发` : '获取验证码' }}
                            </el-button>
                        </el-col>
                    </el-row>
                </el-form-item>
                <el-form-item prop="email">
                    <el-input v-model="emailForm.email" placeholder="请输入新邮箱" />
                </el-form-item>
                <el-form-item prop="code">
                    <el-row :gutter="10" class="code-row">
                        <el-col :xs="16" :sm="16" :md="16" :lg="16">
                            <el-input v-model="emailForm.code" placeholder="新邮箱验证码" />
                        </el-col>
                        <el-col :xs="8" :sm="8" :md="8" :lg="8">
                            <el-button type="primary" :disabled="sendingEmailCode || !emailForm.email"
                                @click="sendEmailCode" class="code-button">
                                {{ sendingEmailCode ? `${emailCountdown}s后重发` : '获取验证码' }}
                            </el-button>
                        </el-col>
                    </el-row>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showEmailDialog = false">取消</el-button>
                <el-button type="primary" @click="handleEmailChange">确定</el-button>
            </template>
        </el-dialog>

        <!-- 密码修改弹窗 -->
        <el-dialog title="修改密码" v-model="showPasswordDialog" :width="dialogWidth">
            <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef">
                <el-form-item prop="oldPassword">
                    <el-input v-model="passwordForm.oldPassword" placeholder="请输入旧密码" type="password" />
                </el-form-item>
                <el-form-item prop="newPassword">
                    <el-input v-model="passwordForm.newPassword" placeholder="请输入新密码" type="password" />
                </el-form-item>
                <el-form-item prop="confirmPassword">
                    <el-input v-model="passwordForm.confirmPassword" placeholder="请确认新密码" type="password" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showPasswordDialog = false">取消</el-button>
                <el-button type="primary" @click="handlePasswordChange">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from "pinia"
import type { FormItemRule } from 'element-plus'
import { useUserInfoStore } from '@/stores/userinfo';
import { paxios } from "@/utils/paxios"
import type { UploadFile, UploadFiles } from 'element-plus'
import { useWebsitConfigStore } from '@/stores/websitConfig';
const userInfoStore = useUserInfoStore();
const { isLogin, userId, userName, userEmail, userPhone, userAvatar, openid } = storeToRefs(userInfoStore)
const { hasEmail, hasSms, hasWechat } = storeToRefs(useWebsitConfigStore());

const dialogWidth = ref('400px');


const imageUrl = ref('')
let imageFile: any = null;
const loading = ref(false);


// 定义处理窗口大小变化的函数
const handleResize = () => {
    if (window.innerWidth < 768) {
        dialogWidth.value = "92%";
    } else {
        dialogWidth.value = "400px";

    }
};
// 在组件挂载时添加监听器
onMounted(() => {
    // 初始化窗口尺寸
    handleResize();
    // 添加窗口大小变化监听器
    window.addEventListener('resize', handleResize);
});

function avatarHandleDelete() {
    imageUrl.value = '';
    imageFile = null;
}
function avatarHandChange(uploadFile: UploadFile, uploadFiles: UploadFiles) {
    if (uploadFile.raw) {
        //必须是图片
        if (!uploadFile.raw.type.startsWith('image/')) {
            ElMessage.error('请上传图片文件');
            return;
        }
        // 必须小于1M
        if (uploadFile.raw.size > 500 * 1024) {
            ElMessage.error('图片大小不能超过500K');
            return;
        }
        // 必须是正方形
        const img = new Image()
        // 图片加载完成后获取宽高
        img.onload = function () {
            console.log('图片宽度：', img.width); // 宽度（像素）
            console.log('图片高度：', img.height); // 高度（像素）
            if (img.width != img.height) {
                ElMessage.error('图片必须是正方形');
                URL.revokeObjectURL(imageUrl.value);
                imageUrl.value = '';
                imageFile = null;
                return;
            }

            // 释放临时URL资源（避免内存泄漏）
            URL.revokeObjectURL(imageUrl.value);
        };
        img.onerror = function () {
            console.error('图片加载失败，可能不是有效的图片文件');
            URL.revokeObjectURL(imageUrl.value); // 释放资源
            imageUrl.value = '';
            imageFile = null;
        };
        imageFile = uploadFile.raw;
        imageUrl.value = URL.createObjectURL(uploadFile.raw)
        img.src = imageUrl.value;
    } else {
        imageUrl.value = '';
        imageFile = null;
    }
}


// 弹窗控制变量
const showAvatarDialog = ref(false)
const showPhoneDialog = ref(false)
const showEmailDialog = ref(false)
const showPasswordDialog = ref(false)
const bindEmailTitle = ref('绑定邮箱');
const bindPhoneTitle = ref('绑定手机号');

// 头像选择
const selectedAvatar = ref(userAvatar.value)



// 手机号表单
const phoneForm = reactive({
    modfiy: false,
    oldPhone: userPhone.value,
    oldCode: '',
    phone: '',
    code: ''
})
const phoneFormRef = ref<InstanceType<typeof ElForm>>()
const phoneRules = {
    phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
    ],
    code: [
        { required: true, message: '请输入验证码', trigger: 'blur' },
        { min: 4, max: 6, message: '验证码长度为4-6位', trigger: 'blur' }
    ]
}

// 验证码相关
const sendingCode = ref(false)
const sendingOldCode = ref(false)
const countdown = ref(60)
const oldCountdown = ref(60)
let codeTimer: ReturnType<typeof setInterval> | null = null
let oldCodeTimer: ReturnType<typeof setInterval> | null = null

// 邮箱表单
const emailForm = reactive({
    modfiy: false,
    oldEmail: userEmail.value,
    oldCode: '',
    email: '',
    code: ''
})
const emailFormRef = ref<InstanceType<typeof ElForm>>()
const emailRules: Record<string, FormItemRule[]> = { // 保留此行不变
    email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email' as const, message: '请输入正确的邮箱格式', trigger: 'blur' }
    ],
    code: [
        { required: true, message: '请输入验证码', trigger: 'blur' },
        { min: 4, max: 6, message: '验证码长度为4-6位', trigger: 'blur' }
    ]
}

// 邮箱验证码相关
const sendingEmailCode = ref(false)
const sendingOldEmailCode = ref(false)
const emailCountdown = ref(60)
const oldEmailCountdown = ref(60)
let emailTimer: ReturnType<typeof setInterval> | null = null
let oldemailTimer: ReturnType<typeof setInterval> | null = null

// 密码表单
const passwordForm = reactive({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
})
const passwordFormRef = ref<InstanceType<typeof ElForm>>()
const passwordRules = {
    oldPassword: [
        { required: true, message: '请输入旧密码', trigger: 'blur' }
    ],
    newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, max: 32, message: '密码长度在6-32个字符之间', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请确认新密码', trigger: 'blur' },
        {
            validator: (rule: any, value: string, callback: any) => {
                if (value !== passwordForm.newPassword) {
                    callback(new Error('两次输入的密码不一致'))
                } else {
                    callback()
                }
            },
            trigger: 'blur'
        }
    ]
}

const sendOldPhoneCode = () => {
    // 简单验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phoneForm.oldPhone)) {
        ElMessage.error('请输入正确的手机号')
        return
    }

    sendingOldCode.value = true


    paxios.post('/index/sendSmsCode', { phone: phoneForm.oldPhone }).then(res => {
        if (res.data.code === 0) {
            ElMessage.success('验证码已发送，请注意查收');
        } else {
            ElMessage.error(res.data.msg);
        }
    }).catch(err => {
        ElMessage.error(err.message)
    })



    // 倒计时
    oldCodeTimer = setInterval(() => {
        oldCountdown.value--
        if (oldCountdown.value <= 0) {
            sendingOldCode.value = false
            oldCountdown.value = 60
            if (oldCodeTimer) clearInterval(oldCodeTimer)
        }
    }, 1000)
}

// 发送手机验证码
const sendPhoneCode = () => {
    // 简单验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phoneForm.phone)) {
        ElMessage.error('请输入正确的手机号')
        return
    }

    sendingCode.value = true

    paxios.post('/index/sendSmsCode', { phone: phoneForm.phone }).then(res => {
        if (res.data.code === 0) {
            ElMessage.success('验证码已发送，请注意查收');
        } else {
            ElMessage.error(res.data.msg);
        }
    }).catch(err => {
        ElMessage.error(err.message)
    })

    // 倒计时
    codeTimer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
            sendingCode.value = false
            countdown.value = 60
            if (codeTimer) clearInterval(codeTimer)
        }
    }, 1000)
}


const sendOldEmailCode = () => {
    // 简单验证邮箱格式
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailReg.test(emailForm.oldEmail)) {
        ElMessage.error('旧邮箱格式错误')
        return
    }
    sendingOldEmailCode.value = true
    // 模拟发送验证码
    paxios.post('/index/sendEmailCode', { email: emailForm.oldEmail, isReg: false }).then(res => {
        if (res.data.code == 0) {
            ElMessage.success('验证码发送成功');
        } else {
            ElMessage.error(res.data.msg);
        }
    }).catch(err => {
        ElMessage.error(err.message);
    })
    // 倒计时
    oldemailTimer = setInterval(() => {
        oldEmailCountdown.value--
        if (oldEmailCountdown.value <= 0) {
            sendingOldEmailCode.value = false
            oldEmailCountdown.value = 60
            if (oldemailTimer) clearInterval(oldemailTimer)
        }
    }, 1000)
}


// 发送邮箱验证码
const sendEmailCode = () => {
    // 简单验证邮箱格式
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailReg.test(emailForm.email)) {
        ElMessage.error('请输入正确的邮箱')
        return
    }

    sendingEmailCode.value = true

    // 模拟发送验证码
    paxios.post('/index/sendEmailCode', { email: emailForm.email, isReg: false }).then(res => {
        if (res.data.code == 0) {
            ElMessage.success('验证码发送成功');
        } else {
            ElMessage.error(res.data.msg);
        }
    }).catch(err => {
        ElMessage.error(err.message);
    })

    // 倒计时
    emailTimer = setInterval(() => {
        emailCountdown.value--
        if (emailCountdown.value <= 0) {
            sendingEmailCode.value = false
            emailCountdown.value = 60
            if (emailTimer) clearInterval(emailTimer)
        }
    }, 1000)
}

// 处理头像修改
const handleAvatarChange = () => {
    if (imageFile == null) {
        ElMessage.error('请选择图片');
        return;
    }
    const formData = new FormData();
    formData.append('avatar', imageFile);
    paxios.post("/console/changeAvatar", formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }).then(function (response) {
        if (response.data.code != 0) {
            ElMessage.error(response.data.msg)
        } else {
            ElMessage.success('头像修改成功');
            userAvatar.value = response.data.data.avatar;
            showAvatarDialog.value = false
        }
    })
        .catch(function (error) {
            alert("服务器异常，请稍后重试")
        });

}

// 处理手机号修改
const handlePhoneChange = async () => {
    if (phoneFormRef.value) {
        try {
            await phoneFormRef.value.validate()
            const res = await paxios.post("/console/changeMobile", { oldcode: phoneForm.oldCode, mobile: phoneForm.phone, code: phoneForm.code });
            if (res.data.code == 0) {
                showPhoneDialog.value = false
                ElMessage.success('手机号修改成功')
            userPhone.value = phoneForm.phone
                if (codeTimer) {
                clearInterval(codeTimer)
                sendingCode.value = false
                countdown.value = 60
            }
            if (oldCodeTimer) {
                clearInterval(oldCodeTimer)
                sendingOldCode.value = false
                oldCountdown.value = 60
            }
            } else {
                ElMessage.error(res.data.msg)
            }
            
        } catch (err) {
            ElMessage.error('提交失败')
        }
    }
}

// 处理邮箱修改
const handleEmailChange = async () => {
    if (emailFormRef.value) {
        try {
            await emailFormRef.value.validate()

            const res = await paxios.post("/console/changeEmail", { oldcode: emailForm.oldCode, email: emailForm.email, code: emailForm.code });
            if (res.data.code == 0) {
                showEmailDialog.value = false
                ElMessage.success('邮箱修改成功')
                userEmail.value = emailForm.email
                if (emailTimer) {
                    clearInterval(emailTimer)
                    sendingEmailCode.value = false
                    emailCountdown.value = 60
                }
                if (oldemailTimer) {
                    clearInterval(oldemailTimer)
                    sendingOldEmailCode.value = false
                    oldEmailCountdown.value = 60
                }
            } else {
                ElMessage.error(res.data.msg)
            }

        } catch (err) {
            ElMessage.error('提交失败')
        }
    }
}

// 处理密码修改
const handlePasswordChange = async () => {
    if (passwordFormRef.value) {
        await passwordFormRef.value.validate()

        paxios.post("/console/changePassword", { oldpwd: passwordForm.oldPassword, newpwd: passwordForm.newPassword }).then(function (response) {
            if (response.data.code != 0) {
                ElMessage.error(response.data.msg)
            } else {
                // 模拟验证旧密码
                showPasswordDialog.value = false
                ElMessage.success('密码修改成功')
                // 重置表单
                passwordForm.oldPassword = ''
                passwordForm.newPassword = ''
                passwordForm.confirmPassword = ''
            }
        })
            .catch(function (error) {
                alert("服务器异常，请稍后重试")
            });

    }
}

function bindEmail() {
    if (userEmail.value == "") {
        emailForm.modfiy = false
        emailForm.oldEmail = '';
        emailForm.oldCode = '';
        emailForm.email = '';
        emailForm.code = '';
        bindEmailTitle.value = "绑定邮箱"
    } else {
        emailForm.modfiy = true
        emailForm.oldEmail = userEmail.value;
        emailForm.oldCode = '';
        emailForm.email = '';
        emailForm.code = '';
        bindEmailTitle.value = "修改邮箱"
    }
    showEmailDialog.value = true
}

function bindPhone() {
    if (userPhone.value == "") {
        phoneForm.modfiy = false
        phoneForm.oldPhone = '';
        phoneForm.oldCode = '';
        phoneForm.phone = '';
        phoneForm.code = '';
        bindPhoneTitle.value = "绑定手机号"
    } else {
        phoneForm.modfiy = true
        phoneForm.oldPhone = userPhone.value;
        phoneForm.oldCode = '';
        phoneForm.phone = '';
        phoneForm.code = '';
        bindPhoneTitle.value = "修改手机号"
    }
    showPhoneDialog.value = true

}

// 组件卸载时清除定时器
onUnmounted(() => {
    if (codeTimer) clearInterval(codeTimer)
    if (oldCodeTimer) clearInterval(oldCodeTimer)
    if (emailTimer) clearInterval(emailTimer)
    if (oldemailTimer) clearInterval(oldemailTimer)
})
</script>

<style scoped>
.avatar-uploader .avatar {
    width: 178px;
    height: 178px;
    display: block;
}

.delete-btn {
    position: absolute;
    background-color: rgba(255, 255, 255, 0.8);
    border: 1px solid #eee;
    display: none;
}

.avatar-uploader:hover .delete-btn {
    display: block;
}


:deep(.avatar-uploader .el-upload) {
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
}

:deep(.avatar-uploader .el-upload:hover) {
    border-color: var(--el-color-primary);
}

:deep(.el-icon.avatar-uploader-icon) {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    text-align: center;
}

.user-center-container {
    min-height: 100vh;
    padding: 20px;
    background-color: #f5f7fa;
}

.user-profile-card {
    max-width: 800px;
    margin: 0 auto;
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.profile-header {
    padding: 20px 30px;
    border-bottom: 1px solid #f0f0f0;
}

.profile-header h2 {
    margin: 0;
    font-size: 18px;
    color: #333;
}

.profile-item {
    display: flex;
    padding: 20px 30px;
    border-bottom: 1px solid #f0f0f0;
    align-items: center;
}

.profile-item:last-child {
    border-bottom: none;
}

.item-label {
    width: 100px;
    font-size: 14px;
    color: #666;
}

.item-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.info-text {
    font-size: 14px;
    color: #333;
}

.avatar-container {
    display: flex;
    align-items: center;
    gap: 16px;
}

.current-avatar {
    border: 2px solid #eee;
    transition: all 0.3s;
}

.current-avatar:hover {
    transform: scale(1.05);
}

/* 验证码按钮样式 */
.code-row {
    width: 100%;
    box-sizing: border-box;
}

.code-button {
    width: 100%;
    padding: 0 8px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}

/* 响应式调整 */
@media (max-width: 768px) {
    .user-center-container {
        padding: 10px;
    }

    .profile-item {
        padding: 15px 16px;
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }

    .item-label {
        width: auto;
        margin-bottom: 5px;
    }

    .item-content {
        width: 100%;
    }

    .el-dialog__body {
        padding: 15px 15px !important;
    }
}

/* 极小屏幕适配 */
@media (max-width: 375px) {
    .code-row {
        flex-direction: column;
        gap: 10px !important;
    }

    .code-row .el-col {
        width: 100% !important;
        flex: none !important;
    }
}
</style>
