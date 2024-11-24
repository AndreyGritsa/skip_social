import { createSlice } from "@reduxjs/toolkit";
import fakeData from "./fakeData";
import { User } from "../user/userSlice";
import { Message } from "../channels/channelsSlice";

export interface ServerMessage extends Message {}

export interface ServerUser extends User {
  role?: string;
}

export interface Room {
  id: string;
  name: string;
  messages: Message[];
}

export interface Server extends User {
  rooms: Room[];
  members: ServerUser[];
}

export interface ServersState {
  servers: Server[];
}

// fake initial state, should be empty
const initialState: ServersState = {
  servers: fakeData,
};

export const serversSlice = createSlice({
  name: "servers",
  initialState,
  reducers: {},
});

export default serversSlice.reducer;
