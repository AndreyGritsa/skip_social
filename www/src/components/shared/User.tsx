import { useAppSelector } from "../../app/hooks";
import { Paper, Box, Typography } from "@mui/material";
import CustomAvatar from "./CustomAvatar";
import {
  useGetUserQuery,
  useGetFriendsQuery,
} from "../../services/endpoints/users";
import UserSettingsPopper from "./UserSettingsPopper";
import UserSelectPopper from "./UserSelectPopper";
import { useEffect, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetExternalsQuery } from "../../services/endpoints/externals";

const User = () => {
  const user = useAppSelector((state) => state.user);
  // TODO: proper auth, localStorage used for the simplicity
  const [profileId, setProfileId] = useState<string>(
    localStorage.getItem("profile_id") || ""
  );
  const { refetch: refetchUser } = useGetUserQuery(
    profileId ? profileId : skipToken
  );
  const { refetch: refetchFriends } = useGetFriendsQuery(
    profileId ? profileId : skipToken
  );
  const { refetch: refetchExternals } = useGetExternalsQuery(
    profileId ? { profile_id: profileId, type: "externals" } : skipToken
  );

  useEffect(() => {
    if (!profileId) {
      localStorage.setItem("profile_id", "1");
      setProfileId("1");
    }
  }, [profileId]);

  useEffect(() => {
    refetchUser();
    refetchFriends();
    refetchExternals();
  }, [profileId, refetchUser, refetchFriends, refetchExternals]);

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
