import socialApi, { handleEventSource } from "../social";
import {
  Server,
  setServers,
  ServerMessage,
  ServerMember,
} from "../../features/servers/serversSlice";
import { setMessages } from "../../features/servers/serversSlice";

interface ServerResponse extends Server {}

interface MessageResponse extends ServerMessage {}

interface ServerMemberResponse extends ServerMember {}

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
        handleEventSource(
          `/api/servers/?profile_id=${arg.profile_id}`,
          {
            init: (data: ServerResponse[]) => {
              dispatch(setServers(data));
            },
            update: (data: ServerResponse[]) => {
              dispatch(setServers(data));
            },
          },
          cacheDataLoaded,
          cacheEntryRemoved
        );
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
      {
        channel_id: string;
        channel_name: string;
        admin_role: boolean;
        newbie_role: boolean;
      }
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
        handleEventSource(
          `/api/servers/messages/?channel_id=${arg.channel_id}`,
          {
            init: (data: MessageResponse[]) => {
              dispatch(
                setMessages({
                  channelId: arg.channel_id,
                  serverId: arg.server_id,
                  messages: data,
                })
              );
            },
            update: (data: MessageResponse[]) => {
              dispatch(
                setMessages({
                  channelId: arg.channel_id,
                  serverId: arg.server_id,
                  messages: data,
                })
              );
            },
          },
          cacheDataLoaded,
          cacheEntryRemoved
        );
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
    getServerMembers: builder.query<
      ServerMemberResponse[],
      { server_id: string; profile_id: string }
    >({
      query: (params) => ({
        url: `/servers/members/?server_id=${params.server_id}&profile_id=${params.profile_id}`,
      }),
      providesTags: ["ServerMembers"],
      async onCacheEntryAdded(
        arg,
        { cacheDataLoaded, cacheEntryRemoved, updateCachedData }
      ) {
        handleEventSource(
          `/api/servers/members/?server_id=${arg.server_id}&profile_id=${arg.profile_id}`,
          {
            init: (data: ServerMemberResponse[]) => {
              console.log("Server members init data", data);
              updateCachedData((draft) => {
                draft.length = 0;
                data.forEach((member) => draft.push(member));
              });
            },
            update: (data: ServerMemberResponse[]) => {
              console.log("Server members update data", data);
              updateCachedData((draft) => {
                draft.length = 0;
                data.forEach((member) => draft.push(member));
              });
            },
          },
          cacheDataLoaded,
          cacheEntryRemoved
        );
      },
    }),
    invalidateServerMembers: builder.mutation<void, void>({
      queryFn: () => {
        return { data: undefined };
      },
      invalidatesTags: ["ServerMembers"],
    }),
    leaveServer: builder.mutation<
      string,
      { profile_id: string; server_id: string }
    >({
      query: (body) => ({
        url: `/servers/members/${body.profile_id}/${body.server_id}/`,
        method: "DELETE",
      }),
    }),
    deleteServer: builder.mutation<string, { server_id: string }>({
      query: (body) => ({
        url: `/servers/${body.server_id}/`,
        method: "DELETE",
      }),
    }),
    updateMemberRole: builder.mutation<
      string,
      { role: string; server_id: string; profile_id: string }
    >({
      query: (body) => ({
        url: `/servers/members/${body.profile_id}/${body.server_id}/`,
        method: "PATCH",
        body,
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
  useGetServerMembersQuery,
  useInvalidateServerMembersMutation,
  useLeaveServerMutation,
  useDeleteServerMutation,
  useUpdateMemberRoleMutation,
} = extendedSocialSlice;
