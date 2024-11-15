import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  Badge,
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";

const ServersContainer = () => {
  return (
    <List sx={{ overflowY: "auto", height: "98dvh" }}>
      {Array.from({ length: 12 }).map((_, index) => (
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
    </List>
  );
};

export default ServersContainer;
