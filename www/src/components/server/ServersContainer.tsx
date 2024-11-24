import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  Badge,
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import HomeIcon from "@mui/icons-material/Home";
import { green, blue } from "@mui/material/colors";
import { setActiveServer } from "../../features/active/activeSlice";

const ServersContainer = () => {
  const servers = useAppSelector((state) => state.servers.servers);
  const activeServer = useAppSelector((state) => state.active.server);
  const activeLastRooms = useAppSelector((state) => state.active.lastRooms);
  const activeChannel = useAppSelector((state) => state.active.channel);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleChangeServer = (serverId: string) => {
    const lastRoom = activeLastRooms?.find((room) => room.server === serverId);
    let path = `/server/${serverId}/`;
    if (lastRoom) {
      path += lastRoom.room;
    } else {
      path += servers.find((server) => server.id === serverId)?.rooms[0].id;
    }
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
            <Avatar sx={{ bgcolor: blue[500] }}>
              <HomeIcon />
            </Avatar>
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
                <Badge
                  badgeContent={18}
                  color="primary"
                  anchorOrigin={{ vertical: "bottom" }}
                >
                  <Avatar src={server.name} alt={server.name} />
                </Badge>
              </ListItemAvatar>
            </ListItemButton>
          </ListItem>
        );
      })}
      {Array.from({ length: 8 }).map((_, index) => (
        <ListItem key={index} sx={{ display: "inline" }}>
          <ListItemButton>
            <ListItemAvatar
              sx={{
                justifyContent: "center",
                display: "flex",
              }}
            >
              <Badge
                badgeContent={10}
                color="primary"
                anchorOrigin={{ vertical: "bottom" }}
              >
                <Avatar>
                  <GroupsIcon />
                </Avatar>
              </Badge>
            </ListItemAvatar>
          </ListItemButton>
        </ListItem>
      ))}
      <ListItem sx={{ display: "inline" }}>
        <ListItemButton>
          <ListItemAvatar
            sx={{
              justifyContent: "center",
              display: "flex",
            }}
          >
            <Avatar sx={{ bgcolor: green[500] }}>
              <AddIcon />
            </Avatar>
          </ListItemAvatar>
        </ListItemButton>
      </ListItem>
    </List>
  );
};

export default ServersContainer;
