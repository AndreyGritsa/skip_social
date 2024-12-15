import MessagesContainer from "../shared/MessagesContainer";
import { useParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  useGetServerMessagesQuery,
  useInvalidateServerMessagesMutation,
  usePostServerMessageMutation,
} from "../../services/endpoints/servers";
import { useEffect } from "react";

const ServerChannelContainer = () => {
  const { channelId, serverId } = useParams<{
    channelId: string;
    serverId: string;
  }>();
  const server = useAppSelector((state) =>
    state.servers.servers.find((server) => server.id === serverId)
  );
  const channel = server?.channels.find((channel) => channel.id === channelId);
  const { refetch } = useGetServerMessagesQuery(
    channel ? { channel_id: channelId!, server_id: serverId! } : skipToken
  );
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const [invalidateMessages] = useInvalidateServerMessagesMutation();
  const [postMessage] = usePostServerMessageMutation();

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

  const handleMessages = (messageInput: string) => {
    if (channelId) {
      // dispatch(
      //   addMessage({ channelId, content: messageInput, author: user.name })
      // );
      postMessage({
        channel_id: channelId,
        author_id: user.id,
        content: messageInput,
      })
        .unwrap()
        .catch((error) => console.error("Error posting message:", error));
    }
  };

  return channel && channel.messages ? (
    <MessagesContainer
      messages={channel.messages}
      handleSendMessage={handleMessages}
    />
  ) : null;
};

export default ServerChannelContainer;
