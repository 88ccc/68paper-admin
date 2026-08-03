<template>
    <el-config-provider :locale="zhCn">
        <el-dialog v-model="dialogVisible" title="编辑产品" :width="dialogWidth" :close-on-click-modal="false" show-close>
            <el-form v-loading="dialogLoading" ref="ruleFormRef" :model="rwData" label-width="auto"
                style="margin-top: 10px;">
                <el-form-item label="产品名称" prop="name">
                    <el-input v-model="rwData.name" disabled />
                </el-form-item>
                <el-form-item label="供货价格" prop="cost">
                    <el-input type="number" v-model="rwData.cost" disabled>
                        <template #append>元/{{ unitstr }}</template>
                    </el-input>
                </el-form-item>

                <el-form-item label="零售价" prop="price">
                    <el-input type="number" v-model="rwData.price">
                        <template #append>元/{{ unitstr }}</template>
                    </el-input>
                    <div class="el-form-item__error" style="position: static; color: #999;">
                        提示：供货方最低零售价{{ rwData.mini_price }}元/{{ unitstr }}
                    </div>
                </el-form-item>


                <el-form-item label="状态">
                    <el-select v-model="rwData.status" placeholder="请选择">
                        <el-option label="正常" :value="1" />
                        <el-option label="禁用" :value="2" />
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
                    <span>检测产品</span>
                </div>
            </template>
            <div>
                <el-alert title="提示" type="primary" :closable="false">
                    1、你的利润是 售价 减去 供货价。<br />
                    2、你可以通过编辑，修改售价。<br />
                    <span v-if="reward_enabled">3、“邀请奖励”是什么意思？你可以去 代理管理->招募代理 页面，那里有详细说明。</span>
                </el-alert>
            </div>
            <div class="table-container">
                <el-table :data="tableData" border stripe style="width: 100%" :cell-style="{ 'padding': '8px 5px' }"
                    :header-cell-style="{ 'padding': '10px 5px' }">
                    <el-table-column prop="id" label="产品ID" min-width="100" align="center" />
                    <el-table-column prop="name" label="产品名称" min-width="120" align="center" />
                    <el-table-column label="供货价" min-width="120" align="center" :show-overflow-tooltip="true">
                        <template #default="scope">
                            {{ scope.row.cost / 100 }}元/{{ convertNumberToUnit(scope.row.punit) }}
                        </template>
                    </el-table-column>
                    <el-table-column v-if="reward_enabled" label="邀请奖励" min-width="120" align="center"
                        :show-overflow-tooltip="true">
                        <template #default="scope">
                            {{ scope.row.reward / 100 }}元/{{ convertNumberToUnit(scope.row.punit) }}
                        </template>
                    </el-table-column>

                    <el-table-column label="最低零售价" min-width="120" align="center" :show-overflow-tooltip="true">
                        <template #default="scope">
                            {{ scope.row.mini_price / 100 }}元/{{ convertNumberToUnit(scope.row.punit) }}
                        </template>
                    </el-table-column>
                    <el-table-column label="零售价" min-width="120" align="center" :show-overflow-tooltip="true">
                        <template #default="scope">
                            {{ scope.row.price / 100 }}元/{{ convertNumberToUnit(scope.row.unit) }}
                        </template>
                    </el-table-column>
                    <el-table-column label="利润" min-width="120" align="center" :show-overflow-tooltip="true">
                        <template #default="scope">
                            <span v-html="getProfit(scope.row)"></span>
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
                    <el-table-column prop="remark" label="备注" min-width="80" align="center" />
                    <el-table-column label="操作" min-width="120" align="center">
                        <template #default="scope">
                            <el-button type="primary" text size="small" @click="editProduct(scope.row)">
                                编辑
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
const dialogVisible = ref(false)
const dialogWidth = ref('600px')
const dialogLoading = ref(false)
const unitstr = ref("");
interface CheckItem {
    id: string;
    name: string;
    price: number;
    cost: number;
    unit: number;
    punit: number;
    mini_price: number;
    status: number;
    remark: string;
}

const rwData = ref<CheckItem>({
    id: '',
    name: '',
    price: 0,
    cost: 0,
    unit: 0,
    punit: 0,
    mini_price: 0,
    status: 1,
    remark: '',
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

function convertNumberToUnit(num: number) {
    // 转为有效数字
    const number = Number(num);
    if (isNaN(number)) return '';

    // 0 特殊处理
    if (number === 0) return '篇';

    // 1️⃣ 整万倍数（最高优先级）
    if (number % 10000 === 0) {
        const val = number / 10000;
        return val === 1 ? '万字符' : `${val}万字符`;
    }

    // 2️⃣ 整千倍数
    if (number % 1000 === 0) {
        const val = number / 1000;
        return val === 1 ? '千字符' : `${val}千字符`;
    }

    // 3️⃣ 整百倍数
    if (number % 100 === 0) {
        const val = number / 100;
        return val === 1 ? '百字符' : `${val}百字符`;
    }

    // 都不满足，原样返回
    return String(number) + '字符';
}

function editProduct(row: any) {
    // 跳转到编辑页面，传递产品ID
    rwData.value = { ...row };
    rwData.value.cost = Math.round(row.cost / 100 * 100) / 100;
    rwData.value.price = Math.round(row.price / 100 * 100) / 100;
    rwData.value.mini_price = Math.round(row.mini_price / 100 * 100) / 100;
    unitstr.value = convertNumberToUnit(row.punit);
    dialogVisible.value = true;
}

function getProfit(row: any) {
    let bili = 1;
    if (row.unit > row.punit) {
        bili = Math.floor(row.unit / row.punit);
    }

    let cost = bili * row.cost;
    let profit = row.price - cost;
    let str = "" + profit / 100 + "元/" + convertNumberToUnit(row.unit);
    let rstr = "";
    if (profit <= 0) {
        rstr = "<span style='color:red'>" + str + "</span>";
    } else {
        rstr = str;
    }
    return rstr;
}


function getDecimalDigits(num: number): number {
    if (num === null || num === undefined) return 0;

    const str = num.toString();

    // 没有小数点 → 0 位
    if (!str.includes('.')) return 0;

    // 返回小数点后面的长度
    return str.split('.')[1].length;
}

async function handleSubmit() {

    if (getDecimalDigits(rwData.value.price) > 2) {
        ElMessage.error("价格最多只能有两位小数");
        return;
    }
    let price = Math.round(rwData.value.price * 100);


    const res = await paxios.post("/console/updateCheckProduct", {
        id: rwData.value.id,
        price: price,
        status: rwData.value.status
    });
    if (res.data.code === 0) {
        ElMessage.success("更新成功");
        dialogVisible.value = false;
        fetchProductList();
    } else {
        ElMessage.error(res.data.msg);
    }

}





// 表格数据
const tableData = ref<any[]>([]);

// 获取列表数据
const fetchProductList = async () => {
    try {
        loading.value = true;
        let url = '/console/getCheckData?page=' + pagination.currentPage + '&limit=' + pagination.pageSize;
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
    fetchProductList();
})
onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
})

</script>

<style scoped>
.text-red {
    color: red;
}

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