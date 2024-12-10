import activeChannelReducer, {
  ActiveState,
  setActiveChannel,
  setActiveServer,
  setActiveRoom,
} from "./activeSlice";

describe("activeChannel reducer", () => {
  const initialState: ActiveState = {
    channel: "0",
    serverChannel: "0",
    server: "0",
    lastRooms: [],
  };

  it("should handle initial state", () => {
    expect(activeChannelReducer(undefined, { type: "unknown" })).toEqual({
      id: "0",
    });
  });

  it("should handle setActiveChannel", () => {
    const actual = activeChannelReducer(initialState, setActiveChannel("1"));
    expect(actual.channel).toEqual("1");
  });
  it("should handle setActiveServer", () => {
    const actual = activeChannelReducer(initialState, setActiveServer("1"));
    expect(actual.server).toEqual("1");
  });
  it("should handle setActiveRoom", () => {
    const actual = activeChannelReducer(
      initialState,
      setActiveRoom({ serverChannel: "1", serverId: "1" })
    );
    expect(actual.channel).toEqual("1");
  });
});
