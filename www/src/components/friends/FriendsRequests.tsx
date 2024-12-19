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
import {
  useGetFriendRequestsQuery,
  usePostFriendRequestMutation,
  useInvalidateFriendsRequestsMutation,
} from "../../services/endpoints/users";
import { useAppSelector } from "../../app/hooks";
import { useEffect } from "react";
import { skipToken } from "@reduxjs/toolkit/query";

const FriendRequests = () => {
  const user = useAppSelector((state) => state.user);
  const { data: friendRequests } = useGetFriendRequestsQuery(
    user.id ? user.id : skipToken
  );
  const [triggerPostFriendRequest] = usePostFriendRequestMutation();
  const [invalidateFriendRequests] = useInvalidateFriendsRequestsMutation();

  useEffect(() => {
    return () => {
      // close EventSource when component is unmounted
      invalidateFriendRequests();
    };
  }, []);

  const handleAcceptRequest = (name: string) => {
    console.log("Accepting friend request from:", name);
    triggerPostFriendRequest({
      from_profile: user.id,
      to_profile: name,
    })
      .unwrap()
      .catch((error) =>
        console.error("Error accepting friend request:", error)
      );
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
                onClick={() => handleAcceptRequest(request.name)}
              >
                <CheckIcon />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="decline"
                color="error"
                onClick={() => handleDeclineRequest(request.name)}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          }
        >
          <ListItemAvatar>
            <Avatar src={request.name} alt={request.name} />
          </ListItemAvatar>
          <ListItemText primary={request.name} />
        </ListItem>
      ))}
    </List>
  );
};

export default FriendRequests;
