<template>
    <el-config-provider :locale="zhCn">
        <el-dialog v-model="dialogStatusVisible" title="状态修改" :width="dialogWidth" :close-on-click-modal="false"
            show-close>
            <div v-loading="dialogLoading">
                用户ID: {{ editStatusId }}<br />
                当前状态: <el-tag :type="editStatusStatus === 1 ? 'success' :
                    editStatusStatus === 2 ? 'danger' : 'warning'" size="small">
                    {{ editStatusStatus === 1 ? '正常' :
                        editStatusStatus === 2 ? '禁用' : '未激活' }}
                </el-tag>
                <br />
                <br />
                <el-form label-width="auto">
                    <el-form-item label="状态:">
                        <el-select v-model="newStatus" placeholder="请选择状态" style="width: 240px" class="search-select">
                            <el-option label="正常" :value="1" />
                            <el-option label="禁用" :value="2" />
                        </el-select>
                    </el-form-item>

                    <el-form-item label="备注:">
                        <el-input v-model="statusRemark" :autosize="{ minRows: 4, maxRows: 8 }" type="textarea" />
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="handleStatus" type="primary">提交</el-button>
                        <el-button @click="dialogStatusVisible = false" type="info">取消</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </el-dialog>
        
        <el-dialog v-model="dialogNameVisible" title="修改代理姓名" :width="dialogWidth" :close-on-click-modal="false"
            show-close>
            <div>
                用户ID：{{ editNameId }}<br />
                <el-form v-loading="dialogLoading" style="width: 100%;padding-top: 18px;">
                    <el-form-item label="姓名:">
                        <el-input type="text" v-model="newName" clearable />
                    </el-form-item>
                    
                    <el-form-item>
                        <el-button type="primary" @click="handleName">提交</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </el-dialog>
        <div class="user-list-container">
            <div class="search-bar">
                <el-row :gutter="16">
                    <!-- 响应式配置：大屏幕6列，平板8列，手机12列（占满整行） -->
                    <el-col :xs="12" :sm="8" :lg="6">
                        <el-input v-model="searchForm.userId" placeholder="请输入用户ID" clearable class="search-input" />
                    </el-col>
                    <el-col :xs="12" :sm="8" :lg="6">
                        <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable class="search-input" />
                    </el-col>
                    <el-col :xs="12" :sm="8" :lg="6">
                        <el-input v-model="searchForm.email" placeholder="请输入邮箱" clearable class="search-input" />
                    </el-col>
                    <el-col :xs="12" :sm="8" :lg="4">
                        <el-select v-model="searchForm.status" placeholder="请选择状态" clearable class="search-select">
                            <el-option label="正常" value="1" />
                            <el-option label="禁用" value="2" />
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
                    <el-table-column prop="id" label="用户ID" min-width="80" align="center" />
                    <el-table-column prop="tid" label="邀请人" min-width="80" align="center" />
                    <el-table-column label="帐号" min-width="140" align="center" :show-overflow-tooltip="true">
                        <template #default="scope">
                            <span v-if="scope.row.mobile">{{ scope.row.mobile }}<br /></span>
                            <span v-if="scope.row.email">{{ scope.row.email }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="余额" min-width="140" align="center" :show-overflow-tooltip="true">
                        <template #default="scope">
                            {{ scope.row.balance / 100 }}元
                        </template>
                    </el-table-column>
                    <el-table-column prop="status" label="状态" min-width="100" align="center">
                        <template #default="scope">
                            <el-tag v-if="scope.row.status === 1" type="success">正常</el-tag>
                            <el-tag v-if="scope.row.status === 2" type="warning">禁用</el-tag>
                            <el-tag v-if="scope.row.status === 3" type="danger">注销</el-tag>
                           
                        </template>
                    </el-table-column>
                    <el-table-column prop="name" label="姓名" min-width="80" align="center" />
                    <el-table-column prop="regtime" label="注册时间" min-width="140" align="center"
                        :show-overflow-tooltip="true" />
                    <el-table-column prop="tips" label="备注" min-width="80" align="center" />
                    <el-table-column label="操作" min-width="150" align="center">
                        <template #default="scope">
                            <el-button type="primary" text size="small" @click="statusEdit(scope.row)">
                                状态
                            </el-button>
                            <el-button type="primary" text size="small" @click="nameEdit(scope.row)">
                                姓名
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
    </el-config-provider>
</template>

<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { Search } from '@element-plus/icons-vue';  // 引入搜索图标
import { paxios } from '@/utils/paxios';

const dialogLoading = ref(false);

const dialogStatusVisible = ref(false);
const dialogWidth = ref('600px')
const editStatusId = ref(0);
const editStatusStatus = ref(0);
const newStatus = ref(0);
const statusRemark = ref("");


const dialogNameVisible = ref(false);
const editNameId = ref(0);
const newName = ref("");

// 定义搜索表单类型
interface SearchForm {
    userId: string;
    phone: string;
    email: string;
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
    phone: '',
    email: '',
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

const handleResize = () => {
    if (window.innerWidth < 768) {
        dialogWidth.value = "92%";
    } else {
        dialogWidth.value = "600px";

    }
};

// 初始化页面时加载数据
onMounted(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    fetchUserList();
});
onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
});

