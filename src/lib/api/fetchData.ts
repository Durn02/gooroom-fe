import { API_URL } from '../config';

export const fetchMyInfo = async () => {
  const response = await fetch(`${API_URL}/domain/user/my/info`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  if (!response.ok) {
    alert('사용자 정보를 불러오는데 실패했습니다.');
    return;
  } else {
    const data = await response.json();
    return data;
  }
};

export const fetchFriendInfo = async (userNodeId: string) => {
  const response = await fetch(`${API_URL}/domain/friend/get-member`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ user_node_id: userNodeId }),
  });
  if (!response.ok) {
    alert('사용자 정보를 불러오는데 실패했습니다.');
    window.location.href = '/';
    return;
  } else {
    const data = await response.json();
    return data;
  }
};

export const fetchMyStickers = async () => {
  const response = await fetch(`${API_URL}/domain/content/sticker/get-my-contents`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  if (!response.ok) {
    alert('스티커를 불러오는데 실패했습니다.');
    window.location.href = '/';
  } else {
    const data = await response.json();
    return data;
  }
};

export const fetchStickers = async (userNodeId: string) => {
  const response = await fetch(`${API_URL}/domain/content/sticker/get-members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_node_id: userNodeId }),
    credentials: 'include',
  });
  if (!response.ok) {
    alert('스티커를 불러오는데 실패했습니다.');
    window.location.href = '/';
  } else {
    const data = await response.json();
    return data;
  }
};

export const fetchPosts = async () => {
  const response = await fetch(`${API_URL}/domain/content/post/get-my-contents`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  if (!response.ok) {
    alert('게시글을 불러오는데 실패했습니다.');
    window.location.href = '/';
  } else {
    const data = await response.json();
    return data;
  }
};
