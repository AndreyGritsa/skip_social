import {
  Card,
  CardContent,
  Typography,
  CardActionArea,
  DialogTitle,
  DialogContent,
  DialogActions,
  Dialog,
  Button,
  List,
  ListItem,
  ListItemButton,
} from "@mui/material";
import type { Game } from "../../services/endpoints/games";
import { Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useGetFriendsQuery } from "../../services/endpoints/users";
import {
  useGetInvitesQuery,
  usePostInviteMutation,
} from "../../services/endpoints/games";
import { useAppSelector } from "../../app/hooks";
import { useNavigate } from "react-router-dom";

const GameCard = (props: Game) => {
  const [open, setOpen] = useState<boolean>(false);
  const friends = useAppSelector((state) => state.friends.friends);
  const user = useAppSelector((state) => state.user);
  const [postInvite] = usePostInviteMutation();
  useGetInvitesQuery(user.id);
  const navigate = useNavigate();
  useGetFriendsQuery(user.id);

  const togleOpen = () => setOpen(!open);

  const handleInvite = (id: string) => {
    console.log(`Inviting ${id} to play ${props.name}`);
    const room_id = Math.random().toString(36).substring(7);
    postInvite({ from_id: user.id, to_id: id, room_id: room_id })
      .unwrap()
      .then(() => navigate(`/games/${room_id}`))
      .catch((e) => console.error(e));
  };

  return (
    <Fragment>
      <Card>
        <CardActionArea onClick={togleOpen}>
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {props.name}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
      <Dialog open={open}>
        <DialogTitle>{`Invite a friend to play ${props.name} together`}</DialogTitle>
        <DialogContent>
          <List>
            {friends.map((friend) => (
              <ListItemButton
                key={friend.id}
                onClick={() => handleInvite(friend.id)}
              >
                <ListItem>{friend.name}</ListItem>
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={togleOpen}>Close</Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};

export default GameCard;
