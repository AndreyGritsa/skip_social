import socialApi, { handleEventSource } from "../social";
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

export const extendedSocialSlice = socialApi.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query<UserResponse[], string>({
      query: (profile_id) => `users/?profile_id=${profile_id}`,
      async onCacheEntryAdded(
        arg,
        { dispatch, cacheDataLoaded, cacheEntryRemoved }
      ) {
        handleEventSource(
          `/api/users/?profile_id=${arg}`,
          {
            init: (data: UserResponse[]) => {
              dispatch(setUser(data[0]));
            },
            update: (data: UserResponse[]) => {
              dispatch(setUser(data[0]));
            },
          },
          cacheDataLoaded,
          cacheEntryRemoved
        );
      },
    }),
    getFriends: builder.query<FriendResponse[], string>({
      query: (profile_id) => `users/friend?profile_id=${profile_id}`,
      async onCacheEntryAdded(
        arg,
        { dispatch, cacheDataLoaded, cacheEntryRemoved }
      ) {
        handleEventSource(
          `/api/users/friend?profile_id=${arg}`,
          {
            init: (data: FriendResponse[]) => {
              dispatch(setFriends(data));
            },
            update: (data: FriendResponse[]) => {
              dispatch(setFriends(data));
            },
          },
          cacheDataLoaded,
          cacheEntryRemoved
        );
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
        handleEventSource(
          `/api/users/friend/request?profile_id=${arg}`,
          {
            init: (data: UserResponse[]) => {
              updateCachedData((draft) => {
                draft.length = 0;
                draft.push(...data);
              });
            },
            update: (data: UserResponse[]) => {
              updateCachedData((draft) => {
                draft.length = 0;
                draft.push(...data);
              });
            },
          },
          cacheDataLoaded,
          cacheEntryRemoved
        );
      },
    }),
    invalidateFriendsRequests: builder.mutation<void, void>({
      invalidatesTags: ["FriendRequests"],
      queryFn: () => {
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
    deleteFriend: builder.mutation<
      any,
      { profile_id: string; friend_id: string }
    >({
      query: (data) => ({
        url: `users/friend`,
        method: "PUT",
        body: data,
      }),
    }),
    getAllUsers: builder.query<UserResponse[], void>({
      query: () => `users/users/`,
    }),
  }),
});

export const {
  useGetUserQuery,
  useGetFriendsQuery,
  useSetStatusMutation,
  useGetFriendRequestsQuery,
  useInvalidateFriendsRequestsMutation,
  usePostFriendRequestMutation,
  useDeleteFriendMutation,
  useGetAllUsersQuery,
} = extendedSocialSlice;
