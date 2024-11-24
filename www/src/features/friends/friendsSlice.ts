import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../user/userSlice";

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
