import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useEffect } from "react";
import {
  setActiveServer,
  setActiveRoom,
} from "../../features/active/activeSlice";
import MessagesContainer from "../shared/MessagesContainer";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  useGetServerMessagesQuery,
  useInvalidateServerMessagesMutation,
  usePostServerMessageMutation,
} from "../../services/endpoints/servers";

const RoomContainer = () => {
  const { channelId, serverId } = useParams<{
    channelId: string;
    serverId: string;
  }>();
  const dispatch = useAppDispatch();
  const activeServer = useAppSelector((state) => state.active.server);
  const activeRoom = useAppSelector((state) => state.active.channel);
  const server = useAppSelector((state) =>
    state.servers.servers.find((server) => server.id === serverId)
  );
  const channel = server?.channels.find((channel) => channel.id === channelId);
  const { refetch } = useGetServerMessagesQuery(
    channel ? { channel_id: channelId!, server_id: serverId! } : skipToken
  );
  const user = useAppSelector((state) => state.user);
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

  useEffect(() => {
    // On page reload make sure the active server and room are set
    if (!serverId || !channelId) return;
    if (activeServer !== serverId) {
      dispatch(setActiveServer(serverId));
    }
    if (activeRoom !== channelId) {
      dispatch(setActiveRoom({ serverChannel: channelId, serverId: serverId }));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

export default RoomContainer;
