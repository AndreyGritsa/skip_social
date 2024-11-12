import activeChannelReducer, {
  ActiveChannelState,
  setActiveChannel,
} from "./activeChannelSlice";

describe("activeChannel reducer", () => {
  const initialState: ActiveChannelState = {
    id: "0",
  };

  it("should handle initial state", () => {
    expect(activeChannelReducer(undefined, { type: "unknown" })).toEqual({
      id: "0",
    });
  });

  it("should handle setActiveChannel", () => {
    const actual = activeChannelReducer(initialState, setActiveChannel("1"));
    expect(actual.id).toEqual("1");
  });
});
