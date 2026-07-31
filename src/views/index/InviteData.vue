<template>
    <el-config-provider :locale="zhCn">
        
        <el-card v-loading="loading">
            <template #header>
                <div class="card-header">
                    <span>代理数据</span>
                </div>
            </template>
            <div>
                这里显示你邀请注册的代理。如果该代理已经注销，这里不将显示。
            </div>
            <div class="table-container">
                <el-table :data="tableData" border stripe style="width: 100%" :cell-style="{ 'padding': '8px 5px' }"
                    :header-cell-style="{ 'padding': '10px 5px' }">
                    <el-table-column prop="id" label="用户ID" min-width="90" align="center" />
                    <el-table-column prop="regtime" label="注册时间" min-width="140" align="center" />
                    <el-table-column label="为我赚取" min-width="120" align="center">
                        <template #default="scope">
                            {{ scope.row.tmoney / 100 }}元
                        </template>
                    </el-table-column>

                    
                    <el-table-column label="状态" min-width="80" align="center">
                        <template #default="scope">
                            <el-tag :type="scope.row.status === 1 ? 'success' :
                                scope.row.status === 2 ? 'danger' : 'warning'" size="small">
                                {{ scope.row.status === 1 ? '正常' :
                                    scope.row.status === 2 ? '冻结' : '注销' }}
                            </el-tag>
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
import { useSaleWebStore } from '@/stores/saleWebConfig'
import { storeToRefs } from "pinia"

const loading = ref(false);
  const { reward_enabled } = storeToRefs(useSaleWebStore());

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





// 表格数据
const tableData = ref<any[]>([]);

// 获取列表数据
const fetchProductList = async () => {
    try {
        loading.value = true;
        let url = '/console/getInviteData?page=' + pagination.currentPage + '&limit=' + pagination.pageSize;
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