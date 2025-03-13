import { API_URL } from '@/src/lib/config';
import { cookies } from 'next/headers';
import MyProfileClient from './MyProfileClient';

async function fetchData(endpoint: string, accessToken: string | undefined) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: accessToken ? { Cookie: `access_token=${accessToken}` } : {},
    credentials: 'include',
    cache: 'no-store',
  });
  return res.ok ? res.json() : null;
}

export default async function MyProfile() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  //Todo. refactor as using axiosClient
  const [initialUserInfo, initialStickers, initialPosts] = await Promise.all([
    fetchData('/domain/user/my/info', accessToken),
    fetchData('/domain/content/sticker/get-my-contents', accessToken),
    fetchData('/domain/content/post/get-my-contents', accessToken),
  ]);

  return (
    <MyProfileClient initialUserInfo={initialUserInfo} initialStickers={initialStickers} initialPosts={initialPosts} />
  );
}
