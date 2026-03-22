<script setup lang="ts">
import { useWebsitConfigStore } from '@/stores/websitConfig'
import { storeToRefs } from "pinia"

const {webIsInit } = storeToRefs(useWebsitConfigStore());
</script>
<template>
  <div v-loading="!webIsInit" >
    <RouterView />
  </div>
  
</template>

<style scoped></style>