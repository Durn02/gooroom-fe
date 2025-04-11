import { clearStore } from '../utils/indexedDB';

export const logout = () => {
  alert('로그인이 필요합니다');
  // window.location.href = '/signin';
  window.location.href = '/main';
  clearStore('roommates');
  clearStore('neighbors');
};
