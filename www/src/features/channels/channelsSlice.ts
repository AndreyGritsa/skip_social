import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import fakeData from "./fakeData.json";
import { User } from "../user/userSlice";

export interface Message {
  id: string;
  content: string;
  author: User;
  timestamp: string;
}

export interface Channel extends User {
  status: string;
  messages: Message[];
}

export interface ChannelsState {
  channels: Channel[];
}

// fake initial state, should be empty
const initialState: ChannelsState = {
  channels: fakeData,
};

export const channelsSlice = createSlice({
  name: "channels",
  initialState,
  reducers: {
    addMessage: (
      state,
      action: PayloadAction<{
        channelId: string;
        content: string;
        author: User;
      }>
    ) => {
      const { channelId, content, author } = action.payload;
      const channel = state.channels.find(
        (channel) => channel.id === channelId
      );
      if (channel) {
        const timestamp = new Date().toISOString();
        const newMessage: Message = {
          id: timestamp,
          content,
          author,
          timestamp,
        };
        channel.messages.unshift(newMessage);
      }
    },
    reorderChannels: (state, action: PayloadAction<string>) => {
      const channelId = action.payload;
      const channel = state.channels.find(
        (channel) => channel.id === channelId
      );
      if (channel) {
        const index = state.channels.indexOf(channel);
        state.channels.splice(index, 1);
        state.channels.unshift(channel);
      }
    },
    addNewChannel: (state, action: PayloadAction<Channel>) => {
      state.channels.unshift(action.payload);
    },
  },
});

export const { addMessage, reorderChannels, addNewChannel } =
  channelsSlice.actions;

export default channelsSlice.reducer;
