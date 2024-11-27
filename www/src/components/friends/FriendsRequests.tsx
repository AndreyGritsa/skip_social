import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { useGetFriendRequestsQuery } from "../../services/endpoints/users";
import { useAppSelector } from "../../app/hooks";
import { usePostFriendRequestMutation } from "../../services/endpoints/users";

const FriendRequests = () => {
  const user = useAppSelector((state) => state.user);
  // TODO: '3' is used for simplicity, should be replaced with user.id
  const userFakeId = "3";
  const { data: friendRequests, refetch: refetchFriendRequest } =
    useGetFriendRequestsQuery(user.id ? user.id : userFakeId);
  const [triggerPostFriendRequest] = usePostFriendRequestMutation();

  const handleAcceptRequest = (name: string) => {
    console.log("Accepting friend request from:", name);
    const fromProfileId =
      user.id && user.id.trim() !== "" ? user.id : userFakeId;
    triggerPostFriendRequest({
      from_profile: fromProfileId,
      to_profile: name,
    })
      .unwrap()
      .then(() => {
        refetchFriendRequest();
      })
      .catch((error) => {
        console.error("Error accepting friend request:", error);
      });
  };

  const handleDeclineRequest = (name: string) => {};

  return (
    <List sx={{ maxWidth: 500 }}>
      {friendRequests?.map((request) => (
        <ListItem
          secondaryAction={
            <Box sx={{ display: "flex", gap: 4 }}>
              <IconButton
                edge="end"
                aria-label="accept"
                color="success"
                onClick={() => handleAcceptRequest(request.from_profile)}
              >
                <CheckIcon />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="decline"
                color="error"
                onClick={() => handleDeclineRequest(request.from_profile)}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          }
        >
          <ListItemAvatar>
            <Avatar src={request.from_profile} alt={request.from_profile} />
          </ListItemAvatar>
          <ListItemText primary={request.from_profile} />
        </ListItem>
      ))}
    </List>
  );
};

export default FriendRequests;