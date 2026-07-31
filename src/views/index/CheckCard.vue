<template>
    <el-config-provider :locale="zhCn">
        <el-dialog v-model="dialogVisible" title="新增检测卡" :width="dialogWidth" :close-on-click-modal="false" show-close>
            <el-form v-loading="dialogLoading" :model="rwData" label-width="auto" style="margin-top: 10px;">
                <el-form-item label="检测系统">
                    <el-select v-model="rwData.product_id" placeholder="选择状态">
                        <el-option v-for="item in checkProducts" :key="item.id" :label="item.name" :value="item.id" />

                    </el-select>
                </el-form-item>
                <el-form-item label="可用件数">
                    <el-input-number v-model="rwData.piece" :min="1" :max="1000" :precision="0" />
                </el-form-item>

                <el-form-item label="备注" prop="remark">
                    <el-input v-model="rwData.remark" :rows="4" type="textarea" />
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="createCard">提交</el-button>
                    <el-button @click="dialogVisible = false">取消</el-button>
                </el-form-item>


            </el-form>
        </el-dialog>
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>检测卡</span>
                </div>
            </template>
            <div class="table-container">
                <div style="margin-bottom: 15px;">
                    <el-button type="primary" @click="addCard">新增检测卡</el-button>
                </div>
                <div style="margin-bottom:15px;">
                    <el-alert title="提示" type="primary" :closable="false" >
                        1、每个卡号，只能使用一次。不再使用的卡号，应该及时禁用。<br/>
                        2、检测卡泄漏引起的损失自行负责。<br/>
                        3、什么是“件数”，要看我们的供货价格。如果供货价格是按千字计费，那么一件就是一千字。如果供货价格是按万字计费，那么一件就是一万字。如果供货价格是按篇计费，那么一件就是一篇。<br/>
                    </el-alert>
                </div>
                <div class="search-bar">
                    <el-row :gutter="16">
                        <!-- 响应式配置：大屏幕6列，平板8列，手机12列（占满整行） -->
                        <el-col :xs="12" :sm="8" :lg="6">
                            <el-input v-model="searchForm.cardid" placeholder="请输入卡号" clearable class="search-input" />
                        </el-col>
                        <el-col :xs="12" :sm="8" :lg="6">
                            <el-input v-model="searchForm.orderid" placeholder="请输入订单号" clearable
                                class="search-input" />
                        </el-col>
                        <el-col :xs="12" :sm="8" :lg="6">
                            <el-select v-model="searchForm.status" placeholder="选择状态">
                                <el-option label="可使用" value="1" />
                                <el-option label="已使用" value="2" />
                                <el-option label="已禁用" value="3" />
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
                <el-table :data="tableData" border stripe style="width: 100%" v-loading="loading"
                    :cell-style="{ 'padding': '8px 5px' }" :header-cell-style="{ 'padding': '10px 5px' }">
                    <el-table-column prop="id" label="卡号" min-width="120" align="center"
                        :show-overflow-tooltip="true" />
                    <el-table-column label="检测系统" min-width="120" align="center">
                        <template #default="scope">
                            {{ getSystemName(scope.row.product_id) }}
                        </template>
                    </el-table-column>

                    <el-table-column prop="create_time" label="生成时间" min-width="120" align="center" />
                    <el-table-column prop="piece" label="可用件数" min-width="80" align="center" />
                    <el-table-column prop="used" label="已用件数" min-width="80" align="center" />
                    <el-table-column label="状态" min-width="100" align="center">
                        <template #default="scope">
                            <el-tag :type="scope.row.status === 1 ? 'success' :
                                scope.row.status === 2 ? 'primary' : 'warning'" size="small">
                                {{ statustoStr(scope.row.status) }}
                            </el-tag>

                        </template>
                    </el-table-column>
                    <el-table-column prop="order_id" label="订单号" min-width="120" align="center"
                        :show-overflow-tooltip="true" />
                    <el-table-column prop="remark" label="备注" min-width="80" align="center" />
                    <el-table-column label="操作" min-width="100" align="center">
                        <template #default="scope">
                            <el-button v-show="scope.row.status == 1" type="primary" text size="small"
                                @click="disableCard(scope.row)">
                                禁用
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
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { paxios } from '@/utils/paxios'
import type { FormInstance, FormRules } from 'element-plus'
// 定义分页类型
interface Pagination {
    currentPage: number;
    pageSize: number;
    total: number;
}
// 定义搜索表单类型
interface SearchForm {
    cardid: string;
    orderid: string;
    status: string;
}
// 搜索表单数据
const searchForm = reactive<SearchForm>({
    cardid: '',
    orderid: '',
    status: "",
});

