import { Box, List } from "@mui/material";
import { useAppSelector } from "../../app/hooks";
import SingleChannel from "../channel/SingleChannel";

interface FriendsTabPanelProps {
  online: boolean;
}

const FriendsTabPanel: React.FC<FriendsTabPanelProps> = ({ online }) => {
  const friends = useAppSelector((state) =>
    online
      ? state.friends.friends.filter((friend) => friend.status === "online")
      : state.friends.friends
  );

  return (
    <Box sx={{ p: 3 }}>
      <List>
        {friends.map((friend) => (
          <SingleChannel key={friend.id} {...friend} />
        ))}
      </List>
    </Box>
  );
};

export default FriendsTabPanel;
