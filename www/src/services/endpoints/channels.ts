import socialApi, { handleEventSource } from "../social";
import {
  Channel,
  Message,
  setChannels,
  setMessages,
} from "../../features/channels/channelsSlice";

interface ChannelResponse extends Channel {}

export const extendedSocialSlice = socialApi.injectEndpoints({
  endpoints: (builder) => ({
    getChannels: builder.query<ChannelResponse[], string>({
      query: (params) => `channels/?profile_id=${params}`,
      providesTags: ["Channels"],
      async onCacheEntryAdded(
        arg,
        { cacheDataLoaded, cacheEntryRemoved, dispatch }
      ) {
        handleEventSource(
          `/api/channels/?profile_id=${arg}`,
          {
            init: (data: ChannelResponse[]) => {
              dispatch(setChannels(data));
            },
            update: (data: ChannelResponse[]) => {
              dispatch(setChannels(data));
            },
          },
          cacheDataLoaded,
          cacheEntryRemoved
        );
      },
    }),
    newChannel: builder.mutation<
      ChannelResponse,
      { profile_id: string; participant_id: string }
    >({
      query: (data) => ({
        url: `channels/`,
        method: "POST",
        body: data,
      }),
    }),
    getMessages: builder.query<Message[], string>({
      query: (params) => `channels/messages/?channel_id=${params}`,
      providesTags: ["Messages"],
      async onCacheEntryAdded(
        arg,
        { cacheDataLoaded, cacheEntryRemoved, dispatch }
      ) {
        handleEventSource(
          `/api/channels/messages/?channel_id=${arg}`,
          {
            init: (data: Message[]) => {
              dispatch(
                setMessages({
                  channelId: arg,
                  messages: data.sort((a, b) => {
                    return (
                      new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime()
                    );
                  }),
                })
              );
            },
            update: (data: Message[]) => {
              dispatch(
                setMessages({
                  channelId: arg,
                  messages: data.sort((a, b) => {
                    return (
                      new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime()
                    );
                  }),
                })
              );
            },
          },
          cacheDataLoaded,
          cacheEntryRemoved
        );
      },
    }),
    invalidateMessages: builder.mutation<void, void>({
      queryFn: () => {
        return { data: undefined };
      },
      invalidatesTags: ["Messages"],
    }),
    postMessage: builder.mutation<
      string,
      { channel_id: string; author_id: string; content: string }
    >({
      query: (data) => ({
        url: `channels/messages/`,
        method: "POST",
        body: data,
      }),
    }),
    invalidateChannels: builder.mutation<void, void>({
      queryFn: () => {
        return { data: undefined };
      },
      invalidatesTags: ["Channels"],
    }),
  }),
});

export const {
  useGetChannelsQuery,
  useNewChannelMutation,
  useGetMessagesQuery,
  useInvalidateMessagesMutation,
  usePostMessageMutation,
  useInvalidateChannelsMutation,
} = extendedSocialSlice;
