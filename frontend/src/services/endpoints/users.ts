import socialApi from "../social";
import { setUser } from "../../features/user/userSlice";

type UserResponse = {
  username: string;
  status: string;
};

export const extendedSocialSlice = socialApi.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query<UserResponse, string>({
      query: (profile_id) => `users/?profile_id=${profile_id}`,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setUser({ id: "", name: data.username, status: data.status })
          );
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      },
    }),
  }),
});

export const { useGetUserQuery } = extendedSocialSlice;
