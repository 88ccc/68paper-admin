import { ref } from 'vue'
import { defineStore } from 'pinia'



export const useWebsitConfigStore = defineStore('websitConfig', () => {
  const apiUrl = ref('')
  const hasWechat = ref(false);

  const webIsInit = ref(false);
  const website = ref({
    name:"",
    desc:"",
    beian:"",
    logo:"",
    favicon:""
  })
  const custom = ref({
    url:"",
  })
  

  return { apiUrl,website,custom,webIsInit,hasWechat}
})