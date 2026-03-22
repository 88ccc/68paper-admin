<template>
    <el-config-provider :locale="zhCn">
        <el-card v-loading="loading">
            <template #header>
                <div class="card-header">
                    <span>检测配置</span>
                </div>
            </template>
            <el-button @click="syncProduct" type="primary">同步货源</el-button>
            <div class="table-container">
                <el-table :data="tableData" border stripe style="width: 100%" :cell-style="{ 'padding': '8px 5px' }"
                    :header-cell-style="{ 'padding': '10px 5px' }">
                    <el-table-column prop="id" label="产品ID" min-width="80" align="center" />
                    <el-table-column prop="name" label="产品名称" min-width="80" align="center" />
                    <el-table-column label="成本" min-width="140" align="center" :show-overflow-tooltip="true">
                        <template #default="scope">
                            <span v-if="scope.row.unit == 0">{{ scope.row.cost / 100 }}元/篇</span>
                            <span v-if="scope.row.unit != 0">{{ scope.row.cost / 100 }}元/{{ scope.row.unit }}字符</span>
                        </template>
                    </el-table-column>

                    <el-table-column label="最低售价" min-width="140" align="center" :show-overflow-tooltip="true">
                        <template #default="scope">
                            <span v-if="scope.row.unit == 0">{{ scope.row.mini_price / 100 }}元/篇</span>
                            <span v-if="scope.row.unit != 0">{{ scope.row.mini_price / 100 }}元/{{ scope.row.unit
                            }}字符</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="货源状态" min-width="80" align="center">
                        <template #default="scope">
                            <el-tag :type="scope.row.supplier_status === 1 ? 'success' :
                                scope.row.supplier_status === 2 ? 'danger' : 'warning'" size="small">
                                {{ scope.row.supplier_status === 1 ? '正常' :
                                    scope.row.supplier_status === 2 ? '禁用' : '已删除' }}
                            </el-tag>
                        </template>
                    </el-table-column>

                    <el-table-column label="状态" min-width="80" align="center">
                        <template #default="scope">
                            <el-tag :type="scope.row.status === 1 ? 'success' :
                                scope.row.status === 2 ? 'danger' : 'warning'" size="small">
                                {{ scope.row.status === 1 ? '正常' :
                                    scope.row.status === 2 ? '禁用' : '未知' }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" min-width="120" align="center">
                        <template #default="scope">
                            <el-button v-if="scope.row.status == 1" type="warning" text size="small"
                                @click="disableProduct(scope.row)">
                                禁用
                            </el-button>
                            <el-button v-if="scope.row.status == 2" type="primary" text size="small"
                                @click="enableProduct(scope.row)">
                                启用
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
import { ref, onMounted, reactive } from 'vue'
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


const handleSizeChange = (size: number) => {
    pagination.pageSize = size;
    fetchProductList();
};
// 当前页码改变事件
const handleCurrentChange = (page: number) => {
    pagination.currentPage = page;
    fetchProductList();
};


async function enableProduct(row: any) {
     try {
                loading.value = true;
                let res = await paxios.post("/manage/enableCheckProduct", { id: row.id });
                if (res.data.code != 0) {
                    ElMessage.error(res.data.msg);
                    loading.value = false;
                    return;
                }
                fetchProductList();
            } catch (error) {
                loading.value = false;
            }

}

async function disableProduct(row: any) {
    ElMessageBox.confirm(
        '禁用后，所有店铺都无法使用该产品',
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
                let res = await paxios.post("/manage/desableCheckProduct", { id: row.id });
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

async function deleteProduct(row: any) {
     ElMessageBox.confirm(
        '删除后，所有该产品的配置都会被删除',
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
                let res = await paxios.post("/manage/deleteCheckProduct", { id: row.id });
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


async function syncProduct() {
    try {
        loading.value = true;
        let res = await paxios.get("/manage/syncCheckSystem");
        if (res.data.code != 0) {
            ElMessage.error(res.data.msg);
            loading.value = false;
            return;
        }

    } catch (error) {
        ElMessage.error("同步货源失败");
        loading.value = false;
    }

    fetchProductList();

}

// 获取列表数据
const fetchProductList = async () => {
    try {
        loading.value = true;
        let url = '/manage/getCheckData?page=' + pagination.currentPage + '&limit=' + pagination.pageSize;
        const res = await paxios.get(url);
        if (res.data.code === 0) {
            tableData.value = res.data.data;
            pagination.total = res.data.count;
        } else {
            ElMessage.error(res.data.msg);
        }
    } catch (error) {
        ElMessage.error('获取产品列表失败');
        console.error('获取产品列表错误:', error);
    } finally {
        loading.value = false;
    }
};



onMounted(async () => {
    fetchProductList();
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