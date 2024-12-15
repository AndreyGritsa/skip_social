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
  messages: ServerMessage[];
}

export interface Server extends User {
  owner_id: string;
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
    setMessages: (
      state,
      action: PayloadAction<{
        serverId: string;
        channelId: string;
        messages: ServerMessage[];
      }>
    ) => {
      const server = state.servers.find(
        (server) => server.id === action.payload.serverId
      );
      if (server) {
        const channel = server.channels.find(
          (channel) => channel.id === action.payload.channelId
        );
        if (channel) {
          channel.messages = action.payload.messages;
        }
      }
    },
  },
});

export const { setServers, setMessages } = serversSlice.actions;

export default serversSlice.reducer;
