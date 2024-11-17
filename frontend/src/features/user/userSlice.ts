import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id: string;
  name: string;
}

export interface UserState extends User {
  status: string;
}

const initialState: UserState = {
  id: "",
  name: "",
  status: "",
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserState>) {
      state.name = action.payload.name;
      state.status = action.payload.status;
    },
  },
});

export const { setUser } = userSlice.actions;

export default userSlice.reducer;
