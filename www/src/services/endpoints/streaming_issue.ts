import socialApi, { handleEventSource } from "../social";

export const extendedStreamingIssueSlice = socialApi.injectEndpoints({
  endpoints: (builder) => ({
    getStreamingIssue: builder.query<any, any>({
      query: () => `issue/`,
      async onCacheEntryAdded(arg, { cacheDataLoaded, cacheEntryRemoved }) {
        handleEventSource(
          `/api/issue/`,
          {
            init: (data) => {
              console.log(`init streaming issue data: `, data);
            },
            update: (data) => {
              console.log(`update streaming issue data: `, data);
            },
          },
          cacheDataLoaded,
          cacheEntryRemoved
        );
      },
    }),
  }),
});

export const { useGetStreamingIssueQuery } = extendedStreamingIssueSlice;
