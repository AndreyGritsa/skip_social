import { useParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { addMessage } from "../../features/channels/channelsSlice";
import { useEffect } from "react";
import { setActiveChannel } from "../../features/active/activeSlice";
import { reorderChannels } from "../../features/channels/channelsSlice";
import {
  useGetMessagesQuery,
  useInvalidateMessagesMutation,
  usePostMessageMutation,
} from "../../services/endpoints/channels";
import { skipToken } from "@reduxjs/toolkit/query";
import MessagesContainer from "../shared/MessagesContainer";

const ChannelContainer = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const channel = useAppSelector((state) =>
    state.channels.channels.find((channel) => channel.id === channelId)
  );
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const { refetch } = useGetMessagesQuery(channel ? channelId! : skipToken);
  const [invalidateMessages] = useInvalidateMessagesMutation();
  const [postMessage] = usePostMessageMutation();

  useEffect(() => {
    // on page reload, makes sure channel is present
    // before fetching messages
    if (channel) refetch();
  }, [refetch, channel]);

  useEffect(() => {
    // close the event source when the component is unmounted
    return () => {
      invalidateMessages();
    };
  }, [invalidateMessages]);

  useEffect(() => {
    // make sure the active channel is set when page is reloaded
    if (channelId) {
      dispatch(setActiveChannel(channelId));
    }
  }, [channelId, dispatch]);

  const handleSendMessage = (messageInput: string) => {
    if (channelId) {
      dispatch(
        addMessage({ channelId, content: messageInput, author: user.name })
      );
      postMessage({
        channel_id: channelId,
        author_id: user.id,
        content: messageInput,
      })
        .unwrap()
        .catch((error) => console.error("Error posting message:", error));
      dispatch(reorderChannels(channelId));
    }
  };

  return channel && channel.messages ? (
    <MessagesContainer
      messages={channel.messages}
      handleSendMessage={handleSendMessage}
    />
  ) : null;
};

export default ChannelContainer;
