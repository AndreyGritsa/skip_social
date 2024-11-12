import React from "react";
import List from "@mui/material/List";
import { useAppSelector } from "../../app/hooks";
import SingleChannel from "./SingleChannel";

const Channels = () => {
  const channels = useAppSelector((state) => state.channels.channels);

  return (
    <List
      sx={{
        width: "100%",
        maxWidth: 400,
        bgcolor: "background.paper",
        overflowY: "auto",
        height: "69dvh",
      }}
    >
      {channels.map((channel) => (
        <React.Fragment key={channel.id}>
          <SingleChannel {...channel} />
          {/* <Divider variant="inset" component="li" /> */}
        </React.Fragment>
      ))}
    </List>
  );
};

export default Channels;
