import { ref } from 'vue'
import { defineStore } from 'pinia'

interface LoginRegisterConfig {
  regList: string[];
}

export const useWebsitConfigStore = defineStore('websitConfig', () => {
  const apiUrl = ref('')
  const hasWechat = ref(false);
  const hasEmail = ref(false);
  const hasSms = ref(false);
  const adminUrl = ref('');

  const webIsInit = ref(false);
  const website = ref({
    name: "",
    logo: "",
    favicon: ""
  })
  const loginRegister = ref<LoginRegisterConfig>({
    regList: [],
  })
  const custom = ref({
    url: "",
  })


  return { apiUrl, hasEmail, hasSms, loginRegister, website, custom, webIsInit, hasWechat, adminUrl }
})