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
  InputAdornment,
  Typography,
} from "@mui/material";
import { Fragment, useState } from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import { Server } from "../../features/servers/serversSlice";
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
import CheckIcon from "@mui/icons-material/Check";
import { useNavigate } from "react-router-dom";

const ServerMenegmentDialog = ({ server }: { server: Server }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [channelName, setChannelName] = useState<string>("");
  const [editChannel, setEditChannel] = useState<string>("");
  const [editChannelId, setEditChannelId] = useState<string>("");
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
    })
      .unwrap()
      .catch((error) => console.error("error", error));
    setEditChannel("");
    setEditChannelId("");
  };

  const handleStartEditChannel = (channelId: string, channelName: string) => {
    setEditChannel(channelName);
    setEditChannelId(channelId);
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
                              handleStartEditChannel(channel.id, channel.name)
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
                        <TextField
                          value={editChannel}
                          onChange={(event) => {
                            if (event.target.value.length < 10)
                              setEditChannel(event.target.value);
                          }}
                          slotProps={{
                            input: {
                              endAdornment: (
                                <InputAdornment position="start">
                                  <IconButton onClick={handleUpdateChannel}>
                                    <CheckIcon color="success" />
                                  </IconButton>
                                </InputAdornment>
                              ),
                            },
                          }}
                        />
                      ) : (
                        <ListItemText primary={channel.name} />
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
