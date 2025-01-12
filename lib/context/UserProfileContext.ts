import { createContext } from 'react';

type UserProfileContextType = {
  selectedUserId: string | null;
  setSelectedUserId: (id: string | null) => void;
};

export const UserProfileContext = createContext<UserProfileContextType>({
  selectedUserId: null,
  setSelectedUserId: () => {},
});
