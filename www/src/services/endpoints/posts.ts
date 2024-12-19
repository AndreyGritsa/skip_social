import socialApi, { handleEventSource } from "../social";
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
        handleEventSource(
          `/api/posts/?profile_id=${arg}&type=posts`,
          {
            init: (data: PostsResponse[]) => {
              dispatch(
                setPosts({
                  posts: data.map((post) => post).reverse(),
                  postType: "posts",
                })
              );
            },
            update: (data: PostsResponse[]) => {
              dispatch(
                setPosts({
                  posts: data.map((post) => post).reverse(),
                  postType: "posts",
                })
              );
            },
          },
          cacheDataLoaded,
          cacheEntryRemoved
        );
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
        handleEventSource(
          `/api/posts/?profile_id=${arg}&type=myPosts`,
          {
            init: (data: PostsResponse[]) => {
              dispatch(
                setPosts({
                  posts: data.map((post) => post).reverse(),
                  postType: "myPosts",
                })
              );
            },
            update: (data: PostsResponse[]) => {
              dispatch(
                setPosts({
                  posts: data.map((post) => post).reverse(),
                  postType: "myPosts",
                })
              );
            },
          },
          cacheDataLoaded,
          cacheEntryRemoved
        );
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
        handleEventSource(
          `/api/posts/comments/?post_id=${arg}`,
          {
            init: (data: Comment[]) => {
              updateCachedData((draft) => {
                draft.length = 0;
                data.forEach((comment) => draft.push(comment as any));
              });
            },
            update: (data: Comment[]) => {
              updateCachedData((draft) => {
                draft.length = 0;
                data.forEach((comment) => draft.push(comment as any));
              });
            },
          },
          cacheDataLoaded,
          cacheEntryRemoved
        );
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
