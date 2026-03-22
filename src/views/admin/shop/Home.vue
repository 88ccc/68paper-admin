<template>
    <el-config-provider :locale="zhCn">
        <el-dialog v-model="dialogVisible" title="编辑产品" :width="dialogWidth" :close-on-click-modal="false" show-close>
            <el-alert :title="editProductCost" type="success" :closable="false"/>
            <el-form v-loading="dialogLoading" label-width="auto" style="margin-top: 10px;">
                <el-form-item label="店铺名称">
                    <el-input v-model="editShopName" disabled />
                </el-form-item>
                <el-form-item label="产品名称">
                    <el-input v-model="editProductName" disabled />
                </el-form-item>
                <el-form-item label="销售单价">
                    <el-input v-model="editProductPrice" type="number">
                        <template #append>元</template>
                    </el-input>
                </el-form-item>
                <el-form-item v-show="!editUnit0" label="销售单位">
                    <el-input v-model="editProducUnit" type="number">
                        <template #append>字符</template>
                    </el-input>
                </el-form-item>
                <el-form-item v-show="editUnit0" label="销售单位">
                    <el-input value="1" disabled>
                        <template #append>篇</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="状态">
                    <el-select v-model="editProductStatus" placeholder="请选择">
                        <el-option label="正常" value="1" />
                        <el-option label="禁用" value="2" />
                    </el-select>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="editProductTips" :rows="2" type="textarea">
                    </el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSubmit">提交</el-button>
                    <el-button @click="dialogVisible = false">取消</el-button>
                </el-form-item>

            </el-form>
        </el-dialog>
        <div class="filedev">
            <div class="filetitle">附件:</div>
            <div>
                <span v-if="fileName == ''">没有附件</span>
                <span v-else style="color: blue;">{{ fileName }}</span>
                <el-button size="small" v-if="fileName != ''" style="margin-left: 10px;" type="primary"
                    @click="downFile">下载</el-button>
                <el-button size="small" v-if="fileName != ''" style="margin-left: 10px;" type="danger"
                    @click="deleteFile">删除</el-button>
                <el-upload class="upload-demo" :show-file-list="false" :http-request="uploadFile"
                    accept="application/pdf">
                    <el-button type="primary">上传附件</el-button>
                </el-upload>
            </div>
            <el-text size="small">附件会随着报告一起被下载,只支持pdf文件，最大2M</el-text>
        </div>
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
                    <el-table-column prop="name" label="产品名称" min-width="120" align="center">
                        <template #default="scope">
                            {{ getProductName(scope.row.productid) }}
                        </template>
                    </el-table-column>
                    <el-table-column label="成本" min-width="140" align="center" :show-overflow-tooltip="true">
                        <template #default="scope">
                            {{ getProducCost(scope.row.productid) }}
                        </template>
                    </el-table-column>
                    <el-table-column label="售价" min-width="140" align="center" :show-overflow-tooltip="true">
                        <template #default="scope">
                            <span v-if="scope.row.unit == 0">{{ scope.row.price / 100 }}元/篇</span>
                            <span v-if="scope.row.unit != 0">{{ scope.row.price / 100 }}元/{{ scope.row.unit }}字符</span>
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
                    <el-table-column label="备注" prop="tips" min-width="80" align="center"
                        :show-overflow-tooltip="true" />
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
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { paxios } from '@/utils/paxios';
import { useWebsitConfigStore } from '@/stores/websitConfig'
import { storeToRefs } from "pinia"
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const { apiUrl } = storeToRefs(useWebsitConfigStore());
const { shopId, shopName } = defineProps(['shopId', 'shopName'])
const fileName = ref('');//附件名称

const dialogWidth = ref("600px");
const editShopName = ref('');
const dialogLoading = ref(false);
const editProductId = ref('');
const editProductName = ref('');
const editProductPrice = ref(0.00);
const editProducUnit = ref(0);
const editUnit0 = ref(false);
const editProductTips = ref('')
const editProductStatus = ref('');
const editProductCost = ref('');

const loading = ref(false)

const dialogVisible = ref(false)

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
// 表格数据
const tableData = ref<any[]>([]);

let checkData: any[] = [];

const handleResize = () => {
    if (window.innerWidth < 768) {
        dialogWidth.value = "92%";
    } else {
        dialogWidth.value = "600px";

    }
};

const handleSizeChange = (size: number) => {
    pagination.pageSize = size;
    fetchProductList();
};
// 当前页码改变事件
const handleCurrentChange = (page: number) => {
    pagination.currentPage = page;
    fetchProductList();
};

function getProductName(id: string) {
    for (let i = 0; i < checkData.length; i++) {
        if (checkData[i].id == id) {
            return checkData[i].name;
        }
    }
}

