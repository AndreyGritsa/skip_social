import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../user/userSlice";
import { Message } from "../channels/channelsSlice";

export interface ServerMessage extends Message {}

export interface ServerMember extends User {
  role?: string;
}

export interface ServerChannel {
  id: string;
  name: string;
}

export interface Server extends User {
  channels: ServerChannel[];
}

export interface ServersState {
  servers: Server[];
}

// fake initial state, should be empty
const initialState: ServersState = {
  servers: [],
};

export const serversSlice = createSlice({
  name: "servers",
  initialState,
  reducers: {
    setServers: (state, action: PayloadAction<Server[]>) => {
      state.servers = action.payload;
    },
  },
});

export const { setServers } = serversSlice.actions;

export default serversSlice.reducer;
