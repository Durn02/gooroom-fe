import { userApi } from '../lib/api';
import { encrypt } from '../utils/crypto';

const viewMyProfile = () => {
  window.location.href = '/myprofile';
};
const viewKnockList = () => {
  alert('show knock list');
};
const viewBlockMuteList = () => {
  alert('show block/mute list');
};

const viewRoommateProfile = (nodeId: string, router) => {
  const encryptedUserId = encodeURIComponent(encrypt(nodeId));
  router.push(`/roommateprofile/${encryptedUserId}`);
};

const viewNeighborProfile = (nodeId: string, router) => {
  const encryptedUserId = encodeURIComponent(encrypt(nodeId));
  router.push(`/neighborprofile/${encryptedUserId}`);
};

export const MY_NODE_MENU_ITEMS = [
  ['view my profile', viewMyProfile],
  ['view knock list', viewKnockList],
  ['view block/mute list', viewBlockMuteList],
  ['logout', userApi.onLogoutButtonClickHandler],
];

export const ROOMMATE_NODE_MENU_ITEMS = [
  ['view roommate profile', viewRoommateProfile],
  ['block', () => {}],
  ['mute', () => {}],
];

export const NEIGHBOR_NODE_MENU_ITEMS = [
  ['view neighbor profile', viewNeighborProfile],
  ['send knock', () => {}],
  ['block', () => {}],
  ['mute', () => {}],
];
