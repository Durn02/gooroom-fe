import { API_URL } from '../config';

export const onSignoutButtonClickHandler = async (): Promise<boolean> => {
  const isSignout = window.confirm('정말 회원탈퇴를 진행하시겠습니까?');
  if (isSignout) {
    alert('회원탈퇴를 진행합니다!');
    try {
      const response = await fetch(`${API_URL}/domain/auth/signout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.message === 'signout success') {
          return true;
          // alert('회원탈퇴가 완료되었습니다.');
          // window.location.href = '/';
        }
      }
    } catch (error) {
      alert('unknown error occurred in onSignoutButtonClickHandler');
      console.error(error);
    }
  }
};

export const onLogoutButtonClickHandler = async (): Promise<boolean> => {
  try {
    alert('로그아웃 합니다.');
    const response = await fetch(`${API_URL}/domain/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    if (response.ok) {
      const data = await response.json();
      if (data.message === 'logout success') {
        // 서버가 보낸 메시지에 따라 조건 수정
        window.location.href = '/';
        return true;
        //   alert('로그아웃합니다.');
        //   localStorage.clear();
        //   sessionStorage.clear();
      }
    }
  } catch (error) {
    alert(error);
  }
};
