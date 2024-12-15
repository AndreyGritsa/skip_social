import { Box, List } from "@mui/material";
import { useAppSelector } from "../../app/hooks";
import SingleChannel from "../channel/SingleChannel";
import { selectFilteredFriends } from "../../app/selectors";

interface FriendsTabPanelProps {
  online: boolean;
}

const FriendsTabPanel: React.FC<FriendsTabPanelProps> = ({ online }) => {
  const friends = useAppSelector((state) =>
    selectFilteredFriends(state, online)
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
