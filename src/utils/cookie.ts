/**
 * 设置 Cookie
 * @param name cookie 名称
 * @param value cookie 值
 * @param days 过期天数（可选，默认7天）
 * @param path 路径（可选，默认'/'）
 * @param domain 域名（可选）
 * @param secure 是否仅 HTTPS 传输（可选）
 */
export function setCookie(
  name: string,
  value: string,
  days: number = 7,
  path: string = '/',
  domain?: string,
  secure?: boolean
): void {
  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  // 设置过期时间
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    cookie += `; expires=${date.toUTCString()}`;
  }

  // 设置路径
  if (path) cookie += `; path=${path}`;

  // 设置域名
  if (domain) cookie += `; domain=${domain}`;

  // 设置 secure
  if (secure) cookie += '; secure';

  document.cookie = cookie;
}

/**
 * 获取 Cookie
 * @param name cookie 名称
 * @returns 对应的 cookie 值（不存在则返回 null）
 */
export function getCookie(name: string): string | null {
  const nameEQ = `${encodeURIComponent(name)}=`;
  const cookies = document.cookie.split(';');

  for (let cookie of cookies) {
    // 清除空格
    cookie = cookie.trim();
    // 找到目标 cookie
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }
  return null;
}

/**
 * 删除 Cookie
 * @param name cookie 名称
 * @param path 路径（需与设置时一致，默认'/'）
 * @param domain 域名（需与设置时一致，可选）
 */
export function removeCookie(
  name: string,
  path: string = '/',
  domain?: string
): void {
  // 通过设置过期时间为过去来删除 cookie
  setCookie(name, '', -1, path, domain);
}