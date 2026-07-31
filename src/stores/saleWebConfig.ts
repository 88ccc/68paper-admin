import { ref } from 'vue'
import { defineStore } from 'pinia'

interface saleWebConfig {
  name: string;
  baseurl: string;
}

interface functionConfig {
  attach: boolean;
  msgsub: boolean;
  notice: boolean;
  extensions: boolean;
}

export const useSaleWebStore = defineStore('saleWebConfig', () => {
  const saleWebConfig = ref<saleWebConfig[]>([])
  const reward_enabled = ref(false)
  const ecommerce = ref(false)
  const functions = ref<functionConfig>({
    attach: false,
    msgsub: false,
    notice: false,
    extensions: false,
  })

  return { saleWebConfig, reward_enabled, functions, ecommerce }
})