import Grid from "@mui/material/Grid2";
import { Paper } from "@mui/material";
import FriendsTabs from "./FriendsTabs";

const FriendsContainer = () => {
  return (
    <Paper sx={{ p: 1, height: "100%" }} elevation={4}>
      <Grid container spacing={2}>
        <Grid size={12}>
          <FriendsTabs />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default FriendsContainer;
