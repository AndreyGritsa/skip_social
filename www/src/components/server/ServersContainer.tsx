import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  Badge,
  Tooltip,
} from "@mui/material";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import { blue } from "@mui/material/colors";
import { setActiveServer } from "../../features/active/activeSlice";
import NewServerDialog from "./NewServerDialog";
import { useGetServersQuery } from "../../services/endpoints/servers";
import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect } from "react";

const ServersContainer = () => {
  const user = useAppSelector((state) => state.user);
  const servers = useAppSelector((state) => state.servers.servers);
  const activeServer = useAppSelector((state) => state.active.server);
  const activeLastRooms = useAppSelector((state) => state.active.lastRooms);
  const activeChannel = useAppSelector((state) => state.active.channel);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { refetch } = useGetServersQuery(
    user.id ? { profile_id: user.id } : skipToken
  );

  useEffect(() => {
    // make sure user is present before fetching servers
    if (user.id) refetch();
  }, [user, refetch]);

  const handleChangeServer = (serverId: string) => {
    const lastRoom = activeLastRooms?.find((room) => room.server === serverId);
    let path = `/server/${serverId}/`;
    // if (lastRoom) {
    //   path += lastRoom.room;
    // } else {
    //   path += servers.find((server) => server.id === serverId)?.rooms[0].id;
    // }
    dispatch(setActiveServer(serverId));
    navigate(path);
  };

  const handleHomeNavigation = () => {
    if (activeServer !== "0") {
      dispatch(setActiveServer("0"));
      if (activeChannel !== "0") {
        navigate(`/channel/${activeChannel}`);
      } else {
        navigate(`/`);
      }
    }
  };

  return (
    <List sx={{ overflowY: "auto", height: "98dvh" }}>
      <ListItem sx={{ display: "inline" }}>
        <ListItemButton onClick={handleHomeNavigation}>
          <ListItemAvatar
            sx={{
              justifyContent: "center",
              display: "flex",
            }}
          >
            <Tooltip title="Home" placement="right">
              <Avatar sx={{ bgcolor: blue[500] }}>
                <HomeIcon />
              </Avatar>
            </Tooltip>
          </ListItemAvatar>
        </ListItemButton>
      </ListItem>
      {servers.map((server) => {
        return (
          <ListItem key={server.id} sx={{ display: "inline" }}>
            <ListItemButton
              onClick={() => handleChangeServer(server.id)}
              selected={server.id === activeServer}
            >
              <ListItemAvatar
                sx={{
                  justifyContent: "center",
                  display: "flex",
                }}
              >
                {/* <Badge
                  badgeContent={18}
                  color="primary"
                  anchorOrigin={{ vertical: "bottom" }}
                > */}
                <Tooltip title={server.name} placement="right">
                  <Avatar src={server.name} alt={server.name} />
                </Tooltip>
                {/* </Badge> */}
              </ListItemAvatar>
            </ListItemButton>
          </ListItem>
        );
      })}
      <NewServerDialog />
    </List>
  );
};

export default ServersContainer;
