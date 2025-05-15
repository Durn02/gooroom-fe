export interface GetGroupsNameAndNumberResponse {
  groupMembers: GroupMember[];
}

interface GroupMember {
  name: string;
  count: number;
}
