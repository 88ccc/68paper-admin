<template>
    <el-config-provider :locale="zhCn">
        <el-dialog v-model="dialogDetailsVisible" title="订单详情" :width="dialogWidth" :close-on-click-modal="false"
            show-close>
            <el-descriptions v-if="dialogDetails" class="margin-top" label-width="100px" :column="1" border>
                <el-descriptions-item>
                    <template #label>
                        <div class="cell-item">
                            产品
                        </div>
                    </template>
                    {{ getSystemName(dialogDetails.product_id) }}
                </el-descriptions-item>
                <el-descriptions-item>
                    <template #label>
                        <div class="cell-item">
                            订单号
                        </div>
                    </template>
                    {{ dialogDetails.id }}
                </el-descriptions-item>
                <el-descriptions-item v-if="dialogDetails.payid">
                    <template #label>
                        <div class="cell-item">
                            支付ID
                        </div>
                    </template>
                    {{ dialogDetails.payid }}
                </el-descriptions-item>
                <el-descriptions-item>
                    <template #label>
                        <div class="cell-item">
                            销售员
                        </div>
                    </template>
                    {{ dialogDetails.userid }}
                </el-descriptions-item>
                <el-descriptions-item v-show="dialogDetails.tid">
                    <template #label>
                        <div class="cell-item">
                            邀请人
                        </div>
                    </template>
                    {{ dialogDetails.tid }}
                </el-descriptions-item>
                <el-descriptions-item>
                    <template #label>
                        <div class="cell-item">
                            提交时间
                        </div>
                    </template>
                    {{ dialogDetails.create_time }}
                </el-descriptions-item>
                <el-descriptions-item v-show="dialogDetails.title">
                    <template #label>
                        <div class="cell-item">
                            标题
                        </div>
                    </template>
                    {{ dialogDetails.title }}
                </el-descriptions-item>
                <el-descriptions-item v-show="dialogDetails.author">
                    <template #label>
                        <div class="cell-item">
                            作者
                        </div>
                    </template>
                    {{ dialogDetails.author }}
                </el-descriptions-item>
                <el-descriptions-item v-show="dialogDetails.end_date">
                    <template #label>
                        <div class="cell-item">
                            发表时间
                        </div>
                    </template>
                    {{ dialogDetails.end_date }}
                </el-descriptions-item>
                <el-descriptions-item v-show="dialogDetails.words">
                    <template #label>
                        <div class="cell-item">
                            字符数
                        </div>
                    </template>
                    {{ dialogDetails.words }}
                </el-descriptions-item>
                <el-descriptions-item v-show="dialogDetails.piece">
                    <template #label>
                        <div class="cell-item">
                            件数
                        </div>
                    </template>
                    {{ dialogDetails.piece }}
                </el-descriptions-item>
                <el-descriptions-item v-show="dialogDetails.unit_price">
                    <template #label>
                        <div class="cell-item">
                            单价
                        </div>
                    </template>
                    {{ (dialogDetails.unit_price ?? 0) / 100 }}元
                </el-descriptions-item>
                <el-descriptions-item v-show="dialogDetails.total_price">
                    <template #label>
                        <div class="cell-item">
                            总价
                        </div>
                    </template>
                    {{ (dialogDetails.total_price ?? 0) / 100 }}元
                </el-descriptions-item>
                <template v-if="dialogDetails.status > 3">
                    <el-descriptions-item>
                        <template #label>
                            <div class="cell-item">
                                付款时间
                            </div>
                        </template>
                        {{ dialogDetails.pay_time }}
                    </el-descriptions-item>
                    <el-descriptions-item>
                        <template #label>
                            <div class="cell-item">
                                销售提成
                            </div>
                        </template>
                        {{ (dialogDetails.profit ?? 0) / 100 }}元
                    </el-descriptions-item>
                    <el-descriptions-item v-show="dialogDetails.tid != 0">
                        <template #label>
                            <div class="cell-item">
                                邀请人提成
                            </div>
                        </template>
                        {{ (dialogDetails.tprofit ?? 0) / 100 }}元
                    </el-descriptions-item>
                    <el-descriptions-item>
                        <template #label>
                            <div class="cell-item">
                                平台利润
                            </div>
                        </template>
                        {{ (dialogDetails.pprofit ?? 0) / 100 }}元
                    </el-descriptions-item>
                </template>
                <el-descriptions-item>
                    <template #label>
                        <div class="cell-item">
                            状态
                        </div>
                    </template>
                    <span :class="getStatusClass(dialogDetails.status)">{{ statustoStr(dialogDetails.status) }}</span>
                </el-descriptions-item>
                <el-descriptions-item v-show="dialogDetails.remark">
                        <template #label>
                            <div class="cell-item">
                                备注
                            </div>
                        </template>
                        {{ dialogDetails.remark }}元
                    </el-descriptions-item>
            </el-descriptions>
            <div style="text-align: center;margin-top: 10px">
                <el-button type="primary"  @click="dialogDetailsVisible = false">关闭</el-button>
            </div>
        </el-dialog>
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>检测记录</span>
                </div>
            </template>
            <div class="table-container">
                <div class="search-bar">
                    <el-row :gutter="16">
                        <!-- 响应式配置：大屏幕6列，平板8列，手机12列（占满整行） -->
                        <el-col :xs="12" :sm="8" :lg="6">
                            <el-input v-model="searchForm.orderid" placeholder="请输入订单ID" clearable
                                class="search-input" />
                        </el-col>
                        <el-col :xs="12" :sm="8" :lg="6">
                            <el-input v-model="searchForm.payid" placeholder="请输入支付ID" clearable class="search-input" />
                        </el-col>
                        <el-col :xs="12" :sm="8" :lg="6">
                            <el-input v-model="searchForm.userid" placeholder="请输入用户ID" clearable
                                class="search-input" />
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
                    <el-table-column prop="id" label="订单号" min-width="140" align="center" :show-overflow-tooltip="true">
                        <template #default="scope">
                            {{ scope.row.id }}<br />
                            {{ getSystemName(scope.row.product_id) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="userid" label="用户ID" min-width="120" align="center">
                        <template #default="scope">
                            <span>销售:{{ scope.row.userid }}</span>
                            <span v-if="scope.row.tid != 0"><br />邀请:{{ scope.row.tid }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="payid" label="支付ID" min-width="120" align="center" />
                    <el-table-column label="利润" min-width="140" align="center" :show-overflow-tooltip="true">
                        <template #default="scope">
                            <span v-if="scope.row.pcost">成本:{{ scope.row.pcost / 100 }} 元<br /></span>
                            <span v-if="scope.row.pprofit">利润:{{ scope.row.pprofit / 100 }}元</span>

                        </template>
                    </el-table-column>
                    <el-table-column label="售价" min-width="140" align="center" :show-overflow-tooltip="true">
                        <template #default="scope">
                            <span v-if="scope.row.unit_price">单价:{{ scope.row.unit_price / 100 }} 元<br /></span>
                            <span v-if="scope.row.total_price">总价:{{ scope.row.total_price / 100 }}元</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="字数" min-width="120" align="center">
                        <template #default="scope">
                            <span v-if="scope.row.words">字数: {{ scope.row.words }}<br /></span>
                            <span v-if="scope.row.piece">件数: {{ scope.row.piece }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="create_time" label="提交时间" min-width="120" align="center" />

                    <el-table-column label="信息" min-width="140" align="center" :show-overflow-tooltip="true">
                        <template #default="scope">
                            <span v-show="scope.row.title">标题: {{ scope.row.title }}<br /></span>
                            <span v-show="scope.row.author">作者:{{ scope.row.author }}</span>
                            <span v-show="scope.row.end_date">发表日期:{{ scope.row.end_date }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="状态" min-width="100" align="center">
                        <template #default="scope">
                            <span :class="getStatusClass(scope.row.status)">{{ statustoStr(scope.row.status) }}</span>

                        </template>
                    </el-table-column>
                    <el-table-column prop="remark" label="备注" min-width="80" align="center" />
                    <el-table-column label="操作" min-width="140" align="center">
                        <template #default="scope">
                            <el-button type="primary" text size="small" @click="showDetails(scope.row)">
                                详情
                            </el-button>
                            <el-button v-show="scope.row.status >= 4 && scope.row.status != 9" type="warning" text
                                size="small" style="margin-left: 10px" @click="orderRefund(scope.row)">
                                退款
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
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { paxios } from '@/utils/paxios'
// 定义分页类型
interface Pagination {
    currentPage: number;
    pageSize: number;
    total: number;
}
// 定义搜索表单类型
interface SearchForm {
    orderid: string;
    payid: string;
    userid: string;
}
// 搜索表单数据
const searchForm = reactive<SearchForm>({
    orderid: '',
    payid: "",
    userid: "",
});

const checkProducts = ref<any[]>([])
const dialogDetailsVisible = ref(false)
const dialogWidth = ref('600px')
const dialogDetails = ref<any>(null)

const handleResize = () => {
    if (window.innerWidth < 768) {
        dialogWidth.value = "92%";
    } else {
        dialogWidth.value = "600px";

    }
};

function statustoStr(status: number) {
    if (status == 1) {
        return "解析中";
    } else if (status == 2) {
        return "待付款";
    } else if (status == 3) {
        return "解析失败";
    } else if (status == 4) {
        return "用户支付成功";
    } else if (status == 5) {
        return "供货成功";
    } else if (status == 6) {
        return "供货成功";
    } else if (status == 7) {
        return "供货失败";
    } else if (status == 8) {
        return "检测成功";
    } else if (status == 9) {
        return "已经退款"
    } else if (status == 10) {
        return "报告删除"
    }
    return "";
}

function showDetails(row: any) {
    dialogDetails.value=null;
    nextTick(() => {
        dialogDetails.value = { ...row };
        dialogDetailsVisible.value = true;
    })

}

function getStatusClass(status: number) {
    const map: Record<number, string> = {
        1: 'status-processing',   // 解析中
        2: 'status-pending',      // 待付款
        3: 'status-error',        // 解析失败
        4: 'status-success',      // 用户支付成功
        5: 'status-success',      // 供货成功
        6: 'status-success',      // 供货成功
        7: 'status-error',        // 供货失败
        8: 'status-done',         // 检测成功
        9: 'status-neutral',      // 已经退款
        10: 'status-neutral',     // 报告删除
    }
    return map[status] || ''
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
        let url = '/manage/getCheckOrderData?page=' + pagination.currentPage + '&limit=' + pagination.pageSize;
        let orderid = searchForm.orderid.trim();
        if (orderid.length > 1) {
            url = url + "&orderid=" + orderid;
        }
        let payid = searchForm.payid.trim();
        if (payid.length > 1) {
            url = url + "&payid=" + payid;
        }
        let userid = searchForm.userid.trim();
        if (userid.length > 1) {
            url = url + "&userid=" + userid;
        }


        const res = await paxios.get(url);
        if (res.data.code === 0) {
            tableData.value = res.data.data;
            pagination.total = res.data.count;
        } else {
            ElMessage.error(res.data.msg);
        }
    } catch (error) {
        ElMessage.error('获取检测记录列表失败');
        console.error('获取检测记录列表错误:', error);
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


async function orderRefund(row: any) {
    let msg = "订单" + row.id + ",支付id:" + row.payid + ",将退款 " + row.total_price / 100 + "元";
    ElMessageBox.confirm(
        msg,
        '退款警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(async () => {
            try {
                let res = await paxios.post("/manage/orderRefund", { orderid: row.id });
                if (res.data.code == 0) {
                    ElMessage.success("退款成功");
                    fetchProductList();
                } else {
                    ElMessage.error(res.data.msg);
                }
            } catch (err) {
                ElMessage.error("退款失败");
            }
        })
        .catch(() => {

        })

}


</script>
<style scoped>
/* 状态文字配色 */
.status-processing {
    color: #409EFF;
}

/* 解析中 — 蓝色，进行中 */
.status-pending {
    color: #E6A23C;
}

/* 待付款 — 橙色，需关注 */
.status-error {
    color: #F56C6C;
}

/* 失败 — 红色，错误 */
.status-success {
    color: #67C23A;
}

/* 成功 — 绿色，已完成 */
.status-done {
    color: #409EFF;
}

/* 检测完成 — 蓝色，已完结 */
.status-neutral {
    color: #909399;
}

/* 退款/删除 — 灰色，中性 */

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