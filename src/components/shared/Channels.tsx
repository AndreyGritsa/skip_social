import List from "@mui/material/List";
import { useAppSelector } from "../../app/hooks";
import SingleChannel from "./SingleChannel";

const Channels = () => {
  const channels = useAppSelector((state) => state.channels.channels);

  return (
    <List
      sx={{
        width: "100%",
        bgcolor: "background.paper",
        overflowY: "auto",
        height: "69dvh",
      }}
    >
      {channels.map((channel) => (
        <SingleChannel key={channel.id} {...channel} />
      ))}
    </List>
  );
};

export default Channels;
