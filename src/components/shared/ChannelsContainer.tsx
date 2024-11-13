import { Paper } from "@mui/material";
import ChannelsNavigation from "./ChannelsNavigation";
import Channels from "./Channels";

const ChannelsContainer = () => {
  return (
    <Paper sx={{ p: 1, height: "100%" }} elevation={4}>
      <ChannelsNavigation />
      <Channels />
    </Paper>
  );
};

export default ChannelsContainer;
