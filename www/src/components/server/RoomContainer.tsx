import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useEffect } from "react";
import {
  setActiveServer,
  setActiveRoom,
} from "../../features/active/activeSlice";

const RoomContainer = () => {
  const dispatch = useAppDispatch();
  const activeServer = useAppSelector((state) => state.active.server);
  const activeRoom = useAppSelector((state) => state.active.channel);
  const { channelId, serverId } = useParams<{
    channelId: string;
    serverId: string;
  }>();

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

  return <div>Room Container: {channelId}</div>;
};

export default RoomContainer;
