import { createSlice } from "@reduxjs/toolkit";
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
  friends: fakeFriendsData,
};

export const friendsSlice = createSlice({
  name: "friends",
  initialState,
  reducers: {},
});

export default friendsSlice.reducer;
