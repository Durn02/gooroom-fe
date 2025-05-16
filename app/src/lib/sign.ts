import { clearStore } from '../utils/indexedDB';

export const logout = () => {
  window.location.href = '/main';
  clearStore('roommates');
  clearStore('neighbors');
};
