<template>

    <el-config-provider :locale="zhCn">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>提现记录</span>
                </div>
            </template>
            <div class="user-list-container">
                <div class="table-container">
                    <el-table :data="tableData" border stripe style="width: 100%" v-loading="loading"
                        :cell-style="{ 'padding': '8px 5px' }" :header-cell-style="{ 'padding': '10px 5px' }">
                        <el-table-column prop="create_time" label="申请时间" min-width="150" align="center"
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
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { paxios } from '@/utils/paxios';





// 定义分页类型
interface Pagination {
    currentPage: number;
    pageSize: number;
    total: number;
}



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

// 初始化页面时加载数据
onMounted(() => {
    fetchDataList();
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
    if(type == "alipay"){
        return "支付宝";
    }else if(type == "wechat"){
        return "微信手机号";
    }else {
        return type;
    }
}

// 获取用户列表数据
const fetchDataList = async () => {
    try {
        loading.value = true;
        let url = '/console/getWithdrawList'
        url += '?page=' + pagination.currentPage;
        url += '&limit=' + pagination.pageSize;
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