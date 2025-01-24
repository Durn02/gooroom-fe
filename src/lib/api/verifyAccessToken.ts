import { API_URL } from '@/src/lib/config';

export const verifyAccessToken = async () => {
  try {
    const response = await fetch(`${API_URL}/domain/auth/verify-access-token`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (response.ok) {
      const user_node_id = await response.json();
      console.log('acc token is valid');
      return user_node_id;
    } else {
      const errorData = await response.json();
      if (errorData.detail === 'Token has expired') {
        const refresh_response = await fetch(`${API_URL}/domain/auth/refresh-acc-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        if (refresh_response.ok) {
          console.log('Refresh token successful');
          const user_node_id = await refresh_response.json();
          return user_node_id;
        } else {
          return false;
        }
      }
      return false;
    }
  } catch (error) {
    console.error(`Unknown error occurred in verifyAccessToken : ${error}`);
  }
};
