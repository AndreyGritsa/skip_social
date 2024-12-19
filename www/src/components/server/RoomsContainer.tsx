import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from "@mui/material/";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import {
  setActiveRoom,
  setActiveServer,
} from "../../features/active/activeSlice";
import { useNavigate } from "react-router-dom";
import TagIcon from "@mui/icons-material/Tag";
import ServerMenegmentDialog from "./ServerMenegmentDialog";
import ServerMembersDialog from "./ServerMembersDialog";
import { useEffect, useState } from "react";
import { Server } from "../../features/servers/serversSlice";

const RoomsContainer = () => {
  const servers = useAppSelector((state) => state.servers.servers);
  const activeServer = useAppSelector((state) => state.active.server);
  const activeRoom = useAppSelector((state) => state.active.serverChannel);
  const [server, setServer] = useState<Server | undefined>(undefined);
  const user = useAppSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    setServer(servers.find((server) => server.id === activeServer));
  }, [servers, activeServer]);

  useEffect(() => {
    if (activeServer === "0") {
      // TODO: not the best practice, but for now it will do
      // allows to refresh the page and keep the active server
      const urlPath = window.location.pathname.split("/");
      const serverId = urlPath[2];
      dispatch(setActiveServer(serverId));
    }
  }, [activeServer]);

  const handleChangeRoom = (channelId: string) => {
    dispatch(
      setActiveRoom({ serverChannel: channelId, serverId: activeServer })
    );
    navigate(`/server/${activeServer}/${channelId}`);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
        <Typography variant="h6">{server?.name}</Typography>
        <Box>
          {server?.id && <ServerMembersDialog serverId={server.id} />}
          {server?.owner_id === String(user.id) && ( // TODO: update reactive service, user id shoud be a string
            <ServerMenegmentDialog server={server} />
          )}
        </Box>
      </Box>
      <Divider />
      <List>
        {server?.channels.map((room) => {
          return (
            <ListItem disablePadding key={room.id}>
              <ListItemButton
                selected={room.id === activeRoom}
                onClick={() => handleChangeRoom(room.id)}
              >
                <ListItemIcon>
                  <TagIcon />
                </ListItemIcon>
                <ListItemText primary={room.name} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default RoomsContainer;
