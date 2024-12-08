import serverReducer, { ServersState } from "./serversSlice";

describe("servers reducer", () => {
  const initialState: ServersState = {
    servers: [],
  };
  it("should return the initial state", () => {
    expect(serverReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });
});
