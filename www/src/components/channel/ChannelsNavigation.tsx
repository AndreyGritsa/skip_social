import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import PeopleIcon from "@mui/icons-material/People";
import HomeIcon from "@mui/icons-material/Home";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks";
import { setActiveChannel } from "../../features/active/activeSlice";

const ChannelsNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentPath = location.pathname;

  const handleNavigation = (path: string) => {
    // make sure no channel is active when navigating
    dispatch(setActiveChannel("0"));
    navigate(path);
  };

  return (
    <Box sx={{ width: "100%", bgcolor: "background.paper" }}>
      <nav aria-label="main navigation">
        <List>
          <ListItem disablePadding>
            <ListItemButton
              selected={currentPath === "/"}
              onClick={() => handleNavigation("/")}
            >
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              selected={currentPath === "/friends"}
              onClick={() => handleNavigation("/friends")}
            >
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Friends" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              selected={currentPath === "/subscriptions"}
              onClick={() => handleNavigation("/subscriptions")}
            >
              <ListItemIcon>
                <SubscriptionsIcon />
              </ListItemIcon>
              <ListItemText primary="Subscriptions" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding><ListItemButton
              selected={currentPath === "/games"}
              onClick={() => handleNavigation("/games")}
            >
              <ListItemIcon>
                <VideogameAssetIcon />
              </ListItemIcon>
              <ListItemText primary="Games" />
            </ListItemButton></ListItem>
        </List>
      </nav>
      <Divider />
    </Box>
  );
};

export default ChannelsNavigation;
