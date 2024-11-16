import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface LastRoom {
  server: string;
  room: string;
}

export interface ActiveState {
  server: string;
  room: string;
  channel: string;
  lastRooms: LastRoom[];
}

const initialState: ActiveState = {
  server: "0",
  room: "0",
  channel: "0",
  lastRooms: [],
};

export const activeChannelSlice = createSlice({
  name: "active",
  initialState,
  reducers: {
    setActiveChannel: (state, action: PayloadAction<string>) => {
      state.channel = action.payload;
    },
    setActiveServer: (state, action: PayloadAction<string>) => {
      state.server = action.payload;
      const lastRoomIndex = state.lastRooms.findIndex(
        (server) => server.server === action.payload
      );
      if (lastRoomIndex !== -1) {
        state.room = state.lastRooms[lastRoomIndex as number].room || "0";
      }
    },
    setActiveRoom: (
      state,
      action: PayloadAction<{ roomId: string; serverId: string }>
    ) => {
      state.room = action.payload.roomId;
      const lastRoomIndex = state.lastRooms.findIndex(
        (server) => server.server === action.payload.serverId
      );
      if (lastRoomIndex !== -1) {
        state.lastRooms[lastRoomIndex].room = action.payload.roomId;
        state.lastRooms[lastRoomIndex].server = action.payload.serverId;
      } else {
        state.lastRooms.push({
          server: action.payload.serverId,
          room: action.payload.roomId,
        });
      }
    },
  },
});

export const { setActiveChannel, setActiveServer, setActiveRoom } =
  activeChannelSlice.actions;

export default activeChannelSlice.reducer;
