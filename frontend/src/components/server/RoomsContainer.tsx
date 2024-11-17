import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import { Typography } from "@mui/material";
import TagIcon from "@mui/icons-material/Tag";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { setActiveRoom } from "../../features/active/activeSlice";
import { useNavigate } from "react-router-dom";

const RoomsContainer = () => {
  const servers = useAppSelector((state) => state.servers.servers);
  const activeServer = useAppSelector((state) => state.active.server);
  const activeRoom = useAppSelector((state) => state.active.room);
  const server = servers.find((server) => server.id === activeServer);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleChangeRoom = (roomId: string) => {
    dispatch(setActiveRoom({ roomId: roomId, serverId: activeServer }));
    navigate(`/server/${activeServer}/${roomId}`);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}>
      <Typography variant="h6" sx={{ m: 2 }}>
        {server?.name}
      </Typography>
      <Divider />
      <List>
        {server?.rooms.map((room) => {
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
