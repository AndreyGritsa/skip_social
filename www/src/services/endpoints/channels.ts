import socialApi from "../social";
import { Channel, setChannels } from "../../features/channels/channelsSlice";

interface ChannelResponse extends Channel {}

let channelsEventSource: EventSource | null = null;

export const extendedSocialSlice = socialApi.injectEndpoints({
  endpoints: (builder) => ({
    getChannels: builder.query<ChannelResponse[], string>({
      query: (params) => `channels/?profile_id=${params}`,
      async onCacheEntryAdded(
        arg,
        { cacheDataLoaded, cacheEntryRemoved, dispatch }
      ) {
        channelsEventSource = new EventSource(
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
        channelsEventSource.close();
        channelsEventSource = null;
      },
    }),
    closeChanelsEventSource: builder.mutation<void, void>({
      queryFn: () => {
        if (channelsEventSource) channelsEventSource.close();
        console.log("Closing event source for channels");
        return { data: undefined };
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
  }),
});

export const { useGetChannelsQuery, useNewChannelMutation } =
  extendedSocialSlice;
