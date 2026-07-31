<template>

    <el-config-provider :locale="zhCn">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>积分记录</span>
                </div>
            </template>
            <div class="user-list-container">
            <div class="search-bar">
                <el-row :gutter="16">
                    <!-- 响应式配置：大屏幕6列，平板8列，手机12列（占满整行） -->
                    <el-col :xs="12" :sm="8" :lg="6">
                        <el-input v-model="searchForm.oid" placeholder="输入订单号" clearable class="search-input" />
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
                    <el-table-column prop="create_time" label="发生时间" min-width="140" align="center"
                    :show-overflow-tooltip="true" />
                    <el-table-column label="变更前" min-width="140" align="center" :show-overflow-tooltip="true">
                        <template #default="scope">
                            <span >{{ scope.row.before_balance/100 }}元</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="变更金额" min-width="140" align="center" :show-overflow-tooltip="true">
                        <template #default="scope">
                            <span >{{ scope.row.change_amount/100 }}元</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="变更后余额" min-width="140" align="center" :show-overflow-tooltip="true">
                        <template #default="scope">
                            <span >{{ scope.row.after_balance/100 }}元</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="类型" min-width="140" align="center" :show-overflow-tooltip="true">
                        <template #default="scope">
                            <span >{{changeTypeZh(scope.row.change_type) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="business_no" label="订单号" min-width="140" align="center"
                    :show-overflow-tooltip="true" />
                    <el-table-column prop="remark" label="备注" min-width="140" align="center"
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
import { Search } from '@element-plus/icons-vue';  // 引入搜索图标
import { paxios } from '@/utils/paxios';



// 定义搜索表单类型
interface SearchForm {
    oid: string;
}

// 定义分页类型
interface Pagination {
    currentPage: number;
    pageSize: number;
    total: number;
}

// 搜索表单数据
const searchForm = reactive<SearchForm>({
    oid: ''
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

// 初始化页面时加载数据
onMounted(() => {
    fetchDataList();
});

function changeTypeZh(type: number) {
    switch (type) {
        case 1:
            return '充值';
        case 2:
            return '消费';
        case 3:
            return '退款';
        case 4:
            return '赠送';
        case 5:
            return '提现';
        case 6:
            return '转账收入';
        case 7:
            return '转账支出';
        case 8:
            return '系统调整';
        case 9:
            return '其他';
        default:
            return '未知';
    }
}

// 获取用户列表数据
const fetchDataList = async () => {
    try {
        loading.value = true;
        let url = '/console/getPointsList'
        let flag = false;
        if (searchForm.oid) {
            if (flag) {
                url += '&oid=' + searchForm.oid;
            } else {
                url += '?oid=' + searchForm.oid;
                flag = true;
            }
        }
       

        if (flag) {
            url += '&page=' + pagination.currentPage;
        } else {
            url += '?page=' + pagination.currentPage;
            flag = true;
        }

        if (flag) {
            url += '&limit=' + pagination.pageSize;
        } else {
            url += '?limit=' + pagination.pageSize;
            flag = true;
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