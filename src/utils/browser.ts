/**
 * 判断当前浏览器环境类型
 * @returns 'pc' | 'mobile' | 'wechat' 分别表示电脑浏览器、手机浏览器、微信内置浏览器
 */
export const getBrowserType = (): 'pc' | 'mobile' | 'wechat' => {
    // 获取用户代理字符串
    const userAgent = navigator.userAgent.toLowerCase()

    // 判断是否为平板（尺寸较大，视为PC）
    const isTablet = /ipad|android(?!.*mobile)|tablet|kindle|silk/i.test(userAgent);

    // 判断是否为移动设备浏览器
    const isMobile = /mobile|android|iphone|ipod|ipad|ios|phone|blackberry|iemobile|opera mini/i.test(userAgent)

    // 微信内置浏览器：仅手机端微信支持 JSAPI 支付，PC 端微信视为 pc
    if (/MicroMessenger/i.test(userAgent)) {
        // 平板尺寸较大与 PC 处理一致，只有手机端微信才返回 wechat
        return (isMobile && !isTablet) ? 'wechat' : 'pc'
    }

    if (isTablet) {
        // 把平板视为PC因为尺寸比较大
        return 'pc';
    }

    return isMobile ? 'mobile' : 'pc'
}