// 获取用户列表数据
const fetchUserList = async () => {
    try {
        loading.value = true;
        let url = '/manage/getUserData'
        let flag = false;
        if (searchForm.userId) {
            if (flag) {
                url += '&id=' + searchForm.userId;
            } else {
                url += '?id=' + searchForm.userId;
                flag = true;
            }
        }
        if (searchForm.phone) {
            if (flag) {
                url += '&mobile=' + searchForm.phone;
            } else {
                url += '?mobile=' + searchForm.phone;
                flag = true;
            }
        }

        if (searchForm.email) {
            if (flag) {
                url += '&email=' + searchForm.email;
            } else {
                url += '?email=' + searchForm.email;
                flag = true;
            }
        }
        if (searchForm.status) {
            if (flag) {
                url += '&status=' + searchForm.status;
            } else {
                url += '?status=' + searchForm.status;
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
        ElMessage.error('获取用户列表失败');
        console.error('获取用户列表错误:', error);
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

// 查看用户详情
const statusEdit = (row: any) => {
    dialogLoading.value = false;
    dialogStatusVisible.value = true;
    editStatusId.value = row.id;
    editStatusStatus.value = row.status;
    newStatus.value = row.status;
    statusRemark.value = "";
};

async function handleStatus() {
    try {
        dialogLoading.value = true;
        const res = await paxios.post("/manage/editUserStatus", { id: editStatusId.value, status: newStatus.value, remark: statusRemark.value });
        if (res.data.code != 0) {
            ElMessage.error(res.data.msg);
        } else {
            ElMessage.success("修改成功");
            fetchUserList();
        }
        dialogLoading.value = false;
        dialogStatusVisible.value = false;
    } catch (error) {
        dialogLoading.value = false;
        dialogStatusVisible.value = false;
    }

}

// 修改姓名
const nameEdit = (row: any) => {
    dialogLoading.value = false;
    dialogNameVisible.value = true;
    editNameId.value = row.id;
    newName.value = row.name;
};

async function handleName() {
    if (newName.value.trim() == "") {
        ElMessage.error('姓名不能为空');
        return;
    }
    try {
        dialogLoading.value = true;
        const res = await paxios.post("/manage/editUserName", { id: editNameId.value, name: newName.value });
        if (res.data.code != 0) {
            ElMessage.error(res.data.msg);
        } else {
            ElMessage.success("修改成功");
            fetchUserList();
        }
        dialogLoading.value = false;
        dialogNameVisible.value = false;
    } catch (error) {
        dialogLoading.value = false;
        dialogNameVisible.value = false;
    }

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