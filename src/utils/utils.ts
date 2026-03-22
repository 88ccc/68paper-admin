
import { useAdminInfoStore } from "@/stores/adminInfo";
import { useWebsitConfigStore } from '@/stores/websitConfig';




export function adminLogout() {
    localStorage.removeItem('admintoken');
    localStorage.removeItem('adminid');
    useAdminInfoStore().resetAdminInfo();
}

export function CompleteUrl(url: string) {
    let websitConfigStore = useWebsitConfigStore()
    const { apiUrl } = websitConfigStore
    if (url == "") {
        return "";
    }
    if(url == undefined || url == null || (typeof url !== "string")){
        return "";
    }
    if (url.startsWith("http://") || url.startsWith("https://)")) {
        return url;
    } else {
        console.log("apiUrl",apiUrl);
        return apiUrl + url;
    }
}