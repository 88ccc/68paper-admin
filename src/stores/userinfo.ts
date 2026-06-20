import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserInfoStore = defineStore('userInfo', () => {
    const isLogin = ref(false)
    const userId = ref(0)
    const userName = ref('')
    const userEmail = ref('')
    const userPhone = ref('')
    const userAvatar = ref('')
    const openid = ref('')
    const domain = ref('')

    function resetUserInfo(){
        isLogin.value = false
        userId.value = 0
        userName.value = ''
        userEmail.value = ''
        userPhone.value = ''
        userAvatar.value = ''
        domain.value = ''
    }
    return { isLogin, userId, userName,userEmail,userPhone,userAvatar,openid,domain,resetUserInfo }
})