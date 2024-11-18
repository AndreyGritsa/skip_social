import friendsReducer, {
  FriendsState,
  setFriends,
  Friend,
} from "./friendsSlice";

describe("friends reducer", () => {
  const initialState: FriendsState = {
    friends: [],
  };
  it("should return the initial state", () => {
    expect(friendsReducer(undefined, { type: "unknown" })).toEqual(
      initialState
    );
  });
  it("should handle setFriends", () => {
    const newFriends: Friend[] = [
      { id: "1", name: "Alice", status: "online" },
      { id: "2", name: "Bob", status: "away" },
    ];
    const expectedState: FriendsState = {
      friends: newFriends,
    };
    expect(friendsReducer(initialState, setFriends(newFriends))).toEqual(
      expectedState
    );
  });
});
