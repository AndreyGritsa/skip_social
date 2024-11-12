import channelsReducer, {
  addMessage,
  ChannelsState,
  reorderChannels,
} from "./channelsSlice";
import fakeData from "./fakeData.json";

describe("channels reducer", () => {
  const initialState: ChannelsState = {
    channels: fakeData,
  };
  it("should return the initial state", () => {
    expect(channelsReducer(undefined, { type: "unknown" })).toEqual(
      initialState
    );
  });
  it("should handle addMessage", () => {
    const actual = channelsReducer(
      initialState,
      addMessage({
        channelId: "1",
        content: "Hello",
        author: "Admin",
      })
    );
    expect(actual.channels[0].messages[0].content).toEqual("Hello");
  });
  it("should handle reorderChannels", () => {
    const actual = channelsReducer(initialState, reorderChannels("1"));
    const channelIndex = actual.channels.findIndex(
      (channel) => channel.id === "1"
    );
    expect(channelIndex).toEqual(0);
  });
});
