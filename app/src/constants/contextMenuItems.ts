// constants/contextMenuItems.ts
import { authApi } from '../lib/api';
import { blockFreind, muteFreind } from '../lib/api/friend/friend.api';
import { sendKnock } from '../lib/api/knock.api';
import { encrypt } from '../utils/crypto';
import { clearStore } from '../utils/indexedDB';
import { logout } from '../lib/sign';

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
  blockFreind({ userNodeId: nodeId });
  Promise.all([clearStore('roommates'), clearStore('neighbors')]);
  window.location.reload();
};

const muteFriendFunc = (nodeId: string) => {
  muteFreind({ userNodeId: nodeId });
};

const sendKnockFunc = async (nodeId: string, selectedGroup: string) => {
  alert('send knock to ' + nodeId);
  try {
    const data = await sendKnock(nodeId, selectedGroup);
    if (data.message === 'send knock successfully') {
      alert('노크를 성공적으로 보냈습니다.');
    } else if (data.message === 'knock already sent') {
      alert('이미 노크를 보냈습니다.');
    } else if (data.message === 'User does not exist') {
      alert('존재하지 않는 사용자입니다.');
    } else if (data.message === 'cannot send to myself') {
      alert('자신에게 노크를 보낼 수 없습니다.');
    } else if (data.message === 'already roommate') {
      alert('이미 룸메이트입니다.');
    } else {
      alert('알 수 없는 오류가 발생했습니다.');
    }
    return;
  } catch (error) {
    console.error(error);
  }
};

const onLogoutHandler = async () => {
  const isLogout = window.confirm('로그아웃을 진행하시겠습니까?');
  if (!isLogout) return;

  try {
    const data = await authApi.RequestLogout();
    if (data.message === 'logout success') {
      logout();
    }
  } catch {
    alert('로그아웃 중 문제가 발생했습니다.');
  }
};

export const MY_NODE_MENU_ITEMS = [
  ['view my profile', viewMyProfile],
  ['view knock list', () => {}],
  ['view block/mute list', () => {}],
  ['create cast', () => {}],
  ['logout', onLogoutHandler],
];

export const ROOMMATE_NODE_MENU_ITEMS = [
  ['view roommate profile', viewRoommateProfile],
  ['block', blockFriendFunc],
  ['mute', muteFriendFunc],
];

export const NEIGHBOR_NODE_MENU_ITEMS = [
  ['view neighbor profile', viewNeighborProfile],
  // ['send knock', sendKnockFunc],
  ['block', blockFriendFunc],
  ['mute', muteFriendFunc],
];
