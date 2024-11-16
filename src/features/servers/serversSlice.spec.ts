import serverReducer, { ServersState } from "./serversSlice";
import fakeData from "./fakeData";

describe("servers reducer", () => {
  const initialState: ServersState = {
    servers: fakeData,
  };
  it("should return the initial state", () => {
    expect(serverReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });
});
