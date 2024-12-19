import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Chip,
  Typography,
  Paper,
} from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import PeopleIcon from "@mui/icons-material/People";
import Grid from "@mui/material/Grid2";
import CustomAvatar from "../shared/CustomAvatar";
import {
  useGetServerMembersQuery,
  useInvalidateServerMembersMutation,
} from "../../services/endpoints/servers";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useAppSelector } from "../../app/hooks";
import { skipToken } from "@reduxjs/toolkit/query";

const MemberRoleColorMap = {
  owner: "secondary",
  admin: "primary",
  newbie: "success",
};

const ServerMembersDialog = ({ serverId }: { serverId: string }) => {
  const [open, setOpen] = useState<boolean>(false);
  const user = useAppSelector((state) => state.user);
  const { data, refetch } = useGetServerMembersQuery(
    user.id
      ? {
          server_id: serverId,
          profile_id: user.id,
        }
      : skipToken
  );
  const [invalidateServerMembers] = useInvalidateServerMembersMutation();

  useEffect(() => {
    return () => {
      invalidateServerMembers();
    };
  }, []);

  useEffect(() => {
    if (user.id) refetch();
  }, [user]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Fragment>
      <IconButton onClick={handleClickOpen}>
        <PeopleIcon />
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
            {data
              ?.filter((member) => member.id === user.id)
              .map((you) => (
                <Grid key={you.id} size={12}>
                  <Paper
                    sx={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: 1,
                    }}
                  >
                    <CustomAvatar src="/" alt={you.name} status={you.status} />
                    <Typography>{you.name}</Typography>
                    <Chip
                      label={you.role}
                      color={
                        MemberRoleColorMap[
                          you.role as keyof typeof MemberRoleColorMap
                        ] as any
                      }
                      size="small"
                      variant="outlined"
                    />
                  </Paper>
                </Grid>
              ))}
            {data
              ?.filter((memeber) => memeber.id !== user.id)
              .map((member) => (
                <Fragment key={member.id}>
                  <Grid
                    size={6}
                    sx={{ display: "flex", alignItems: "center", gap: 2 }}
                  >
                    <CustomAvatar
                      src="/"
                      alt={member.name}
                      status={member.status}
                    />
                    <Typography>{member.name}</Typography>
                    <Chip
                      label={member.role}
                      color={
                        MemberRoleColorMap[
                          member.role as keyof typeof MemberRoleColorMap
                        ] as any
                      }
                      size="small"
                      variant="outlined"
                    />
                    {member.friend === 1 && (
                      <Chip
                        label="Friend"
                        color="info"
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Grid>
                  <Grid
                    size={6}
                    sx={{ justifyContent: "center", display: "flex", gap: 2 }}
                  >
                    {member.id !== user.id && (
                      <IconButton>
                        <MoreVertIcon />
                      </IconButton>
                    )}
                  </Grid>
                </Fragment>
              ))}
          </Grid>
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

export default ServerMembersDialog;
