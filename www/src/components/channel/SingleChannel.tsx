import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  IconButton,
} from "@mui/material";
import { Channel } from "../../features/channels/channelsSlice";
import { useAppSelector } from "../../app/hooks";
import CustomAvatar from "../shared/CustomAvatar";
import { Friend } from "../../features/friends/friendsSlice";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDeleteFriendMutation } from "../../services/endpoints/users";
import useChannelNavigate from "../../hooks/useChannelNavigate";

const isFriend = (props: Channel | Friend): props is Friend => {
  return (props as Friend).status !== undefined;
};

const SingleChannel = ({ ...props }: Channel | Friend) => {
  const activeChannel = useAppSelector((state) => state.active.channel);
  const user = useAppSelector((state) => state.user);
  const [deleteFriend] = useDeleteFriendMutation();
  const channelNavigation = useChannelNavigate();

  const name = isFriend(props)
    ? props.name
    : props.participants.filter((participant) => participant.id !== user.id)[0]
        .name;

  const status = isFriend(props)
    ? props.status
    : props.participants.filter((participant) => participant.id !== user.id)[0]
        .status;

  const handleNavigation = () => {
    channelNavigation({
      participantName: name,
      participantId: props.id,
    });
  };

  const handleDeleteFriend = () => {
    deleteFriend({ profile_id: user.id, friend_id: props.id });
  };

  return (
    <ListItem>
      <ListItemButton
        onClick={() => handleNavigation()}
        selected={activeChannel === props.id}
      >
        <ListItemAvatar>
          <CustomAvatar alt={name} src={undefined} status={status} />
        </ListItemAvatar>
        <ListItemText primary={name} />
      </ListItemButton>

      {isFriend(props) && (
        <IconButton onClick={handleDeleteFriend}>
          <DeleteIcon />
        </IconButton>
      )}
    </ListItem>
  );
};

export default SingleChannel;
