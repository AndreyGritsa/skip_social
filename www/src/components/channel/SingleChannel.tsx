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
import { useNewChannelMutation } from "../../services/endpoints/channels";

const isFriend = (props: Channel | Friend): props is Friend => {
  return (props as Friend).status !== undefined;
};

const SingleChannel = ({ ...props }: Channel | Friend) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const activeChannel = useAppSelector((state) => state.active.channel);
  const user = useAppSelector((state) => state.user);
  const [deleteFriend] = useDeleteFriendMutation();
  const [newChannel] = useNewChannelMutation();

  const name = isFriend(props)
    ? props.name
    : props.participants.filter((participant) => participant.id !== user.id)[0]
        .name;

  const status = isFriend(props)
    ? props.status
    : props.participants.filter((participant) => participant.id !== user.id)[0]
        .status;

  const handleNavigation = () => {
    // Check if the channel exists in the store
    // If not, add it to the store
    const state = store.getState();
    const channel = state.channels.channels.find(
      (channel) =>
        channel.participants.filter((participant) => participant.name === name)
          .length > 0
    );
    if (!channel) {
      newChannel({
        profile_id: user.id,
        participant_id: props.id,
      })
        .unwrap()
        .then((data) => {
          console.log(`New channel created, id: ${data.id}`);
          dispatch(setActiveChannel(data.id));
          navigate(`/channel/${data.id}`);
        })
        .catch((error) => console.error(error));
      // dispatch(
      //   addNewChannel({
      //     id,
      //     name: props.name,
      //     status: props.status,
      //     messages: [],
      //   })
      // );
      return;
    } else {
      dispatch(setActiveChannel(channel.id));
      navigate(`/channel/${channel.id}`);
    }
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
