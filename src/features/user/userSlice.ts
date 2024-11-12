import { createSlice } from "@reduxjs/toolkit";

export interface UserState {
  id: string;
  name: string;
  status: "online" | "away";
}

// fake initial state, should be empty
const initialState: UserState = {
  id: "1",
  name: "Admin",
  status: "online",
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
});

export default userSlice.reducer;
