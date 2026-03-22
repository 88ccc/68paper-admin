import axios from 'axios';
import { useWebsitConfigStore } from '@/stores/websitConfig';
import { useAdminInfoStore } from "@/stores/adminInfo";

let baseURL = "";





// 创建axios实例
export const paxios = axios.create({
    timeout: 120000, // 设置请求超时时间
    //withCredentials: true, // 是否允许带cookie这些
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    validateStatus: function (status) {
        return status === 401 || (status >= 200 && status < 300);
    },

});

// 添加请求拦截器
paxios.interceptors.request.use(function (config: any) {
    if (baseURL == "") {
        let websitConfigStore = useWebsitConfigStore()
        const { apiUrl } = websitConfigStore
        baseURL = apiUrl;
    }
    // 在发送请求之前做些什么
    if (baseURL == undefined || baseURL == "") {
        throw "请先配置apiUrl"
    }
    let token = null;
    let userid = null;
    if (config.url.startsWith("/manage")) {
        token = localStorage.getItem('admintoken');
        userid = localStorage.getItem('adminid');
    }
    config.url = baseURL + config.url
    if (token) {
        config.headers.authorization = token
    }
    if (userid) {
        config.headers.userid = userid
    }
    return config;
}, function (error: any) {
    // 对请求错误做些什么
    return Promise.reject(error);
});


// 添加响应拦截器
paxios.interceptors.response.use(function (response) {
    if (response.status === 401) {
        localStorage.removeItem('admintoken');
        localStorage.removeItem('adminid');
        useAdminInfoStore().resetAdminInfo();
    }
    return response;
}, function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    return Promise.reject(error);
});