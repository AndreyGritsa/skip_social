import { createSelector } from "reselect";
import { RootState } from "./store";

const selectFriends = (state: RootState) => state.friends.friends;

export const selectFilteredFriends = createSelector(
  [selectFriends, (state: RootState, online: boolean) => online],
  (friends, online) =>
    online ? friends.filter((friend) => friend.status === "online") : friends
);
