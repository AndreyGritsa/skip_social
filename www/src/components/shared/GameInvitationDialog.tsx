import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useGetInvitesQuery } from "../../services/endpoints/games";
import { useAppSelector } from "../../app/hooks";
import { useNavigate } from "react-router-dom";

const GameInvitationDialog = () => {
  const [open, setOpen] = useState<boolean>(false);
  const user = useAppSelector((state) => state.user);
  const { data } = useGetInvitesQuery(user.id);
  const navigate = useNavigate();

  useEffect(() => {
    if (data) {
      setOpen(data.length > 0);
    }
  }, [data]);

  const handleAcceptGame = () => {
    console.log(data);

    if (!data) return;
    navigate(`/games/${data[0].room_id}`);
    setOpen(false);
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
        <Button color="primary" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button color="success" onClick={handleAcceptGame}>
          Join Game
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GameInvitationDialog;
