import socialApi from "../social";
import { Server, setServers } from "../../features/servers/serversSlice";

interface ServerResponse extends Server {}

export const extendedSocialSlice = socialApi.injectEndpoints({
  endpoints: (builder) => ({
    postServer: builder.mutation<
      string,
      { profile_id: string; server_name: string }
    >({
      query: (body) => ({
        url: "/servers/",
        method: "POST",
        body,
      }),
    }),
    getServers: builder.query<ServerResponse[], { profile_id: string }>({
      query: (params) => `/servers/?profile_id=${params.profile_id}`,
      async onCacheEntryAdded(
        arg,
        { cacheDataLoaded, cacheEntryRemoved, dispatch }
      ) {
        const serversEventSource = new EventSource(
          `/api/servers/?profile_id=${arg.profile_id}`
        );

        // Handle the initial cache data
        try {
          const serversCacheData = await cacheDataLoaded;
          console.log("serversCacheData", serversCacheData);
          dispatch(setServers(serversCacheData.data));
        } catch (error) {
          console.error("Error loading cache data:", error);
        }

        // Handle the "init" event
        serversEventSource.addEventListener(
          "init",
          (e: MessageEvent<string>) => {
            const data = JSON.parse(e.data);
            console.log("Servers init data", data);
            try {
              const servers = data[0][1] as ServerResponse[];
              dispatch(setServers(servers));
            } catch (error) {
              console.error("Error updating friend requests:", error);
            }
          }
        );

        // Handle the "update" event
        serversEventSource.addEventListener(
          "update",
          (e: MessageEvent<string>) => {
            const data = JSON.parse(e.data);
            console.log("Servers update data", data);
            try {
              const servers = data[0][1] as ServerResponse[];
              dispatch(setServers(servers));
              console.log(`servers`, servers);
            } catch (error) {
              console.error("Error updating friend requests:", error);
            }
          }
        );

        // Clean up the EventSource when the cache entry is removed
        await cacheEntryRemoved;
        console.log("Closing event source for servers");
        serversEventSource.close();
      },
    }),
    newMember: builder.mutation<
      string,
      { profile_id: string; server_name: string }
    >({
      query: (body) => ({
        url: "/servers/members/",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  usePostServerMutation,
  useGetServersQuery,
  useNewMemberMutation,
} = extendedSocialSlice;
