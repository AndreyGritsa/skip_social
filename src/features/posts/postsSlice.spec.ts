import postsReducer, { PostsState } from "./postsSlice";
import { fakePostsData } from "./postsSlice";

describe("channels reducer", () => {
  const initialState: PostsState = {
    posts: fakePostsData,
  };
  it("should return the initial state", () => {
    expect(postsReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });
});
