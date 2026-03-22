<template>
  <div class="pay-config-container" v-loading="loading">
    <!-- H5端配置 -->
    <el-card header="H5端" class="pay-card">
      <div class="pay-desc">在H5端付款时使用</div>
      <el-table :data="h5Payments" border style="width: 100%">
        <el-table-column label="支付方式" width="120">
          <template #default="scope">
            {{ payTypeZh(scope.row.type) }}
          </template>
        </el-table-column>
        <el-table-column label="支付模板">
          <template #default="scope">
            <el-select v-model="scope.row.modeid" placeholder="请选择">
              <template v-if="scope.row.type == 'alipay'">
                <el-option label="请选择" :value="0" />
                <el-option v-for="item in alipay" :key="item.id" :label="item.name" :value="item.id">
                </el-option>
              </template>
              <template v-if="scope.row.type == 'wxpay'">
                <el-option label="请选择" :value="0" />
                <el-option v-for="item in wechat" :key="item.id" :label="item.name" :value="item.id">
                </el-option>
              </template>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="是否启用">
          <template #default="scope">
            <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0" />
          </template>
        </el-table-column>
        <el-table-column label="是否为默认支付">
          <template #default="scope">
            <el-switch v-model="scope.row.prefer" :active-value="1" :inactive-value="0" />
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 微信公众号端配置 -->
    <el-card header="微信公众号端" class="pay-card">
      <div class="pay-desc">在微信公众号端付款时使用</div>
      <el-table :data="wechatPayments" border style="width: 100%">
        <el-table-column label="支付方式" width="120">
          <template #default="scope">
            {{ payTypeZh(scope.row.type) }}
          </template>
        </el-table-column>
        <el-table-column label="支付模板">
          <template #default="scope">
            <el-select v-model="scope.row.modeid" placeholder="请选择">
              <template v-if="scope.row.type == 'alipay'">
                <el-option label="请选择" :value="0" />
                <el-option v-for="item in alipay" :key="item.id" :label="item.name" :value="item.id">
                </el-option>
              </template>
              <template v-if="scope.row.type == 'wxpay'">
                <el-option label="请选择" :value="0" />
                <el-option v-for="item in wechat" :key="item.id" :label="item.name" :value="item.id">
                </el-option>
              </template>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="是否启用">
          <template #default="scope">
            <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0" />
          </template>
        </el-table-column>
        <el-table-column label="是否为默认支付">
          <template #default="scope">
            <el-switch v-model="scope.row.prefer" :active-value="1" :inactive-value="0" />
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- PC端配置 -->
    <el-card header="PC端" class="pay-card">
      <div class="pay-desc">在PC端付款时使用</div>
      <el-table :data="pcPayments" border style="width: 100%">
        <el-table-column label="支付方式" width="120">
          <template #default="scope">
            {{ payTypeZh(scope.row.type) }}
          </template>
        </el-table-column>
        <el-table-column label="支付模板">
          <template #default="scope">
            <el-select v-model="scope.row.modeid" placeholder="请选择">
              <template v-if="scope.row.type == 'alipay'">
                <el-option label="请选择" :value="0" />
                <el-option v-for="item in alipay" :key="item.id" :label="item.name" :value="item.id">
                </el-option>
              </template>
              <template v-if="scope.row.type == 'wxpay'">
                <el-option label="请选择" :value="0" />
                <el-option v-for="item in wechat" :key="item.id" :label="item.name" :value="item.id">
                </el-option>
              </template>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="是否启用">
          <template #default="scope">
            <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0" />
          </template>
        </el-table-column>
        <el-table-column label="是否为默认支付">
          <template #default="scope">
            <el-switch v-model="scope.row.prefer" :active-value="1" :inactive-value="0" />
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 提交按钮 -->
    <div class="submit-btn-container">
      <el-button type="primary" @click="handleSubmit">提交</el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { paxios } from '@/utils/paxios';
import { ref, onMounted } from 'vue';

let payModes = <any[]>[];
let paySets = <any[]>[];
let alipay = ref<any[]>([]);
let wechat = ref<any[]>([]);
const pcPayments = ref<any[]>([]);
const loading = ref(false);

function payTypeZh(type: string) {
  if (type === 'alipay') {
    return '支付宝';
  } else if (type === 'wxpay') {
    return '微信';
  }
}

function modeSplit() {
  for (let i = 0; i < payModes.length; i++) {
    if (payModes[i].type === 'alipay') {
      alipay.value.push(payModes[i]);
    } else if (payModes[i].type === 'wxpay') {
      wechat.value.push(payModes[i]);
    }
  }
}
function handlePaySet() {
  for (let i = 0; i < paySets.length; i++) {
    if (paySets[i].scene === 'pc') {
      pcPayments.value.push(paySets[i]);
    } else if (paySets[i].scene === 'h5') {
      h5Payments.value.push(paySets[i]);
    } else if (paySets[i].scene === 'wxh5') {
      wechatPayments.value.push(paySets[i]);
    }
  }
}

// 定义各端支付配置的响应式数据
const h5Payments = ref<any[]>([]);

const wechatPayments = ref<any[]>([]);

onMounted(async () => {
  loading.value = true;
  try {
    const res = await paxios.get('/manage/getPayMode?page=1&limit=50');
    if (res.data.code === 0) {
      payModes = res.data.data;
      modeSplit();
    } else {
      ElMessage.error(res.data.msg);
    }
    const res2 = await paxios.get('/manage/getPaySet');
    if (res2.data.code === 0) {
      paySets = res2.data.data;
      handlePaySet();
    } else {
      ElMessage.error(res2.data.msg);
    }
  } catch (err) {
    ElMessage.error('获取支付模板失败');
    console.log(err)
  }
  loading.value = false;

});

// 提交逻辑（可根据实际需求对接后端接口）
const handleSubmit = async () => {
  loading.value = true;
  let data = [];
  for (let i = 0; i < h5Payments.value.length; i++) {
    data.push(h5Payments.value[i])
  }
  for (let i = 0; i < wechatPayments.value.length; i++) {
    data.push(wechatPayments.value[i])
  }
  for (let i = 0; i < pcPayments.value.length; i++) {
    data.push(pcPayments.value[i])
  }
  try {
    const res = await paxios.post('/manage/setPaySet', {
      data: data
    });
    if (res.data.code === 0) {
      ElMessage.success('提交成功');
    } else {
      ElMessage.error(res.data.msg);
    }

  } catch (err) {
    ElMessage.error('提交失败');
  }
  loading.value = false;
};
</script>

<style scoped>
.pay-config-container {
  max-width: 1200px;
  margin: 0 auto;
}

.pay-card {
  margin-bottom: 20px;
}

.pay-desc {
  color: #606266;
  margin-bottom: 10px;
}

.submit-btn-container {
  text-align: right;
  margin-top: 20px;
}
</style>