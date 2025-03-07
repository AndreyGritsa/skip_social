import { useParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { addMessage } from "../../features/channels/channelsSlice";
import { useEffect, useState } from "react";
import { setActiveChannel } from "../../features/active/activeSlice";
import { reorderChannels } from "../../features/channels/channelsSlice";
import {
  useGetMessagesQuery,
  useInvalidateMessagesMutation,
  usePostMessageMutation,
  useGetChannelCommandQuery,
  useInvalidateChannelCommandMutation,
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
  const { data: chatCommandResponse, refetch: refetchChannelCommand } =
    useGetChannelCommandQuery(channel ? channelId! : skipToken);
  const [invalidateChannelCommand] = useInvalidateChannelCommandMutation();
  const [chatCommand, setChatCommand] = useState<string>("");

  useEffect(() => {
    // on page reload, makes sure channel is present
    // before fetching messages
    if (channel) {
      refetch();
      refetchChannelCommand();
    }
  }, [refetch, channel, refetchChannelCommand]);

  useEffect(() => {
    // close the event source when the component is unmounted
    return () => {
      invalidateMessages();
      invalidateChannelCommand();
    };
  }, [invalidateMessages, invalidateChannelCommand]);

  useEffect(() => {
    // make sure the active channel is set when page is reloaded
    if (channelId) {
      dispatch(setActiveChannel(channelId));
    }
  }, [channelId, dispatch]);

  useEffect(() => {
    if (chatCommandResponse) {
      setChatCommand(chatCommandResponse[0]);
    }
  }, [chatCommandResponse]);

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
      chatCommand={chatCommand}
    />
  ) : null;
};

export default ChannelContainer;
