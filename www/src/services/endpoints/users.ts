import socialApi from "../social";
import { setUser } from "../../features/user/userSlice";
import { setFriends } from "../../features/friends/friendsSlice";
import { Friend } from "../../features/friends/friendsSlice";
import { User } from "../../features/user/userSlice";

type StausRequest = {
  profile_id: string;
  new_status: string;
};

interface UserResponse extends User {
  status: string;
}

interface FriendResponse extends Friend {}

let friendRequestsEventSource: EventSource | null = null;

export const extendedSocialSlice = socialApi.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query<UserResponse[], string>({
      query: (profile_id) => `users/?profile_id=${profile_id}`,
      async onCacheEntryAdded(
        arg,
        { dispatch, cacheDataLoaded, cacheEntryRemoved }
      ) {
        // Create an EventSource instance
        const evSource = new EventSource(`/api/users/?profile_id=${arg}`);

        // Handle the initial cache data
        try {
          const cacheData = await cacheDataLoaded;
          dispatch(setUser(cacheData.data[0]));
          console.log("cacheData", cacheData);
        } catch (error) {
          console.error("Error loading cache data:", error);
        }

        // Handle the "init" event
        evSource.addEventListener("init", (e: MessageEvent<string>) => {
          const data = JSON.parse(e.data);
          const updatedUser = data[0][1][0] as UserResponse;
          // console.log("response", data);
          dispatch(setUser(updatedUser));
        });

        // Handle the "update" event
        evSource.addEventListener("update", (e: MessageEvent<string>) => {
          const data = JSON.parse(e.data);
          const updatedUser = data[0][1][0] as UserResponse;
          // console.log("response", data);
          dispatch(setUser(updatedUser));
        });

        // Clean up the EventSource when the cache entry is removed
        await cacheEntryRemoved;
        evSource.close();
      },
    }),
    getFriends: builder.query<FriendResponse[], string>({
      query: (profile_id) => `users/friend?profile_id=${profile_id}`,
      async onCacheEntryAdded(
        arg,
        { dispatch, cacheDataLoaded, cacheEntryRemoved }
      ) {
        // Create an EventSource instance
        const evSource = new EventSource(`/api/users/friend?profile_id=${arg}`);

        // Handle the initial cache data
        try {
          const cacheData = await cacheDataLoaded;
          dispatch(setFriends(cacheData.data));
        } catch (error) {
          console.error("Error loading cache data:", error);
        }

        // Handle the "init" event
        evSource.addEventListener("init", (e: MessageEvent<string>) => {
          const data = JSON.parse(e.data);
          try {
            const updatedFriends = data[0][1] as FriendResponse[];
            dispatch(setFriends(updatedFriends));
          } catch (error) {
            console.error("Error updating friends:", error);
          }
        });

        // Handle the "update" event
        evSource.addEventListener("update", (e: MessageEvent<string>) => {
          const data = JSON.parse(e.data);
          try {
            const updatedFriends = data[0][1] as FriendResponse[];
            dispatch(setFriends(updatedFriends));
          } catch (error) {
            console.error("Error updating friends:", error);
          }
        });

        // Clean up the EventSource when the cache entry is removed
        await cacheEntryRemoved;
        evSource.close();
      },
    }),
    setStatus: builder.mutation<any, StausRequest>({
      query: (data) => ({
        url: `users/`,
        method: "PATCH",
        body: { status: data.new_status, profile_id: data.profile_id },
      }),
    }),
    getFriendRequests: builder.query<UserResponse[], string>({
      query: (profile_id) => `users/friend/request?profile_id=${profile_id}`,
      async onCacheEntryAdded(
        arg,
        { cacheDataLoaded, cacheEntryRemoved, updateCachedData }
      ) {
        // Create an EventSource instance
        friendRequestsEventSource = new EventSource(
          `/api/users/friend/request?profile_id=${arg}`
        );

        // Handle the initial cache data
        try {
          await cacheDataLoaded;
        } catch (error) {
          console.error("Error loading cache data:", error);
        }

        // Handle the "init" event
        friendRequestsEventSource.addEventListener(
          "init",
          (e: MessageEvent<string>) => {
            const data = JSON.parse(e.data);
            try {
              const friendRequests = data[0][1] as UserResponse[];
              updateCachedData((draft) => {
                draft.length = 0;
                draft.push(...friendRequests);
              });
            } catch (error) {
              console.error("Error updating friend requests:", error);
            }
          }
        );

        // Handle the "update" event
        friendRequestsEventSource.addEventListener(
          "update",
          (e: MessageEvent<string>) => {
            const data = JSON.parse(e.data);
            try {
              const friendRequests = data[0][1] as UserResponse[];
              updateCachedData((draft) => {
                draft.length = 0;
                draft.push(...friendRequests);
              });
            } catch (error) {
              console.error("Error updating friend requests:", error);
            }
          }
        );

        // Clean up the EventSource when the cache entry is removed
        await cacheEntryRemoved;
        friendRequestsEventSource.close();
        friendRequestsEventSource = null;
      },
    }),
    closeFriendRequestsEventSource: builder.mutation<void, void>({
      queryFn: () => {
        if (friendRequestsEventSource) friendRequestsEventSource.close();
        return { data: undefined };
      },
    }),
    postFriendRequest: builder.mutation<
      any,
      { from_profile: string; to_profile: string }
    >({
      query: (data) => ({
        url: `users/friend/request`,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetUserQuery,
  useGetFriendsQuery,
  useSetStatusMutation,
  useGetFriendRequestsQuery,
  useCloseFriendRequestsEventSourceMutation,
  usePostFriendRequestMutation,
} = extendedSocialSlice;
