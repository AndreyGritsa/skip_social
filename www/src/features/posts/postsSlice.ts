import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../user/userSlice";
export interface Comment {
  id: string;
  content: string;
  author: User;
}
export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
  comments?: Comment[];
}

export interface CommentWithPostId extends Comment {
  postId: string;
}

export interface PostsState {
  posts: Post[];
}

// fake initial state, should be empty
const initialState: PostsState = {
  posts: [],
};

export const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    addComment: (state, action: PayloadAction<CommentWithPostId>) => {
      const { postId, ...comment } = action.payload;
      const post = state.posts.find((post) => post.id === postId);
      if (post) {
        if (!post.comments) {
          post.comments = [];
        }
        post.comments.push(comment);
      }
    },
    setPosts: (state, action: PayloadAction<Post[]>) => {
      if (action.payload[0] !== undefined) {
        state.posts = action.payload;
      }
    },
  },
});

export const { addComment, setPosts } = postsSlice.actions;

export default postsSlice.reducer;
