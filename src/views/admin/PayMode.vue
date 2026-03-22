<template>
    <el-config-provider :locale="zhCn">
        <el-dialog v-model="alipayVisible" :title="dialogTitle" :width="dialogWith" :close-on-click-modal="false">
            <el-form label-width="auto" :model="alipay" ref="alipayFormRef" v-loading="loading" :rules="alipayRules"
                style="margin-top: 25px;">
                <el-form-item label="模版名称" prop="name">
                    <el-input v-model="alipay.name" placeholder="自己随便取一个名字"></el-input>
                </el-form-item>
                <el-form-item label="APPID" prop="appId">
                    <el-input v-model="alipay.appId"></el-input>
                </el-form-item>
                <el-form-item label="加密方式" prop="encryptType">
                    <el-radio-group v-model="alipay.encryptType">
                        <el-radio value="RSA2">RSA2</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="应用私钥" prop="appSecretCert">
                    <el-input v-model="alipay.appSecretCert" :autosize="{ minRows: 4, maxRows: 8 }"
                        type="textarea"></el-input>
                </el-form-item>
                <el-form-item label="应用公钥证书" prop="appPublicKey">
                    <el-upload :limit="1" accept=".crt" :on-change="appPublicKeyChange"
                        v-model:file-list="appPublicKeyFileList" :auto-upload="false">
                        <template #trigger>
                            <el-button type="primary">点击上传<el-icon class="el-icon--right">
                                    <Upload />
                                </el-icon></el-button>
                        </template>
                        <template #tip>
                            <div class="el-upload__tip text-red">
                                请上传appCertPublicKey_xxx.crt
                            </div>
                        </template>
                    </el-upload>
                </el-form-item>
                <el-form-item label="支付宝公钥证书" prop="aliPublicKey">
                    <el-upload :limit="1" accept=".crt" :on-change="aliPublicKeyChange" :auto-upload="false">
                        <template #trigger>
                            <el-button type="primary">点击上传<el-icon class="el-icon--right">
                                    <Upload />
                                </el-icon></el-button>
                        </template>
                        <template #tip>
                            <div class="el-upload__tip text-red">
                                请上传alipayCertPublicKey_RSA2.crt
                            </div>
                        </template>
                    </el-upload>
                </el-form-item>
                <el-form-item label="支付宝根证书" prop="aliRootKey">
                    <el-upload :limit="1" accept=".crt" :on-change="aliRootKeyChange" :auto-upload="false">
                        <template #trigger>
                            <el-button type="primary">点击上传<el-icon class="el-icon--right">
                                    <Upload />
                                </el-icon></el-button>
                        </template>
                        <template #tip>
                            <div class="el-upload__tip text-red">
                                请上传alipayRootCert.crt
                            </div>
                        </template>
                    </el-upload>
                </el-form-item>
                <el-form-item>
                    <el-button @click="alipayVisible = false">取消</el-button>
                    <el-button type="primary" @click="aliPaySave">保存</el-button>
                </el-form-item>

            </el-form>
        </el-dialog>
        <el-dialog v-model="wechatVisible" :title="dialogTitle" :width="dialogWith" :close-on-click-modal="false">
            <el-form label-width="auto" :model="wxpay" ref="wxpayFormRef" v-loading="loading" :rules="wxpayRules"
                style="margin-top: 25px;">
                <el-form-item label="模版名称" prop="name">
                    <el-input v-model="wxpay.name" placeholder="自己随便取一个名字"></el-input>
                </el-form-item>
                <el-form-item label="APPID" prop="appId">
                    <el-input v-model="wxpay.appId"></el-input>
                </el-form-item>
                <el-form-item label="商户号" prop="mchId">
                    <el-input v-model="wxpay.mchId"></el-input>
                </el-form-item>
                <el-form-item label="商户秘钥" prop="mchSecretKey">
                    <el-input v-model="wxpay.mchSecretKey" placeholder="APIv3密钥32字节"></el-input>
                </el-form-item>
                <el-form-item label="商户私钥" prop="mchSecretCert">
                    <el-upload :limit="1" accept=".pem" :on-change="mchSecretCertChange" :auto-upload="false">
                        <template #trigger>
                            <el-button type="primary">点击上传<el-icon class="el-icon--right">
                                    <Upload />
                                </el-icon></el-button>
                        </template>
                        <template #tip>
                            <div class="el-upload__tip text-red">
                                请上传apiclient_key.pem
                            </div>
                        </template>
                    </el-upload>
                </el-form-item>
                <el-form-item label="商户公钥" prop="mchPublicCert">
                    <el-upload :limit="1" accept=".pem" :on-change="mchPublicCertChange" :auto-upload="false">
                        <template #trigger>
                            <el-button type="primary">点击上传<el-icon class="el-icon--right">
                                    <Upload />
                                </el-icon></el-button>
                        </template>
                        <template #tip>
                            <div class="el-upload__tip text-red">
                                请上传apiclient_cert.pem
                            </div>
                        </template>
                    </el-upload>
                </el-form-item>
                <el-form-item>
                    <el-button @click="alipayVisible = false">取消</el-button>
                    <el-button type="primary" @click="wxPaySave">保存</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>支付模板</span>
                </div>
            </template>
            <div>
                <el-button @click="showAlipay" type="primary">新增支付宝模板</el-button>
                <el-button @click="shwoWxpay" type="success">新增微信支付模板</el-button>
            </div>
            <el-table :data="tableData" border v-loading="tableLoading" style="margin-top: 20px;">
                <el-table-column prop="name" label="模版名称" align="center" min-width="100" />
                <el-table-column label="支付类型" align="center" min-width="100">
                    <template #default="scope">
                        {{ payTypeZh(scope.row.type) }}
                    </template>
                </el-table-column>
                <el-table-column prop="appid" align="center" label="APPID" min-width="120" />
                <el-table-column label="操作" align="center" width="140">

                    <template #default="scope">
                        <el-button type="danger" @click="deletePay(scope.row)" size="small">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination-wrap">
                <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[5, 10, 20]"
                    :total="totalRecords" layout="total, sizes, prev, pager, next" @size-change="handlePageSizeChange"
                    @current-change="handlePageChange" :disabled="loading" />
            </div>
        </el-card>
    </el-config-provider>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { FormInstance, UploadUserFile, FormRules, UploadFile, UploadFiles, UploadStatus } from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { paxios } from '@/utils/paxios';

