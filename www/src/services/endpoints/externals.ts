import socialApi, { handleEventSource } from "../social";
import { setSubscriptions } from "../../features/subscriptions/subscriptionsSlice";
import { Subscription } from "../../features/subscriptions/subscriptionsSlice";

export const extendedExternalSlice = socialApi.injectEndpoints({
  endpoints: (builder) => ({
    getExternals: builder.query<
      any,
      { profile_id: string; type: string; id?: string }
    >({
      query: (params) =>
        `externals/?profile_id=${params.profile_id}&type=${params.type}&id=${params.id}`,
      providesTags: ["Externals"],
      async onCacheEntryAdded(
        arg,
        { cacheDataLoaded, cacheEntryRemoved, dispatch }
      ) {
        handleEventSource(
          `/api/externals/?profile_id=${arg.profile_id}&type=${arg.type}&id=${arg.id}`,
          {
            init: (data: Subscription[]) => {
              dispatch(setSubscriptions(data));
            },
            update: (data: Subscription[]) => {
              dispatch(setSubscriptions(data));
            },
          },
          cacheDataLoaded,
          cacheEntryRemoved
        );
      },
    }),
    getExternalsWeather: builder.query<
      any,
      { profile_id: string; type: string; id: string }
    >({
      query: (params) =>
        `externals/?profile_id=${params.profile_id}&type=${params.type}&id=${params.id}`,
      providesTags: ["Externals"],
      async onCacheEntryAdded(
        arg,
        { cacheDataLoaded, cacheEntryRemoved, updateCachedData }
      ) {
        handleEventSource(
          `/api/externals/?profile_id=${arg.profile_id}&type=${arg.type}&id=${arg.id}`,
          {
            init: (data: Subscription[]) => {
              updateCachedData((draft) => {
                draft.length = 0;
                data.forEach((element) => draft.push(element));
              });
            },
            update: (data: Subscription[]) => {
              updateCachedData((draft) => {
                draft.length = 0;
                data.forEach((element) => draft.push(element));
              });
            },
          },
          cacheDataLoaded,
          cacheEntryRemoved
        );
      },
    }),
    invalidateExternals: builder.mutation<void, void>({
      queryFn: () => {
        return { data: undefined };
      },
      invalidatesTags: ["Externals"],
    }),
    addExternalSubscription: builder.mutation<
      any,
      { type: string; params: Record<string, any>, profile_id: string }
    >({
      query: (data) => ({
        url: `externals/`,
        method: "POST",
        body: data,
      }),
    }),
    deleteSubscription: builder.mutation<
      any,
      string
      >({
      query: (id) => ({
        url: `externals/${id}/`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetExternalsQuery,
  useGetExternalsWeatherQuery,
  useInvalidateExternalsMutation,
  useAddExternalSubscriptionMutation,
  useDeleteSubscriptionMutation,
} = extendedExternalSlice;