function getCostStr(id: string) {
    for (let i = 0; i < checkData.length; i++) {
        if (checkData[i].id == id) {
            if (checkData[i].unit == 0) {
                return "" + checkData[i].cost / 100 + "元/篇"
            } else {
                return "" + checkData[i].cost / 100 + "元/" + checkData[i].unit + "字符"
            }
        }
    }
}
function getProducCost(id: string) {

    for (let i = 0; i < checkData.length; i++) {

        if (checkData[i].id == id) {
            if (checkData[i].unit == 0) {
                return "" + checkData[i].cost / 100 + "元/篇"
            } else {
                return "" + checkData[i].cost / 100 + "元/" + checkData[i].unit + "字符"
            }

        }

    }

}

function editProduct(row: any) {
    editShopName.value = shopName;
    editProductId.value = row.productid;
    editProductName.value = getProductName(row.productid);
    editProductCost.value = "成本价格："+ getCostStr(row.productid);
    editProductPrice.value = row.price / 100;
    editProducUnit.value = row.unit;
    if (row.unit == 0) {
        editUnit0.value = true;
    } else {
        editUnit0.value = false;
    }
    editProductTips.value = row.tips;
    editProductStatus.value = "" + row.status;
    dialogVisible.value = true;

}

async function handleSubmit() {
    //判断editProductPrice 小数位数不得超过两位
    if (editProductPrice.value.toString().split(".")[1] && editProductPrice.value.toString().split(".")[1].length > 2) {
        ElMessage.error("售价最多保留两位小数");
        return;
    }
    let price = editProductPrice.value * 100;
    try {
        dialogLoading.value = true;
        let res = await paxios.post("/manage/editShopProduct", { shopid: shopId, productid: editProductId.value, status: editProductStatus.value, unit: editProducUnit.value, price: price, tips: editProductTips.value });
        if (res.data.code != 0) {
            ElMessage.error(res.data.msg);
        } else {
            ElMessage.success("编辑成功");
            dialogVisible.value = false;
            fetchProductList();
        }
    } catch (error) {
        console.error(error);
    } finally {

        dialogLoading.value = false;

    }
}




// 获取列表数据
const fetchProductList = async () => {
    try {
        loading.value = true;
        let url = '/manage/getShopProductData?shopid=' + shopId + '&page=' + pagination.currentPage + '&limit=' + pagination.pageSize;


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


async function syncProduct() {
    try {
        loading.value = true;
        let res = await paxios.post("/manage/syncShopProduct", { shopid: shopId });
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


onMounted(async () => {

    try {
        const res = await paxios.post("/manage/getShopInfo", { shopid: shopId });
        if (res.data.code != 0) {
            ElMessage.error(res.data.msg);
            return;
        }
        fileName.value = res.data.data.file_name;
        let url = '/manage/getCheckData?page=1&limit=1000';
        const res1 = await paxios.get(url);
        if (res1.data.code === 0) {
            checkData = res1.data.data;
        } else {
            ElMessage.error(res1.data.msg);
        }
        fetchProductList();
    } catch (error) {
        console.log(error)
    }
    handleResize();
    window.addEventListener('resize', handleResize);
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
})

async function uploadFile(option: any) {
    console.log(option.file)
    //判断文件是否是pdf格式

    if (option.file.type != 'application/pdf') {
        ElMessage.error('请上传pdf格式文件');
        return;
    }
    //判断文件大小是否超过2M
    if (option.file.size > 2 * 1024 * 1024) {
        ElMessage.error('文件大小不能超过2M');
        return;
    }
    try {
        const formData = new FormData();
        formData.append('file', option.file);
        formData.append('shopid', shopId);
        const res = await paxios.post('/manage/uploadShopFile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data' // 可省略，Axios 会自动设置
            }
        });

        if (res.data.code != 0) {
            ElMessage.error(res.data.msg);
            return;
        }
        fileName.value = res.data.data.file_name;


    } catch (error) {
        ElMessage.error("上传失败");
    }

}
function downFile() {
    window.open("" + apiUrl.value + "/index/downShopFile?shopid=" + shopId, "_blank");
}

async function deleteFile() {
    try {
        let res = await paxios.post("/manage/deleteShopFile", { shopid: shopId });
        if (res.data.code != 0) {
            ElMessage.error(res.data.msg);
            return;
        }
        ElMessage.success("删除成功");
        fileName.value = '';
    } catch (error) {
        ElMessage.error("删除失败");
    }
}
</script>
<style lang="css" scoped>
.filetitle {
    font-size: 18px;
    font-weight: bold;
    padding-bottom: 15px;
}

.filedev {
    background-color: #f0f8ff;
    /* AliceBlue */
    padding: 5px;
    border: 1px solid #ccc;
}

.upload-demo {
    margin-top: 10px;
}
</style>