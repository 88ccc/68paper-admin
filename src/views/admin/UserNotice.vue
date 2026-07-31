<template>
    <el-config-provider :locale="zhCn">
        <el-dialog v-model="dialogVisible" :title="dialogTitle" :width="dialogWidth" :close-on-click-modal="false"
            show-close>
            <el-form v-loading="dialogLoading" ref="ruleFormRef" :model="rwData" label-width="auto"
                style="margin-top: 10px;">
                <el-form-item label="用户ID">
                    <el-input v-model="auditUserid" :disabled="true" />
                </el-form-item>
                <el-form-item label="位置">
                    <el-select v-model="auditPosition" placeholder="请选择">
                        <el-option v-for="check in checkProducts" :key="check.id" :label="check.name" :value="check.id"
                            :disabled="true" />
                    </el-select>
                </el-form-item>
                <el-form-item label="内容">
                    <el-input v-model="auditContent" :rows="4" type="textarea" maxlength="300" :disabled="true" />
                </el-form-item>
                <el-form-item label="状态">
                    <el-select v-model="auditStatus" placeholder="请选择状态" clearable class="search-select">
                        <el-option label="待审核" value="1" />
                        <el-option label="审核通过" value="2" />
                        <el-option label="审核拒绝" value="3" />
                    </el-select>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="handleSubmit">提交</el-button>
                    <el-button @click="dialogVisible = false">取消</el-button>
                </el-form-item>


            </el-form>
        </el-dialog>
        <el-card v-loading="loading">
            <template #header>
                <div class="card-header">
                    <span>用户公告</span>
                </div>
            </template>

            <div class="table-container">
                <div class="search-bar">
                    <el-row :gutter="16">
                        <!-- 响应式配置：大屏幕6列，平板8列，手机12列（占满整行） -->
                        <el-col :xs="12" :sm="8" :lg="6">
                            <el-input v-model="searchForm.userid" placeholder="请输入用户ID" clearable
                                class="search-input" />
                        </el-col>
                        <el-col :xs="12" :sm="8" :lg="6">
                            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable class="search-select">
                                <el-option label="待审核" value="1" />
                                <el-option label="审核通过" value="2" />
                                <el-option label="审核拒绝" value="3" />
                            </el-select>
                        </el-col>

                        <el-col :xs="12" :sm="8" :lg="6">
                            <el-select v-model="searchForm.position" placeholder="请选择位置">
                                <el-option v-for="check in checkProducts" :key="check.id" :label="check.name"
                                    :value="check.id" />
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
                <el-table :data="tableData" border stripe style="width: 100%" :cell-style="{ 'padding': '8px 5px' }"
                    :header-cell-style="{ 'padding': '10px 5px' }">
                    <el-table-column prop="userid" label="用户ID" min-width="80" align="center" />
                    <el-table-column label="位置" min-width="120" align="center">
                        <template #default="scope">
                            {{ getSystemName(scope.row.position) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="conent" label="内容" min-width="120" align="center"
                        :show-overflow-tooltip="true" />
                    <el-table-column prop="status" label="状态" min-width="100" align="center">
                        <template #default="scope">
                            <el-tag :type="scope.row.status === 1 ? 'info' :
                                scope.row.status === 2 ? 'success' : 'danger'" size="small">
                                {{ scope.row.status === 1 ? '待审核' :
                                    scope.row.status === 2 ? '审核通过' : '审核被拒' }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" min-width="120" align="center">
                        <template #default="scope">
                            <el-button type="primary" text size="small" @click="auditUserNotice(scope.row)">
                                审核
                            </el-button>
                        </template>
                    </el-table-column>

                </el-table>
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
import { ref, onMounted, reactive, onUnmounted } from 'vue'
import { paxios } from '@/utils/paxios'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
const loading = ref(false);

// 定义分页类型
interface Pagination {
    currentPage: number;
    pageSize: number;
    total: number;
}
// 分页数据
const pagination = reactive<Pagination>({
    currentPage: 1,
    pageSize: 10,
    total: 0
});
const dialogVisible = ref(false)
const dialogWidth = ref('600px')
const dialogLoading = ref(false)
const checkProducts = ref<any[]>([{
    id: "home",
    name: "首页"
}])

// 定义搜索表单类型
interface SearchForm {
    userid: string;
    status: string;
    position: string;
}
// 搜索表单数据
const searchForm = reactive<SearchForm>({
    userid: "",
    status: "",
    position: "",
});
const dialogTitle = ref("");
const auditUserid = ref("");
const auditPosition = ref("")
const auditContent = ref("");
const auditStatus = ref("");

interface tipsItem {
    product_id: string;
    level: number;
    content: string;
    update_time: string;
}

const rwData = ref<tipsItem>({
    product_id: "",
    level: 0,
    content: "",
    update_time: ""
});

function handleSearch() {
    fetchUserNoticeList();
}

const handleSizeChange = (size: number) => {
    pagination.pageSize = size;
    fetchUserNoticeList();
};
// 当前页码改变事件
const handleCurrentChange = (page: number) => {
    pagination.currentPage = page;
    fetchUserNoticeList();
};

const getSystemName = (system: string) => {
    for (var i = 0; i < checkProducts.value.length; i++) {
        if (checkProducts.value[i].id === system) {
            return checkProducts.value[i].name
        }
    }
    return '';
}



function auditUserNotice(row: any) {
    dialogTitle.value = "用户公告信息(审核)";
    auditUserid.value = row.userid
    auditPosition.value = row.position;
    auditContent.value = row.conent;
    auditStatus.value = "" + row.status;
    dialogVisible.value = true;
}



async function handleSubmit() {
    if (auditUserid.value) {
        if (auditUserid.value.length < 1) {
            ElMessage.error("请选择用户");
            return;
        }
    } else {
        ElMessage.error("请选择用户");
        return;
    }
    if (auditPosition.value) {
        if (auditPosition.value.length < 1) {
            ElMessage.error("请填写位置");
            return;
        }
    } else {
        ElMessage.error("请填写位置");
        return;
    }

    if (auditStatus.value) {
        if (auditStatus.value.length < 1) {
            ElMessage.error("请填写状态");
            return;
        }
    } else {
        ElMessage.error("请填写状态");
        return;
    }

    const res = await paxios.post("/manage/auditUserNotice", {
        userid: auditUserid.value,
        position: auditPosition.value,
        status: auditStatus.value,
    });
    if (res.data.code === 0) {
        ElMessage.success("更新成功");
        dialogVisible.value = false;
        fetchUserNoticeList();
    } else {
        ElMessage.error(res.data.msg);
    }

}





// 表格数据
const tableData = ref<any[]>([]);




// 获取列表数据
const fetchUserNoticeList = async () => {
    try {
        loading.value = true;
        let url = '/manage/getUserNoticeData?page=' + pagination.currentPage + '&limit=' + pagination.pageSize;
        let userid = searchForm.userid.trim();
        if (userid.length >= 1) {
            url = url + "&userid=" + userid;
        }

        let status = searchForm.status ?? "";
        status = status.trim();
        if (status.length >= 1) {
            url = url + "&status=" + status;
        }
        let position = searchForm.position ?? "";
        position = position.trim();
        if (position.length >= 1) {
            url = url + "&position=" + position;
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

const handleResize = () => {
    if (window.innerWidth < 768) {
        dialogWidth.value = "92%";
    } else {
        dialogWidth.value = "600px";

    }
};


onMounted(async () => {
    handleResize();
    window.addEventListener('resize', handleResize);
    let url = '/index/getCheckIdAndName';
    const res1 = await paxios.get(url);
    if (res1.data.code === 0) {
        let arr2 = res1.data.data;
        for (let i = 0; i < arr2.length; i++) {
            checkProducts.value.push(arr2[i]);
        }
    } else {
        ElMessage.error(res1.data.msg);
    }
    fetchUserNoticeList();

})
onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
})

</script>

<style scoped>
.table-container {
    margin-top: 10px;
    margin-bottom: 16px;
    overflow-x: auto;
    /* 表格在小屏幕上可横向滚动 */
}

.pagination-container {
    text-align: right;
    padding-top: 8px;
}

.id-info {
    padding: 10px;
    background-color: #f5f7fa;
    border-radius: 4px;
    font-size: 14px;
}

.id-label {
    font-weight: bold;
    margin-right: 8px;
    color: #606266;
}

.id-value {
    color: #303133;
    word-break: break-all;
}

.content-comparison {
    display: flex;
    flex-direction: row;
    gap: 20px;
    max-height: 60vh;
}

@media (max-width: 768px) {
    .content-comparison {
        flex-direction: column;
        max-height: 70vh;
    }
}

.content-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: #f9f9f9;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.input-section {
    border-left: 4px solid #409eff;
}

.output-section {
    border-left: 4px solid #67c23a;
}

.section-header {
    padding: 12px 15px;
    background-color: #f5f5f5;
    border-bottom: 1px solid #e9e9e9;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.section-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    color: #303133;
}

.content-area {
    flex: 1;
    padding: 15px;
    overflow-y: auto;
    position: relative;
}

/* 滚动条美化 */
.content-area::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.content-area::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.content-area::-webkit-scrollbar-thumb {
    background: #c0c4cc;
    border-radius: 3px;
}

.content-area::-webkit-scrollbar-thumb:hover {
    background: #909399;
}

.hidden-content {
    opacity: 0.5;
}

.placeholder-text {
    color: #909399;
    text-align: center;
    padding: 5px 0;
    margin: 0;
}

.content-text {
    margin: 0;
    line-height: 1.8;
    color: #303133;
    font-size: 14px;
    white-space: pre-wrap;
    word-break: break-word;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
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
</style>