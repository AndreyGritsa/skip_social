import socialApi from "../social";
import { Post } from "../../features/posts/postsSlice";
import { setPosts } from "../../features/posts/postsSlice";

interface PostsResponse extends Post {}

export const extendedSocialSlice = socialApi.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query<PostsResponse[], string>({
      providesTags: ["Posts"],
      query: (params) => `posts/?profile_id=${params}&type=posts`,
      async onCacheEntryAdded(
        arg,
        { cacheDataLoaded, cacheEntryRemoved, dispatch }
      ) {
        const postsEventSource = new EventSource(
          `/api/posts/?profile_id=${arg}&type=posts`
        );

        // Handle the initial cache data
        try {
          const postsCacheData = await cacheDataLoaded;
          console.log("postsCacheData", postsCacheData);
          dispatch(
            setPosts({
              posts: postsCacheData.data.map((post: Post) => post).reverse(),
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
        console.log("Closing event source for posts");
        postsEventSource.close();
      },
    }),
    invalidatePosts: builder.mutation<void, void>({
      invalidatesTags: ["Posts"],
      queryFn: () => {
        return { data: undefined };
      },
    }),
    getMyPosts: builder.query<PostsResponse[], string>({
      providesTags: ["Posts"],
      query: (params) => `posts/?profile_id=${params}&type=myPosts`,
      async onCacheEntryAdded(
        arg,
        { cacheDataLoaded, cacheEntryRemoved, dispatch }
      ) {
        const myPostsEventSource = new EventSource(
          `/api/posts/?profile_id=${arg}&type=myPosts`
        );

        // Handle the initial cache data
        try {
          const myPostsCacheData = await cacheDataLoaded;
          console.log("myPostsCacheData", myPostsCacheData);
          dispatch(
            setPosts({
              posts: myPostsCacheData.data.map((post: Post) => post).reverse(),
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
        console.log("Closing event source for my posts");
        myPostsEventSource.close();
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
    deletePost: builder.mutation<void, string>({
      query: (postId) => ({
        url: `posts/${postId}/`,
        method: "DELETE",
      }),
    }),
    updatePost: builder.mutation<void, Post>({
      query: (data) => ({
        url: `posts/${data.id}/`,
        method: "PUT",
        body: data,
      }),
    }),
    newComment: builder.mutation<
      void,
      { content: string; author: string; post: string }
    >({
      query: (data) => ({
        url: "posts/comments/",
        method: "POST",
        body: data,
      }),
    }),
    getComments: builder.query<Comment[], string>({
      query: (postId) => `posts/comments/?post_id=${postId}`,
      providesTags: ["Comments"],
      async onCacheEntryAdded(
        arg,
        { cacheDataLoaded, cacheEntryRemoved, updateCachedData }
      ) {
        const commentsEventSource = new EventSource(
          `/api/posts/comments/?post_id=${arg}`
        );

        // Handle the initial cache data
        try {
          await cacheDataLoaded;
        } catch (error) {
          console.error("Error loading cache data for comments:", error);
        }

        // Handle the "init" event
        commentsEventSource.addEventListener(
          "init",
          (e: MessageEvent<string>) => {
            const data = JSON.parse(e.data);
            console.log("Comments init data", data);
            try {
              const comments = data[0][1] as Comment[];

              updateCachedData((draft) => {
                draft.length = 0;
                comments.forEach((comment) => draft.push(comment as any));
              });
            } catch (error) {
              console.error("Error updating comments:", error);
            }
          }
        );

        // Handle the "update" event
        commentsEventSource.addEventListener(
          "update",
          (e: MessageEvent<string>) => {
            const data = JSON.parse(e.data);
            console.log("Comments update data", data);
            try {
              const comments = data[0][1] as Comment[];
              updateCachedData((draft) => {
                draft.length = 0;
                comments.forEach((comment) => draft.push(comment as any));
              });
            } catch (error) {
              console.error("Error updating comments:", error);
            }
          }
        );

        // Clean up the EventSource when the cache entry is removed
        await cacheEntryRemoved;
        console.log("Closing event source for comments");
        commentsEventSource.close();
      },
    }),
    invalidateComments: builder.mutation<void, void>({
      invalidatesTags: ["Comments"],
      queryFn: () => {
        return { data: undefined };
      },
    }),
  }),
});

export const {
  useGetPostsQuery,
  useInvalidatePostsMutation,
  useGetMyPostsQuery,
  useNewPostMutation,
  useDeletePostMutation,
  useUpdatePostMutation,
  useNewCommentMutation,
  useGetCommentsQuery,
  useInvalidateCommentsMutation,
} = extendedSocialSlice;
