import List from "@mui/material/List";
import { useAppSelector } from "../../app/hooks";
import SingleChannel from "./SingleChannel";
import { useGetChannelsQuery } from "../../services/endpoints/channels";
import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect } from "react";

const Channels = () => {
  const channels = useAppSelector((state) => state.channels.channels);
  const user = useAppSelector((state) => state.user);
  const { data, refetch } = useGetChannelsQuery(user.id ? user.id : skipToken);

  useEffect(() => {
    if (!data && user.id) refetch();
  }, [user, data, refetch]);

  return (
    <List
      sx={{
        width: "100%",
        bgcolor: "background.paper",
        overflowY: "auto",
        height: "calc(100vh - 220px)",
      }}
    >
      {channels.map((channel) => (
        <SingleChannel key={channel.id} {...channel} />
      ))}
    </List>
  );
};

export default Channels;
