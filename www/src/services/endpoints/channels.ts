import socialApi from "../social";
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
        const channelsEventSource = new EventSource(
          `/api/channels/?profile_id=${arg}`
        );

        // Handle the initial cache data
        try {
          const channelsCacheData = await cacheDataLoaded;
          console.log("channelsCacheData", channelsCacheData);
          dispatch(setChannels(channelsCacheData.data));
        } catch (error) {
          console.error("Error loading cache data:", error);
        }

        // Handle the "init" event
        channelsEventSource.addEventListener(
          "init",
          (e: MessageEvent<string>) => {
            const data = JSON.parse(e.data);
            console.log("Channels init data", data);
            try {
              const channels = data[0][1] as ChannelResponse[];
              dispatch(setChannels(channels));
            } catch (error) {
              console.error("Error updating friend requests:", error);
            }
          }
        );

        // Handle the "update" event
        channelsEventSource.addEventListener(
          "update",
          (e: MessageEvent<string>) => {
            const data = JSON.parse(e.data);
            console.log("Channels update data", data);
            try {
              const channels = data[0][1] as ChannelResponse[];
              console.log(`channels`, channels);
              dispatch(setChannels(channels));
            } catch (error) {
              console.error("Error updating friend requests:", error);
            }
          }
        );

        // Clean up the EventSource when the cache entry is removed
        await cacheEntryRemoved;
        console.log("Closing event source for channels");
        channelsEventSource.close();
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
        const messagesEventSource = new EventSource(
          `/api/channels/messages/?channel_id=${arg}`
        );

        // Handle the initial cache data
        try {
          const messagesCacheData = await cacheDataLoaded;
          console.log("messagesCacheData", messagesCacheData);
          dispatch(
            setMessages({
              channelId: arg,
              messages: messagesCacheData.data.reverse(),
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
            console.log("Messages init data", data);
            try {
              const messages = data[0][1] as Message[];
              dispatch(
                setMessages({ channelId: arg, messages: messages.reverse() })
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
            console.log("Messages update data", data);
            try {
              const messages = data[0][1] as Message[];
              dispatch(
                setMessages({ channelId: arg, messages: messages.reverse() })
              );
            } catch (error) {
              console.error("Error updating messages:", error);
            }
          }
        );

        // Clean up the EventSource when the cache entry is removed
        await cacheEntryRemoved;
        console.log("Closing event source for messages");
        messagesEventSource.close();
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
