import socialApi from "../social";
import { Post } from "../../features/posts/postsSlice";
import { setPosts } from "../../features/posts/postsSlice";

interface PostsResponse extends Post {}

export let postsEventSource: EventSource | null = null;
export let myPostsEventSource: EventSource | null = null;

export const extendedSocialSlice = socialApi.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query<PostsResponse[], string>({
      query: (params) => `posts/?profile_id=${params}&type=posts`,
      async onCacheEntryAdded(
        arg,
        { cacheDataLoaded, cacheEntryRemoved, dispatch }
      ) {
        postsEventSource = new EventSource(
          `/api/posts/?profile_id=${arg}&type=posts`
        );

        // Handle the initial cache data
        try {
          const postsCacheData = await cacheDataLoaded;
          console.log("postsCacheData", postsCacheData);
          dispatch(
            setPosts({
              posts: postsCacheData.data.map((post: Post) => post),
              postType: "posts",
            })
          );
        } catch (error) {
          console.error("Error loading cache data:", error);
        }

        // Handle the "init" event
        postsEventSource.addEventListener("init", (e: MessageEvent<string>) => {
          const data = JSON.parse(e.data);
          console.log("Posts init data", data);
          try {
            const posts = data[0][1] as PostsResponse[];
            dispatch(
              setPosts({
                posts: posts.reverse(),
                postType: "posts",
              })
            );
          } catch (error) {
            console.error("Error updating friend requests:", error);
          }
        });

        // Handle the "update" event
        postsEventSource.addEventListener(
          "update",
          (e: MessageEvent<string>) => {
            const data = JSON.parse(e.data);
            console.log("Posts update data", data);
            try {
              const posts = data[0][1] as PostsResponse[];
              console.log(`posts`, posts);
              dispatch(
                setPosts({
                  posts: posts.reverse(),
                  postType: "posts",
                })
              );
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
        if (myPostsEventSource) myPostsEventSource.close();
        console.log("Closing event source for posts");
        return { data: undefined };
      },
    }),
    getMyPosts: builder.query<PostsResponse[], string>({
      query: (params) => `posts/?profile_id=${params}&type=myPosts`,
      async onCacheEntryAdded(
        arg,
        { cacheDataLoaded, cacheEntryRemoved, dispatch }
      ) {
        myPostsEventSource = new EventSource(
          `/api/posts/?profile_id=${arg}&type=myPosts`
        );

        // Handle the initial cache data
        try {
          const myPostsCacheData = await cacheDataLoaded;
          console.log("myPostsCacheData", myPostsCacheData);
          dispatch(
            setPosts({
              posts: myPostsCacheData.data.map((post: Post) => post),
              postType: "myPosts",
            })
          );
        } catch (error) {
          console.error("Error loading cache data:", error);
        }

        // Handle the "init" event
        myPostsEventSource.addEventListener(
          "init",
          (e: MessageEvent<string>) => {
            const data = JSON.parse(e.data);
            console.log("My posts init data", data);
            try {
              console.log("posts data", data);
              const posts = data[0][1] as PostsResponse[];
              dispatch(
                setPosts({ posts: posts.reverse(), postType: "myPosts" })
              );
            } catch (error) {
              console.error("Error updating friend requests:", error);
            }
          }
        );

        // Handle the "update" event
        myPostsEventSource.addEventListener(
          "update",
          (e: MessageEvent<string>) => {
            const data = JSON.parse(e.data);
            console.log("My posts update data", data);
            try {
              const posts = data[0][1] as PostsResponse[];
              dispatch(
                setPosts({ posts: posts.reverse(), postType: "myPosts" })
              );
            } catch (error) {
              console.error("Error updating friend requests:", error);
            }
          }
        );

        // Clean up the EventSource when the cache entry is removed
        await cacheEntryRemoved;
        myPostsEventSource.close();
        myPostsEventSource = null;
      },
    }),
    newPost: builder.mutation<
      void,
      { title: string; content: string; profile_id: string }
    >({
      query: (data) => ({
        url: "posts/",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetPostsQuery,
  useClosePostsEventSourceMutation,
  useGetMyPostsQuery,
  useNewPostMutation,
} = extendedSocialSlice;
