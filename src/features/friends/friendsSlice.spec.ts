import friendsReducer, { FriendsState } from "./friendsSlice";
import { fakeFriendsData } from "./friendsSlice";

describe("friends reducer", () => {
  const initialState: FriendsState = {
    friends: fakeFriendsData,
  };
  it("should return the initial state", () => {
    expect(friendsReducer(undefined, { type: "unknown" })).toEqual(
      initialState
    );
  });
});
