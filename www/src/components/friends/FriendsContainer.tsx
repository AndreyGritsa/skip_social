import Grid from "@mui/material/Grid2";
import FriendsTabs from "./FriendsTabs";

const FriendsContainer = () => {
  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <FriendsTabs />
      </Grid>
    </Grid>
  );
};

export default FriendsContainer;
