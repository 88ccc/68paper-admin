<template>
    <el-config-provider :locale="zhCn">
        <el-dialog v-model="dialogVisible" title="新增店铺" :width="dialogWidth" :close-on-click-modal="false" show-close>
            <el-alert title="注意" type="success" :closable="false">
                <p>店铺ID只能是小写字母和数字组成，长度不得超过64</p>
                <p>店铺名称支持中英文长度不得超过64</p>
            </el-alert>
            <el-form v-loading="dialogLoading" label-width="auto" style="margin-top: 10px;">
                <el-form-item label="店铺id">
                    <el-input v-model="newShopId" />
                </el-form-item>
                <el-form-item label="店铺名称名称">
                    <el-input v-model="newShopName" />
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
                    <span>店铺管理</span>
                </div>
            </template>
            <el-button @click="addShop" type="primary">新增店铺</el-button>
            <div class="table-container">
                <el-table :data="tableData" border stripe style="width: 100%" :cell-style="{ 'padding': '8px 5px' }"
                    :header-cell-style="{ 'padding': '10px 5px' }">
                    <el-table-column prop="id" label="店铺ID" min-width="80" align="center" />
                    <el-table-column prop="name" label="店铺名称" min-width="80" align="center" />

                    <el-table-column label="状态" min-width="80" align="center">
                        <template #default="scope">
                            <el-tag :type="scope.row.status === 1 ? 'success' :
                                scope.row.status === 2 ? 'danger' : 'warning'" size="small">
                                {{ scope.row.status === 1 ? '正常' :
                                    scope.row.status === 2 ? '禁用' : '未知' }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="管理" min-width="120" align="center">
                        <template #default="scope">
                            <el-button type="primary" text size="small" @click="manageShop(scope.row)">
                                管理
                            </el-button>

                        </template>
                    </el-table-column>
                    <el-table-column label="操作" min-width="120" align="center">
                        <template #default="scope">
                            <el-button v-if="scope.row.status == 1" type="warning" text size="small"
                                @click="disableShop(scope.row)">
                                禁用
                            </el-button>
                            <el-button v-if="scope.row.status == 2" type="primary" text size="small"
                                @click="enableShop(scope.row)">
                                启用
                            </el-button>
                            <el-button type="danger" text size="small" @click="deleteShop(scope.row)">
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
import { ref, onMounted, reactive,onUnmounted } from 'vue'
import { paxios } from '@/utils/paxios'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import { useRouter } from 'vue-router'
const loading = ref(false);

const router = useRouter()

const dialogVisible = ref(false);
const dialogWidth = ref('600px');
const dialogLoading = ref(false);
const newShopId = ref("");
const newShopName = ref("");
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
    fetchShopList();
};
// 当前页码改变事件
const handleCurrentChange = (page: number) => {
    pagination.currentPage = page;
    fetchShopList();
};


async function enableShop(row: any) {
    try {
        loading.value = true;
        let res = await paxios.post("/manage/enableShop", { id: row.id });
        if (res.data.code != 0) {
            ElMessage.error(res.data.msg);
            loading.value = false;
            return;
        }
        fetchShopList();
    } catch (error) {
        loading.value = false;
    }

}

const handleResize = () => {
    if (window.innerWidth < 768) {
        dialogWidth.value = "92%";
    } else {
        dialogWidth.value = "600px";

    }
};

async function disableShop(row: any) {
    ElMessageBox.confirm(
        '禁用后，该店铺的所有产品都无法使用',
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
                let res = await paxios.post("/manage/desableShop", { id: row.id });
                if (res.data.code != 0) {
                    ElMessage.error(res.data.msg);
                    loading.value = false;
                    return;
                }
                fetchShopList();
            } catch (error) {
                loading.value = false;
            }
        })
        .catch(() => {

        })

}

async function deleteShop(row: any) {
    ElMessageBox.confirm(
        '删除后，所有该店铺的配置都会被删除',
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
                let res = await paxios.post("/manage/deleteShop", { id: row.id });
                if (res.data.code != 0) {
                    ElMessage.error(res.data.msg);
                    loading.value = false;
                    return;
                }
                fetchShopList();
            } catch (error) {
                loading.value = false;
            }
        })
        .catch(() => {

        })
}


// 表格数据
const tableData = ref<any[]>([]);


function addShop() {
    dialogLoading.value = false;
    dialogVisible.value = true;
    newShopId.value = "";
    newShopName.value = "";
}

async function handleSubmit() {
    //判断newShopId 是否合法
    let shopid = newShopId.value.trim();
    const strLength = shopid.length;
    if (strLength > 64 || strLength < 1) {
        ElMessage.error("店铺ID长度必须在1-64之间");
        return;
    }
    const reg = /^[a-z0-9]{1,64}$/;

    // 4. 使用正则test()方法验证字符串，返回布尔值
    if (!reg.test(shopid)) {
        ElMessage.error("店铺ID只能由小写字母和数字组成");
        return;
    }
    let shopname = newShopName.value.trim()
    const nameLength = shopname.length;
    if (nameLength > 64 || nameLength < 1) {
        ElMessage.error("店铺ID长度必须在1-64之间");
        return;
    }
    try {
        dialogLoading.value = true;
        const res = await paxios.post("/manage/addShop",{id:shopid,name:shopname});
        if(res.data.code == 0){
            ElMessage.success("添加成功");
            dialogVisible.value = false;
            fetchShopList();
        }else{
            ElMessage.error(res.data.msg);
        }
    }catch(error){

    }
}

function manageShop(row:any){
    
router.push({
    path: '/shopd/',
    query: {
        id: row.id,
        name:row.name
    }
  })
    
}

// 获取列表数据
const fetchShopList = async () => {
    try {
        loading.value = true;
        let url = '/manage/getShopData?type=2&page=' + pagination.currentPage + '&limit=' + pagination.pageSize;


        const res = await paxios.get(url);
        if (res.data.code === 0) {
            tableData.value = res.data.data;
            pagination.total = res.data.count;
        } else {
            ElMessage.error(res.data.msg);
        }
    } catch (error) {
        ElMessage.error('获取店铺列表失败');
        console.error('获取店铺列表错误:', error);
    } finally {
        loading.value = false;
    }
};



onMounted(async () => {
    fetchShopList();
    handleResize();
    // 添加窗口大小变化监听器
    window.addEventListener('resize', handleResize);
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