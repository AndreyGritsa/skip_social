import socialApi from "../social";
import { setUser } from "../../features/user/userSlice";
import { setFriends } from "../../features/friends/friendsSlice";
import { Friend } from "../../features/friends/friendsSlice";

type UserResponse = {
  username: string;
  status: string;
};

type StausRequest = {
  profile_id: string;
  new_status: string;
};

// type FriendsResponse = {
//   friends: Friend[];
// };

type FriendReuqestResponse = {
  from_profile: string;
  to_profile: string;
};

export const extendedSocialSlice = socialApi.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query<UserResponse, string>({
      query: (profile_id) => `users/?profile_id=${profile_id}`,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setUser({
              id: localStorage.getItem("profile_id") as string,
              name: data.username,
              status: data.status,
            })
          );
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      },
    }),
    getFriends: builder.query<any, string>({
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
          const updatedFriends = data[0][1] as Friend[];
          dispatch(setFriends(updatedFriends));
        });

        // Handle the "update" event
        evSource.addEventListener("update", (e: MessageEvent<string>) => {
          const data = JSON.parse(e.data);
          const updatedFriends = data[0][1] as Friend[];
          dispatch(setFriends(updatedFriends));
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
    getFriendRequests: builder.query<FriendReuqestResponse[], string>({
      query: (profile_id) => `users/friend/request?profile_id=${profile_id}`,
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
  usePostFriendRequestMutation,
} = extendedSocialSlice;
