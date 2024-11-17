import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import socialApi from "../services/social";
import userReducer from "../features/user/userSlice";
import channelsReducer from "../features/channels/channelsSlice";
import activeChannelReducer from "../features/active/activeSlice";
import postsReducer from "../features/posts/postsSlice";
import friendsReducer from "../features/friends/friendsSlice";
import serversReducer from "../features/servers/serversSlice";

export const store = configureStore({
  reducer: {
    [socialApi.reducerPath]: socialApi.reducer,
    user: userReducer,
    channels: channelsReducer,
    active: activeChannelReducer,
    posts: postsReducer,
    friends: friendsReducer,
    servers: serversReducer,
  },

  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(socialApi.middleware),
});

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
