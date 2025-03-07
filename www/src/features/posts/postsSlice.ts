import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Comment {
  id: string;
  content: string;
  author_id: string;
  author: string;
  replies_count: number;
}
export interface Post {
  id: string;
  title: string;
  content: string;
  author?: string;
  created_at: string;
  comments_amount: number;
  last_comment?: Comment;
}

export interface CommentWithPostId extends Comment {
  postId: string;
  postType: "posts" | "myPosts";
}

export interface PostsState {
  posts: Post[];
  myPosts: Post[];
}

const initialState: PostsState = {
  posts: [],
  myPosts: [],
};

export const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    addComment: (state, action: PayloadAction<CommentWithPostId>) => {
      // const { postId, postType, ...comment } = action.payload;
      // const post = state[postType].find((post) => post.id === postId);
      // if (post) {
      //   if (!post.comments) {
      //     post.comments = [];
      //   }
      //   post.comments.push(comment);
      // }
    },
    setPosts: (
      state,
      action: PayloadAction<{ posts: Post[]; postType: "posts" | "myPosts" }>
    ) => {
      if (
        action.payload.posts.length > 0 &&
        action.payload.posts[0] !== undefined
      ) {
        state[action.payload.postType] = action.payload.posts;
      } else if (action.payload.posts.length === 0) {
        state[action.payload.postType] = [];
      }
    },
  },
});

export const { addComment, setPosts } = postsSlice.actions;

export default postsSlice.reducer;
