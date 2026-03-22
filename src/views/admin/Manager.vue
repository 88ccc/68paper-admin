<template>
    <el-dialog title="上传头像"  v-model="showEditDialog" :width="dialogWidth">
        <el-form label-width="auto" v-loading="loading">
            <el-form-item label="头像:">
                <el-upload class="avatar-uploader" :auto-upload="false" :show-file-list="false"
                    :on-change="avatarHandChange">
                    <img v-if="imageUrl" :src="imageUrl" class="avatar" />
                    <el-button v-if="imageUrl" icon="Delete" circle size="small" class="delete-btn"
                        @click.stop="avatarHandleDelete" />
                    <el-icon v-else class="avatar-uploader-icon">
                        <Plus />
                    </el-icon>
                </el-upload>

            </el-form-item>
            <el-form-item label="帐号">
                <el-input v-model="editName" />
            </el-form-item>
            <el-form-item label="密码">
                <el-input v-model="editPassword" placeholder="请输入密码" type="password" show-password />
            </el-form-item>
            <el-form-item>
                <el-button @click="showEditDialog = false">取消</el-button>
            <el-button type="primary" @click="handleEditInfo">确定</el-button>
            </el-form-item>
        </el-form>
       
        <template #footer>
            <el-text class="mx-1" size="small">不修改密码就不要输入密码</el-text><br /><br />
            
        </template>
    </el-dialog>
    <el-config-provider :locale="zhCn">
        <div class="user-list-container">

            <div class="table-container">
                <el-table :data="tableData" border stripe style="width: 100%" v-loading="loading"
                    :cell-style="{ 'padding': '8px 5px' }" :header-cell-style="{ 'padding': '10px 5px' }">
                    <el-table-column prop="id" label="用户ID" min-width="80" align="center" />
                    <el-table-column label="用户头像" min-width="80" align="center">
                        <template #default="scope">
                            <el-avatar :src="CompleteUrl(scope.row.avatar)"></el-avatar>
                        </template>
                    </el-table-column>
                    <el-table-column prop="name" label="帐号" min-width="140" align="center"
                        :show-overflow-tooltip="true">
                    </el-table-column>
                    <el-table-column prop="status" label="状态" min-width="100" align="center">
                        <template #default="scope">
                            <el-tag :type="scope.row.status === 1 ? 'success' :
                                scope.row.status === 2 ? 'danger' : 'warning'" size="small">
                                {{ scope.row.status === 1 ? '正常' :
                                    scope.row.status === 2 ? '禁用' : '未激活' }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="create_time" label="创建时间" min-width="140" align="center"
                        :show-overflow-tooltip="true" />
                    <el-table-column label="操作" min-width="120" align="center">
                        <template #default="scope">
                            <el-button type="primary" text size="small" @click="toShowEditDialog(scope.row)">
                                编辑
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <div class="pagination-container">
                <el-pagination :pager-count="5" v-model:current-page="pagination.currentPage"
                    v-model:page-size="pagination.pageSize" :page-sizes="[10, 20, 50]" :total="pagination.total"
                    layout="total, sizes, prev, pager, next" @size-change="handleSizeChange"
                    @current-change="handleCurrentChange" />
            </div>
        </div>
    </el-config-provider>
</template>

<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import { paxios } from '@/utils/paxios';
import { CompleteUrl } from '@/utils/utils';
import type { UploadFile, UploadFiles } from 'element-plus'
import { useAdminInfoStore } from '@/stores/adminInfo'
import { storeToRefs } from "pinia"

const { name:adminName, adminId,avatar:adminAvatar } = storeToRefs(useAdminInfoStore());

const dialogWidth = ref('400px');
const showEditDialog = ref(false);
const imageUrl = ref('')
let imageFile: any = null;
const editId = ref('');
const editName = ref('');
const editPassword = ref('');

// 定义分页类型
interface Pagination {
    currentPage: number;
    pageSize: number;
    total: number;
}

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

// 初始化页面时加载数据
onMounted(() => {
    fetchUserList();
    // 初始化窗口尺寸
    handleResize();
    // 添加窗口大小变化监听器
    window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
})

// 获取用户列表数据
const fetchUserList = async () => {
    try {
        loading.value = true;
        let url = '/manage/getAdminData?page=' + pagination.currentPage + '&limit=' + pagination.pageSize;


        const res = await paxios.get(url);
        if (res.data.code === 0) {
            tableData.value = res.data.data;
            pagination.total = res.data.count;
        } else {
            ElMessage.error(res.data.msg);
        }
    } catch (error) {
        ElMessage.error('获取用户列表失败');
        console.error('获取用户列表错误:', error);
    } finally {
        loading.value = false;
    }
};

// 分页大小改变事件
const handleSizeChange = (size: number) => {
    pagination.pageSize = size;
    fetchUserList();
};

// 当前页码改变事件
const handleCurrentChange = (page: number) => {
    pagination.currentPage = page;
    fetchUserList();
};
// 定义处理窗口大小变化的函数
const handleResize = () => {
    if (window.innerWidth < 768) {
        dialogWidth.value = "92%";
    } else {
        dialogWidth.value = "400px";

    }
};

function avatarHandleDelete() {
    imageUrl.value = '';
    imageFile = null;
}

function avatarHandChange(uploadFile: UploadFile, uploadFiles: UploadFiles) {
    if (uploadFile.raw) {
        //必须是图片
        if (!uploadFile.raw.type.startsWith('image/')) {
            ElMessage.error('请上传图片文件');
            return;
        }
        // 必须小于1M
        if (uploadFile.raw.size > 500 * 1024) {
            ElMessage.error('图片大小不能超过500K');
            return;
        }
        // 必须是正方形
        const img = new Image()
        // 图片加载完成后获取宽高
        img.onload = function () {
            console.log('图片宽度：', img.width); // 宽度（像素）
            console.log('图片高度：', img.height); // 高度（像素）
            if (img.width != img.height) {
                ElMessage.error('图片必须是正方形');
                URL.revokeObjectURL(imageUrl.value);
                imageUrl.value = '';
                imageFile = null;
                return;
            }
            URL.revokeObjectURL(imageUrl.value);

        };
        img.onerror = function () {
            console.error('图片加载失败，可能不是有效的图片文件');
            URL.revokeObjectURL(imageUrl.value); // 释放资源
            imageUrl.value = '';
            imageFile = null;
        };
        imageFile = uploadFile.raw;
        imageUrl.value = URL.createObjectURL(uploadFile.raw)
        img.src = imageUrl.value;
    } else {
        imageUrl.value = '';
        imageFile = null;
    }
}

// 编辑用户
const toShowEditDialog = (row: any) => {
    ElMessage.info(`编辑用户: ${row.id}`);
    editId.value = row.id;
    editName.value = row.name;
    showEditDialog.value = true;
    imageUrl.value = CompleteUrl(row.avatar);
};
function handleEditInfo() {
    loading.value = true;
    const formData = new FormData();
    formData.append('id', editId.value);
    if (imageFile) {
        formData.append('avatar', imageFile);
    }
    if (editName.value) {
        formData.append('name', editName.value);
    }
    if (editPassword.value) {
        formData.append('password', editPassword.value);
    }
    paxios.post('/manage/editAdmin', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }).then(res => {
        if (res.data.code == 0) {
            ElMessage.success(res.data.msg);
            showEditDialog.value = false;
            if(editId.value == ''+adminId.value){
                location.reload();
            }else{
                fetchUserList();
            }
        } else {
            ElMessage.error(res.data.msg);
            loading.value = false;
        }
    }).catch(error => {
        console.log(error);
        loading.value = false;
        ElMessage.error("提交失败，请稍后再试");
    })
}
</script>

<style scoped>
.avatar-uploader .avatar {
    width: 178px;
    height: 178px;
    display: block;
}

.delete-btn {
    position: absolute;
    background-color: rgba(255, 255, 255, 0.8);
    border: 1px solid #eee;
    display: none;
}

.user-list-container {
    padding: 16px;
    background-color: #fff;
    min-height: 100vh;
    box-sizing: border-box;
    /* 确保padding不会增加总宽度 */
}


.search-bar {
    margin-bottom: 16px;
    padding: 12px;
    background-color: #f5f7fa;
    border-radius: 4px;
}



.table-container {
    margin-bottom: 16px;
    overflow-x: auto;
    /* 表格在小屏幕上可横向滚动 */
}

.pagination-container {
    text-align: right;
    padding-top: 8px;
}

/* 针对不同屏幕尺寸的额外调整 */
@media (max-width: 767px) {
    .user-list-container {
        padding: 8px;
    }

    .search-bar {
        padding: 8px;
    }
}
</style>
<style>
.avatar-uploader:hover .delete-btn {
    display: block;
}


.avatar-uploader .el-upload {
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
    border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    text-align: center;
}
</style>