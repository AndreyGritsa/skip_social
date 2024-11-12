import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import userReducer from "../features/user/userSlice";
import channelsReducer from "../features/channels/channelsSlice";
import activeChannelReducer from "../features/active_channel/activeChannelSlice";
import postsReducer from "../features/posts/postsSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    channels: channelsReducer,
    activeChannel: activeChannelReducer,
    posts: postsReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
