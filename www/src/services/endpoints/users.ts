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

type FriendsResponse = {
  friends: Friend[];
};

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
    getFriends: builder.query<FriendsResponse, string>({
      query: (profile_id) => `users/friend/?profile_id=${profile_id}`,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setFriends([...data.friends]));
        } catch (error) {
          console.error("Error fetching friends data:", error);
        }
      },
      providesTags: ["friends"],
    }),
    setStatus: builder.mutation<any, StausRequest>({
      query: (data) => ({
        url: `users/`,
        method: "PATCH",
        body: { status: data.new_status, profile_id: data.profile_id },
      }),
    }),
    getFriendRequests: builder.query<FriendReuqestResponse[], string>({
      query: (profile_id) => `users/friend/request/?profile_id=${profile_id}`,
    }),
    postFriendRequest: builder.mutation<
      any,
      { from_profile: string; to_profile: string }
    >({
      query: (data) => ({
        url: `users/friend/request/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["friends"],
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
