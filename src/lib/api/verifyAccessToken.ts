import { API_URL } from '@/src/lib/config';

export const verifyAccessToken = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/domain/auth/verify-access-token`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data);
      if (data.message == 'access token validation check successfull') {
        return true;
      }
    } else {
      const refresh_response = await fetch(`${API_URL}/domain/auth/refresh-acc-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (refresh_response.ok) {
        alert('refresh token success');
        window.location.reload();
        return true;
      } else {
        alert('새롭게 로그인 해야합니다.');
        window.location.href = '/signin';
        return false;
      }
    }
  } catch (error) {
    console.error(`Unknown error occurred in verifyAccessToken : ${error}`);
  }
};
