<template>
    <el-config-provider :locale="zhCn">
        <div style="text-align: center;font-size: large;">
            <h1>用户积分记录</h1>
        </div>
        <div class="user-list-container">

            <div class="search-bar">
                <el-row :gutter="16">
                    <!-- 响应式配置：大屏幕6列，平板8列，手机12列（占满整行） -->
                    <el-col :xs="12" :sm="8" :lg="6">
                        <el-input v-model="searchForm.userId" placeholder="请输入用户ID" clearable class="search-input" />
                    </el-col>
                    <el-col :xs="12" :sm="8" :lg="6">
                        <el-input v-model="searchForm.businessNo" placeholder="业务单号" clearable class="search-input" />
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
                    <el-table-column prop="user_id" label="用户ID" min-width="80" align="center" />
                    <el-table-column prop="create_time" label="发生时间" min-width="150" align="center"
                        :show-overflow-tooltip="true" />
                    <el-table-column label="变更前" min-width="140" align="center" :show-overflow-tooltip="true">
                        <template #default="scope">
                            <span>{{ scope.row.before_balance / 100 }}元</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="变更金额" min-width="140" align="center" :show-overflow-tooltip="true">
                        <template #default="scope">
                            <span>{{ scope.row.change_amount / 100 }}元</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="变更后余额" min-width="140" align="center" :show-overflow-tooltip="true">
                        <template #default="scope">
                            <span>{{ scope.row.after_balance / 100 }}元</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="类型" min-width="140" align="center" :show-overflow-tooltip="true">
                        <template #default="scope">
                            <span>{{ changeTypeZh(scope.row.change_type) }}</span>
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
    </el-config-provider>
</template>

<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { ref, reactive, onMounted } from 'vue';
import { Search } from '@element-plus/icons-vue';  // 引入搜索图标
import { paxios } from '@/utils/paxios';



// 定义搜索表单类型
interface SearchForm {
    userId: string;
    businessNo: string;
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
    businessNo: '',
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
            return '其他';
        default:
            return '未知';
    }
}


// 初始化页面时加载数据
onMounted(() => {

    fetchUserList();
});

// 获取用户列表数据
const fetchUserList = async () => {
    try {
        loading.value = true;
        let url = '/manage/getPointsData'
        let flag = false;
        if (searchForm.userId) {
            if (flag) {
                url += '&userid=' + searchForm.userId;
            } else {
                url += '?userid=' + searchForm.userId;
                flag = true;
            }
        }
        if (searchForm.businessNo) {
            if (flag) {
                url += '&bid=' + searchForm.businessNo;
            } else {
                url += '?bid=' + searchForm.businessNo;
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
        ElMessage.error('获取列表失败');
        console.error('获取列表错误:', error);
    } finally {
        loading.value = false;
    }
};

// 搜索按钮点击事件
const handleSearch = () => {
    // 重置页码为1
    pagination.currentPage = 1;
    fetchUserList();
};

// 分页大小改变事件
const handleSizeChange = (size: number) => {
    pagination.pageSize = size;
    fetchUserList();
};

// 当前页码改变事件
const handleCurrentChange = (page: number) => {
    pagination.currentPage = page;
    fetchUserList();
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