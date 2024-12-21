import {
  IconButton,
  Box,
  Popper,
  Fade,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from "@mui/material";
import { MouseEvent, useEffect, useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { ServerMember } from "../../features/servers/serversSlice";
import { SelectChangeEvent } from "@mui/material/Select";
import { useUpdateMemberRoleMutation } from "../../services/endpoints/servers";
import useChannelNavigate from "../../hooks/useChannelNavigate";

const MemberOptionsPopper = ({
  member,
  userMember,
  serverId,
}: {
  member: ServerMember;
  userMember: ServerMember;
  serverId: string;
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [role, setRole] = useState<string>(member.role);
  const [settingRole, setSettingRole] = useState<boolean>(false);
  const [updateMemberRole] = useUpdateMemberRoleMutation();
  const channelNavigation = useChannelNavigate();

  useEffect(() => {
    setRole(member.role);
  }, [member]);

  const handleSettingClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(!open);
  };

  const handleChange = (event: SelectChangeEvent) => {
    setRole(event.target.value as string);
  };

  const handleChangeRole = () => {
    if (role !== member.role) {
      updateMemberRole({
        role: role,
        server_id: serverId,
        profile_id: member.id,
      })
        .unwrap()
        .catch((error) => console.error(error));
    }
    setSettingRole(false);
  };

  const handleNavigation = () => {
    channelNavigation({
      participantName: member.name,
      participantId: member.id,
    });
  };

  return (
    <Box sx={{ ml: "auto", display: "flex", direction: "column" }}>
      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="top"
        transition
        sx={{ zIndex: 3700 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper
              sx={
                !settingRole
                  ? { minWidth: "200px" }
                  : { p: 1, minWidth: "400px" }
              }
            >
              {!settingRole ? (
                <List>
                  {member.friend === 0 && (
                    <ListItem disablePadding>
                      <ListItemButton>
                        <ListItemText primary="Send friend request" />
                      </ListItemButton>
                    </ListItem>
                  )}
                  {(userMember.role === "owner" ||
                    userMember.role === "admin") && (
                    <ListItem disablePadding>
                      <ListItemButton onClick={() => setSettingRole(true)}>
                        <ListItemText primary="Change role" />
                      </ListItemButton>
                    </ListItem>
                  )}
                  <ListItem disablePadding>
                    <ListItemButton onClick={handleNavigation}>
                      <ListItemText primary="Write a message" />
                    </ListItemButton>
                  </ListItem>
                </List>
              ) : (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Role</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={role}
                      label="Role"
                      onChange={handleChange}
                    >
                      <MenuItem value={"admin"}>Admin</MenuItem>
                      <MenuItem value={"newbie"}>Newbie</MenuItem>
                    </Select>
                  </FormControl>
                  <Button onClick={handleChangeRole} fullWidth>
                    Change role
                  </Button>
                </Box>
              )}
            </Paper>
          </Fade>
        )}
      </Popper>
      <IconButton onClick={handleSettingClick}>
        <MoreVertIcon />
      </IconButton>
    </Box>
  );
};

export default MemberOptionsPopper;
