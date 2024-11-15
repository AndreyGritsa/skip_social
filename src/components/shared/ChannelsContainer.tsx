import { Box } from "@mui/material";
import ChannelsNavigation from "./ChannelsNavigation";
import Channels from "./Channels";

const ChannelsContainer = () => {
  return (
    <Box>
      <ChannelsNavigation />
      <Channels />
    </Box>
  );
};

export default ChannelsContainer;
