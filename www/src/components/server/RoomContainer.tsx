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
  const activeRoom = useAppSelector((state) => state.active.room);
  const { roomId, serverId } = useParams<{
    roomId: string;
    serverId: string;
  }>();

  useEffect(() => {
    // On page reload make sure the active server and room are set
    if (!serverId || !roomId) return;
    if (activeServer !== serverId) {
      dispatch(setActiveServer(serverId));
    }
    if (activeRoom !== roomId) {
      dispatch(setActiveRoom({ roomId: roomId, serverId: serverId }));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div>Room Container: {roomId}</div>;
};

export default RoomContainer;
