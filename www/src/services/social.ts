import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const socialApi = createApi({
  reducerPath: "socialApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_PUBLIC_BACKEND_URL,
  }),
  refetchOnFocus: false,
  tagTypes: [
    "Messages",
    "Posts",
    "Comments",
    "Channels",
    "ServerMessages",
    "ServerMembers",
    "FriendRequests",
    "Externals",
    "ChannelCommand",
  ],
  endpoints: () => ({}),
});

export default socialApi;

export const handleEventSource = async (
  url: string,
  eventHandlers: { [key: string]: (data: any) => void },
  cacheDataLoaded: any,
  cacheEntryRemoved: Promise<void>
) => {
  const eventSource = new EventSource(url);

  // Handle the initial cache data
  try {
    const cacheData = await cacheDataLoaded;
    console.log(`cacheData for ${url}`, cacheData);
    eventHandlers.init && eventHandlers.init(cacheData.data);
  } catch (error) {
    console.error(`Error loading cache data for ${url}:`, error);
  }

  // Handle the events
  Object.keys(eventHandlers).forEach((event) => {
    eventSource.addEventListener(event, (e: MessageEvent<string>) => {
      const data = JSON.parse(e.data);
      console.log(`${event} data for ${url}`, data);
      if (!data || !data[0]) return;
      try {
        eventHandlers[event](data[0][1]);
      } catch (error) {
        console.error(`Error handling ${event} event for ${url}:`, error);
      }
    });
  });

  // Clean up the EventSource when the cache entry is removed
  await cacheEntryRemoved;
  console.log(`Closing event source for ${url}`);
  eventSource.close();
};
