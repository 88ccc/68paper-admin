<template>
    <el-card>
        <template #header>
            <div class="card-header">
                <span>附件管理</span>
            </div>
        </template>
        <el-card v-if="attachmentInfo.status == 0" v-loading="loading">
            <el-form label-width="100px" style="max-width: 800px">
                <el-form-item label="上传文件">
                    <el-upload :multiple="false" style="width: 100%;" ref="uploadRef" :show-file-list="false" :limit="1"
                        drag action="#" :auto-upload="false" :on-exceed="handleExceed" :on-change="fileChange">
                        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                        <div class="el-upload__text">
                            <span v-show="formData.fileName == ''">将文件拖到此处，或<em>点击上传</em></span>
                            <span v-show="formData.fileName != ''">{{ formData.fileName }}&ensp;&ensp;<el-button
                                    type="danger" :icon="Delete" size="small" @click.stop="deleteFile()"
                                    circle /></span>

                        </div>
                    </el-upload>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submit">提交</el-button>
                </el-form-item>
            </el-form>

        </el-card>
        <el-card v-if="attachmentInfo.status != 0" v-loading="loading">
            文件状态：{{ file_status(attachmentInfo.status) }}<br />
            文件名称：{{ attachmentInfo.file_name }}<br />
            上传时间：{{ attachmentInfo.file_time }}<br />
            <el-button type="primary" size="small" @click="download">下载</el-button> <el-button type="warning"
                size="small" @click="deleteAttachment">删除</el-button>
        </el-card>

        <template #footer>
            1、附件会随着报告一起被下载<br />
            2、附件大小不超过2M<br />
            3、仅支持pdf格式<br />
            4、文件中不得有 黄、赌、毒 等违反中国法律的内容，一旦发现有违法内容，将永久禁止你使用该功能，情节严重的我们会主动报警<br />
            5、文件中不得涉及政治，不得包含 金融广告、医疗广告。不得包含性暗示等低俗趣味<br />
            6、上传者对文件内容负责<br />
        </template>
    </el-card>
</template>
<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { paxios } from '@/utils/paxios';
import type { UploadFile, UploadFiles, UploadInstance } from 'element-plus'
import {
    Warning,
    Delete
} from '@element-plus/icons-vue'
import { useWebsitConfigStore } from '@/stores/websitConfig';
let websitConfigStore = useWebsitConfigStore()
const { apiUrl } = websitConfigStore

const uploadRef = ref<UploadInstance>()
const loading = ref(false);

const attachmentInfo = ref({
    userid: 0,
    file_name: '',
    file_time: '',
    status: 0

});

// 表单数据
const formData = reactive({
    file: null as File | null,
    fileName: '',
    scope: ''
})

onMounted(async () => {
    let res = await paxios.get('/console/attachment_info');
    if (res.data.code != 0) {
        ElMessage.error(res.data.msg);
        return;
    }
    attachmentInfo.value.userid = res.data.data.userid;
    attachmentInfo.value.file_name = res.data.data.file_name;
    attachmentInfo.value.file_time = res.data.data.file_time;
    attachmentInfo.value.status = res.data.data.status;
})

function file_status(status: number) {
    if (status == 0) {
        return '未上传';
    } else if (status == 1 || status == 2) {
        return '已上传';
    } else if (status == 3) {
        return '审核不通过'
    } else if (status == 4) {
        return '永久禁用'
    }
}
function handleExceed() {
    ElMessageBox.alert('只能上传一个文件，你可以删除原有文件后再重新上传新文件，或者刷新网页后重试', '错误', {
        confirmButtonText: '确定'
    });
}

async function fileChange(file: UploadFile, uploadFiles: UploadFiles) {
    const rawFile = file.raw
    if (!rawFile) return

    // 2. 提取文件名的后缀：找到最后一个"."的位置
    const lastDotIndex = rawFile.name.lastIndexOf('.');
    // 没有后缀（无点）或点在最后（如"文件名."），返回false
    if (lastDotIndex === -1 || lastDotIndex === rawFile.name.length - 1) {
        ElMessage.error('仅支持pdf格式')
        formData.file = null
        formData.fileName = ''
        uploadRef.value?.clearFiles();
        return
    }

    // 3. 提取后缀并转小写，判断是否在支持列表中
    const fileExt = rawFile.name.slice(lastDotIndex + 1).toLowerCase();

    if (fileExt != 'pdf') {
        ElMessage.error('仅支持pdf格式')
        formData.file = null
        formData.fileName = ''
        uploadRef.value?.clearFiles();
        return
    }

    if (rawFile.size > 2 * 1024 * 1024) {
        ElMessage.error('文件大小不能超过 2MB')
        formData.file = null
        formData.fileName = ''
        uploadRef.value?.clearFiles();
        return
    }
    if (!new RegExp("^[a-zA-Z0-9_\u4e00-\u9fa5]+\.pdf$").test(rawFile.name)) {
        ElMessage.error('文件名只能是中文、大小写字母、数字和下划线，例如 查重秘籍_abcDEF_123.pdf');
        formData.file = null
        formData.fileName = ''
        uploadRef.value?.clearFiles();
        return;
    }
    formData.fileName = rawFile.name;
    formData.file = rawFile
}
function deleteFile() {
    uploadRef.value?.clearFiles();
    formData.file = null
    formData.fileName = ''
}

async function submit() {
    if (formData.file == null) {
        ElMessage.error('请选择文件')
        return
    }

    try {
        loading.value = true;
        const formDataObj = new FormData()
        formDataObj.append('scope', formData.scope);

        formDataObj.append('file', formData.file)

        const res1 = await paxios.post('/console/attachment_upload', formDataObj, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        if (res1.data.code == 0) {
            ElMessage.success("上传成功");
            attachmentInfo.value.userid = res1.data.data.userid;
            attachmentInfo.value.file_name = res1.data.data.file_name;
            attachmentInfo.value.file_time = res1.data.data.file_time;
            attachmentInfo.value.status = res1.data.data.status;
        } else {
            ElMessage.error(res1.data.msg);
            loading.value = false;
            return;
        }

    } catch (err) {
        ElMessage.error("上传文件出错");
    } finally {
        loading.value = false;
    }

}

function download() {
    window.open(apiUrl + '/index/down_attachment?id=' + attachmentInfo.value.userid);
}

function deleteAttachment() {
    ElMessageBox.confirm('确定要删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
    }).then(async () => {
        try {
            loading.value = true;
            const res1 = await paxios.post('/console/attachment_delete');
            if (res1.data.code == 0) {
                ElMessage.success("删除成功");
                attachmentInfo.value.userid = 0;
                attachmentInfo.value.file_name = '';
                attachmentInfo.value.file_time = '';
                attachmentInfo.value.status = 0;
            } else {
                ElMessage.error(res1.data.msg);
                loading.value = false;
                return;
            }
        } catch (err) {
            ElMessage.error("删除文件出错");
        } finally {
            loading.value = false;
        }
    });
}
</script>