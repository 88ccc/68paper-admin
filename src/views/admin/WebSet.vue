<template>
    <el-card>
        <template #header>
            <div class="card-header">
                <span>网站设置</span>
            </div>
        </template>
        <el-form label-width="auto" v-loading="loading">
            <el-form-item label="网站名称" :required="true">
                <el-input v-model="webName" maxlength="20" show-word-limit />
            </el-form-item>
            <el-form-item label="网站logo">
                <el-upload class="avatar-uploader" :auto-upload="false" :show-file-list="false" :on-change="handChange">
                    <img v-if="imageUrl" :src="imageUrl" class="avatar" />
                    <el-button v-if="imageUrl" icon="Delete" circle size="small" class="delete-btn"
                        @click.stop="handleDelete" />
                    <el-icon v-else class="avatar-uploader-icon">
                        <Plus />
                    </el-icon>
                </el-upload>
            </el-form-item>
            <el-form-item label="网站favicon">
                <el-upload class="avatar-uploader" :auto-upload="false" :show-file-list="false"
                    :on-change="handFaviconChange">
                    <img v-if="faviconUrl" :src="faviconUrl" class="avatar" />
                    <el-button v-if="faviconUrl" icon="Delete" circle size="small" class="delete-btn"
                        @click.stop="handlFaviconeDelete" />
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
import { paxios } from '@/utils/paxios'
import { CompleteUrl } from '@/utils/utils'
const webName = ref('')
const loading = ref(false)

const imageUrl = ref('')
const faviconUrl = ref('')
let imageFile: any = null;
let faviconFile: any = null;

function handlFaviconeDelete() {
    faviconUrl.value = '';
    faviconFile = null;
}


function handleDelete() {
    imageUrl.value = '';
    imageFile = null;
}

function handFaviconChange(uploadFile: UploadFile, uploadFiles: UploadFiles) {
    if (uploadFile.raw) {
        //必须是图片
        console.log(uploadFile.raw.type);
        if (!uploadFile.raw.type.startsWith('image/x-icon')) {
            ElMessage.error('请上传ico格式图片文件');
            return;
        }
        // 必须小于100kB
        if (uploadFile.raw.size > 100 * 1024) {
            ElMessage.error('图片大小不能超过100kB');
            return;
        }

        faviconFile = uploadFile.raw;
        faviconUrl.value = URL.createObjectURL(uploadFile.raw)
    } else {
        faviconUrl.value = '';
        faviconFile = null;
    }
}

function handChange(uploadFile: UploadFile, uploadFiles: UploadFiles) {
    if (uploadFile.raw) {
        //必须是图片
        if (!uploadFile.raw.type.startsWith('image/')) {
            ElMessage.error('请上传图片文件');
            return;
        }
        // 必须小于1M
        if (uploadFile.raw.size > 1024 * 1024) {
            ElMessage.error('图片大小不能超过1M');
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

            // 释放临时URL资源（避免内存泄漏）
            //
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

onMounted(() => {
    loading.value = true;
    paxios.get("/index/getWebsiteConfig").then(res => {
        if (res.data.code == 0) {
            webName.value = res.data.data.webName;
            imageUrl.value = CompleteUrl(res.data.data.webLogo);
            faviconUrl.value = CompleteUrl(res.data.data.webFavicon);
        } else if (res.data.code != 10000) {
            ElMessage.error(res.data.msg);
        }
    }).catch(error => {
        console.log(error);
    }).finally(() => {
        loading.value = false;
    });
})

function onSubmit() {
    //检查数据
    if (!webName.value) {
        ElMessage.error('网站名称不能为空');
        return;
    }
    const formData = new FormData();
    if (imageFile) {
        formData.append('webLogo', imageFile);
    }
    if (faviconFile) {
        formData.append('favicon', faviconFile);
    }


    formData.append('webName', webName.value);
    loading.value = true;
    paxios.post("/manage/setWebsiteConfig", formData, {
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