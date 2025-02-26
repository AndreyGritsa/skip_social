import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  TextField,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  List,
  Box,
  Typography,
  Chip,
  Checkbox,
  FormGroup,
  FormControlLabel,
} from "@mui/material";
import { Fragment, useState } from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  Server,
  ServerChannelAllowedRole,
} from "../../features/servers/serversSlice";
import Grid from "@mui/material/Grid2";
import {
  useNewServerChannelMutation,
  useDeleteServerChannelMutation,
  useUpdateServerChannelMutation,
  useDeleteServerMutation,
} from "../../services/endpoints/servers";
import TagIcon from "@mui/icons-material/Tag";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import { MemberRoleColorMap } from "./ServerMembersDialog";

const ServerMenegmentDialog = ({ server }: { server: Server }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [channelName, setChannelName] = useState<string>("");
  const [editChannel, setEditChannel] = useState<string>("");
  const [editChannelId, setEditChannelId] = useState<string>("");
  const [adminRoleChecked, setAdminRoleChecked] = useState<boolean>(false);
  const [newbieRoleChecked, setNewbieRoleChecked] = useState<boolean>(false);
  const [newServerChannel] = useNewServerChannelMutation();
  const [deleteServerChannel] = useDeleteServerChannelMutation();
  const [updateServerChannel] = useUpdateServerChannelMutation();
  const [deleteServer] = useDeleteServerMutation();
  const navigate = useNavigate();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAddChannel = () => {
    newServerChannel({
      server_id: server.id,
      channel_name: channelName,
    })
      .unwrap()
      .catch((error) => console.error("error", error));
    setChannelName("");
  };

  const handleDeleteChannel = (channelId: string) => {
    deleteServerChannel({ channel_id: channelId })
      .unwrap()
      .catch((error) => console.error("error", error));
  };

  const handleUpdateChannel = () => {
    updateServerChannel({
      channel_id: editChannelId,
      channel_name: editChannel,
      admin_role: adminRoleChecked,
      newbie_role: newbieRoleChecked,
    })
      .unwrap()
      .catch((error) => console.error("error", error));
    setEditChannel("");
    setEditChannelId("");
  };

  const handleStartEditChannel = (
    channelId: string,
    channelName: string,
    allowedRoles: ServerChannelAllowedRole[]
  ) => {
    if (editChannelId === channelId) {
      setEditChannel("");
      setEditChannelId("");
      return;
    }
    setEditChannel(channelName);
    setEditChannelId(channelId);
    setAdminRoleChecked(allowedRoles.some((role) => role.role === "admin"));
    setNewbieRoleChecked(allowedRoles.some((role) => role.role === "newbie"));
  };

  const handleDeleteServer = () => {
    deleteServer({ server_id: server.id })
      .unwrap()
      .catch((error) => console.error("error", error));
    setOpen(false);
    navigate("/");
  };

  return (
    <Fragment>
      <IconButton onClick={handleClickOpen}>
        <SettingsIcon />
      </IconButton>
      <Dialog
        fullWidth
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <Grid container spacing={2}>
            <Grid size={8}>
              <TextField
                value={channelName}
                onChange={(event) => {
                  if (event.target.value.length < 10)
                    setChannelName(event.target.value);
                }}
                label="Add new channel"
                fullWidth
              />
            </Grid>
            <Grid size={4} sx={{ justifyContent: "center", display: "flex" }}>
              <Button
                onClick={handleAddChannel}
                disabled={!channelName}
                fullWidth
              >
                Add
              </Button>
            </Grid>
            <Grid size={8}>
              <Typography sx={{ color: "error.main" }}>
                Delete server
              </Typography>
            </Grid>
            <Grid size={4} sx={{ justifyContent: "center", display: "flex" }}>
              <Button onClick={handleDeleteServer} color="error">
                Delete
              </Button>
            </Grid>
          </Grid>
          {server?.channels.length > 0 && (
            <Fragment>
              <Divider sx={{ pt: 2, mb: 1 }} />{" "}
              <List>
                {server?.channels.map((channel) => {
                  return (
                    <ListItem
                      disablePadding
                      key={channel.id}
                      secondaryAction={
                        <Box sx={{ display: "flex", gap: 3 }}>
                          <IconButton
                            edge="end"
                            aria-label="edit"
                            onClick={() =>
                              handleStartEditChannel(
                                channel.id,
                                channel.name,
                                channel.allowed_roles
                              )
                            }
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleDeleteChannel(channel.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemIcon>
                        <TagIcon />
                      </ListItemIcon>
                      {editChannelId === channel.id ? (
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            flexDirection: "column",
                          }}
                        >
                          <TextField
                            value={editChannel}
                            onChange={(event) => {
                              if (event.target.value.length < 10)
                                setEditChannel(event.target.value);
                            }}
                          />
                          <FormGroup row>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={adminRoleChecked}
                                  onClick={() =>
                                    setAdminRoleChecked(!adminRoleChecked)
                                  }
                                />
                              }
                              label="Admin"
                            />
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={newbieRoleChecked}
                                  onClick={() =>
                                    setNewbieRoleChecked(!newbieRoleChecked)
                                  }
                                />
                              }
                              label="Newbie"
                            />
                          </FormGroup>
                          <Button
                            variant="outlined"
                            onClick={handleUpdateChannel}
                          >
                            Save Changes
                          </Button>
                        </Box>
                      ) : (
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: "flex",
                                gap: 1,
                                alignItems: "center",
                              }}
                            >
                              {channel.name}
                              {channel.allowed_roles.map((role) => {
                                if (role.role === "owner") return null;
                                return (
                                  <Chip
                                    key={role.id}
                                    label={role.role}
                                    color={
                                      MemberRoleColorMap[
                                        role.role as keyof typeof MemberRoleColorMap
                                      ] as any
                                    }
                                    variant="outlined"
                                    size="small"
                                  />
                                );
                              })}
                            </Box>
                          }
                        />
                      )}
                    </ListItem>
                  );
                })}
              </List>
            </Fragment>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};

export default ServerMenegmentDialog;
