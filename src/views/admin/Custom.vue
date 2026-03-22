<template>
    <el-card>
        <template #header>
            <div class="card-header">
                <span>客服设置</span>
            </div>
        </template>
        <el-form label-width="80px" v-loading="loading">

            <el-form-item label="客服二维码:">
                <el-upload class="avatar-uploader" :auto-upload="false" :show-file-list="false" :on-change="handChange">
                    <img v-if="imageUrl" :src="imageUrl" class="avatar" />
                    <el-button v-if="imageUrl" icon="Delete" circle size="small" class="delete-btn"
                        @click.stop="handleDelete" />
                    <el-icon v-else class="avatar-uploader-icon">
                        <Plus />
                    </el-icon>
                </el-upload>
            </el-form-item>

            <el-form-item>
                <el-button type="primary" @click="onSubmit">提交</el-button>
            </el-form-item>
        </el-form>
    </el-card>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { UploadFile, UploadFiles } from 'element-plus'
import { paxios } from '@/utils/paxios';
import { CompleteUrl } from '@/utils/utils';

const imageUrl = ref('')
const loading = ref(false)
let imageFile: any = null;


function handleDelete() {
    imageUrl.value = '';
    imageFile = null;
}


function handChange(uploadFile: UploadFile, uploadFiles: UploadFiles) {
    if (uploadFile.raw) {
        //必须是图片
        if (!uploadFile.raw.type.startsWith('image/')) {
            ElMessage.error('请上传图片文件');
            return;
        }
        // 必须小于500kB
        if (uploadFile.raw.size > 500 * 1024) {
            ElMessage.error('图片大小不能超过500kB');
            return;
        }
        imageFile = uploadFile.raw;
        imageUrl.value = URL.createObjectURL(uploadFile.raw)
    } else {
        imageUrl.value = '';
        imageFile = null;
    }
}

function onSubmit() {
    if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        loading.value = true;
        paxios.post("/manage/setCustomConfig", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then(res => {
            if (res.data.code == 0) {
                ElMessage.success(res.data.msg);
            } else {
                ElMessage.error(res.data.msg);
            }
        }).catch(error => {
            console.log(error);
            ElMessage.error("提交失败，请稍后再试");
        }).finally(() => {
            loading.value = false;
        });
    }

}

onMounted(() => {
    loading.value = true
    paxios.get("/index/getCustomConfig").then(res => {
        if (res.data.code == 0) {
            imageUrl.value = CompleteUrl(res.data.data.url);
        }
    }).catch(error => {
        console.log(error);
    }).finally(() => {
        loading.value = false
    });
})

</script>


<style lang="css" scoped>
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

.avatar-uploader:hover .delete-btn {
    display: block;
}


:deep(.avatar-uploader .el-upload) {
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
}

:deep(.avatar-uploader .el-upload:hover) {
    border-color: var(--el-color-primary);
}

:deep(.el-icon.avatar-uploader-icon) {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    text-align: center;
}
</style>