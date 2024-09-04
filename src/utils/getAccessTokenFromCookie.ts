// 쿠키에서 access_token을 가져오는 함수
export function getAccessTokenFromCookie(cookie_name: string): string | null {
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${cookie_name}=`));

  return cookie ? decodeURIComponent(cookie.split("=")[0]) : null;
}
