
import { useAdminInfoStore } from "@/stores/adminInfo";
import { useWebsitConfigStore } from '@/stores/websitConfig';
import { useUserInfoStore } from "@/stores/userinfo";




export function adminLogout() {
    console.log("管理员登出，清除登录状态");
    localStorage.removeItem('admintoken');
    localStorage.removeItem('adminid');
    useAdminInfoStore().resetAdminInfo();
}

export function userLogout() {
    console.log("用户登出，清除登录状态");
    localStorage.removeItem('token');
    localStorage.removeItem('userid');
    useUserInfoStore().resetUserInfo();
}

export function CompleteUrl(url: string) {
    let websitConfigStore = useWebsitConfigStore()
    const { apiUrl } = websitConfigStore
    if (url == "") {
        return "";
    }
    if (url == undefined || url == null || (typeof url !== "string")) {
        return "";
    }
    if (url.startsWith("http:") || url.startsWith("https:")) {
        return url;
    } else {
        return apiUrl + url;
    }
}