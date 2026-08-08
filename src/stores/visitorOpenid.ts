import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useVisitorOpenidStore = defineStore('VisitorOpenid', () => {
  const vopenid = ref('')
  return { vopenid }
})