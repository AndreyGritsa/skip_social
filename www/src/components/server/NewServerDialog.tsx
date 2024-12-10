import {
  ListItem,
  DialogTitle,
  DialogContent,
  DialogActions,
  Dialog,
  Button,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  TextField,
  Tooltip,
} from "@mui/material";
import { green } from "@mui/material/colors";
import AddIcon from "@mui/icons-material/Add";
import Grid from "@mui/material/Grid2";
import { useState, Fragment } from "react";
import {
  usePostServerMutation,
  useNewMemberMutation,
} from "../../services/endpoints/servers";
import { useAppSelector } from "../../app/hooks";

const NewServerDialog = () => {
  const user = useAppSelector((state) => state.user);
  const [open, setOpen] = useState<boolean>(false);
  const [newServer, setNewServer] = useState<string>("");
  const [joinServer, setJoinServer] = useState<string>("");
  const [postServerMutation] = usePostServerMutation();
  const [newMember] = useNewMemberMutation();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCreate = () => {
    postServerMutation({ profile_id: user.id, server_name: newServer })
      .unwrap()
      .catch((err) => console.error(err));
    setNewServer("");
    handleClose();
  };

  const handleJoin = () => {
    newMember({ profile_id: user.id, server_name: joinServer })
      .unwrap()
      .catch((err) => console.error(err));
    setJoinServer("");
    handleClose();
  };

  return (
    <Fragment>
      <ListItem sx={{ display: "inline" }}>
        <ListItemButton onClick={handleClickOpen}>
          <ListItemAvatar
            sx={{
              justifyContent: "center",
              display: "flex",
            }}
          >
            <Tooltip title="Create or join a server" placement="right">
              <Avatar sx={{ bgcolor: green[500] }}>
                <AddIcon />
              </Avatar>
            </Tooltip>
          </ListItemAvatar>
        </ListItemButton>
      </ListItem>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Create or join a server"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1, alignItems: "center" }}>
            <Grid size={{ sm: 8 }}>
              <TextField
                value={newServer}
                onChange={(e) => setNewServer(e.target.value)}
                fullWidth
                label="Create new server"
              />
            </Grid>
            <Grid size={{ sm: 4 }}>
              <Button disabled={!newServer} onClick={handleCreate}>
                Create
              </Button>
            </Grid>
            <Grid size={{ sm: 8 }}>
              <TextField
                value={joinServer}
                onChange={(e) => setJoinServer(e.target.value)}
                fullWidth
                label="Join a server"
              />
            </Grid>
            <Grid size={{ sm: 4 }}>
              <Button disabled={!joinServer} onClick={handleJoin}>
                Join
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};

export default NewServerDialog;
