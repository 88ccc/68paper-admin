<template>
    <el-dialog v-model="dialogVisible" :title="dialogTitle" :width="dialogWidth" :modal="true"
        :close-on-click-modal="false">
        <!-- 弹窗内容 -->
        <el-form v-loading="dialogLoading" label-width="auto">
            <el-form-item label="验证方式：">
                <el-select v-model="form.type" placeholder="请选择" @change="handleChange" :disabled="typedisable">
                    <el-option v-for="item in verifyType" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="账号：">
                <el-input v-model="form.account" disabled></el-input>
            </el-form-item>
            <el-form-item label="验证码：">
                <el-row :gutter="10">
                    <el-col :span="16">
                        <el-input v-model="form.code" placeholder="请输入验证码" prefix-icon="Key" clearable></el-input>
                    </el-col>
                    <el-col :span="8">
                        <el-button type="default" class="send-code-btn" @click="sendCode" :disabled="codeDisabled">
                            {{ codeDisabled ? `${countDown}秒后重发` : '发送验证码' }}
                        </el-button>
                    </el-col>
                </el-row>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" v-show="action == 'show'" @click="toShowApiKey">显示KEY</el-button>
                <el-button @click="dialogVisible = false">取 消</el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
    <el-card v-loading="loading">
        <template #header>
            <div class="card-header">
                <span>检测卡秘钥</span>
            </div>
        </template>
        <div>
            用户ID&nbsp;&nbsp;:&nbsp;&nbsp;{{ userId }}<br /><br />
            用户密钥&nbsp;&nbsp;:&nbsp;&nbsp; *******<br /><br />
            接口网关&nbsp;&nbsp;:&nbsp;&nbsp; {{ apiUrl }}<br /><br />
        </div>
        <div style="margin-top: 35px;">
            <el-button type="primary" size="small" @click="showApiKey">显示</el-button>
            <el-button type="warning" size="small" @click="toRestApiKey">重置</el-button>
        </div>
        <template #footer>
            <el-alert title="注意事项" type="warning" :closable="false">
                1. 秘钥要保密，请勿外泄。如果你怀疑秘钥被泄露，请立即点击重置按钮，并重新生成新的秘钥。<br />
            </el-alert>
        </template>
    </el-card>
</template>
<script setup lang="ts">
import { paxios } from '@/utils/paxios';
import { ref, onMounted } from 'vue'
import { useUserInfoStore } from '@/stores/userinfo';
import { useWebsitConfigStore } from '@/stores/websitConfig'
import { storeToRefs } from "pinia"

let websitConfigStore = useWebsitConfigStore()
const { apiUrl } = storeToRefs(websitConfigStore)

const { userEmail, userPhone, userId } = useUserInfoStore()

const loading = ref(false)
const action = ref('')
const dialogWidth = ref('500px')
const codeDisabled = ref(false)
const countDown = ref(60)
const dialogVisible = ref(false)
const typedisable = ref(false)
const dialogTitle = ref('')
const dialogLoading = ref(false);
const form = ref({
    type: '',
    account: '',
    code: ''
})
const verifyType = ref<Array<{ label: string, value: string }>>([])

// 监听窗口大小变化，用于响应式调整
const handleResize = () => {
    dialogWidth.value = window.innerWidth <= 768 ? '92%' : '500px';
};


onMounted(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    if (userEmail != '') {
        verifyType.value.push({ label: '邮箱验证', value: 'email' });
    }
    if (userPhone != '') {
        verifyType.value.push({ label: '手机验证', value: 'phone' });
    }
})

function showApiKey() {
    form.value = {
        type: '',
        account: '',
        code: ''
    };
    action.value = 'show'
    dialogTitle.value = '显示用户密钥'
    typedisable.value = false
    dialogVisible.value = true
}

function toShowApiKey() {
    if (form.value.type != 'phone' && form.value.type != 'email') {
        ElMessage.warning('请选择验证方式')
        return
    }
    if (form.value.code == '') {
        ElMessage.warning('请输入验证码')
        return
    }
    dialogLoading.value = true;
    paxios.post("/console/getCardKey", { verifyType: form.value.type, code: form.value.code }).then(res => {
        if (res.data.code == 0) {
            ElMessageBox.alert(res.data.data.cardkey, '用户密钥', {
                confirmButtonText: '确认'
            })
        } else {
            ElMessage.error(res.data.msg)
        }
    }).catch(err => { ElMessage.error(err.message) }).finally(() => {
        dialogLoading.value = false;
    })
}

function toRestApiKey() {

    paxios.post("/console/resetCardKey").then(res => {
        if (res.data.code == 0) {
            dialogVisible.value = false
            ElMessage.success('重置成功')
        } else {
            ElMessage.error(res.data.msg)
        }
    }).catch(err => { ElMessage.error(err.message) })

}



function handleChange() {
    if (form.value.type == 'email') {
        form.value.account = userEmail
    } else if (form.value.type == 'phone') {
        form.value.account = userPhone
    }
}
//发送验证码
function sendCode() {
    // 开始倒计时
    if (form.value.type != 'phone' && form.value.type != 'email') {
        ElMessage.warning('请选择验证方式')
        return
    }
    codeDisabled.value = true;
    let timer = setInterval(() => {
        countDown.value--;
        if (countDown.value <= 0) {
            clearInterval(timer);
            countDown.value = 60;
            codeDisabled.value = false;
        }
    }, 1000);
    if (form.value.type === 'phone') {
        typedisable.value = true
        paxios.post('/index/sendSmsCode', { phone: userPhone }).then(res => {
            if (res.data.code == 0) {
                ElMessage.success('验证码发送成功');
            } else {
                ElMessage.error(res.data.msg);
            }
        }).catch(err => {
            ElMessage.error(err.message);
        })
    } else if (form.value.type === 'email') {
        typedisable.value = true
        paxios.post('/index/sendEmailCode', { email: userEmail, isReg: false }).then(res => {
            if (res.data.code == 0) {
                ElMessage.success('验证码发送成功');
            } else {
                ElMessage.error(res.data.msg);
            }
        }).catch(err => {
            ElMessage.error(err.message);
        })
    }
}

</script>