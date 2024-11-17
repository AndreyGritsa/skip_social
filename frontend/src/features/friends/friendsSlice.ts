import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../user/userSlice";

export const fakeFriendsData = [
  { id: "1", name: "Alice", status: "online" },
  { id: "2", name: "Bob", status: "away" },
  { id: "500", name: "NotExistentChannel", status: "online" },
];

export interface Friend extends User {
  status: string;
}

export interface FriendsState {
  friends: Friend[];
}

// fake initial state, should be empty
const initialState: FriendsState = {
  friends: [],
};

export const friendsSlice = createSlice({
  name: "friends",
  initialState,
  reducers: {
    setFriends(state, action: PayloadAction<Friend[]>) {
      state.friends = action.payload;
    },
  },
});

export const { setFriends } = friendsSlice.actions;

export default friendsSlice.reducer;
