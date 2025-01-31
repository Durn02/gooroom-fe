import { onLogoutButtonClickHandler } from '../lib/api/sign';
import { API_URL } from '../lib/config';

const viewMyProfile = () => {
  window.location.href = '/myprofile';
};
const viewKnockList = () => {
  alert('show knock list');
};
const viewBlockMuteList = () => {
  alert('show block/mute list');
};

const viewRoommateProfile = (nodeId: string) => {
  const encryptedUserId = encodeURIComponent(nodeId);
  window.location.href = `/roommateprofile/${encryptedUserId}`;
};

export const MY_NODE_MENU_ITEMS = [
  ['view my profile', viewMyProfile],
  ['view knock list', viewKnockList],
  ['view block/mute list', viewBlockMuteList],
  ['logout', onLogoutButtonClickHandler],
];

export const ROOMMATE_NODE_MENU_ITEMS = [
  ['view roommate profile', viewRoommateProfile],
  ['view roommate memo', () => {}],
  ['block', () => {}],
  ['mute', () => {}],
];

export const NEIGHBOR_NODE_MENU_ITEMS = [
  ['view neighbor profile', () => {}],
  ['send knock', () => {}],
  ['block', () => {}],
  ['mute', () => {}],
];
