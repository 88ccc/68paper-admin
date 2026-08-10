<template>
    <el-config-provider :locale="zhCn">
        <el-dialog v-model="dialogVisible" :title="dialogTitle" :width="dialogWidth" :close-on-click-modal="false"
            show-close>
            <el-form v-loading="dialogLoading" ref="ruleFormRef" :model="rwData" label-width="auto"
                style="margin-top: 10px;">
                <el-form-item label="位置">
                    <el-select v-model="editPosition" placeholder="请选择">
                        <el-option v-for="check in checkProducts" :key="check.id" :label="check.name" :value="check.id"
                            :disabled="isModify" />
                    </el-select>
                </el-form-item>
                <el-form-item label="内容">
                    <el-input v-model="editContent" :rows="4" type="textarea" maxlength="300" />
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="handleSubmit">提交</el-button>
                    <el-button @click="dialogVisible = false">取消</el-button>
                </el-form-item>
                <div style="margin-top: 15px;">
                    <el-alert title="提示" type="primary" :closable="false">
                        内容不得包含链接和联系方式，管理员审核通过后才能在前端显示
                    </el-alert>
                </div>
            </el-form>
        </el-dialog>
        <el-card v-loading="loading">
            <template #header>
                <div class="card-header">
                    <span>公告配置</span>
                </div>
            </template>
            <el-button @click="addItem" type="primary">新增项目</el-button>
            <div class="table-container">
                <el-table :data="tableData" border stripe style="width: 100%" :cell-style="{ 'padding': '8px 5px' }"
                    :header-cell-style="{ 'padding': '10px 5px' }">
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
                            <el-button type="primary" text size="small" @click="editUserNotice(scope.row)">
                                编辑
                            </el-button>
                            <el-button type="danger" text size="small" @click="deleteUserNotice(scope.row)">
                                删除
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

const isModify = ref(false);
const dialogTitle = ref("");
const editPosition = ref("")
const editContent = ref("");

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



function editUserNotice(row: any) {
    // 跳转到编辑页面，传递产品ID
    isModify.value = true;
    dialogTitle.value = "公告信息(修改)";
    editPosition.value = row.position;
    editContent.value = row.conent;
    dialogVisible.value = true;
}

function addItem() {
    isModify.value = false;
    dialogTitle.value = "公告信息(新增)";
    editPosition.value = "";
    editContent.value = "";
    dialogVisible.value = true;
}



async function handleSubmit() {
    if (editPosition.value) {
        if (editPosition.value.length < 1) {
            ElMessage.error("请选择位置");
            return;
        }
    } else {
        ElMessage.error("请选择位置");
        return;
    }
    if (editContent.value) {
        if (editContent.value.length < 1) {
            ElMessage.error("请填写内容");
            return;
        }
    }
    dialogLoading.value = true;
    try {
        const res = await paxios.post("/console/updateUserNotice", {
            position: editPosition.value,
            content: editContent.value
        });
        if (res.data.code === 0) {
            ElMessage.success("更新成功");
            dialogVisible.value = false;
            fetchUserNoticeList();
        } else {
            ElMessage.error(res.data.msg);
        }

    } catch (error) {
        ElMessage.error('网络异常');
        console.error('网络异常:', error);
    }
    dialogLoading.value = false;


}


async function deleteUserNotice(row: any) {
    ElMessageBox.confirm(
        '确定删除该项',
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(async () => {
            try {
                loading.value = true;
                let res = await paxios.post("/console/delUserNotice", { position: row.position });
                if (res.data.code != 0) {
                    ElMessage.error(res.data.msg);
                    loading.value = false;
                    return;
                }
                fetchUserNoticeList();
            } catch (error) {
                loading.value = false;
            }
        })
        .catch(() => {

        })
}


// 表格数据
const tableData = ref<any[]>([]);




// 获取列表数据
const fetchUserNoticeList = async () => {
    try {
        loading.value = true;
        let url = '/console/getUserNoticeData?page=' + pagination.currentPage + '&limit=' + pagination.pageSize;
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
</style>