import { GetGroupsNameAndNumberResponse } from '../../response/friend';

export interface GroupsInfo {
  groupName: string;
  memberCount: number;
}

export const toDomainGroups = (response: GetGroupsNameAndNumberResponse): GroupsInfo[] => {
  const validGroups = response.groupMembers.filter((group) => group.name && group.name.trim() != '');
  return validGroups.map((group) => ({
    groupName: group.name,
    memberCount: group.count ?? 0,
  }));
};
