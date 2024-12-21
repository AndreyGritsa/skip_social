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
import { useAppSelector } from "../../app/hooks";
import { skipToken } from "@reduxjs/toolkit/query";
import MemberOptionsPopper from "./MemberOptionsPopper";
import { ServerMember } from "../../features/servers/serversSlice";

const MemberRoleColorMap = {
  owner: "secondary",
  admin: "warning",
  newbie: "success",
};

const ServerMembersDialog = ({ serverId }: { serverId: string }) => {
  const [open, setOpen] = useState<boolean>(false);
  const user = useAppSelector((state) => state.user);
  const [userMember, setUserMember] = useState<ServerMember>();
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
    if (data) {
      setUserMember(data.find((member) => member.id === user.id));
    }
  }, [data]);

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
            {userMember && (
              <Grid key={userMember.id} size={12}>
                <Paper
                  sx={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 1,
                  }}
                >
                  <CustomAvatar
                    src="/"
                    alt={userMember.name}
                    status={userMember.status}
                  />
                  <Typography>{userMember.name}</Typography>
                  <Chip
                    label={userMember.role}
                    color={
                      MemberRoleColorMap[
                        userMember.role as keyof typeof MemberRoleColorMap
                      ] as any
                    }
                    size="small"
                    variant="outlined"
                  />
                </Paper>
              </Grid>
            )}
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
                    {userMember && (
                      <MemberOptionsPopper
                        member={member}
                        userMember={userMember}
                        serverId={serverId}
                      />
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
