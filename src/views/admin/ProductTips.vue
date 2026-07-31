<template>
    <el-config-provider :locale="zhCn">
        <el-dialog v-model="dialogVisible" :title="dialogTitle" :width="dialogWidth" :close-on-click-modal="false" show-close>
            <el-form v-loading="dialogLoading" ref="ruleFormRef" :model="rwData" label-width="auto"
                style="margin-top: 10px;">
                <el-form-item label="产品">
                    <el-select v-model="editProductid" placeholder="请选择">
                        <el-option v-for="check in checkProducts" :key="check.id" :label="check.name" :value="check.id"
                            :disabled="isModify" />
                    </el-select>
                </el-form-item>
                <el-form-item label="级别">
                    <el-select v-model="editLevel" placeholder="请选择">
                        <el-option label="提示" value="1" />
                        <el-option label="警告" value="2" />
                        <el-option label="错误" value="3" />
                    </el-select>
                </el-form-item>

                <el-form-item label="内容">
                    <el-input v-model="editContent" :rows="4" type="textarea" maxlength="300"/>
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
                    <span>检测配置</span>
                </div>
            </template>
            <el-button @click="addItem" type="primary">新增项目</el-button>
            <div class="table-container">
                <el-table :data="tableData" border stripe style="width: 100%" :cell-style="{ 'padding': '8px 5px' }"
                    :header-cell-style="{ 'padding': '10px 5px' }">
                    <el-table-column label="产品名称" min-width="120" align="center">
                        <template #default="scope">
                            {{ getSystemName(scope.row.product_id) }}
                        </template>
                    </el-table-column>
                    <el-table-column label="级别" min-width="100" align="center">
                        <template #default="scope">
                            <el-tag :type="scope.row.level === 1 ? 'info' :
                                scope.row.level === 2 ? 'warning' : 'danger'" size="small">
                                {{ scope.row.level === 1 ? '提示' :
                                    scope.row.level === 2 ? '警告' : '错误' }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="content" label="内容" min-width="120" align="center"
                        :show-overflow-tooltip="true" />

                    <el-table-column prop="update_time" label="修改时间" min-width="120" align="center"
                        :show-overflow-tooltip="true" />
                    <el-table-column label="操作" min-width="120" align="center">
                        <template #default="scope">
                            <el-button type="primary" text size="small" @click="editProduct(scope.row)">
                                编辑
                            </el-button>
                            <el-button type="danger" text size="small" @click="deleteProduct(scope.row)">
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
const checkProducts = ref<any[]>([])

const isModify = ref(false);
const dialogTitle = ref('');
const editProductid = ref("")
const editLevel = ref("");
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
    fetchProductList();
};
// 当前页码改变事件
const handleCurrentChange = (page: number) => {
    pagination.currentPage = page;
    fetchProductList();
};

const getSystemName = (system: string) => {
    for (var i = 0; i < checkProducts.value.length; i++) {
        if (checkProducts.value[i].id === system) {
            return checkProducts.value[i].name
        }
    }
    return '';
}



function editProduct(row: any) {
    // 跳转到编辑页面，传递产品ID
    isModify.value = true;
    dialogTitle.value = "提示信息(修改)";
    editProductid.value = row.product_id;
    editLevel.value = ""+row.level;
    editContent.value = row.content;
    dialogVisible.value = true;
}

function addItem() {
    isModify.value = false;
    dialogTitle.value = "提示信息(新增)";
    editProductid.value = "";
    editLevel.value = "";
    editContent.value = "";
    dialogVisible.value = true;
}



async function handleSubmit() {
    if (editProductid.value) {
        if (editProductid.value.length < 1) {
            ElMessage.error("请选择产品");
            return;
        }
    } else {
        ElMessage.error("请选择产品");
        return;
    }
    if (editLevel.value.length < 1) {
        ElMessage.error("请选择级别");
        return;
    }
    if (editContent.value) {
        if (editContent.value.length < 1) {
            ElMessage.error("请填写内容");
            return;
        }
    }

const res = await paxios.post("/manage/updateProductTips", {
    product_id: editProductid.value,
    level: editLevel.value,
    content:editContent.value
});
if (res.data.code === 0) {
    ElMessage.success("更新成功");
    dialogVisible.value = false;
    fetchProductList();
} else {
    ElMessage.error(res.data.msg);
}

}


async function deleteProduct(row: any) {
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
                let res = await paxios.post("/manage/delProductTips", { product_id: row.product_id });
                if (res.data.code != 0) {
                    ElMessage.error(res.data.msg);
                    loading.value = false;
                    return;
                }
                fetchProductList();
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
const fetchProductList = async () => {
    try {
        loading.value = true;
        let url = '/manage/getProductTipsData?page=' + pagination.currentPage + '&limit=' + pagination.pageSize;
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
        checkProducts.value = res1.data.data;
    } else {
        ElMessage.error(res1.data.msg);
    }
    fetchProductList();

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