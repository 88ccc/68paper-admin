/**
 * 判断当前浏览器环境类型
 * @returns 'pc' | 'mobile' | 'wechat' 分别表示电脑浏览器、手机浏览器、微信内置浏览器
 */
export const getBrowserType = (): 'pc' | 'mobile' | 'wechat' => {
  // 获取用户代理字符串
  const userAgent = navigator.userAgent.toLowerCase()

  // 先判断是否为微信内置浏览器
  if (/MicroMessenger/i.test(userAgent)) {
    return 'wechat'
  }

  // 判断是否为移动设备浏览器
  const isMobile = /mobile|android|iphone|ipod|ipad|ios|phone|blackberry|iemobile|opera mini/i.test(userAgent)
  
  return isMobile ? 'mobile' : 'pc'
}