const checkProducts = ref<any[]>([])
const dialogVisible = ref(false)
const dialogWidth = ref('600px')
const dialogLoading = ref(false);

interface CardItem {

    product_id: string;
    piece: number;
    mun: number;
    remark: string;
}

const rwData = ref<CardItem>({
    product_id: '',
    piece: 0,
    mun: 1,
    remark: '',
});


const handleResize = () => {
    if (window.innerWidth < 768) {
        dialogWidth.value = "92%";
    } else {
        dialogWidth.value = "600px";

    }
};

function statustoStr(status: number) {
    if (status == 1) {
        return "未使用";
    } else if (status == 2) {
        return "已使用";
    } else if (status == 3) {
        return "已禁用";
    }
    return "";
}

const getSystemName = (system: string) => {
    for (var i = 0; i < checkProducts.value.length; i++) {
        if (checkProducts.value[i].id === system) {
            return checkProducts.value[i].name
        }
    }
    return '';
}

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

// 加载状态
const loading = ref<boolean>(false);

// 分页数据
const pagination = reactive<Pagination>({
    currentPage: 1,
    pageSize: 10,
    total: 0
});

// 获取列表数据
const fetchProductList = async () => {
    try {
        loading.value = true;
        let url = '/console/getCardData?page=' + pagination.currentPage + '&limit=' + pagination.pageSize;
        let cardid = searchForm.cardid.trim();
        if (cardid.length > 0) {
            url = url + "&cardid=" + cardid;
        }
        let orderid = searchForm.orderid.trim();
        if (orderid.length > 0) {
            url = url + "&orderid=" + orderid;
        }
        let status = searchForm.status.trim();
        if (status.length > 0) {
            url = url + "&status=" + status;
        }


        const res = await paxios.get(url);
        if (res.data.code === 0) {
            tableData.value = res.data.data;
            pagination.total = res.data.count;
        } else {
            ElMessage.error(res.data.msg);
        }
    } catch (error) {
        ElMessage.error('获取检测卡列表失败');
        console.error('获取检测卡列表失败:', error);
    } finally {
        loading.value = false;
    }
};

function handleSearch() {
    fetchProductList();
}


onMounted(async () => {
    handleResize();
    window.addEventListener('resize', handleResize);
     try {
        let url = '/index/getCheckIdAndName';
        const res1 = await paxios.get(url);
        if (res1.data.code === 0) {
            checkProducts.value = res1.data.data;
        } else {
            ElMessage.error(res1.data.msg);
        }
    } catch (err) {
        ElMessage.error("获取产品信息失败");
    }
    
    fetchProductList();
});
onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
});
async function disableCard(row: any) {
    try {
        const ret = await paxios.post('/console/disableCard', {
            cardid: row.id
        })
        if (ret.data.code == 0) {
            ElMessage.success('禁用成功')
            fetchProductList();
        } else {
            ElMessage.error(ret.data.msg)
        }
    } catch (error) {
        ElMessage.error('禁用失败');
        console.error('禁用失败:', error);
    }

}

async function createCard() {
    //检查数据
    if (rwData.value.product_id == '') {
        ElMessage.error('请选择产品');
        return;
    }
    if (rwData.value.piece <= 0) {
        ElMessage.error('请输入可用件数');
        return;
    }
    if (rwData.value.mun <= 0) {
        ElMessage.error('请输入卡数量');
        return;
    }
    try {
        const ret = await paxios.post('/console/createCheckCard', {
            piece: rwData.value.piece,
            product_id: rwData.value.product_id,
            mun: rwData.value.mun,
            remark: rwData.value.remark
        })
        if (ret.data.code == 0) {
            ElMessage.success('创建成功')
            dialogVisible.value = false;
            fetchProductList();
        } else {
            ElMessage.error(ret.data.msg)
        }
    } catch (error) {
        ElMessage.error('禁用失败');
        console.error('禁用失败:', error);
    }

}

function addCard() {

    rwData.value.product_id = '';
    rwData.value.piece = 0;
    rwData.value.mun = 1;
    rwData.value.remark = '';
    dialogVisible.value = true;
}


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