// constants/contextMenuItems.ts
import { userApi } from '../lib/api';
import { blockFreind, muteFreind } from '../lib/api/friend/friend.api';
import { sendKnock } from '../lib/api/knock.api';
import { encrypt } from '../utils/crypto';
import { clearStore } from '../utils/indexedDB';

const viewMyProfile = () => {
  window.location.href = '/myprofile';
};

const viewRoommateProfile = (nodeId: string, router) => {
  const encryptedUserId = encodeURIComponent(encrypt(nodeId));
  router.push(`/roommateprofile/${encryptedUserId}`);
};

const viewNeighborProfile = (nodeId: string, router) => {
  const encryptedUserId = encodeURIComponent(encrypt(nodeId));
  router.push(`/neighborprofile/${encryptedUserId}`);
};

const blockFriendFunc = (nodeId: string) => {
  blockFreind(nodeId);
  Promise.all([clearStore('roommates'), clearStore('neighbors')]);
  window.location.reload();
};

const muteFriendFunc = (nodeId: string) => {
  muteFreind(nodeId);
};

const sendKnockFunc = async (nodeId: string) => {
  alert('send knock to ' + nodeId);
  const data = await sendKnock(nodeId);
  console.log(data);
};

export const MY_NODE_MENU_ITEMS = [
  ['view my profile', viewMyProfile],
  ['view knock list', () => {}],
  ['view block/mute list', () => {}],
  ['logout', userApi.onLogoutButtonClickHandler],
];

export const ROOMMATE_NODE_MENU_ITEMS = [
  ['view roommate profile', viewRoommateProfile],
  ['block', blockFriendFunc],
  ['mute', muteFriendFunc],
];

export const NEIGHBOR_NODE_MENU_ITEMS = [
  ['view neighbor profile', viewNeighborProfile],
  ['send knock', sendKnockFunc],
  ['block', blockFriendFunc],
  ['mute', muteFriendFunc],
];
