import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  IconButton,
} from "@mui/material";
import { Channel } from "../../features/channels/channelsSlice";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { setActiveChannel } from "../../features/active/activeSlice";
import CustomAvatar from "../shared/CustomAvatar";
import { Friend } from "../../features/friends/friendsSlice";
import { addNewChannel } from "../../features/channels/channelsSlice";
import { store } from "../../app/store";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDeleteFriendMutation } from "../../services/endpoints/users";

const isFriend = (props: Channel | Friend): props is Friend => {
  return (props as Channel).messages === undefined;
};

const SingleChannel = ({ ...props }: Channel | Friend) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const activeChannel = useAppSelector((state) => state.active.channel);
  const user = useAppSelector((state) => state.user);
  const [deleteFriend] = useDeleteFriendMutation();

  const handleNavigation = (id: string) => {
    // Check if the channel exists in the store
    // If not, add it to the store
    const state = store.getState();
    const channel = state.channels.channels.find(
      (channel) => channel.id === id
    );
    if (!channel) {
      dispatch(
        addNewChannel({
          id,
          name: props.name,
          status: props.status,
          messages: [],
        })
      );
    }

    dispatch(setActiveChannel(id));
    navigate(`/channel/${id}`);
  };

  const handleDeleteFriend = () => {
    deleteFriend({ profile_id: user.id, friend_id: props.id });
  };

  return (
    <ListItem>
      <ListItemButton
        onClick={() => handleNavigation(props.id)}
        selected={activeChannel === props.id}
      >
        <ListItemAvatar>
          <CustomAvatar
            alt={props.name}
            src={undefined}
            status={props.status}
          />
        </ListItemAvatar>
        <ListItemText primary={props.name} />
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
