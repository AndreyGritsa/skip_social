import userReducer, { UserState } from "./userSlice";

describe("user reducer", () => {
  const initialState: UserState = {
    id: "1",
    name: "Admin",
    status: "online",
  };
  it("should return the initial state", () => {
    expect(userReducer(undefined, { type: "unknown" })).toEqual({
      id: "1",
      name: "Admin",
      status: "online",
    });
  });
});
