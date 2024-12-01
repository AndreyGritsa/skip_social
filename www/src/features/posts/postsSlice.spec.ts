import postsReducer, { PostsState } from "./postsSlice";

describe("posts reducer", () => {
  const initialState: PostsState = {
    posts: [],
    myPosts: [],
  };
  it("should return the initial state", () => {
    expect(postsReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });
});
