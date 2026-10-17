<template>
    <div class="upgrade-container">
        <el-card shadow="never">
            <template #header>
                <div class="card-header">
                    <span class="card-title">系统升级</span>
                    <div class="card-btns">
                        <el-button :icon="Refresh" :loading="loading" @click="loadInfo">检测更新</el-button>
                        <el-button type="primary" :icon="Upload" :loading="running" :disabled="loading || upToDate"
                            @click="onUpgrade">
                            立即升级
                        </el-button>
                    </div>
                </div>
            </template>

            <div v-loading="loading" class="upgrade-body">
                <el-alert type="warning" :closable="false" show-icon class="tip-alert"
                    title="升级前请务必备份数据库"
                    description="数据库升级会执行新增字段、新增索引等结构变更，MySQL 的 DDL 无法回滚。请先做一次完整备份再执行升级。" />

                <el-row :gutter="16" class="stat-row">
                    <el-col :xs="24" :sm="12" :md="6">
                        <div class="stat-box">
                            <div class="stat-label">代码版本</div>
                            <div class="stat-value">{{ info.code_version || '-' }}</div>
                        </div>
                    </el-col>
                    <el-col :xs="24" :sm="12" :md="6">
                        <div class="stat-box">
                            <div class="stat-label">数据库版本</div>
                            <div class="stat-value">{{ info.db_version || '-' }}</div>
                        </div>
                    </el-col>
                    <el-col :xs="24" :sm="12" :md="6">
                        <div class="stat-box">
                            <div class="stat-label">待执行脚本</div>
                            <div class="stat-value" :class="{ 'text-danger': info.pending_count > 0 }">
                                {{ info.pending_count }} 个
                            </div>
                        </div>
                    </el-col>
                    <el-col :xs="24" :sm="12" :md="6">
                        <div class="stat-box">
                            <div class="stat-label">当前状态</div>
                            <div class="stat-value">
                                <el-tag :type="upToDate ? 'success' : 'warning'" effect="light">
                                    {{ upToDate ? '已是最新' : '待升级' }}
                                </el-tag>
                            </div>
                        </div>
                    </el-col>
                </el-row>

                <div class="meta-info">
                    <span>迁移记录表：{{ info.table || '-' }}</span>
                    <span>脚本目录：{{ info.dir || '-' }}</span>
                </div>

                <el-divider content-position="left">待执行脚本</el-divider>

                <el-table :data="pending" border stripe style="width: 100%" max-height="360" empty-text="暂无待执行的升级脚本，数据库结构已是最新">
                    <el-table-column type="index" label="#" width="60" align="center" />
                    <el-table-column prop="version" label="版本号" min-width="100" align="center" />
                    <el-table-column prop="name" label="脚本文件" min-width="280" align="center"
                        :show-overflow-tooltip="true" />
                    <el-table-column prop="type" label="类型" min-width="80" align="center">
                        <template #default="{ row }">
                            <el-tag size="small" :type="row.type === 'php' ? 'warning' : 'info'" effect="plain">
                                {{ String(row.type).toUpperCase() }}
                            </el-tag>
                        </template>
                    </el-table-column>
                </el-table>

                <div class="upgrade-option">
                    <el-checkbox v-model="needBackup">升级前自动备份数据库（mysqldump 不可用时会自动跳过）</el-checkbox>
                </div>
            </div>
        </el-card>

        <el-card v-if="result" shadow="never" class="result-card">
            <template #header>
                <div class="card-header">
                    <span class="card-title">升级结果</span>
                    <el-button link type="primary" @click="result = null">关闭</el-button>
                </div>
            </template>

            <el-alert :type="resultType" :closable="false" show-icon class="tip-alert" :title="resultMsg" />

            <div v-if="backupFile" class="backup-tip">
                备份文件：{{ backupFile }}
            </div>

            <el-descriptions :column="2" border size="small" class="result-desc">
                <el-descriptions-item label="待执行">{{ result.total }} 个</el-descriptions-item>
                <el-descriptions-item label="执行成功">{{ result.ok.length }} 个</el-descriptions-item>
                <el-descriptions-item label="已跳过">{{ result.skip.length }} 个</el-descriptions-item>
                <el-descriptions-item label="失败">
                    <span :class="{ 'text-danger': result.fail.length > 0 }">{{ result.fail.length }} 个</span>
                </el-descriptions-item>
            </el-descriptions>

            <template v-if="result.ok.length">
                <el-divider content-position="left">执行成功</el-divider>
                <div v-for="item in result.ok" :key="'ok-' + item.name" class="log-item log-ok">
                    <span class="log-tag">[完成]</span>
                    <span class="log-name">{{ item.name }}</span>
                    <span v-if="item.statements" class="log-extra">{{ item.statements }} 条语句</span>
                </div>
            </template>

            <template v-if="result.skip.length">
                <el-divider content-position="left">已跳过</el-divider>
                <div v-for="item in result.skip" :key="'skip-' + item.name" class="log-item log-skip">
                    <span class="log-tag">[跳过]</span>
                    <span class="log-name">{{ item.name }}</span>
                    <span class="log-extra">{{ item.reason }}</span>
                </div>
            </template>

            <template v-if="result.fail.length">
                <el-divider content-position="left">失败</el-divider>
                <div v-for="item in result.fail" :key="'fail-' + item.name" class="log-item log-fail">
                    <span class="log-tag">[失败]</span>
                    <span class="log-name">{{ item.name }}</span>
                    <span class="log-extra">{{ item.error }}</span>
                </div>
            </template>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { paxios } from '@/utils/paxios'
