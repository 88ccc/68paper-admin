<template>
    <el-config-provider :locale="zhCn">
        <el-dialog v-model="dialogVisible" title="编辑产品" :width="dialogWidth" :close-on-click-modal="false" show-close>
            <el-form v-loading="dialogLoading" ref="ruleFormRef" :model="rwData" label-width="auto"
                style="margin-top: 10px;">
                <el-form-item label="产品id" prop="id">
                    <el-input v-model="rwData.id" disabled />
                </el-form-item>
                <el-form-item label="产品名称" prop="name">
                    <el-input v-model="rwData.name" disabled />
                </el-form-item>
                <el-form-item label="成本价" prop="price">
                    <el-input type="number" v-model="rwData.cost" disabled>
                        <template #append>元/{{ unitstr }}</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="供货价格" prop="price">
                    <el-input type="number" v-model="rwData.price">
                        <template #append>元/{{ unitstr }}</template>
                    </el-input>
                </el-form-item>
                <el-form-item v-if="hasInvite" label="邀请奖励" prop="reward">
                    <el-input type="number" v-model="rwData.reward">
                        <template #append>元/{{ unitstr }}</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="最低零售价" prop="mini_price">
                    <el-input type="number" v-model="rwData.mini_price">
                        <template #append>元/{{ unitstr }}</template>
                    </el-input>
                    <div class="el-form-item__error" style="position: static; color: #999;">
                        提示：供货方最低零售价{{ rwData.low_price / 100 }}元/{{ unitstr }}
                    </div>
                </el-form-item>


                <el-form-item label="状态">
                    <el-select v-model="rwData.status" placeholder="请选择">
                        <el-option label="正常" :value="1" />
                        <el-option label="禁用" :value="2" />
                    </el-select>
                    <div class="el-form-item__error" style="position: static; color: #999;">
                        提示：供货方状态 {{ rwData.supplier_status === 1 ? '正常' :
                            rwData.supplier_status === 2 ? '禁用' : '已删除' }}
                    </div>
                </el-form-item>

                <el-form-item label="备注" prop="remark">
                    <el-input v-model="rwData.remark" :rows="4" type="textarea" />
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
            <el-button @click="syncProduct" type="primary">同步货源</el-button>
            <div class="table-container">
                <el-table :data="tableData" border stripe style="width: 100%" :cell-style="{ 'padding': '8px 5px' }"
                    :header-cell-style="{ 'padding': '10px 5px' }">
                    <el-table-column prop="name" label="产品名称" min-width="120" align="center" />
                    <el-table-column label="成本" min-width="120" align="center" :show-overflow-tooltip="true">
                        <template #default="scope">
                            {{ scope.row.cost / 100 }}元/{{ convertNumberToUnit(scope.row.unit) }}

                        </template>
                    </el-table-column>
                    <el-table-column label="供货价" min-width="120" align="center" :show-overflow-tooltip="true">
                        <template #default="scope">
                            {{ scope.row.price / 100 }}元/{{ convertNumberToUnit(scope.row.unit) }}
                        </template>
                    </el-table-column>
                    <el-table-column v-if="hasInvite" label="邀请奖励" min-width="120" align="center" :show-overflow-tooltip="true">
                        <template #default="scope">
                            {{ scope.row.reward / 100 }}元/{{ convertNumberToUnit(scope.row.unit) }}
                        </template>
                    </el-table-column>

                    <el-table-column label="最低零售价" min-width="120" align="center" :show-overflow-tooltip="true">
                        <template #default="scope">
                            {{ scope.row.mini_price / 100 }}元/{{ convertNumberToUnit(scope.row.unit) }}
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
                    <el-table-column prop="remark" label="备注" min-width="80" align="center" />
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
const unitstr = ref("");
const hasInvite = ref(false);
interface CheckItem {
    id: string;
    name: string;
    price: number;
    reward: number;
    cost: number;
    unit: number;
    low_price: number;
    mini_price: number;
    supplier_status: number;
    status: number;
    remark: string;
}

const rwData = ref<CheckItem>({
    id: '',
    name: '',
    price: 0,
    reward:0,
    cost: 0,
    unit: 0,
    low_price: 0,
    mini_price: 0,
    supplier_status: 0,
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
    rwData.value.reward = Math.round(row.reward / 100 * 100) / 100;
    rwData.value.mini_price = Math.round(row.mini_price / 100 * 100) / 100;
    unitstr.value = convertNumberToUnit(row.unit);
    dialogVisible.value = true;
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
    console.log(rwData.value.price, rwData.value.mini_price);
    console.log(getDecimalDigits(rwData.value.price), getDecimalDigits(rwData.value.mini_price));
    if (getDecimalDigits(rwData.value.price) > 2 || getDecimalDigits(rwData.value.mini_price) > 2 || getDecimalDigits(rwData.value.reward) > 2) {
        ElMessage.error("价格最多只能有两位小数");
        return;
    }

    let price = Math.round(rwData.value.price * 100);
    let reward = Math.round(rwData.value.reward * 100);
    let cost = Math.round(rwData.value.cost * 100);
    let lir = price - cost - reward;
    if(lir <0){
        ElMessage.error("供货价必须大于成本价和邀请奖励之和");
        return;
    }
    let mini_price = Math.round(rwData.value.mini_price * 100);
    const res = await paxios.post("/manage/updateCheckProduct", {
        id: rwData.value.id,
        price: price,
        mini_price: mini_price,
        reward: reward,
        status: rwData.value.status,
        remark: rwData.value.remark
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
    let res = await paxios.get("/index/getInviteConfig");
    if (res.data.code == 0) {
        let str = res.data.data.enable;
        const val = String(str).trim().toLowerCase();
        hasInvite.value = (val === 'true');
    }
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