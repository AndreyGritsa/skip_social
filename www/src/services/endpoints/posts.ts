import socialApi from "../social";
import { Post } from "../../features/posts/postsSlice";
import { setPosts } from "../../features/posts/postsSlice";

interface PostsResponse extends Post {}

let postsEventSource: EventSource | null = null;

export const extendedSocialSlice = socialApi.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query<PostsResponse[], string>({
      query: (profile_id) => `posts/?profile_id=${profile_id}`,
      async onCacheEntryAdded(
        arg,
        { cacheDataLoaded, cacheEntryRemoved, dispatch }
      ) {
        // Create an EventSource instance
        postsEventSource = new EventSource(`/api/posts/?profile_id=${arg}`);

        // Handle the initial cache data
        try {
          const cacheData = await cacheDataLoaded;
          console.log("cacheData", cacheData);

          dispatch(setPosts([cacheData.data[0]]));
        } catch (error) {
          console.error("Error loading cache data:", error);
        }

        // Handle the "init" event
        postsEventSource.addEventListener("init", (e: MessageEvent<string>) => {
          const data = JSON.parse(e.data);
          try {
            console.log("posts data", data);
            const posts = data[0][1] as PostsResponse[];
            dispatch(setPosts(posts));
          } catch (error) {
            console.error("Error updating friend requests:", error);
          }
        });

        // Handle the "update" event
        postsEventSource.addEventListener(
          "update",
          (e: MessageEvent<string>) => {
            const data = JSON.parse(e.data);
            try {
              const posts = data[0][1] as PostsResponse[];
              dispatch(setPosts(posts));
            } catch (error) {
              console.error("Error updating friend requests:", error);
            }
          }
        );

        // Clean up the EventSource when the cache entry is removed
        await cacheEntryRemoved;
        postsEventSource.close();
        postsEventSource = null;
      },
    }),
    closePostsEventSource: builder.mutation<void, void>({
      queryFn: () => {
        if (postsEventSource) postsEventSource.close();
        return { data: undefined };
      },
    }),
  }),
});

export const { useGetPostsQuery, useClosePostsEventSourceMutation } =
  extendedSocialSlice;
