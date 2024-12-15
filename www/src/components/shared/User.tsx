import { useAppSelector } from "../../app/hooks";
import { Paper, Box, Typography } from "@mui/material";
import CustomAvatar from "./CustomAvatar";
import {
  useGetUserQuery,
  useGetFriendsQuery,
} from "../../services/endpoints/users";
import UserSettingsPopper from "./UserSettingsPopper";
import UserSelectPopper from "./UserSelectPopper";

const User = () => {
  const user = useAppSelector((state) => state.user);
  // TODO: proper auth, localStorage used for the simplicity
  const profile_id = localStorage.getItem("profile_id");
  if (!profile_id) {
    throw Error(
      "localStorage profile_id is not set. Enter in console localStorage.setItem('profile_id', '[value]')"
    );
  }
  const { data: userData } = useGetUserQuery(profile_id);
  const { data: friendsData } = useGetFriendsQuery(profile_id);

  return (
    <Paper sx={{ p: 1 }} elevation={4}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <CustomAvatar src="/" alt={user.name} status={user.status} />
        <Typography variant="body1">
          <strong>{user.name}</strong>
        </Typography>
        <UserSelectPopper />
        <UserSettingsPopper />
      </Box>
    </Paper>
  );
};

export default User;
