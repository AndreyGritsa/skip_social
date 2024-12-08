import List from "@mui/material/List";
import { useAppSelector } from "../../app/hooks";
import SingleChannel from "./SingleChannel";
import {
  useGetChannelsQuery,
  useInvalidateChannelsMutation,
} from "../../services/endpoints/channels";
import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect } from "react";

const Channels = () => {
  const channels = useAppSelector((state) => state.channels.channels);
  const user = useAppSelector((state) => state.user);
  const { refetch } = useGetChannelsQuery(user.id ? user.id : skipToken);
  const [invalidateChannels] = useInvalidateChannelsMutation();

  useEffect(() => {
    // make sure the channels are fetched when the user is set
    if (user.id) refetch();
  }, [user, refetch]);

  useEffect(() => {
    // close the event source when the component is unmounted
    return () => {
      invalidateChannels();
    };
  }, [invalidateChannels]);

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
