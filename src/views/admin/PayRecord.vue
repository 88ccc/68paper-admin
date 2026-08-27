<template>
    <el-config-provider :locale="zhCn">
        <div style="text-align: center;font-size: large;">
            <h1>支付记录</h1>
        </div>
        <div class="user-list-container">
            <div class="search-bar">
                <el-row :gutter="16">
                    <!-- 响应式配置：大屏幕6列，平板8列，手机12列（占满整行） -->
                    <el-col :xs="12" :sm="8" :lg="6">
                        <el-input v-model="searchForm.userId" placeholder="请输入用户ID" clearable class="search-input" />
                    </el-col>
                    <el-col :xs="12" :sm="8" :lg="6">
                        <el-input v-model="searchForm.payid" placeholder="支付单号" clearable class="search-input" />
                    </el-col>
                    <el-col :xs="12" :sm="8" :lg="6">
                        <el-select v-model="searchForm.scene" placeholder="请选择场景" clearable class="search-select">
                            <el-option label="销售产品" value="1" />
                            <el-option label="积分充值" value="2" />
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
                    <el-table-column prop="userid" label="用户ID" min-width="80" align="center" />
                    <el-table-column prop="id" label="支付单号" min-width="120" align="center" />
                     <el-table-column label="场景" min-width="100" align="center" :show-overflow-tooltip="true">
                        <template #default="scope">
                            <span>{{ paySceneStr(scope.row.scene) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="支付方式" min-width="120" align="center" :show-overflow-tooltip="true">
                        <template #default="scope">
                            <span>{{ paymethodStr(scope.row.method) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="subject" label="商品名称" min-width="140" align="center"
                        :show-overflow-tooltip="true" />
                    <el-table-column label="金额" min-width="120" align="center" :show-overflow-tooltip="true">
                        <template #default="scope">
                            <span>{{ scope.row.price }}元</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="状态" min-width="100" align="center" :show-overflow-tooltip="true">
                        <template #default="scope">
                            <span :class="{
                                'text-red': scope.row.status === 2 || scope.row.status === 3,
                                'text-blue': scope.row.status === 1
                            }">
                                {{ statusStr(scope.row.status) }}
                            </span>
                        </template>
                    </el-table-column>

                    <el-table-column prop="tips" label="备注" min-width="120" align="center"
                        :show-overflow-tooltip="true" />
                    <el-table-column prop="create_time" label="创建时间" min-width="150" align="center"
                        :show-overflow-tooltip="true" />
                    <el-table-column prop="update_time" label="更新时间" min-width="150" align="center"
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
    payid: string;
    scene:string;
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
    payid: '',
    scene:''
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

function paymethodStr(method: string) {
    if (method == "alipay") {
        return "支付宝";
    } else if (method == "wechat") {
        return "微信支付";
    }
    return method;
}

function paySceneStr(scene:number){
 switch (scene) {
        case 1:
            return '销售产品';
        case 2:
            return '积分充值';
        default:
            return '未知';
    }
}

function statusStr(type: number) {
    switch (type) {
        case 0:
            return '待支付';
        case 1:
            return '已支付';
        case 2:
            return '支付失败';
        case 3:
            return '已退款';
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
        let url = '/manage/getPayRecordData'
        let flag = false;
        if (searchForm.userId) {
            if (flag) {
                url += '&userid=' + searchForm.userId;
            } else {
                url += '?userid=' + searchForm.userId;
                flag = true;
            }
        }
        if (searchForm.payid) {
            if (flag) {
                url += '&payid=' + searchForm.payid;
            } else {
                url += '?payid=' + searchForm.payid;
                flag = true;
            }
        }
        if (searchForm.scene) {
            if (flag) {
                url += '&scene=' + searchForm.scene;
            } else {
                url += '?scene=' + searchForm.scene;
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
/* 字体颜色*/

.text-red {
    color: red;
}

.text-blue {
    color: blue;
}

.text-green {
    color: green;
}

.text-gray {
    color: gray;
}

.text-orange {
    color: #FF851B;
}

.text-yellow {
    color: #FFDC00;
}

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