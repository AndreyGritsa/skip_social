import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
} from "@mui/material";
import { Channel } from "../../features/channels/channelsSlice";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { setActiveChannel } from "../../features/active_channel/activeChannelSlice";
import CustomAvatar from "./CustomAvatar";

const SingleChannel = ({ ...props }: Channel) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const activeChannel = useAppSelector((state) => state.activeChannel.id);

  const handleNavigation = (id: string) => {
    dispatch(setActiveChannel(id));
    navigate(`/channel/${id}`);
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
            status={props.status as "online" | "away"} // TODO: change type of status in Channel interface
          />
        </ListItemAvatar>
        <ListItemText primary={props.name} />
      </ListItemButton>
    </ListItem>
  );
};

export default SingleChannel;
