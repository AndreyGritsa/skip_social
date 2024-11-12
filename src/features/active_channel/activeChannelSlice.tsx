import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ActiveChannelState {
  id: string;
}

const initialState: ActiveChannelState = {
  id: "0",
};

export const activeChannelSlice = createSlice({
  name: "activeChannel",
  initialState,
  reducers: {
    setActiveChannel: (state, action: PayloadAction<string>) => {
      state.id = action.payload;
    },
  },
});

export const { setActiveChannel } = activeChannelSlice.actions;

export default activeChannelSlice.reducer;