const alipayVisible = ref(false)
const wechatVisible = ref(false)
const loading = ref(false)
const dialogWith = ref('600px');
const dialogTitle = ref('新增支付宝模版')
const appPublicKeyFileList = ref<UploadUserFile[]>([])

const alipayFormRef = ref<FormInstance>()
const wxpayFormRef = ref<FormInstance>()

const tableData = ref([])
const tableLoading = ref(false)
// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const totalRecords = ref(0) // 总记录数

const alipay = ref({
    id: 0,
    name: '',
    appId: '',
    encryptType: 'RSA2',
    appSecretCert: '',
    appPublicKey: null as File | null,
    aliPublicKey: null as File | null,
    aliRootKey: null as File | null
})

const wxpay = ref({
    id: 0,
    name: '',
    appId: '',
    mchId: '',
    mchSecretKey: '',
    mchSecretCert: null as File | null,
    mchPublicCert: null as File | null
})

const wxpayRules = reactive<FormRules>({
    name: [
        { required: true, message: '请输入模版名称', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    appId: [
        { required: true, message: '请输入APPID', trigger: 'blur' },
    ],
    mchId: [
        { required: true, message: '请输入商户号', trigger: 'blur' },
    ],
    mchSecretKey: [
        { required: true, message: '请输入商户秘钥', trigger: 'blur' },
    ],
    mchSecretCert: [
        { required: true, message: '请上传商户私钥', trigger: 'blur' },
    ],
    mchPublicCert: [
        { required: true, message: '请上传商户公钥证书', trigger: 'blur' },
    ]
})


const alipayRules = reactive<FormRules>({
    name: [
        { required: true, message: '请输入模版名称', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    appId: [
        { required: true, message: '请输入APPID', trigger: 'blur' },
    ],
    encryptType: [
        { required: true, message: '请选择加密方式', trigger: 'blur' },
    ],
    appSecretCert: [
        { required: true, message: '请输入应用私钥', trigger: 'blur' },
    ],
    appPublicKey: [
        { required: true, message: '请上传应用公钥证书', trigger: 'blur' },
    ],
    aliPublicKey: [
        { required: true, message: '请上传支付宝公钥证书', trigger: 'blur' },
    ],
    aliRootKey: [
        { required: true, message: '请上传支付宝根证书', trigger: 'blur' },
    ]
})


function payTypeZh(type: string) {
    if (type == 'alipay') {
        return '支付宝'
    } else if (type == 'wxpay') {
        return '微信'
    } else {
        return '未知'
    }
}

function toDelPay(payid: number){
    tableLoading.value = true
    paxios.post("/manage/deletePayMode",{id:payid}).then(res => {
        if(res.data.code == 0){
            ElMessage.success(res.data.msg)
            getData()
        }else{
            ElMessage.error(res.data.msg)
            tableLoading.value = false
        }
    }).catch(function (error) {
        ElMessage.error("服务器异常，请稍后重试")
        tableLoading.value = false
    })
}

function deletePay(pay: any) {
    ElMessageBox.confirm(
    '确定要删除这个支付模版吗?',
    '警告',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
        toDelPay(pay.id)
    })
    .catch(() => {
    })
}

function getData() {
    tableLoading.value = true
    let url = "/manage/getPayMode?page=" + currentPage.value + "&limit=" + pageSize.value;

    paxios.get(url).then(function (response) {
        if (response.data.code != 0) {
            ElMessage.error(response.data.msg)
        } else {
            tableData.value = response.data.data
            totalRecords.value = response.data.count
        }
    })
        .catch(function (error) {
            alert("服务器异常，请稍后重试")
        }).finally(() => {
            tableLoading.value = false
        })
}

function handlePageSizeChange(val: number) {
    pageSize.value = val
    getData()
}

function handlePageChange(val: number) {
    currentPage.value = val
    getData()
}


function mchPublicCertChange(uploadFile: UploadFile, uploadFiles: UploadFiles) {
    if (uploadFile.raw) {
        let name = uploadFile.raw.name;
        if (name.endsWith('.pem')) {
            wxpay.value.mchPublicCert = uploadFile.raw;
        } else {
            ElMessage.error('请上传crt文件');
            wxpay.value.mchPublicCert = null;
        }
    }
}

function mchSecretCertChange(uploadFile: UploadFile, uploadFiles: UploadFiles) {
    if (uploadFile.raw) {
        let name = uploadFile.raw.name;
        if (name.endsWith('.pem')) {
            wxpay.value.mchSecretCert = uploadFile.raw;
        } else {
            ElMessage.error('请上传crt文件');
            wxpay.value.mchSecretCert = null;
        }
    }
}

function aliRootKeyChange(uploadFile: UploadFile, uploadFiles: UploadFiles) {
    if (uploadFile.raw) {
        let name = uploadFile.raw.name;
        if (name.endsWith('.crt')) {
            alipay.value.aliRootKey = uploadFile.raw;
        } else {
            ElMessage.error('请上传crt文件');
            alipay.value.appPublicKey = null;
        }
    }
}

function aliPublicKeyChange(uploadFile: UploadFile, uploadFiles: UploadFiles) {
    if (uploadFile.raw) {
        let name = uploadFile.raw.name;
        if (name.endsWith('.crt')) {
            alipay.value.aliPublicKey = uploadFile.raw;
        } else {
            ElMessage.error('请上传crt文件');
            alipay.value.appPublicKey = null;
        }
    }
}

function appPublicKeyChange(uploadFile: UploadFile, uploadFiles: UploadFiles) {
    if (uploadFile.raw) {
        let name = uploadFile.raw.name;
        if (name.endsWith('.crt')) {
            alipay.value.appPublicKey = uploadFile.raw;
        } else {
            ElMessage.error('请上传crt文件');
            alipay.value.appPublicKey = null;
        }
    }
}




async function wxPaySave() {
    try {
        await wxpayFormRef.value?.validate()

        const formData = new FormData();
        formData.append('id', wxpay.value.id.toString());
        formData.append('name', wxpay.value.name);
        formData.append('type', 'wxpay');
        formData.append('appId', wxpay.value.appId);
        formData.append('mchId', wxpay.value.mchId);
        formData.append('mchSecretKey', wxpay.value.mchSecretKey);
        if (wxpay.value.mchSecretCert) {
            formData.append('mchSecretCert', wxpay.value.mchSecretCert);
        } else {
            ElMessage.error('请上传商户私钥');
            return
        }
        if (wxpay.value.mchPublicCert) {
            formData.append('mchPublicCert', wxpay.value.mchPublicCert);
        } else {
            ElMessage.error('请上传商户公钥证书');
            return
        }
        loading.value = true
        const res = await paxios.post("/manage/setPayMode", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        if (res.data.code == 0) {
            ElMessage.success(res.data.msg);
            wechatVisible.value = false
            getData()
        } else {
            ElMessage.error(res.data.msg);
        }
        loading.value = false
    } catch (e) {
        loading.value = false
        return
    }
}

async function aliPaySave() {
    //检查数据
    try {
        await alipayFormRef.value?.validate()
        const formData = new FormData();
        formData.append('id', alipay.value.id.toString());
        formData.append('name', alipay.value.name);
        formData.append('type', 'alipay');
        formData.append('appId', alipay.value.appId);
        formData.append('encryptType', alipay.value.encryptType);
        formData.append('appSecretCert', alipay.value.appSecretCert);
        if (alipay.value.appPublicKey) {
            formData.append('appPublicKey', alipay.value.appPublicKey);
        } else {
            ElMessage.error('请上传应用公钥证书');
            return
        }
        if (alipay.value.aliPublicKey) {
            formData.append('aliPublicKey', alipay.value.aliPublicKey);
        } else {
            ElMessage.error('请上传支付宝公钥证书');
            return
        }
        if (alipay.value.aliRootKey) {
            formData.append('aliRootKey', alipay.value.aliRootKey);
        } else {
            ElMessage.error('请上传支付宝根证书');
            return
        }
        loading.value = true
        const res = await paxios.post("/manage/setPayMode", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        if (res.data.code == 0) {
            ElMessage.success(res.data.msg);
            alipayVisible.value = false
            getData()
        } else {
            ElMessage.error(res.data.msg);
        }
        loading.value = false

    } catch (error) {
        loading.value = false
        return
    }

}


// 监听窗口大小变化
const handleResize = () => {
    // 屏幕宽度小于768px时自动隐藏侧边栏
    dialogWith.value = window.innerWidth < 768 ? '95%' : '600px'
}

onMounted(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    getData()
})

function showAlipay() {
    wechatVisible.value = false
    dialogTitle.value = "新增支付宝模版"
    alipayVisible.value = true
    loading.value = false
    alipay.value = {
        id: 0,
        name: '',
        appId: '',
        encryptType: 'RSA2',
        appSecretCert: '',
        appPublicKey: null as File | null,
        aliPublicKey: null as File | null,
        aliRootKey: null as File | null
    }
}

function shwoWxpay() {
    alipayVisible.value = false
    dialogTitle.value = "新增微信模版"
    wechatVisible.value = true
    loading.value = false
    wxpay.value = {
        id: 0,
        name: '',
        appId: '',
        mchId: '',
        mchSecretKey: '',
        mchSecretCert: null as File | null,
        mchPublicCert: null as File | null
    }
}
</script>
<style lang="css" scoped>
/* 分页样式 */
.pagination-wrap {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding-top: 10px;
}

/* 响应式调整 */
@media (max-width: 768px) {
    .pagination-wrap {
        justify-content: center;
        padding: 10px 0 5px;
    }
}
</style>