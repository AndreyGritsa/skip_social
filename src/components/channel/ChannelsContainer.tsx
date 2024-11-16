import { Box } from "@mui/material";
import ChannelsNavigation from "./ChannelsNavigation";
import Channels from "../channel/Channels";

const ChannelsContainer = () => {
  return (
    <Box>
      <ChannelsNavigation />
      <Channels />
    </Box>
  );
};

export default ChannelsContainer;
