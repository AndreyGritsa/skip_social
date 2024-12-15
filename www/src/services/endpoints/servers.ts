import socialApi from "../social";
import {
  Server,
  setServers,
  ServerMessage,
} from "../../features/servers/serversSlice";
import { setMessages } from "../../features/servers/serversSlice";

interface ServerResponse extends Server {}

interface MessageResponse extends ServerMessage {}

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
    newServerChannel: builder.mutation<
      string,
      { server_id: string; channel_name: string }
    >({
      query: (body) => ({
        url: "/servers/channels/",
        method: "POST",
        body,
      }),
    }),
    deleteServerChannel: builder.mutation<string, { channel_id: string }>({
      query: (body) => ({
        url: `/servers/channels/${body.channel_id}/`,
        method: "DELETE",
      }),
    }),
    updateServerChannel: builder.mutation<
      string,
      { channel_id: string; channel_name: string }
    >({
      query: (body) => ({
        url: `/servers/channels/${body.channel_id}/`,
        method: "PUT",
        body,
      }),
    }),
    getServerMessages: builder.query<
      MessageResponse[],
      { channel_id: string; server_id: string }
    >({
      query: (params) => `/servers/messages/?channel_id=${params.channel_id}`,
      providesTags: ["ServerMessages"],
      async onCacheEntryAdded(
        arg,
        { cacheDataLoaded, cacheEntryRemoved, dispatch }
      ) {
        const messagesEventSource = new EventSource(
          `/api/servers/messages/?channel_id=${arg.channel_id}`
        );

        // Handle the initial cache data
        try {
          const serverMessagesCacheData = await cacheDataLoaded;
          console.log("serverMessagesCacheData", serverMessagesCacheData);
          dispatch(
            setMessages({
              channelId: arg.channel_id,
              serverId: arg.server_id,
              messages: serverMessagesCacheData.data.sort((a, b) => {
                return (
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
                );
              }),
            })
          );
        } catch (error) {
          console.error("Error loading cache data:", error);
        }

        // Handle the "init" event
        messagesEventSource.addEventListener(
          "init",
          (e: MessageEvent<string>) => {
            const data = JSON.parse(e.data);
            console.log("Server messages init data", data);
            try {
              const messages = data[0][1] as MessageResponse[];
              dispatch(
                setMessages({
                  channelId: arg.channel_id,
                  serverId: arg.server_id,
                  messages: messages.sort((a, b) => {
                    return (
                      new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime()
                    );
                  }),
                })
              );
            } catch (error) {
              console.error("Error updating messages:", error);
            }
          }
        );

        // Handle the "update" event
        messagesEventSource.addEventListener(
          "update",
          (e: MessageEvent<string>) => {
            const data = JSON.parse(e.data);
            console.log("Server messages update data", data);
            try {
              const messages = data[0][1] as MessageResponse[];
              dispatch(
                setMessages({
                  channelId: arg.channel_id,
                  serverId: arg.server_id,
                  messages: messages.sort((a, b) => {
                    return (
                      new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime()
                    );
                  }),
                })
              );
            } catch (error) {
              console.error("Error updating messages:", error);
            }
          }
        );

        // Clean up the EventSource when the cache entry is removed
        await cacheEntryRemoved;
        console.log("Closing event source for server messages");
        messagesEventSource.close();
      },
    }),
    invalidateServerMessages: builder.mutation<void, void>({
      queryFn: () => {
        return { data: undefined };
      },
      invalidatesTags: ["ServerMessages"],
    }),
    postServerMessage: builder.mutation<
      string,
      { channel_id: string; author_id: string; content: string }
    >({
      query: (data) => ({
        url: `servers/messages/`,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  usePostServerMutation,
  useGetServersQuery,
  useNewMemberMutation,
  useNewServerChannelMutation,
  useDeleteServerChannelMutation,
  useUpdateServerChannelMutation,
  useGetServerMessagesQuery,
  useInvalidateServerMessagesMutation,
  usePostServerMessageMutation,
} = extendedSocialSlice;
