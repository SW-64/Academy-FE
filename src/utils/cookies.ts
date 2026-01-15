/**
 * 쿠키 유틸리티 함수들
 */

/**
 * 쿠키를 설정합니다.
 * @param name 쿠키 이름
 * @param value 쿠키 값
 * @param days 만료일 (기본값: 7일)
 */
export const setCookie = (
  name: string,
  value: string,
  days: number = 7
): void => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

/**
 * 쿠키를 가져옵니다.
 * @param name 쿠키 이름
 * @returns 쿠키 값 또는 null
 */
export const getCookie = (name: string): string | null => {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

/**
 * 쿠키를 삭제합니다.
 * @param name 쿠키 이름
 */
export const removeCookie = (name: string): void => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};
