import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAdminInfoStore = defineStore('adminInfo', () => {
    const isLogin = ref(false)
    const adminId = ref(0)
    const name = ref('')
    const avatar = ref('')

    function resetAdminInfo() {
        isLogin.value = false
        adminId.value = 0
        name.value = ''
        avatar.value = ''
    }
    return { isLogin, name, avatar, adminId, resetAdminInfo }
})