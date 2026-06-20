<template>

    <el-config-provider :locale="zhCn">
        <el-dialog v-model="dialogVisible" title="提现处理" :width="dialogWidth" :close-on-click-modal="false" show-close>
            <div v-loading="dialogLoading">
                <el-alert style="margin-bottom: 15px;" :title="msgstr" :type="msgtype" :closable="false" />
                <el-form label-width="85px">
                    <el-form-item label="代理ID:">
                        <el-input v-model="handleUserid" type="txt" disabled />
                    </el-form-item>
                    <el-form-item label="代理姓名:">
                        <el-input v-model="handleName" type="txt" disabled />
                    </el-form-item>
                    <el-form-item label="提现金额:">
                        <el-input v-model="handleMoney" type="txt" disabled>
                            <template #append>元</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="账号类型:">
                        <el-input v-model="handleAccountType" type="txt" disabled />
                    </el-form-item>
                    <el-form-item label="账号:">
                        <el-input v-model="handleAccount" type="txt" disabled />
                    </el-form-item>
                    <el-form-item label="手续费:">
                        <el-input v-model="handleCharge" type="number" >
                            <template #append>元</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="实际到账:">
                        <el-input v-model="handleAmount" type="number" disabled >
                            <template #append>元</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="状态:">
                        <el-select v-model="handleStatus" placeholder="请选择状态" style="width: 240px"
                            class="search-select">
                            <el-option label="待处理" :value="1" />
                            <el-option label="提现成功" :value="2" />
                            <el-option label="提现失败" :value="2" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="备注:">
                        <el-input v-model="handleRemark" :autosize="{ minRows: 4, maxRows: 8 }" type="textarea" />
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="withdrawSubmit" type="primary">提交</el-button>
                        <el-button @click="dialogVisible = false" type="info">取消</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </el-dialog>
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>提现记录</span>
                </div>
            </template>
            <div class="user-list-container">
                <div class="search-bar">
                    <el-row :gutter="16">
                        <!-- 响应式配置：大屏幕6列，平板8列，手机12列（占满整行） -->
                        <el-col :xs="12" :sm="8" :lg="6">
                            <el-input v-model="searchForm.userId" placeholder="请输入用户ID" clearable
                                class="search-input" />
                        </el-col>

                        <el-col :xs="12" :sm="8" :lg="4">
                            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable class="search-select">
                                <el-option label="待处理" value="1" />
                                <el-option label="提现成功" value="2" />
                                <el-option label="提现失败" value="2" />
                            </el-select>
                        </el-col>
                        <el-col :xs="6" :sm="8" :lg="2">
                            <el-button type="primary" @click="handleSearch" class="search-btn">
                                <el-icon>
                                    <Search />
                                </el-icon>
                                <span>搜索</span>
                            </el-button>
                        </el-col>
                    </el-row>
                </div>
                <div class="table-container">
                    <el-table :data="tableData" border stripe style="width: 100%" v-loading="loading"
                        :cell-style="{ 'padding': '8px 5px' }" :header-cell-style="{ 'padding': '10px 5px' }">
                        <el-table-column prop="create_time" label="发生时间" min-width="150" align="center"
                            :show-overflow-tooltip="true" />
                        <el-table-column label="提现金额" min-width="100" align="center" :show-overflow-tooltip="true">
                            <template #default="scope">
                                <span>{{ scope.row.money / 100 }}元</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="账户类型" min-width="100" align="center" :show-overflow-tooltip="true">
                            <template #default="scope">
                                <span>{{ accountTypeZh(scope.row.account_type) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="账号" min-width="100" align="center" :show-overflow-tooltip="true">
                            <template #default="scope">
                                <span>{{ scope.row.account }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="转账时间" min-width="150" align="center" :show-overflow-tooltip="true">
                            <template #default="scope">
                                <span v-if="scope.row.status != 1">{{ scope.row.do_time }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="实际到账" min-width="100" align="center" :show-overflow-tooltip="true">
                            <template #default="scope">
                                <span v-if="scope.row.status != 1">{{ scope.row.amount / 100 }}元</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="手续费" min-width="100" align="center" :show-overflow-tooltip="true">
                            <template #default="scope">
                                <span v-if="scope.row.status != 1">{{ scope.row.charge / 100 }}元</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="状态" min-width="100" align="center" :show-overflow-tooltip="true">
                            <template #default="scope">
                                <span>{{ statusZh(scope.row.status) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="remark" label="备注" min-width="100" align="center"
                            :show-overflow-tooltip="true" />
                        <el-table-column label="操作" min-width="100" align="center">
                            <template #default="scope">
                                <el-button v-if="scope.row.status == 1" type="primary" text size="small"
                                    @click="handleWithdraw(scope.row)">
                                    处理
                                </el-button>
                            </template>
                        </el-table-column>


                    </el-table>
                </div>

                <div class="pagination-container">
                    <el-pagination :pager-count="5" v-model:current-page="pagination.currentPage"
                        v-model:page-size="pagination.pageSize" :page-sizes="[10, 20, 50]" :total="pagination.total"
                        layout="total, sizes, prev, pager, next" @size-change="handleSizeChange"
                        @current-change="handleCurrentChange" />
                </div>
            </div>
        </el-card>

    </el-config-provider>
</template>

<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { paxios } from '@/utils/paxios';

interface SearchForm {
    userId: string;
    status: string;
}



// 定义分页类型
interface Pagination {
    currentPage: number;
    pageSize: number;
    total: number;
}

// 搜索表单数据
const searchForm = reactive<SearchForm>({
    userId: '',
    status: ''
});

// 表格数据
const tableData = ref<any[]>([]);

// 加载状态
const loading = ref<boolean>(false);

// 分页数据
const pagination = reactive<Pagination>({
    currentPage: 1,
    pageSize: 10,
    total: 0
});

const dialogVisible = ref(false);
const withdrawConfig = ref();
const dialogWidth = ref('600px')
const dialogLoading = ref(false)
const handleid = ref("");
const handleUserid = ref(0);
const handleName = ref('');
const handleMoney = ref(0.0)
const handleAccountType = ref("")
const handleAccount = ref("")
const handleCharge = ref(0.0);
const handleAmount = computed(() => {
    return handleMoney.value - handleCharge.value;
});
const handleStatus = ref(0);
const handleRemark = ref("");
const msgtype = ref("")
const msgstr = ref("")



const handleResize = () => {
    if (window.innerWidth < 768) {
        dialogWidth.value = "92%";
    } else {
        dialogWidth.value = "600px";

    }
};

// 初始化页面时加载数据
onMounted(async () => {
    handleResize();
    window.addEventListener('resize', handleResize);
    fetchDataList();
    let res = await paxios.get("/index/getWithdrawConfig");
    if (res.data.code == 0) {
        withdrawConfig.value = res.data.data;
    }
});
onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
});

function statusZh(status: number) {
    switch (status) {
        case 1:
            return '等待处理';
        case 2:
            return '提现成功';
        case 3:
            return '提现失败';
        default:
            return '未知';
    }
}

function accountTypeZh(type: string) {
    if (type == "alipay") {
        return "支付宝";
    } else if (type == "wechat") {
        return "微信手机号";
    } else {
        return type;
    }
}

// 获取用户列表数据
const fetchDataList = async () => {
    try {
        loading.value = true;
        let url = '/manage/getWithdrawList'
        url += '?page=' + pagination.currentPage;
        url += '&limit=' + pagination.pageSize;
        if (searchForm.userId) {
            url += '&userid=' + searchForm.userId;
        }
        if (searchForm.status) {
            url += '&status=' + searchForm.status;
        }
        const res = await paxios.get(url);
        if (res.data.code === 0) {
            tableData.value = res.data.data;
            pagination.total = res.data.count;
        } else {
            ElMessage.error(res.data.msg);
        }
    } catch (error) {
        ElMessage.error('获取记录失败');
        console.error('获取记录错误:', error);
    } finally {
        loading.value = false;
    }
};

// 搜索按钮点击事件
const handleSearch = () => {
    // 重置页码为1
    pagination.currentPage = 1;
    fetchDataList();
};

// 分页大小改变事件
const handleSizeChange = (size: number) => {
    pagination.pageSize = size;
    fetchDataList();
};

// 当前页码改变事件
const handleCurrentChange = (page: number) => {
    pagination.currentPage = page;
    fetchDataList();
};

async function handleWithdraw(data: any) {
    handleid.value = data.id;
    handleUserid.value = data.userid;
    handleName.value = data.name;
    handleMoney.value = data.money / 100;
    handleAccountType.value = accountTypeZh(data.account_type);
    handleAccount.value = data.account;
    //计算手续费
    if (withdrawConfig.value.charge) {
        let num = data.money * withdrawConfig.value.charge / 100;
        handleCharge.value = parseFloat(num.toFixed(2));
    } else {
        handleCharge.value = 0.0;
    }
    handleRemark.value = data.remark;
    handleStatus.value = data.status;
    dialogVisible.value = true;
    dialogLoading.value = true;
    let res = await paxios.post("/manage/getWithdrawInfo", { userid: data.userid });
    if (res.data.code == 0) {
        if (data.money > res.data.data.balance) {
            msgtype.value = "error"
            msgstr.value = "该用户账户余额不足，余额：" + res.data.data.balance / 100 + "元";
            return;
        } else {
            msgtype.value = "success"
            msgstr.value = "该用户余额充足，余额：" + res.data.data.balance / 100 + "元";
        }
    }
    dialogLoading.value = false;
}

async function withdrawSubmit() {
    const parts =  handleCharge.value.toString().split(".");
    if (parts[1] && parts[1].length > 2) {
        ElMessage.error("手续费最多两位小数");
        return;
    }
    dialogLoading.value = true;
    let res = await paxios.post("/manage/withdrawHandle", {
        id: handleid.value,
        userid: handleUserid.value,
        charge: handleCharge.value * 100,
        amount: handleAmount.value * 100,
        status: handleStatus.value,
        remark: handleRemark.value,
    });
    if (res.data.code == 0) {
        ElMessage.success("提现成功");
        dialogVisible.value = false;
        fetchDataList();
    } else {
        ElMessage.error(res.data.msg);
    }
    dialogLoading.value = false;
}

</script>

<style scoped>
.user-list-container {
    padding: 16px;
    background-color: #fff;
    min-height: 100vh;
    box-sizing: border-box;
    /* 确保padding不会增加总宽度 */
}

.search-bar {
    margin-bottom: 16px;
    padding: 12px;
    background-color: #f5f7fa;
    border-radius: 4px;
}

/* 搜索输入框样式优化 */
.search-input,
.search-select {
    width: 100%;
    margin-bottom: 8px;
    /* 小屏幕上增加垂直间距 */
}

/* 适配小屏幕的搜索按钮 */
.search-btn {
    width: 100%;
    margin-bottom: 8px;
}

.table-container {
    margin-bottom: 16px;
    overflow-x: auto;
    /* 表格在小屏幕上可横向滚动 */
}

.pagination-container {
    text-align: right;
    padding-top: 8px;
}

/* 针对不同屏幕尺寸的额外调整 */
@media (max-width: 767px) {
    .user-list-container {
        padding: 8px;
    }

    .search-bar {
        padding: 8px;
    }
}
</style>