import { Refresh, Upload } from '@element-plus/icons-vue'

interface MigrationItem {
    version: string
    name: string
    type: string
}

interface RunItem {
    name: string
    version: string
    statements?: number
    reason?: string
    error?: string
    dry_run?: boolean
}

interface RunResult {
    total: number
    ok: RunItem[]
    skip: RunItem[]
    fail: RunItem[]
}

const loading = ref(false)
const running = ref(false)
const needBackup = ref(true)
const pending = ref<MigrationItem[]>([])
const info = ref({
    code_version: '',
    db_version: '',
    table: '',
    dir: '',
    pending_count: 0,
    up_to_date: true
})
const result = ref<RunResult | null>(null)
const resultMsg = ref('')
const backupFile = ref('')

const upToDate = computed(() => info.value.up_to_date)

const resultType = computed(() => {
    if (!result.value) return 'info'
    if (result.value.fail.length > 0) return 'error'
    if (result.value.skip.length > 0) return 'warning'
    return 'success'
})

onMounted(() => {
    loadInfo()
})

function loadInfo() {
    loading.value = true
    paxios.get("/manage/upgradeInfo").then(res => {
        if (res.data.code == 0) {
            const data = res.data.data
            info.value = {
                code_version: data.code_version || '',
                db_version: data.db_version || '',
                table: data.table || '',
                dir: data.dir || '',
                pending_count: data.pending_count || 0,
                up_to_date: !!data.up_to_date
            }
            pending.value = data.pending || []
        } else if (res.data.code != 10000) {
            ElMessage.error(res.data.msg || '获取升级信息失败');
        }
    }).catch(() => {
        ElMessage.error('获取升级信息失败，请检查接口是否正常');
    }).finally(() => {
        loading.value = false
    })
}

function onUpgrade() {
    if (upToDate.value) {
        ElMessage.info('数据库已是最新，无需升级');
        return
    }
    ElMessageBox.confirm(
        `即将执行 ${info.value.pending_count} 个数据库升级脚本${needBackup.value ? '，并会先尝试自动备份数据库' : ''}。建议在业务低峰期操作，确定继续吗？`,
        '升级确认',
        {
            type: 'warning',
            confirmButtonText: '确定升级',
            cancelButtonText: '再想想',
            dangerouslyUseHTMLString: false
        }
    ).then(() => {
        runUpgrade()
    }).catch(() => { })
}

function runUpgrade() {
    running.value = true
    result.value = null
    resultMsg.value = ''
    backupFile.value = ''
    paxios.post("/manage/upgradeRun", { backup: needBackup.value ? 1 : 0 }).then(res => {
        const data = res.data.data || {}
        backupFile.value = data.backup_file || ''
        if (res.data.code == 0 || data.result) {
            result.value = data.result
            resultMsg.value = res.data.msg || '升级完成'
        } else {
            resultMsg.value = res.data.msg || '升级失败'
            ElMessage.error(resultMsg.value);
        }
        loadInfo()
    }).catch(() => {
        ElMessage.error('升级请求失败，请检查接口是否正常');
    }).finally(() => {
        running.value = false
    })
}
</script>

<style scoped>
.upgrade-container {
    padding-bottom: 20px;
}

.card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
}

.card-title {
    font-size: 16px;
    font-weight: 600;
}

.card-btns {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.tip-alert {
    margin-bottom: 20px;
}

.stat-row {
    margin-bottom: 10px;
}

.stat-box {
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
    padding: 14px 16px;
    margin-bottom: 12px;
    background-color: var(--el-fill-color-lighter);
}

.stat-label {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    margin-bottom: 8px;
}

.stat-value {
    font-size: 18px;
    font-weight: 600;
    min-height: 32px;
    display: flex;
    align-items: center;
}

.text-danger {
    color: var(--el-color-danger);
}

.meta-info {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    margin-bottom: 10px;
}

.upgrade-option {
    margin-top: 20px;
}

.result-card {
    margin-top: 20px;
}

.result-desc {
    margin-bottom: 10px;
}

.backup-tip {
    margin-bottom: 16px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    word-break: break-all;
}

.log-item {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 8px;
    font-size: 13px;
    line-height: 22px;
    padding: 4px 0;
}

.log-tag {
    font-weight: 600;
}

.log-name {
    font-family: Consolas, Monaco, monospace;
}

.log-extra {
    color: var(--el-text-color-secondary);
    word-break: break-all;
}

.log-ok .log-tag {
    color: var(--el-color-success);
}

.log-skip .log-tag {
    color: var(--el-color-warning);
}

.log-fail .log-tag {
    color: var(--el-color-danger);
}
</style>
