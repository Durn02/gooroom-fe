import { clearStore } from '../utils/indexedDB';

export const logout = () => {
  alert('로그인이 필요합니다');
  window.location.href = '/signin';
  clearStore('roommates');
  clearStore('neighbors');
};
