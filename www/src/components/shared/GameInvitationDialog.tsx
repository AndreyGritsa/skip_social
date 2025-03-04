import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  useGetInvitesQuery,
  useUpdateInviteMutation,
} from "../../services/endpoints/games";
import { useAppSelector } from "../../app/hooks";
import { useNavigate } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";

const GameInvitationDialog = () => {
  const [open, setOpen] = useState<boolean>(false);
  const user = useAppSelector((state) => state.user);
  const { data, refetch } = useGetInvitesQuery(user.id ? user.id : skipToken);
  const [updateInvite] = useUpdateInviteMutation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user.id && data) {
      refetch();
    }
  }, [user, data, refetch]);

  useEffect(() => {
    if (data) {
      setOpen(data.length > 0);
    }
  }, [data]);

  const handleAcceptOrDeclineGame = (status: "accepted" | "declined") => {
    if (!data) return;
    const invite = data[0];
    updateInvite({
      from_id: invite.from_id,
      to_id: invite.to_id,
      room_id: invite.room_id,
      id: invite.id!,
      status: status,
    })
      .unwrap()
      .then(() => {
        if (status === "accepted") navigate(`/games/${invite.room_id}`);
        setOpen(false);
      })
      .catch((e) => console.log(e));
  };

  return (
    <Dialog open={open} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Game Invitation</DialogTitle>
      <DialogContent>
        <DialogContentText>
          You have been invited to join a game!
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          color="primary"
          onClick={() => handleAcceptOrDeclineGame("declined")}
        >
          Cancel
        </Button>
        <Button
          color="success"
          onClick={() => handleAcceptOrDeclineGame("accepted")}
        >
          Join Game
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GameInvitationDialog;
