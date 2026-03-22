<template>
  <div >
    <h1> 店铺管理</h1>
    <p>ID: <el-tag size="large">{{ shopId }}</el-tag>  名称：{{ shopName }}</p>
  </div>
  <div>
    <RouterView :shopId="shopId" :shopName="shopName" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 获取页面标题，提供默认值避免空显示
const shopId = computed(() => route.query.id as string || "")
const shopName = computed(() => route.query.name as string || "")
console.log(shopId)
</script>

<style scoped>

</style>